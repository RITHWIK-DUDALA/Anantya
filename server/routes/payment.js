const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const QRCode = require('qrcode');
const sanitizeHtml = require('sanitize-html');
const { db } = require('../firebase');
const { sendConfirmationEmail } = require('../utils/email');
const { calculateOrderAmount } = require('../utils/pricing');

// ── Shared sanitiser ────────────────────────────────────────────────────────
const sanitizeField = (val, maxLen = 150) => {
  if (typeof val !== 'string') return '';
  return sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }).trim().slice(0, maxLen);
};

// ── Helper: Secure unique token generator ───────────────────────────────────
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

// ── Helper: Validate Student ID format ─────────────────────────────────────
const isValidStudentId = (id) => {
  if (!id || typeof id !== 'string') return false;
  const cleaned = id.trim().toUpperCase();
  return /^[A-Z]{2,5}\.[A-Z]{2}\.[A-Z0-9]{5,15}$/.test(cleaned) || /^[A-Z0-9]{8,20}$/.test(cleaned);
};
const isAmritaEmail = (email) => email && email.toLowerCase().endsWith('@ch.students.amrita.edu');

// ── Razorpay instance ───────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── POST /api/payment/create-order ─────────────────────────────────────────
// Step 1: User fills form, selects games.
// Server calculates amount, creates Razorpay Order, and writes an 'order_created'
// registration document to Firestore in a single transaction.
router.post('/create-order', async (req, res, next) => {
  try {
    const { name, email, phone, dept, year, games, secretCode, studentId } = req.body;

    if (!name || !email || !phone || !games || !Array.isArray(games) || games.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (isAmritaEmail(email)) {
      if (!studentId || !isValidStudentId(studentId)) {
        return res.status(400).json({ error: 'Amrita Chennai students must provide a valid Student ID (e.g. CB.EN.U4CSE23001)' });
      }
    }

    const safeEmail = sanitizeField(email, 150).toLowerCase().trim();
    const safeName = sanitizeField(name, 100);
    const safeDept = sanitizeField(dept, 50);
    const safeYear = sanitizeField(year, 20);
    const safeRole = 'Games Participant';
    const safeGames = games.map(g => sanitizeField(g, 100));
    const safeStudentId = studentId ? sanitizeField(studentId.trim().toUpperCase(), 30) : null;
    const safePhone = phone.trim().replace(/[^\d]/g, '');

    // ── Server-side amount calculation ──────────────────────────────────────
    const { finalTotal, discountAmount } = calculateOrderAmount(safeGames, secretCode);

    if (finalTotal <= 0) {
      return res.status(400).json({ error: 'Amount is 0 — use the free registration endpoint' });
    }

    // ── Check if Razorpay keys are configured ────────────────────────────────
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('REPLACE_ME')) {
      return res.status(400).json({ 
        error: 'Razorpay payment gateway keys are not configured in server/.env yet. Please use "Pay via UPI instead" below or add your Razorpay API keys.' 
      });
    }

    // ── Create Razorpay order ───────────────────────────────────────────────
    const order = await razorpay.orders.create({
      amount: finalTotal * 100,
      currency: 'INR',
      receipt: `reg_${crypto.randomUUID().slice(0, 16)}`,
      notes: {
        email: safeEmail,
        name: safeName,
        games: safeGames.join(', ').slice(0, 256),
      },
    });

    const razorpayOrderId = order.id;
    const regId = `REG-${crypto.randomUUID()}`;

    // Document data created with status: "order_created"
    const orderCreatedData = {
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      dept: safeDept,
      year: safeYear,
      role: safeRole,
      games: safeGames,
      amount: finalTotal,
      status: 'order_created',         // Will be updated to 'verified' on webhook/verification
      paymentMethod: 'razorpay',
      razorpayOrderId,
      razorpayPaymentId: null,
      paymentId: null,
      registeredAt: new Date().toISOString(),
      regId,
      token: null,                     // Assigned on payment confirmation
      qrCode: null,
      checkedIn: false,
      discountAmount: discountAmount || 0,
      studentId: safeStudentId,
      isAmritaStudent: isAmritaEmail(safeEmail),
    };

    // ── Atomic check + write inside transaction ─────────────────────────────
    // Query by email only (does NOT require a composite index), filter status in-memory
    let duplicateEmail = false;
    await db.runTransaction(async (t) => {
      const emailQuery = await t.get(
        db.collection('registrations').where('email', '==', safeEmail)
      );
      const hasActiveRegistration = emailQuery.docs.some(doc => {
        const st = doc.data().status;
        return ['verified', 'free', 'pending_verification', 'volunteer_pending', 'volunteer_accepted'].includes(st);
      });
      if (hasActiveRegistration) {
        duplicateEmail = true;
        return;
      }
      // Store document using razorpayOrderId as document ID for O(1) atomic lookups
      t.set(db.collection('registrations').doc(razorpayOrderId), orderCreatedData);
    });

    if (duplicateEmail) {
      return res.status(409).json({ error: 'This email is already registered. If you have an issue, please contact the organizers.' });
    }

    res.json({
      orderId: order.id,
      regId,
      amount: finalTotal,          // in rupees (for display)
      amountPaise: order.amount,   // in paise (for Razorpay SDK)
      keyId: process.env.RAZORPAY_KEY_ID,
      currency: 'INR',
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/payment/webhook ───────────────────────────────────────────────
// Step 2 (server-to-server): Razorpay calls this endpoint on payment capture.
// Fully idempotent & non-blocking email response.
router.post('/webhook', async (req, res, next) => {
  try {
    const razorpaySignature = req.headers['x-razorpay-signature'];
    if (!razorpaySignature) {
      return res.status(400).json({ error: 'Missing signature header' });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret === 'REPLACE_ME') {
      console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET is not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    const rawBody = req.body;

    // ── Verify HMAC-SHA256 signature ────────────────────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.warn('[Webhook] Signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event !== 'payment.captured') {
      return res.json({ status: 'ignored', event: event.event });
    }

    const payment = event.payload?.payment?.entity;
    if (!payment) {
      return res.status(400).json({ error: 'Invalid payload structure' });
    }

    const { order_id: razorpayOrderId, id: razorpayPaymentId } = payment;

    // ── Idempotent Transactional Update ─────────────────────────────────────
    let alreadyVerified = false;
    let finalRegData = null;

    const docRef = db.collection('registrations').doc(razorpayOrderId);

    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      if (!doc.exists) {
        throw new Error('ORDER_DOC_NOT_FOUND');
      }

      const data = doc.data();

      // If already verified, exit transaction without changes (idempotent ack)
      if (data.status === 'verified') {
        alreadyVerified = true;
        finalRegData = data;
        return;
      }

      // Generate token and QR code for confirmed registration
      const token = await generateUniqueToken();
      const qrData = JSON.stringify({ regId: data.regId });
      const qrImageUrl = await QRCode.toDataURL(qrData);

      const updates = {
        status: 'verified',
        razorpayPaymentId,
        paymentId: razorpayPaymentId,
        token,
        qrCode: qrImageUrl,
        verifiedAt: new Date().toISOString(),
      };

      t.update(docRef, updates);
      finalRegData = { ...data, ...updates };
    });

    // Respond IMMEDIATELY to Razorpay with 200 OK so retries aren't triggered
    res.json({ status: alreadyVerified ? 'already_processed' : 'success', regId: finalRegData?.regId });

    // Send confirmation email asynchronously (fire-and-forget) AFTER HTTP response
    if (!alreadyVerified && finalRegData) {
      sendConfirmationEmail(
        finalRegData.email,
        finalRegData.name,
        finalRegData.regId,
        (finalRegData.games || []).join(', '),
        finalRegData.amount,
        razorpayPaymentId,
        finalRegData.qrCode,
        false
      ).catch(err => console.error('[Webhook] Async email error:', err));
    }
  } catch (error) {
    if (error.message === 'ORDER_DOC_NOT_FOUND') {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.error('[Webhook] Error:', error);
    next(error);
  }
});

// ── POST /api/payment/verify ────────────────────────────────────────────────
// Client-side verification called after Razorpay checkout popup callback.
// Verifies payment signature and ensures status is updated.
router.post('/verify', async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Missing verification parameters' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    const docRef = db.collection('registrations').doc(razorpayOrderId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Registration order not found' });
    }

    let data = doc.data();

    // If status is still 'order_created' (e.g. webhook is slightly delayed), update it here
    if (data.status === 'order_created') {
      let finalRegData = null;
      await db.runTransaction(async (t) => {
        const freshDoc = await t.get(docRef);
        const freshData = freshDoc.data();
        if (freshData.status === 'verified') {
          finalRegData = freshData;
          return;
        }

        const token = await generateUniqueToken();
        const qrData = JSON.stringify({ regId: freshData.regId });
        const qrImageUrl = await QRCode.toDataURL(qrData);

        const updates = {
          status: 'verified',
          razorpayPaymentId,
          paymentId: razorpayPaymentId,
          token,
          qrCode: qrImageUrl,
          verifiedAt: new Date().toISOString(),
        };

        t.update(docRef, updates);
        finalRegData = { ...freshData, ...updates };
      });

      data = finalRegData;

      // Fire email asynchronously
      sendConfirmationEmail(
        data.email,
        data.name,
        data.regId,
        (data.games || []).join(', '),
        data.amount,
        razorpayPaymentId,
        data.qrCode,
        false
      ).catch(err => console.error('[Client Verify] Async email error:', err));
    }

    return res.json({
      status: 'verified',
      regId: data.regId,
      token: data.token,
      amount: data.amount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
