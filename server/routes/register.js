const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const { db } = require('../firebase');
const { sendConfirmationEmail } = require('../utils/email');
const { appendRegistrationToExcel } = require('../utils/excel');
const { calculateOrderAmount } = require('../utils/pricing');
const sanitizeHtml = require('sanitize-html');

const sanitizeField = (val, maxLen = 150) => {
  if (typeof val !== 'string') return '';
  return sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }).trim().slice(0, maxLen);
};

// Validate Student ID format (Amrita Chennai: e.g. CB.EN.U4CSE23001)
// Format: 2–5 uppercase letters, dot, 2 uppercase letters, dot, alphanumeric 8–15 chars
const isValidStudentId = (id) => {
  if (!id || typeof id !== 'string') return false;
  const cleaned = id.trim().toUpperCase();
  // Accept formats like: CB.EN.U4CSE23001 or AM.EN.U4AIE22050 or simple IDs (8-20 alphanum)
  return /^[A-Z]{2,5}\.[A-Z]{2}\.[A-Z0-9]{5,15}$/.test(cleaned) || /^[A-Z0-9]{8,20}$/.test(cleaned);
};

// Helper: Secure unique 5-char alphanumeric regId generator (Atomic .create retry loop)
async function generateUniqueRegId() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  while (attempts < 10) {
    const randomBytes = crypto.randomBytes(5);
    let regId = '';
    for (let i = 0; i < 5; i++) {
      regId += charset[randomBytes[i] % charset.length];
    }
    try {
      // Atomically create the document to reserve the ID
      await db.collection('registrations').doc(regId).create({ _reserved: true, createdAt: new Date().toISOString() });
      return regId;
    } catch (err) {
      if (err.code === 6) attempts++; // ALREADY_EXISTS
      else throw err;
    }
  }
  throw new Error('Server busy: could not generate unique registration ID. Please try again.');
}

// Helper: check if email is from Amrita Chennai campus
const isAmritaEmail = (email) => email && email.toLowerCase().endsWith('@ch.students.amrita.edu');

// POST /api/register/free
router.post('/free', async (req, res, next) => {
  return res.status(403).json({ error: 'Registrations are closed. Register for next year, we will be waiting!' });
  try {
    const { name, email, phone, dept, year, role, games, secretCode, discountAmount, studentId } = req.body;

    if (!name || !email || !phone || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate Student ID for Amrita Chennai students
    if (isAmritaEmail(email)) {
      if (!studentId || !isValidStudentId(studentId)) {
        return res.status(400).json({ error: 'Amrita Chennai students must provide a valid Student ID (e.g. CB.EN.U4CSE23001)' });
      }
    }

    const safeEmail = sanitizeField(email, 150).toLowerCase().trim();

    const regId = `REG-${crypto.randomUUID()}`;
    // Token will be generated securely inside the transaction to prevent TOCTOU
    let token = null;

    const qrData = JSON.stringify({ regId });
    const qrImageUrl = await QRCode.toDataURL(qrData);

    const volunteerRoles = ['Decoration Volunteer', 'Disciplinary Volunteer', 'Prasadam Distribution Volunteer'];
    const isVolunteer = volunteerRoles.includes(role);

    const safeName = sanitizeField(name, 100);
    const safeDept = sanitizeField(dept, 50);
    const safeYear = sanitizeField(year, 20);
    const safeRole = sanitizeField(role, 50);
    const rawGamesArray = Array.isArray(games) ? games : (games ? games.split(',').map(g => g.trim()) : []);
    const safeGames = rawGamesArray.map(g => sanitizeField(g, 100));
    const safeStudentId = studentId ? sanitizeField(studentId.trim().toUpperCase(), 30) : null;
    // H-3: Sanitize phone number — strip everything except digits
    const safePhone = phone.trim().replace(/[^\d]/g, '');

    const registrationData = {
      name: safeName, email: safeEmail, phone: safePhone, dept: safeDept, year: safeYear, role: safeRole,
      games: safeGames,
      amount: 0,
      status: isVolunteer ? "volunteer_pending" : "free",
      paymentId: null,
      registeredAt: new Date().toISOString(),
      regId, token,
      qrCode: qrImageUrl,
      checkedIn: false,
      // M-2: Don't store the raw secret code — discountAmount captures the outcome
      discountAmount: discountAmount || 0,
      studentId: safeStudentId,
      isAmritaStudent: isAmritaEmail(safeEmail),
    };

    // H-2 (fixed): Run email duplicate-check + write atomically inside a Firestore
    // transaction. The previous non-transactional get() + set() had a TOCTOU race
    // condition where two simultaneous requests with the same email could both pass.
    let duplicateEmail = false;
    await db.runTransaction(async (t) => {
      const emailQuery = await t.get(
        db.collection('registrations').where('email', '==', safeEmail)
      );
      if (!emailQuery.empty) {
        duplicateEmail = true;
        return;
      }

      // Securely generate unique token atomically within the transaction
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        token = crypto.randomInt(100000, 1000000).toString();
        const snapshot = await t.get(db.collection('registrations').where('token', '==', token).limit(1));
        if (snapshot.empty) isUnique = true;
        attempts++;
      }
      if (!isUnique) throw new Error('Server busy: could not generate unique token. Please try again.');
      registrationData.token = token;

      t.set(db.collection('registrations').doc(regId), registrationData);
    });

    if (duplicateEmail) {
      return res.status(409).json({ error: 'This email is already registered. If you have an issue, please contact the organizers.' });
    }

    // Fire-and-forget confirmation email so SMTP latency doesn't block client HTTP response
    // sendConfirmationEmail(email, name, regId, role, 0, null, qrImageUrl, true).catch(err => console.error('Free reg email error:', err));

    res.json({ success: true, regId, token });
  } catch (error) {
    next(error);
  }
});

