const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Serve uploaded posters statically
app.use('/posters', express.static(path.join(__dirname, '..', 'public', 'posters')));

// Trust proxy for rate limiters behind Render/Railway
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*.razorpay.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
    },
  },
}));

// Restrict CORS
const frontendUrl = process.env.FRONTEND_URL || 'https://anantya.dpdns.org';
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [frontendUrl, 'https://anantya-2025.web.app', 'https://anantya.dpdns.org', 'http://anantya.dpdns.org', 'https://www.anantya.dpdns.org', 'http://www.anantya.dpdns.org', 'https://anantya.dpxdns.org', 'http://anantya.dpxdns.org', 'https://www.anantya.dpxdns.org'] 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (process.env.NODE_ENV !== 'production') {
      // In development, allow any localhost origin or undefined (Postman)
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // Allow server-to-server requests (like Razorpay Webhooks) which have no origin
    const isCloudDomain = origin && (
      origin.endsWith('.vercel.app') || 
      origin.endsWith('.web.app') || 
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.dpdns.org')
    );
    if (!origin || allowedOrigins.includes(origin) || isCloudDomain) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
}));

app.use(express.json());
app.use(cookieParser());

// Specific Rate Limiters (Tuned for campus NAT burst traffic during event launch)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many messages sent. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 150 : 500, // Accommodate shared campus WiFi NAT IP
  message: { error: 'Too many registration attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 150 : 500, // Accommodate shared campus WiFi NAT IP
  message: { error: 'Too many payment requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
// Apply payment limiter specifically to order creation
app.use('/api/register/paid', paymentLimiter);
const registerRoute = require('./routes/register');
const verifyRoute = require('./routes/verify');
const statusRoute = require('./routes/status');
const adminRoute = require('./routes/admin');
const contactRoute = require('./routes/contact');
const moviesRoute = require('./routes/movies');
const pricingRoute = require('./routes/pricing'); // H-1: server-side discount validation
const paymentRoute = require('./routes/payment'); // Razorpay integration

// ── Razorpay webhook MUST receive raw body for HMAC-SHA256 signature verification.
// Register this BEFORE the global express.json() middleware so the body isn't
// pre-parsed. Only this specific path gets the raw body parser.
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use('/api/register', registerLimiter, registerRoute);
app.use('/api/verify', verifyRoute);
app.use('/api/status', statusRoute);
app.use('/api/movies', moviesRoute);
app.use('/api/pricing', pricingRoute); // H-1: discount code validation endpoint
app.use('/api/payment', paymentLimiter, paymentRoute); // Razorpay payment flow
app.use('/api/admin/login', adminLimiter); // Apply strictly to login
app.use('/api/admin', adminRoute);
app.use('/api/admin/events', require('./routes/events'));
app.use('/api/admin/settings', require('./routes/settings')); // Admin settings writes
app.use('/api/settings', require('./routes/settings'));       // Public settings reads
app.use('/api/contact', contactLimiter, contactRoute);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack || err);
  // Do not leak error details to the client in production
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('exit', (code) => {
  console.log('Process exit event with code: ', code);
});

server.on('close', () => {
  console.log('Server closed');
});
