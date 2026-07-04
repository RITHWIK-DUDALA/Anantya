const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase');

const { authenticateAdmin } = require('../middleware/auth');

// GET /api/admin/payments
// Fetch all registrations
router.get('/payments', authenticateAdmin, async (req, res, next) => {
  try {
    const snapshot = await db.collection('registrations')
      .orderBy('registeredAt', 'desc')
      .get();

    const registrations = [];
    snapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() });
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
    const { status } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const docRef = db.collection('registrations').doc(regId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    await docRef.update({ status });

    if (status === 'verified') {
      const { appendRegistrationToExcel } = require('../utils/excel');
      appendRegistrationToExcel({ ...doc.data(), status: 'verified' });
    }

    res.json({ success: true, message: `Payment marked as ${status}` });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/login
// Verify admin password
router.post('/login', async (req, res, next) => {
  try {
    const { password } = req.body;
    
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
        { role: 'admin' }, 
        secret, 
        { expiresIn: '12h' }
      );
      
      // Issue httpOnly, Secure, SameSite cookie
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
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

module.exports = router;
