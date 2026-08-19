const express = require('express');
const router = express.Router();
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { db } = require('../firebase');
const { authenticateAdmin } = require('../middleware/auth');

// C-2: Rate limiter for the status-login endpoint.
// The token is only 6-digit numeric (900k possibilities) so brute-force via
// IP enumeration is realistic without a rate limit. 10 attempts per 15 min.
// Key by IP + email so one attacker can't burn the limit for a shared-WiFi IP.
// ipKeyGenerator is required by express-rate-limit v8+ for IPv6 safety.
const statusLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  keyGenerator: (req) => `${ipKeyGenerator(req)}:${(req.body?.email || '').toLowerCase().trim()}`,
});

// GET /api/verify/registration/:regId
// M-1: Now requires the 6-digit token as a query param to prevent unauthenticated
//       info disclosure from a leaked regId (e.g. via QR code screenshot).
router.get('/registration/:regId', async (req, res) => {
  try {
    const { regId } = req.params;
    const { token } = req.query;

    // Require token for proof-of-ownership
    if (!token || !/^\d{6}$/.test(token)) {
      return res.status(400).json({ error: 'A valid 6-digit token is required to look up a registration.' });
    }

    const doc = await db.collection('registrations').doc(regId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Registration not found or fake' });
    }

    const data = doc.data();

    // Verify the token matches — prevents fishing with a guessed regId
    if (data.token !== token) {
      return res.status(404).json({ error: 'Registration not found or fake' });
    }

    // Return only what the caller needs — no phone, email, payment ID, QR code, etc.
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
router.post('/status-login', statusLoginLimiter, async (req, res) => {
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
        // Include rejectionReason so the status page can display it
        rejectionReason: data.rejectionReason || null,
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

    const docRef = snapshot.docs[0].ref;
    // Snapshot data used only for the error-state response body — do NOT trust for auth decisions
    const snapshotData = snapshot.docs[0].data();

    // H-5: Run the ENTIRE status check + checkin update inside a single Firestore
    // transaction so the read and write are atomic.  Previously the status check
    // happened outside, leaving a TOCTOU window where an admin could reject a
    // payment just as the person was walking through the gate.
    let transactionError = null;
    let checkedInData = null;

    try {
      await db.runTransaction(async (t) => {
        const tDoc = await t.get(docRef);
        const tData = tDoc.data();

        if (!tData) throw new Error('NOT_FOUND');

        // Status check is now INSIDE the transaction — atomic with the update
        if (tData.status !== 'verified' && tData.status !== 'free') {
          throw new Error('NOT_VERIFIED:' + tData.status);
        }

        if (tData.checkedIn) {
          throw new Error('ALREADY_CHECKED_IN');
        }

        t.update(docRef, {
          checkedIn: true,
          checkedInAt: new Date().toISOString(),
        });

        // Capture data inside transaction for the success response
        checkedInData = tData;
      });
    } catch (err) {
      const msg = err.message || '';

      if (msg === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Registration not found' });
      }

      if (msg.startsWith('NOT_VERIFIED')) {
        const status = msg.split(':')[1] || snapshotData.status;
        let errorMsg = 'Verification pending';
        if (status === 'rejected') errorMsg = 'Payment Rejected';
        if (status === 'pending') errorMsg = 'Payment Not Completed';
        if (status === 'pending_verification') errorMsg = 'Verification pending';

        return res.status(400).json({
          error: errorMsg,
          user: {
            name: snapshotData.name,
            role: snapshotData.role,
            status: snapshotData.status,
            games: snapshotData.games || [],
            enteredGames: snapshotData.enteredGames || [],
            regId: snapshotData.regId,
          }
        });
      }

      if (msg === 'ALREADY_CHECKED_IN') {
        return res.status(400).json({
          error: 'ALREADY CHECKED IN',
          user: {
            name: snapshotData.name,
            role: snapshotData.role,
            status: snapshotData.status,
            games: snapshotData.games || [],
            enteredGames: snapshotData.enteredGames || [],
            regId: snapshotData.regId,
          }
        });
      }

      throw err; // re-throw unexpected errors to the global handler
    }

    res.json({
      success: true,
      message: 'Verified and Allowed Inside',
      user: {
        name: checkedInData.name,
        role: checkedInData.role,
        games: checkedInData.games || [],
        amount: checkedInData.amount,
        status: checkedInData.status,
        regId: checkedInData.regId,
        enteredGames: checkedInData.enteredGames || []
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

    // M-3: Require the participant to be verified AND checked in before allowing game entry
    if (data.status !== 'verified' && data.status !== 'free') {
      return res.status(400).json({ error: 'Registration is not verified — cannot mark game entry.' });
    }
    if (!data.checkedIn) {
      return res.status(400).json({ error: 'Participant has not checked in at the venue yet.' });
    }

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
