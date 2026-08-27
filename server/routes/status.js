const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { db } = require('../firebase');

// ── Turnstile CAPTCHA Verify Helper
const verifyCaptcha = async (token, ip) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey || secretKey === 'REPLACE_ME') {
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
    return false;
  }
};

const statusCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { message: "No matching registration found." }, // Match generic response on lockout
  standardHeaders: true,
  legacyHeaders: false,
});

const statusCheckHourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: { message: "No matching registration found." }, // Match generic response on lockout
  standardHeaders: true,
  legacyHeaders: false,
});

// ── POST /api/status/check
router.post('/check', statusCheckLimiter, statusCheckHourlyLimiter, async (req, res, next) => {
  try {
    const { email, regId, captchaToken } = req.body;

    if (!email || !regId) {
      return res.status(404).json({ message: "No matching registration found." });
    }

    const submissionIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    // CAPTCHA validation
    if (!captchaToken || !(await verifyCaptcha(captchaToken, submissionIp))) {
      // Return same generic error to prevent enumeration, but status checks fail if captcha is bad
      return res.status(404).json({ message: "No matching registration found." });
    }

    const safeEmail = email.trim().toLowerCase();

    const docRef = db.collection('registrations').doc(regId);
    
    // We increment attempts regardless of success, to prevent regId hammering
    await docRef.update({
      statusCheckAttempts: require('firebase-admin/firestore').FieldValue.increment(1)
    }).catch(() => {}); // ignore if doc doesn't exist

    const doc = await docRef.get();

    // Generic identical response for ANY mismatch
    const genericError = () => res.status(404).json({ message: "No matching registration found." });

    if (!doc.exists) {
      // Log failure
      await db.collection('statusCheckLogs').add({
        regId,
        ip: submissionIp,
        success: false,
        reason: 'not_found',
        timestamp: new Date().toISOString()
      });
      return genericError();
    }

    const data = doc.data();

    if (data.email !== safeEmail) {
      // Log failure
      await db.collection('statusCheckLogs').add({
        regId,
        ip: submissionIp,
        success: false,
        reason: 'email_mismatch',
        timestamp: new Date().toISOString()
      });
      return genericError();
    }

    // Log success
    await db.collection('statusCheckLogs').add({
      regId,
      ip: submissionIp,
      success: true,
      timestamp: new Date().toISOString()
    });

    const responsePayload = {
      status: data.status,
      gameId: data.gameId || (data.games ? data.games.join(', ') : ''),
      name: data.name
    };

    if (data.status === 'verified') {
      responsePayload.token = data.token;
      responsePayload.qrCode = data.qrCode;
    }

    if (data.status === 'rejected') {
      responsePayload.rejectedReason = data.rejectedReason;
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('[Status Check Error]', error);
    // Generic error on throw
    res.status(404).json({ message: "No matching registration found." });
  }
});

module.exports = router;
