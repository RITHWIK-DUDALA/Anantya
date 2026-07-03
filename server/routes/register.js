const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const Razorpay = require('razorpay');
const { db } = require('../firebase');
const { sendConfirmationEmail } = require('../utils/email');
const { appendRegistrationToExcel } = require('../utils/excel');
const { calculateOrderAmount } = require('../utils/pricing');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
      razorpayOrderId: null,
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

router.post('/create-order', async (req, res, next) => {
  try {
    const { name, email, phone, dept, year, role, games, secretCode, discountAmount, calculatedAmount } = req.body;

    if (!name || !email || !phone || calculatedAmount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Use the server-side price calculation logic
    const gameTitles = Array.isArray(games) ? games : (games ? games.split(',').map(g => g.trim()) : []);
    const { finalTotal } = calculateOrderAmount(gameTitles, secretCode);
    
    // We enforce our server-calculated amount
    const amount = finalTotal;
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Calculated amount is 0, use free registration' });
    }

    const regId = `REG-${crypto.randomUUID()}`;
    const token = await generateUniqueToken();

    const qrData = JSON.stringify({ regId });
    const qrImageUrl = await QRCode.toDataURL(qrData);

    // Create Razorpay Order
    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: regId,
    };

    const order = await razorpay.orders.create(options);

    const registrationData = {
      name, email, phone, dept, year, role,
      games: Array.isArray(games) ? games : (games ? games.split(',').map(g => g.trim()) : []),
      amount,
      status: "pending_verification",
      paymentId: null,
      registeredAt: new Date().toISOString(),
      regId, token,
      razorpayOrderId: order.id,
      qrCode: qrImageUrl,
      checkedIn: false,
      secretCode: secretCode || '',
      discountAmount: discountAmount || 0
    };

    await db.collection('registrations').doc(regId).set(registrationData);

    res.json({ success: true, regId, token, order_id: order.id, amount });
  } catch (error) {
    next(error);
  }
});

// Webhook for Razorpay payment success
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('Webhook secret not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const signature = req.headers['x-razorpay-signature'];
    
    // Express raw body is needed here if signature verification fails with parsed JSON
    // Since we use express.json() globally, we might need a specific parsing strategy 
    // but we'll use crypto to verify
    
    const bodyString = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', secret)
                                    .update(bodyString)
                                    .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      // Find registration by razorpayOrderId
      const snapshot = await db.collection('registrations').where('razorpayOrderId', '==', orderId).get();
      if (snapshot.empty) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const doc = snapshot.docs[0];
      const data = doc.data();

      // Idempotency check: if already verified or paymentId exists, ignore
      if (data.status === 'verified' && data.paymentId === paymentId) {
        return res.json({ status: 'ok', message: 'Already processed' });
      }

      await doc.ref.update({
        status: 'verified',
        paymentId: paymentId
      });

      await sendConfirmationEmail(data.email, data.name, data.regId, data.games, data.amount, paymentId, data.qrCode, false);
      appendRegistrationToExcel({ ...data, status: 'verified', paymentId });
    }

    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
