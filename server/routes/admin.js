const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');
const { db } = require('../firebase');

const { authenticateAdmin } = require('../middleware/auth');

// Shared sanitiser (same as in register.js)
const sanitizeField = (val, maxLen = 150) => {
  if (typeof val !== 'string') return '';
  return sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }).trim().slice(0, maxLen);
};

// ── Shared cookie options — MUST be identical for set and clear ──────────────
// Having different options (especially sameSite) caused clearCookie to silently
// fail in many browsers (M-4 fix).
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

// GET /api/admin/payments
// Fetch all registrations
const VOLUNTEER_ROLES = ['Decoration Volunteer', 'Disciplinary Volunteer', 'Prasadam Distribution Volunteer'];

router.get('/payments', authenticateAdmin, async (req, res, next) => {
  try {
    const snapshot = await db.collection('registrations')
      .orderBy('registeredAt', 'desc')
      .get();

    const registrations = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Exclude volunteers and abandoned order_created checkouts
      if (!VOLUNTEER_ROLES.includes(data.role) && data.status !== 'order_created') {
        registrations.push({
          id: doc.id,
          ...data,
          studentId: data.studentId || null,
          isAmritaStudent: data.isAmritaStudent || false,
        });
      }
    });

    // Sort: pending_verification first, then by date
    registrations.sort((a, b) => {
      if (a.status === 'pending_verification' && b.status !== 'pending_verification') return -1;
      if (a.status !== 'pending_verification' && b.status === 'pending_verification') return 1;
      return new Date(b.registeredAt) - new Date(a.registeredAt);
    });

    res.json(registrations);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/payments/flagged
// Returns registrations that share a paymentId with another registration (duplicate TXN IDs)
router.get('/payments/flagged', authenticateAdmin, async (req, res, next) => {
  try {
    const snapshot = await db.collection('registrations')
      .orderBy('registeredAt', 'desc')
      .get();

    // Build a map of paymentId -> list of registrations
    const txnMap = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.paymentId && !VOLUNTEER_ROLES.includes(data.role) && data.status !== 'order_created') {
        const key = data.paymentId;
        if (!txnMap[key]) txnMap[key] = [];
        txnMap[key].push({ id: doc.id, ...data, studentId: data.studentId || null, isAmritaStudent: data.isAmritaStudent || false });
      }
    });

    // Collect entries where the same paymentId appears more than once
    const flagged = [];
    Object.values(txnMap).forEach((group) => {
      if (group.length > 1) {
        group.forEach((reg) => flagged.push({ ...reg, flagReason: 'Duplicate Transaction ID' }));
      }
    });

    flagged.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
    res.json(flagged);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/verify-payment
// Manually verify or reject a pending payment
router.post('/verify-payment', authenticateAdmin, async (req, res, next) => {
  try {
    const { regId, action, rejectedReason, note } = req.body;

    if (!regId || !action || !['verify', 'reject', 'revoke'].includes(action)) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    if (action === 'reject' && (!rejectedReason || !rejectedReason.trim())) {
      return res.status(400).json({ error: 'Rejected reason is required' });
    }

    if (!req.admin?.identifier) {
      return res.status(401).json({ error: 'Admin identity could not be verified.' });
    }

    const docRef = db.collection('registrations').doc(regId);
    let finalRegData = null;

    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);

      if (!doc.exists) {
        throw new Error('NOT_FOUND');
      }

      const data = doc.data();

      if (data.status !== 'pending_verification' && 
          !(data.status === 'verified' && action === 'revoke') && 
          !(data.status === 'rejected' && action === 'revoke')) {
        throw new Error('INVALID_STATUS');
      }

      const adminId = sanitizeField(req.admin.identifier, 50);
      const updateData = { 
        updatedAt: new Date().toISOString()
      };

      const auditEntry = {
        action: action === 'verify' ? 'admin_verified' : (action === 'revoke' ? 'admin_revoked' : 'admin_rejected'),
        actor: adminId,
        from: data.status,
        to: action === 'verify' ? 'verified' : (action === 'revoke' ? 'pending_verification' : 'rejected'),
        timestamp: new Date().toISOString(),
        note: note ? sanitizeField(note, 200) : null
      };

      if (action === 'verify') {
        const QRCode = require('qrcode');
        const qrData = JSON.stringify({ regId });
        const qrImageUrl = await QRCode.toDataURL(qrData);

        Object.assign(updateData, {
          status: 'verified',
          verifiedBy: adminId,
          verifiedAt: new Date().toISOString(),
          qrCode: qrImageUrl,
          auditLog: require('firebase-admin/firestore').FieldValue.arrayUnion(auditEntry)
        });
      } else if (action === 'revoke') {
        Object.assign(updateData, {
          status: 'pending_verification',
          auditLog: require('firebase-admin/firestore').FieldValue.arrayUnion(auditEntry)
        });
      } else {
        Object.assign(updateData, {
          status: 'rejected',
          rejectedReason: sanitizeField(rejectedReason, 200),
          auditLog: require('firebase-admin/firestore').FieldValue.arrayUnion(auditEntry)
        });
      }

      t.update(docRef, updateData);
      finalRegData = { ...data, ...updateData };
    });

    if (action === 'verify') {
      const { appendRegistrationToExcel } = require('../utils/excel');
      appendRegistrationToExcel(finalRegData);
      const { sendConfirmationEmail } = require('../utils/email');
      sendConfirmationEmail(
        finalRegData.email,
        finalRegData.name,
        finalRegData.regId,
        (finalRegData.games || []).join(', '),
        finalRegData.amountExpected,
        finalRegData.utr,
        finalRegData.qrCode,
        false
      ).catch(err => console.error('[Verify Email Error]', err));
    } else {
      // Send rejection email (assuming a sendRejectionEmail function exists or placeholder)
      // sendRejectionEmail(finalRegData.email, finalRegData.name, finalRegData.regId, finalRegData.rejectedReason);
    }

    res.json({ success: true, message: `Payment marked as ${action === 'verify' ? 'verified' : 'rejected'}` });
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Registration not found' });
    }
    if (error.message === 'INVALID_STATUS') {
      return res.status(400).json({ error: 'Only pending_verification registrations can be verified or rejected.' });
    }
    next(error);
  }
});

