const jwt = require('jsonwebtoken');
const { db } = require('../firebase');

const authenticateAdmin = async (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }

    // Check the JWT denylist — tokens are added here on logout
    if (decoded.jti) {
      const revoked = await db.collection('revokedTokens').doc(decoded.jti).get();
      if (revoked.exists) {
        return res.status(401).json({ error: 'Unauthorized: Session has been revoked. Please log in again.' });
      }
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = { authenticateAdmin };
