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

// POST /api/verify/venue-token-checkin
router.post('/venue-token-checkin', authenticateAdmin, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const snapshot = await db.collection('registrations')
      .where('token', '==', String(token).trim())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Invalid Session ID (Token not found)' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Check status - strictly require 'verified' or 'free'
    if (data.status !== 'verified' && data.status !== 'free') {
      let errorMsg = 'Verification pending';
      if (data.status === 'rejected') errorMsg = 'Payment Rejected';
      if (data.status === 'pending') errorMsg = 'Payment Not Completed';

      return res.status(400).json({ 
        error: errorMsg,
        user: { name: data.name, role: data.role, status: data.status, games: data.games || [], enteredGames: data.enteredGames || [], regId: data.regId }
      });
    }

    // Run a Firestore Transaction to prevent TOCTOU race conditions
    const docRef = snapshot.docs[0].ref;
    
    try {
      await db.runTransaction(async (t) => {
        const tDoc = await t.get(docRef);
        const tData = tDoc.data();

        if (tData.checkedIn) {
          throw new Error('ALREADY_CHECKED_IN');
        }

        t.update(docRef, { checkedIn: true });
      });
    } catch (err) {
      if (err.message === 'ALREADY_CHECKED_IN') {
        return res.status(400).json({ 
          error: 'ALREADY CHECKED IN',
          user: { name: data.name, role: data.role, status: data.status, games: data.games || [], enteredGames: data.enteredGames || [], regId: data.regId }
        });
      }
      throw err;
    }

    res.json({
      success: true,
      message: 'Verified and Allowed Inside',
      user: {
        name: data.name,
        role: data.role,
        games: data.games || [],
        amount: data.amount,
        status: data.status,
        regId: data.regId,
        enteredGames: data.enteredGames || []
      }
    });

  } catch (error) {
    console.error('Error in venue checkin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/verify/game-entry
router.patch('/game-entry', authenticateAdmin, async (req, res) => {
  try {
    const { token, gameName } = req.body;
    
    if (!token || !gameName) {
      return res.status(400).json({ error: 'Token and gameName are required' });
    }

    const snapshot = await db.collection('registrations')
      .where('token', '==', String(token).trim())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Invalid Session ID' });
    }

    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data();
    const enteredGames = data.enteredGames || [];
    const registeredGames = data.games || [];

    if (!registeredGames.includes(gameName)) {
      return res.status(400).json({ error: 'Participant did not register for this game' });
    }

    if (!enteredGames.includes(gameName)) {
      enteredGames.push(gameName);
      await docRef.update({ enteredGames });
    }

    res.json({ success: true, enteredGames });
  } catch (error) {
    console.error('Error in game entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
