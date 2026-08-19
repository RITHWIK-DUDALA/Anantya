const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { db } = require('../firebase');
const { authenticateAdmin } = require('../middleware/auth');

// ── Multer setup — save posters to public/posters/ ──────────────────────────
const postersDir = path.join(__dirname, '..', '..', 'public', 'posters');
if (!fs.existsSync(postersDir)) fs.mkdirSync(postersDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, postersDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `poster-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/i;
    if (allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
    }
  },
});

// ── Settings Firestore ref ───────────────────────────────────────────────────
const SETTINGS_DOC = () => db.collection('settings').doc('global');

// ── PUBLIC: GET /api/settings/event-date ────────────────────────────────────
router.get('/event-date', async (req, res, next) => {
  try {
    const doc = await SETTINGS_DOC().get();
    if (doc.exists && doc.data().eventDate) {
      return res.json({ eventDate: doc.data().eventDate });
    }
    res.json({ eventDate: null }); // client falls back to config
  } catch (error) {
    next(error);
  }
});

// ── PUBLIC: GET /api/settings/timeline ──────────────────────────────────────
router.get('/timeline', async (req, res, next) => {
  try {
    const doc = await SETTINGS_DOC().get();
    if (doc.exists && Array.isArray(doc.data().timeline)) {
      return res.json({ timeline: doc.data().timeline });
    }
    res.json({ timeline: null }); // client falls back to static data
  } catch (error) {
    next(error);
  }
});

// ── ADMIN: PATCH /api/admin/settings/event-date ─────────────────────────────
router.patch('/event-date', authenticateAdmin, async (req, res, next) => {
  try {
    const { eventDate } = req.body;
    if (!eventDate) return res.status(400).json({ error: 'eventDate is required' });
    // Basic ISO / datetime-local validation
    const d = new Date(eventDate);
    if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid date format' });

    await SETTINGS_DOC().set({ eventDate }, { merge: true });
    res.json({ success: true, eventDate });
  } catch (error) {
    next(error);
  }
});

// ── ADMIN: PATCH /api/admin/settings/timeline ───────────────────────────────
router.patch('/timeline', authenticateAdmin, async (req, res, next) => {
  try {
    const { timeline } = req.body;
    if (!Array.isArray(timeline)) return res.status(400).json({ error: 'timeline must be an array' });

    // Sanitise each entry — only allow known keys
    const clean = timeline.map((item, idx) => ({
      id: item.id ?? idx + 1,
      icon: String(item.icon || '🎪').slice(0, 10),
      name: String(item.name || '').slice(0, 120),
      time: String(item.time || '').slice(0, 80),
      description: String(item.description || '').slice(0, 300),
      category: String(item.category || 'General').slice(0, 40),
    }));

    await SETTINGS_DOC().set({ timeline: clean }, { merge: true });
    res.json({ success: true, count: clean.length });
  } catch (error) {
    next(error);
  }
});

// ── ADMIN: POST /api/admin/settings/upload-poster ───────────────────────────
router.post('/upload-poster', authenticateAdmin, upload.single('poster'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Return the public URL path
  const publicUrl = `/posters/${req.file.filename}`;
  res.json({ success: true, url: publicUrl });
});

module.exports = router;
