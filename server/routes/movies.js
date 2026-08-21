const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../firebase');
const { sendConfirmationEmail } = require('../utils/email');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');

const sanitizeField = (val, maxLen = 150) => {
  if (typeof val !== 'string') return '';
  return sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }).trim().slice(0, maxLen);
};

// GET /api/movies/session
router.get('/session', (req, res, next) => {
  try {
    const sessionId = crypto.randomUUID();
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
    const token = jwt.sign({ sessionId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, sessionId });
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/screens
router.get('/screens', async (req, res, next) => {
  try {
    const snapshot = await db.collection('screens').get();
    const screens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(screens);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/shows
router.get('/shows', async (req, res, next) => {
  try {
    const snapshot = await db.collection('showtimes').where('status', '==', 'active').get();
    const shows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(shows);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/shows/:showtimeId
router.get('/shows/:showtimeId', async (req, res, next) => {
  try {
    const { showtimeId } = req.params;
    const showDoc = await db.collection('showtimes').doc(showtimeId).get();
    if (!showDoc.exists) {
      return res.status(404).json({ error: 'Showtime not found' });
    }
    const showData = { id: showDoc.id, ...showDoc.data() };
    
    // Also fetch the screen layout
    if (showData.screenId) {
      const screenDoc = await db.collection('screens').doc(showData.screenId).get();
      if (screenDoc.exists) {
        showData.screen = { id: screenDoc.id, ...screenDoc.data() };
      }
    }
    
    res.json(showData);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/shows/:showtimeId/seats
router.get('/shows/:showtimeId/seats', async (req, res, next) => {
  try {
    const { showtimeId } = req.params;
    const now = Date.now();

    // 1. Get all locks
    const locksSnapshot = await db.collection('seatLocks').where('showtimeId', '==', showtimeId).get();
    const activeLocks = [];
    locksSnapshot.forEach(doc => {
      const lock = doc.data();
      if (lock.expiresAt > now) {
        activeLocks.push(lock);
      }
    });

    // 2. Get all bookings for this showtime
    const bookingsSnapshot = await db.collection('movieBookings')
      .where('showtimeId', '==', showtimeId)
      .where('status', 'in', ['pending_verification', 'confirmed', 'verified'])
      .get();
      
    const bookedSeats = [];
    bookingsSnapshot.forEach(doc => {
      bookedSeats.push(...(doc.data().seats || []));
    });

    res.json({
      activeLocks,
      bookedSeats
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/movies/lock-seat
router.post('/lock-seat', async (req, res, next) => {
  try {
    const { showtimeId, seatId, sessionToken } = req.body;
    if (!showtimeId || !seatId || !sessionToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!/^[A-Z]-\d+$/.test(seatId)) {
      return res.status(400).json({ error: 'Invalid seat format' });
    }

    let sessionId;
    try {
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
      const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
      sessionId = decoded.sessionId;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    const now = Date.now();
    const lockExpiry = now + 10 * 60 * 1000; // 10 minutes

    let success = false;
    let message = '';

    await db.runTransaction(async (t) => {
      // Validate seat against screen layout
      const showDoc = await t.get(db.collection('showtimes').doc(showtimeId));
      if (!showDoc.exists || showDoc.data().status !== 'active') {
        success = false;
        message = 'Showtime is invalid or inactive.';
        return;
      }
      
      const screenDoc = await t.get(db.collection('screens').doc(showDoc.data().screenId));
      if (!screenDoc.exists) {
        success = false;
        message = 'Screen layout not found.';
        return;
      }
      
      const layout = screenDoc.data().layout || {};
      const { rows = 10, cols = 20, blankSpaces = [] } = layout;
      
      const match = seatId.match(/^([A-Z])-(\d+)$/);
      if (!match) {
        success = false;
        message = 'Invalid seat format.';
        return;
      }
      
      const rowChar = match[1];
      const colNum = parseInt(match[2], 10);
      const rowIdx = rowChar.charCodeAt(0) - 65; // A=0
      
      if (rowIdx < 0 || rowIdx >= rows || colNum < 1 || colNum > cols) {
        success = false;
        message = 'Seat is out of bounds.';
        return;
      }
      if (blankSpaces.includes(seatId)) {
        success = false;
        message = 'Seat is not bookable (aisle).';
        return;
      }

      // Check if already booked
      const bookingsQuery = await t.get(
        db.collection('movieBookings')
          .where('showtimeId', '==', showtimeId)
          .where('seats', 'array-contains', seatId)
          .where('status', 'in', ['pending_verification', 'confirmed', 'verified'])
      );

      if (!bookingsQuery.empty) {
        success = false;
        message = 'Seat is already booked.';
        return;
      }

      // Check active locks
      const lockRef = db.collection('seatLocks').doc(`${showtimeId}_${seatId}`);
      const lockDoc = await t.get(lockRef);

      if (lockDoc.exists) {
        const lockData = lockDoc.data();
        if (lockData.expiresAt > now && lockData.sessionId !== sessionId) {
          success = false;
          message = 'Seat is temporarily locked by another user.';
          return;
        }
      }

      // Write lock
      t.set(lockRef, {
        showtimeId,
        seatId,
        sessionId,
        expiresAt: lockExpiry
      });
      success = true;
    });

    if (!success) {
      return res.status(409).json({ error: message });
    }

    res.json({ success: true, expiresAt: lockExpiry });
  } catch (error) {
    next(error);
  }
});

// POST /api/movies/unlock-seat
router.post('/unlock-seat', async (req, res, next) => {
  try {
    const { showtimeId, seatId, sessionToken } = req.body;
    if (!showtimeId || !seatId || !sessionToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let sessionId;
    try {
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
      const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
      sessionId = decoded.sessionId;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    const lockRef = db.collection('seatLocks').doc(`${showtimeId}_${seatId}`);
    
    await db.runTransaction(async (t) => {
      const lockDoc = await t.get(lockRef);
      if (lockDoc.exists && lockDoc.data().sessionId === sessionId) {
        t.delete(lockRef);
      }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Helper: Secure unique token generator
async function generateUniqueToken() {
  let isUnique = false;
  let token = '';
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    token = crypto.randomInt(100000, 1000000).toString();
    const snapshot = await db.collection('movieBookings').where('token', '==', token).get();
    if (snapshot.empty) isUnique = true;
    attempts++;
  }
  if (!isUnique) throw new Error('Failed to generate unique token');
  return token;
}

// POST /api/movies/book
router.post('/book', async (req, res, next) => {
  try {
    const { showtimeId, sessionToken, seats, snacks, name, email, phone, transactionId, participantType, collegeId } = req.body;
    
    if (!showtimeId || !sessionToken || !seats || !seats.length || !transactionId || !name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if ((participantType === 'Student' || participantType === 'Faculty') && !collegeId) {
      return res.status(400).json({ error: 'College ID / Registration number is required for Amrita students and faculty' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const uniqueSeats = new Set(seats);
    if (uniqueSeats.size !== seats.length) {
      return res.status(400).json({ error: 'Duplicate seats detected' });
    }

    for (const seat of seats) {
      if (!/^[A-Z]-\d+$/.test(seat)) {
        return res.status(400).json({ error: 'Invalid seat format' });
      }
    }

    let sessionId;
    try {
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
      const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
      sessionId = decoded.sessionId;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    if (seats.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 seats allowed per booking' });
    }

    const cleanTxnId = transactionId.trim();
    if (cleanTxnId.length < 6 || !/^[a-zA-Z0-9]+$/.test(cleanTxnId)) {
      return res.status(400).json({ error: 'Invalid transaction ID format' });
    }

    // Generate IDs and Tokens outside the transaction (avoids external API/DB calls in strict transaction locks)
    const bookingId = `MOV-${crypto.randomUUID()}`;
    const token = await generateUniqueToken();
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
    const signature = crypto.createHmac('sha256', process.env.JWT_SECRET).update(bookingId).digest('hex');
    const qrData = JSON.stringify({ bookingId, signature });
    const qrImageUrl = await QRCode.toDataURL(qrData);

    // Server-side check locks
    const now = Date.now();
    let canProceed = true;
    let errorMessage = 'Some seats are no longer locked by you or have expired.';
    let finalBooking = null;

    await db.runTransaction(async (t) => {
      // 1. Verify Showtime Active
      const showDoc = await t.get(db.collection('showtimes').doc(showtimeId));
      if (!showDoc.exists || showDoc.data().status !== 'active') {
        canProceed = false;
        errorMessage = 'Showtime is no longer active.';
        return;
      }

      // 2. UTR Uniqueness Check
      const utrQuery = await t.get(
        db.collection('movieBookings')
          .where('paymentId', '==', cleanTxnId)
          .where('status', 'in', ['pending_verification', 'verified'])
      );
      if (!utrQuery.empty) {
        canProceed = false;
        errorMessage = 'This transaction ID has already been used. Please wait for verification or contact support.';
        return;
      }

      // 3. Rate Limit Pending Bookings
      const phoneQuery = await t.get(
        db.collection('movieBookings')
          .where('phone', '==', phone)
          .where('status', '==', 'pending_verification')
      );
      if (phoneQuery.size >= 2) {
        canProceed = false;
        errorMessage = 'You have reached the maximum allowed pending bookings. Please wait for admin verification.';
        return;
      }

      // 4. Check Locks
      for (const seatId of seats) {
        const lockRef = db.collection('seatLocks').doc(`${showtimeId}_${seatId}`);
        const lockDoc = await t.get(lockRef);
        
        if (!lockDoc.exists) {
          canProceed = false;
          return;
        }

        const lockData = lockDoc.data();
        if (lockData.sessionId !== sessionId || lockData.expiresAt <= now) {
          canProceed = false;
          return;
        }
      }

      if (canProceed) {
        // Clear the locks
        for (const seatId of seats) {
          const lockRef = db.collection('seatLocks').doc(`${showtimeId}_${seatId}`);
          t.delete(lockRef);
        }

        // Calculate Amount Server-Side
        let serverAmount = 0;
        for (const seat of seats) {
          const row = seat.split('-')[0];
          if (row === 'A' || row === 'B') serverAmount += 125;
          else if (row === 'C' || row === 'D') serverAmount += 110;
          else serverAmount += 99;
        }

        if (snacks && Array.isArray(snacks)) {
          for (const snack of snacks) {
            let price = 0;
            if (snack.name.startsWith('Goli Soda')) price = 50;
            else if (snack.name.startsWith('Lays')) price = 20;
            else if (snack.name.startsWith('Popcorn')) price = 60;
            else if (snack.name.startsWith('Sweet Corn')) price = 50;
            else {
               canProceed = false;
               errorMessage = 'Invalid snack selected';
               return;
            }
            serverAmount += (price * snack.quantity);
          }
        }

        finalBooking = {
          bookingId,
          showtimeId,
          seats,
          snacks: snacks || [],
          name: sanitizeField(name),
          email: sanitizeField(email).toLowerCase(),
          phone: sanitizeField(phone),
          participantType: sanitizeField(participantType || 'Other', 50),
          collegeId: sanitizeField(collegeId || '', 50),
          amount: serverAmount,
          paymentId: cleanTxnId,
          status: 'pending_verification',
          registeredAt: new Date().toISOString(),
          token,
          qrCode: qrImageUrl,
          checkedIn: false
        };

        const docRef = db.collection('movieBookings').doc(bookingId);
        t.set(docRef, finalBooking);

      }
    });

    if (!canProceed) {
      return res.status(400).json({ error: errorMessage });
    }

    res.json({ success: true, message: 'Booking submitted successfully', bookingId: finalBooking.bookingId, token: finalBooking.token, qrCode: finalBooking.qrCode });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
