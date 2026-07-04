const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/verify/registration/:regId
router.get('/registration/:regId', async (req, res) => {
  try {
    const { regId } = req.params;

    const doc = await db.collection('registrations').doc(regId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Registration not found or fake' });
    }

    const data = doc.data();
    
    // Do not leak sensitive info if not paid/free, but we should return status
    res.json({
      regId: data.regId,
      name: data.name,
      dept: data.dept,
      year: data.year,
      role: data.role,
      games: data.games,
      amount: data.amount,
      status: data.status,
      checkedIn: data.checkedIn || false
    });

  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/verify/checkin/:regId
router.patch('/checkin/:regId', authenticateAdmin, async (req, res) => {
  try {
    const { regId } = req.params;

    const docRef = db.collection('registrations').doc(regId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const data = doc.data();

    if (data.checkedIn) {
      return res.status(400).json({ error: 'Already checked in' });
    }

    if (data.status === 'pending') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    await docRef.update({ checkedIn: true });

    res.json({ success: true, message: 'Checked in successfully' });

  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/verify/status-login
// User login to check their verification status
router.post('/status-login', async (req, res) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({ error: 'Email and Token are required' });
    }

    // Since token is saved as string, ensure we are comparing against string
    const snapshot = await db.collection('registrations')
      .where('email', '==', email.toLowerCase().trim())
      .where('token', '==', token.trim())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid email or token' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    res.json({
      success: true,
      user: {
        name: data.name,
        role: data.role,
        games: data.games,
        amount: data.amount,
        status: data.status,
        regId: data.regId,
      }
    });

  } catch (error) {
    console.error('Error in status login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
