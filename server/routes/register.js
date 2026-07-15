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

// Helper: Secure unique token generator
async function generateUniqueToken() {
  let isUnique = false;
  let token = '';
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    token = crypto.randomInt(100000, 1000000).toString();
    const snapshot = await db.collection('registrations').where('token', '==', token).get();
    if (snapshot.empty) isUnique = true;
    attempts++;
  }
  if (!isUnique) throw new Error('Failed to generate unique token');
  return token;
}

// POST /api/register/free
router.post('/free', async (req, res, next) => {
  try {
    const { name, email, phone, dept, year, role, games, secretCode, discountAmount } = req.body;

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

    const regId = `REG-${crypto.randomUUID()}`;
    const token = await generateUniqueToken();

    const qrData = JSON.stringify({ regId });
    const qrImageUrl = await QRCode.toDataURL(qrData);

    const volunteerRoles = ['Decoration Volunteer', 'Disciplinary Volunteer', 'Prasadam Distribution Volunteer'];
    const isVolunteer = volunteerRoles.includes(role);

    const safeEmail = sanitizeField(email, 150);
    const safeName = sanitizeField(name, 100);
    const safeDept = sanitizeField(dept, 50);
    const safeYear = sanitizeField(year, 20);
    const safeRole = sanitizeField(role, 50);
    const rawGamesArray = Array.isArray(games) ? games : (games ? games.split(',').map(g => g.trim()) : []);
    const safeGames = rawGamesArray.map(g => sanitizeField(g, 100));

    const registrationData = {
      name: safeName, email: safeEmail, phone, dept: safeDept, year: safeYear, role: safeRole,
      games: safeGames,
      amount: 0,
      status: isVolunteer ? "volunteer_pending" : "free",
      paymentId: null,
      registeredAt: new Date().toISOString(),
      regId, token,
      qrCode: qrImageUrl,
      checkedIn: false,
      secretCode: secretCode || '',
      discountAmount: discountAmount || 0
    };

    await db.collection('registrations').doc(regId).set(registrationData);

    await sendConfirmationEmail(email, name, regId, role, 0, null, qrImageUrl, true);
    appendRegistrationToExcel(registrationData);

    res.json({ success: true, regId, token });
  } catch (error) {
    next(error);
  }
});

// POST /api/register/paid
// UPI manual payment — user submits their UPI transaction ID, admin verifies manually
router.post('/paid', async (req, res, next) => {
  try {
    const { name, email, phone, dept, year, role, games, secretCode, transactionId } = req.body;

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

    // Sanitize and validate transaction ID
    const cleanTxnId = transactionId.trim();
    if (cleanTxnId.length < 6 || !/^[a-zA-Z0-9]+$/.test(cleanTxnId)) {
      return res.status(400).json({ error: 'Invalid transaction ID format' });
    }

    // Server-side amount calculation
    const gameTitles = Array.isArray(games) ? games : (games ? games.split(',').map(g => g.trim()) : []);
    const { finalTotal, discountAmount } = calculateOrderAmount(gameTitles, secretCode);

    if (finalTotal <= 0) {
      return res.status(400).json({ error: 'Amount is 0 — use the free registration endpoint' });
    }

    const regId = `REG-${crypto.randomUUID()}`;
    const token = await generateUniqueToken();

    const qrData = JSON.stringify({ regId });
    const qrImageUrl = await QRCode.toDataURL(qrData);

    const safeEmail = sanitizeField(email, 150);
    const safeName = sanitizeField(name, 100);
    const safeDept = sanitizeField(dept, 50);
    const safeYear = sanitizeField(year, 20);
    const safeRole = sanitizeField(role || 'Games Participant', 50);
    const safeGames = gameTitles.map(g => sanitizeField(g, 100));

    const registrationData = {
      name: safeName, email: safeEmail, phone, dept: safeDept, year: safeYear,
      role: safeRole,
      games: safeGames,
      amount: finalTotal,
      status: "pending_verification",
      paymentId: cleanTxnId,      // UPI transaction ID for admin to verify
      registeredAt: new Date().toISOString(),
      regId, token,
      qrCode: qrImageUrl,
      checkedIn: false,
      secretCode: secretCode || '',
      discountAmount: discountAmount || 0
    };

    let isDuplicate = false;
    await db.runTransaction(async (t) => {
      const querySnapshot = await t.get(db.collection('registrations').where('paymentId', '==', cleanTxnId));
      if (!querySnapshot.empty) {
        isDuplicate = true;
        return;
      }
      const newDocRef = db.collection('registrations').doc(regId);
      t.set(newDocRef, registrationData);
    });

    if (isDuplicate) {
      return res.status(409).json({ error: 'This transaction ID has already been used.' });
    }

    await sendConfirmationEmail(email, name, regId, gameTitles.join(', '), finalTotal, cleanTxnId, qrImageUrl, false);
    appendRegistrationToExcel(registrationData);

    res.json({ success: true, regId, token, amount: finalTotal });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