// POST /api/register/paid
// UPI manual payment — user submits their UPI transaction ID, admin verifies manually
router.post('/paid', async (req, res, next) => {
  return res.status(403).json({ error: 'Registrations are closed. Register for next year, we will be waiting!' });
  let reservedRegId = null;
  try {
    const { name, email, phone, dept, year, role, games, secretCode, transactionId, studentId } = req.body;

    if (!name || !email || !phone || !games || !transactionId) {
      return res.status(400).json({ error: 'Missing required fields (including transaction ID)' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Validate Student ID for Amrita Chennai students
    if (isAmritaEmail(email)) {
      if (!studentId || !isValidStudentId(studentId)) {
        return res.status(400).json({ error: 'Amrita Chennai students must provide a valid Student ID (e.g. CB.EN.U4CSE23001)' });
      }
    }

    // C-3: Stricter transaction ID validation.
    // Real UPI UTRs are typically 12+ characters (12-digit numeric for IMPS/UPI,
    // or bank-prefix + digits for other rails). A 6-char minimum is too permissive
    // and allows obviously fake strings like 'abc123'.
    const cleanTxnId = transactionId.trim();
    if (cleanTxnId.length < 12 || !/^[a-zA-Z0-9]+$/.test(cleanTxnId)) {
      return res.status(400).json({ error: 'Invalid transaction ID. Please enter the full 12+ character UTR/reference number from your UPI app.' });
    }

    // Server-side amount calculation
    const gameTitles = Array.isArray(games) ? games : (games ? games.split(',').map(g => g.trim()) : []);
    const { finalTotal, discountAmount } = calculateOrderAmount(gameTitles, secretCode);

    if (finalTotal <= 0) {
      return res.status(400).json({ error: 'Amount is 0 — use the free registration endpoint' });
    }

    reservedRegId = await generateUniqueRegId();
    const regId = reservedRegId;
    const token = null; // No 6-digit token for paid registrations

    const qrData = JSON.stringify({ regId });
    const qrImageUrl = await QRCode.toDataURL(qrData);

    const safeEmail = sanitizeField(email, 150).toLowerCase().trim();
    const safeName = sanitizeField(name, 100);
    const safeDept = sanitizeField(dept, 50);
    const safeYear = sanitizeField(year, 20);
    const safeRole = sanitizeField(role || 'Games Participant', 50);
    const safeGames = gameTitles.map(g => sanitizeField(g, 100));
    const safeStudentId = studentId ? sanitizeField(studentId.trim().toUpperCase(), 30) : null;
    // H-3: Sanitize phone number
    const safePhone = phone.trim().replace(/[^\d]/g, '');

    const registrationData = {
      name: safeName, email: safeEmail, phone: safePhone, dept: safeDept, year: safeYear,
      role: safeRole,
      games: safeGames,
      amount: finalTotal,
      status: "pending_verification",
      paymentId: cleanTxnId,      // UPI transaction ID for admin to verify
      registeredAt: new Date().toISOString(),
      regId, token,
      qrCode: qrImageUrl,
      checkedIn: false,
      // M-2: Don't store the raw secret code — discountAmount captures the outcome
      discountAmount: discountAmount || 0,
      studentId: safeStudentId,
      isAmritaStudent: isAmritaEmail(safeEmail),
    };

    // ── Atomic duplicate-check + write ──────────────────────────────────────
    // Firestore transaction ensures only ONE registration can use a given
    // transaction ID OR email, even if multiple requests arrive simultaneously.
    let duplicateReason = null;
    await db.runTransaction(async (t) => {
      // H-2: Check for duplicate email inside the transaction to close the race condition
      const emailQuery = await t.get(
        db.collection('registrations').where('email', '==', safeEmail)
      );
      if (!emailQuery.empty) {
        duplicateReason = 'email';
        return;
      }

      // Check for duplicate transaction ID
      const txnQuery = await t.get(
        db.collection('registrations').where('paymentId', '==', cleanTxnId)
      );
      if (!txnQuery.empty) {
        duplicateReason = 'transaction';
        return;
      }

      const newDocRef = db.collection('registrations').doc(regId);
      t.set(newDocRef, registrationData);
    });

    if (duplicateReason === 'email') {
      await db.collection('registrations').doc(regId).delete();
      return res.status(409).json({
        error: 'This email is already registered. If you have an issue, please contact the organizers.'
      });
    }

    if (duplicateReason === 'transaction') {
      await db.collection('registrations').doc(regId).delete();
      return res.status(409).json({
        error: 'This Transaction ID has already been used for another registration. Each UPI payment can only be used once. Please check your UPI app for the correct Transaction ID.'
      });
    }

    // Fire-and-forget confirmation email so SMTP latency doesn't block client HTTP response
    // sendConfirmationEmail(email, name, regId, gameTitles.join(', '), finalTotal, cleanTxnId, qrImageUrl, false).catch(err => console.error('Paid reg email error:', err));

    reservedRegId = null; // Success, don't clean up
    res.json({ success: true, regId, token: null, amount: finalTotal });
  } catch (error) {
    if (reservedRegId) {
      // Catch-all cleanup for any unexpected failure after reservation
      await db.collection('registrations').doc(reservedRegId).delete().catch(e => console.error('Cleanup error:', e));
    }
    next(error);
  }
});

module.exports = router;
