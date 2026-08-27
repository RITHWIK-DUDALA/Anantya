const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');
const rateLimit = require('express-rate-limit');
const { db } = require('../firebase');
const { calculateOrderAmount } = require('../utils/pricing');
const { sendConfirmationEmail } = require('../utils/email'); // We'll need to update email utils later to support 'pending_verification' emails

// ── Shared sanitiser
const sanitizeField = (val, maxLen = 150) => {
  if (typeof val !== 'string') return '';
  return sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }).trim().slice(0, maxLen);
};

// ── Helper: Validate Student ID format
const isValidStudentId = (id) => {
  if (!id || typeof id !== 'string') return false;
  const cleaned = id.trim().toUpperCase();
  return /^[A-Z]{2,5}\.[A-Z]{2}\.[A-Z0-9]{5,15}$/.test(cleaned) || /^[A-Z0-9]{8,20}$/.test(cleaned);
};
const isAmritaEmail = (email) => email && email.toLowerCase().endsWith('@ch.students.amrita.edu');

// ── Rate Limiter: Max 5 submissions per IP per 10 minutes
const manualPaymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions from this IP. Please try again in 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Turnstile CAPTCHA Verify Helper
const verifyCaptcha = async (token, ip) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey || secretKey === 'REPLACE_ME') {
    // If not configured, we accept for dev, but log a warning
    console.warn('[CAPTCHA] TURNSTILE_SECRET_KEY missing. Bypassing validation.');
    return true; 
  }
  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', ip);
    
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    });
    const outcome = await result.json();
    return outcome.success;
  } catch (err) {
    console.error('[CAPTCHA] Verification error:', err);
    return false;
  }
};

// ── Helper: Crypto secure random ID
const generateRegId = () => {
  // 5 digit random for regId (numbers only, as requested)
  const charset = '0123456789';
  const randomBytes = crypto.randomBytes(5);
  let id = '';
  for (let i = 0; i < 5; i++) {
    id += charset[randomBytes[i] % charset.length];
  }
  return id;
};

// ── POST /api/payment/create-manual-order
router.post('/create-manual-order', manualPaymentLimiter, async (req, res, next) => {
  try {
    const { name, email, phone, dept, year, games, secretCode, studentId, utr, captchaToken } = req.body;

    if (!name || !email || !phone || !games || !Array.isArray(games) || games.length === 0 || !utr) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Basic Validations
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

    // UTR validation (8 to 50 alphanumeric characters)
    const safeUtr = utr.trim().toUpperCase();
    if (!/^[A-Z0-9]{8,50}$/.test(safeUtr)) {
      return res.status(400).json({ error: 'INVALID_UTR_FORMAT: Transaction ID must be 8-50 alphanumeric characters' });
    }

    const submissionIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    // CAPTCHA validation
    if (!captchaToken || !(await verifyCaptcha(captchaToken, submissionIp))) {
      return res.status(400).json({ error: 'CAPTCHA validation failed. Please try again.' });
    }

    const safeEmail = sanitizeField(email, 150).toLowerCase();
    const safeName = sanitizeField(name, 100);
    const safeDept = sanitizeField(dept, 50);
    const safeYear = sanitizeField(year, 20);
    const safeRole = 'Games Participant';
    const safeGames = games.map(g => sanitizeField(g, 100));
    const safeStudentId = studentId ? sanitizeField(studentId.trim().toUpperCase(), 30) : null;
    const safePhone = phone.trim().replace(/[^\d]/g, '');

    const submissionUserAgent = req.headers['user-agent'] || 'unknown';

    // ── Server-side amount calculation
    const { finalTotal, discountAmount } = calculateOrderAmount(safeGames, secretCode);

    if (finalTotal <= 0) {
      return res.status(400).json({ error: 'Amount is 0 — use the free registration endpoint' });
    }

    const baseOrderData = {
      email: safeEmail,
      name: safeName,
      phone: safePhone,
      dept: safeDept,
      year: safeYear,
      role: safeRole,
      games: safeGames,
      amountExpected: finalTotal,
      discountAmount: discountAmount || 0,
      studentId: safeStudentId,
      isAmritaStudent: isAmritaEmail(safeEmail),
      utr: safeUtr,
      paymentMethod: 'upi_manual',
      status: 'pending_verification',
      token: null,
      qrCode: null,
      checkedIn: false,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submissionIp,
      submissionUserAgent,
      verifiedBy: null,
      verifiedAt: null,
      rejectedReason: null,
      flagged: false,
      flagReason: null,
      statusCheckAttempts: 0,
      auditLog: [{
        action: 'submission_received',
        actor: 'user',
        from: null,
        to: 'pending_verification',
        timestamp: new Date().toISOString(),
        note: `Submitted UTR: ${safeUtr}`
      }]
    };

    let utrConflict = false;
    let pendingLimitReached = false;

    let finalRegId = null;

    await db.runTransaction(async (t) => {
      // 1. Check UTR uniqueness
      const utrQuery = await t.get(db.collection('registrations').where('utr', '==', safeUtr));
      if (!utrQuery.empty) {
        utrConflict = true;
        return;
      }

      // 2. Check max 3 pending submissions per email
      const emailQuery = await t.get(
        db.collection('registrations')
          .where('email', '==', safeEmail)
          .where('status', '==', 'pending_verification')
      );
      if (emailQuery.size >= 3) {
        pendingLimitReached = true;
        return;
      }
      
      // Also check if they are already verified
      const verifiedEmailQuery = await t.get(
        db.collection('registrations')
          .where('email', '==', safeEmail)
          .where('status', 'in', ['verified', 'free', 'volunteer_accepted'])
      );
      if (!verifiedEmailQuery.empty) {
        pendingLimitReached = true;
        return;
      }

      // 3. Generate a 5-char unique ID and ensure it doesn't collide
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        const candidateId = generateRegId();
        const docRef = db.collection('registrations').doc(candidateId);
        const docSnap = await t.get(docRef);
        
        if (!docSnap.exists) {
          isUnique = true;
          finalRegId = candidateId;
          t.set(docRef, { ...baseOrderData, regId: candidateId });
        }
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('COLLISION_ERROR');
      }
    });

    if (utrConflict) {
      return res.status(409).json({ error: 'This transaction ID has already been submitted.' });
    }

    if (pendingLimitReached) {
      return res.status(409).json({ error: 'Maximum pending registrations reached or email already registered.' });
    }

    // Send "submission received" email asynchronously
    // sendPendingEmail(safeEmail, safeName, finalRegId, safeGames.join(', ')).catch(console.error);

    res.json({ regId: finalRegId });
  } catch (error) {
    if (error.message === 'COLLISION_ERROR') {
      return res.status(500).json({ error: 'Failed to generate a unique registration code. Please try submitting again.' });
    }
    next(error);
  }
});

module.exports = router;