// GET /api/admin/volunteers
// Fetch only volunteer registrations
router.get('/volunteers', authenticateAdmin, async (req, res, next) => {
  try {
    const snapshot = await db.collection('registrations')
      .orderBy('registeredAt', 'desc')
      .get();

    const volunteers = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (VOLUNTEER_ROLES.includes(data.role)) {
        volunteers.push({ id: doc.id, ...data });
      }
    });

    // Sort: pending first
    volunteers.sort((a, b) => {
      if (a.status === 'volunteer_pending' && b.status !== 'volunteer_pending') return -1;
      if (a.status !== 'volunteer_pending' && b.status === 'volunteer_pending') return 1;
      return 0;
    });

    res.json(volunteers);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/volunteers/:regId
// Accept or reject a volunteer
router.patch('/volunteers/:regId', authenticateAdmin, async (req, res, next) => {
  try {
    const { regId } = req.params;
    const { status } = req.body;

    if (!['volunteer_accepted', 'volunteer_rejected', 'volunteer_reinstated'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use volunteer_accepted, volunteer_rejected, or volunteer_reinstated.' });
    }

    const docRef = db.collection('registrations').doc(regId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (!req.admin?.identifier) {
      return res.status(401).json({ error: 'Admin identity could not be verified.' });
    }

    await docRef.update({ 
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: sanitizeField(req.admin.identifier, 50) // H-4: sanitize before writing to DB
    });

    res.json({ success: true, message: `Volunteer marked as ${status}` });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/login
// Verify admin password
router.post('/login', async (req, res, next) => {
  try {
    const { password, name } = req.body;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Admin name is required to log in.' });
    }

    // H-4: Sanitize name before embedding in JWT to prevent future XSS via updatedBy
    const cleanName = sanitizeField(name.trim(), 50);
    
    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (!hash) {
      console.error('ADMIN_PASSWORD_HASH is not configured.');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const isMatch = await bcrypt.compare(password, hash);

    if (isMatch) {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ error: 'Server configuration error' });
      }

      // C-1: Include a unique jti (JWT ID) so this token can be individually revoked on logout
      const jti = crypto.randomUUID();

      const token = jwt.sign(
        { role: 'admin', identifier: cleanName, jti }, 
        secret, 
        { expiresIn: '12h' }
      );
      
      // M-4: Use shared COOKIE_OPTIONS so set and clear are always in sync
      res.cookie('admin_token', token, {
        ...COOKIE_OPTIONS,
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
      });

      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid admin password' });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/check-auth
// Verify if current admin session is valid
router.get('/check-auth', authenticateAdmin, (req, res) => {
  res.json({ success: true, message: 'Authenticated' });
});

// POST /api/admin/logout
// C-1: Revoke the token server-side (add to denylist), then clear the cookie
router.post('/logout', authenticateAdmin, async (req, res, next) => {
  try {
    const { jti, exp } = req.admin;

    if (jti) {
      // Add the token's jti to the Firestore denylist.
      // Set a Firestore TTL policy on the `expiresAt` field to auto-clean expired entries.
      await db.collection('revokedTokens').doc(jti).set({
        revokedAt: new Date().toISOString(),
        expiresAt: new Date(exp * 1000).toISOString(),
        revokedBy: req.admin.identifier,
      });
    }

    // M-4: Use same COOKIE_OPTIONS as login — must match for browser to clear correctly
    res.clearCookie('admin_token', COOKIE_OPTIONS);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
