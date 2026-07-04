const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const { db } = require('../firebase');
const { sendConfirmationEmail } = require('../utils/email');
const { appendRegistrationToExcel } = require('../utils/excel');
const { calculateOrderAmount } = require('../utils/pricing');

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

    const regId = `REG-${crypto.randomUUID()}`;
    const token = await generateUniqueToken();

    const qrData = JSON.stringify({ regId });
    const qrImageUrl = await QRCode.toDataURL(qrData);

    const registrationData = {
      name, email, phone, dept, year, role,
      games: Array.isArray(games) ? games : (games ? games.split(',').map(g => g.trim()) : []),
      amount: 0,
      status: "free",
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

    const registrationData = {
      name, email, phone, dept, year,
      role: role || 'Games Participant',
      games: gameTitles,
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

    await db.collection('registrations').doc(regId).set(registrationData);

    await sendConfirmationEmail(email, name, regId, gameTitles.join(', '), finalTotal, cleanTxnId, qrImageUrl, false);
    appendRegistrationToExcel(registrationData);

    res.json({ success: true, regId, token, amount: finalTotal });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
