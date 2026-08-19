const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { calculateOrderAmountFromBase } = require('../utils/pricing');

// Rate-limit discount code validation to slow down enumeration of valid codes
const discountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/pricing/validate-discount
// H-1: Validates a secret code server-side and returns ONLY the computed discount
// amount — never the code list or logic. The frontend uses this number for the
// price preview. The actual amount is independently re-verified during registration.
router.post('/validate-discount', discountLimiter, (req, res) => {
  const { code, baseTotal } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, error: 'Invalid secret code' });
  }

  const parsedBase = parseFloat(baseTotal);
  if (isNaN(parsedBase) || parsedBase < 0) {
    return res.status(400).json({ valid: false, error: 'Invalid base total' });
  }

  const result = calculateOrderAmountFromBase(parsedBase, code);

  if (!result.valid) {
    return res.status(400).json({ valid: false, error: 'Invalid secret code' });
  }

  res.json({
    valid: true,
    discount: result.discountAmount,
    finalTotal: result.finalTotal,
  });
});

module.exports = router;
