const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
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
    if (decoded.role === 'admin') {
      req.admin = decoded;
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { authenticateAdmin };
