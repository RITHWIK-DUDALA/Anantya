const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase');

const { authenticateAdmin } = require('../middleware/auth');

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
        registrations.push({ id: doc.id, ...data });
      }
    });

    // Sort to put pending_verification at the top
    registrations.sort((a, b) => {
      if (a.status === 'pending_verification' && b.status !== 'pending_verification') return -1;
      if (a.status !== 'pending_verification' && b.status === 'pending_verification') return 1;
      return 0;
    });

    res.json(registrations);
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
      updatedBy: req.admin.identifier
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
      updatedBy: req.admin.identifier
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

    const cleanName = name.trim().slice(0, 50);
    
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

      const token = jwt.sign(
        { role: 'admin', identifier: cleanName }, 
        secret, 
        { expiresIn: '12h' }
      );
      
      // Issue httpOnly, Secure, SameSite cookie
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
// Clear the admin session cookie
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
