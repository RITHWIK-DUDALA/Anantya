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
      // Exclude volunteers — they have their own page
      if (!VOLUNTEER_ROLES.includes(data.role)) {
        registrations.push({
          id: doc.id,
          ...data,
          // Ensure these fields are always present
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
      if (data.paymentId && !VOLUNTEER_ROLES.includes(data.role)) {
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

// PATCH /api/admin/payments/:regId
// Update registration status
router.patch('/payments/:regId', authenticateAdmin, async (req, res, next) => {
  try {
    const { regId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const docRef = db.collection('registrations').doc(regId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (!req.admin?.identifier) {
      return res.status(401).json({ error: 'Admin identity could not be verified.' });
    }

    const updateData = { 
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: sanitizeField(req.admin.identifier, 50) // H-4: sanitize before writing to DB
    };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await docRef.update(updateData);

    if (status === 'verified') {
      const { appendRegistrationToExcel } = require('../utils/excel');
      appendRegistrationToExcel({ ...doc.data(), status: 'verified' });
    }

    res.json({ success: true, message: `Payment marked as ${status}` });
  } catch (error) {
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
