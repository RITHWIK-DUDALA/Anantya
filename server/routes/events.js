const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { authenticateAdmin } = require('../middleware/auth');

// ── GET /api/admin/events ──────────────────────────────────────
// List all events, sorted by date
router.get('/', authenticateAdmin, async (req, res, next) => {
  try {
    const snapshot = await db.collection('events').orderBy('createdAt', 'desc').get();
    const events = [];
    snapshot.forEach(doc => events.push({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// ── POST /api/admin/events ─────────────────────────────────────
// Create a new event
router.post('/', authenticateAdmin, async (req, res, next) => {
  try {
    const {
      title, description, date, time, venue, capacity,
      category, imageUrl, status, scheduledPublishAt
    } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ error: 'Title, date, and time are required.' });
    }

    const validStatuses = ['draft', 'published', 'scheduled'];
    const eventStatus = validStatuses.includes(status) ? status : 'draft';

    const newEvent = {
      title: title.trim(),
      description: description?.trim() || '',
      date,
      time,
      venue: venue?.trim() || '',
      capacity: parseInt(capacity) || 0,
      category: category || 'General',
      imageUrl: imageUrl?.trim() || '',
      status: eventStatus,
      scheduledPublishAt: eventStatus === 'scheduled' ? (scheduledPublishAt || null) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.admin.identifier,
    };

    const docRef = await db.collection('events').add(newEvent);
    res.status(201).json({ id: docRef.id, ...newEvent });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/admin/events/:id ────────────────────────────────
// Update an event (edit fields or change status)
router.patch('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('events').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found.' });

    const allowedFields = ['title', 'description', 'date', 'time', 'venue', 'capacity', 'category', 'imageUrl', 'status', 'scheduledPublishAt', 'releaseAt'];
    const updates = { updatedAt: new Date().toISOString(), updatedBy: req.admin.identifier };

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Auto-clear scheduledPublishAt if status isn't 'scheduled'
    if (updates.status && updates.status !== 'scheduled') {
      updates.scheduledPublishAt = null;
    }

    await docRef.update(updates);
    res.json({ success: true, id, ...updates });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/admin/events/:id ───────────────────────────────
// Delete an event
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('events').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found.' });

    await docRef.delete();
    res.json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /api/admin/events/:id/schedule ──────────────────────
// Convenience route: schedule a future publish time
router.patch('/:id/schedule', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scheduledPublishAt } = req.body;
    if (!scheduledPublishAt) return res.status(400).json({ error: 'scheduledPublishAt is required.' });

    const docRef = db.collection('events').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found.' });

    await docRef.update({
      status: 'scheduled',
      scheduledPublishAt,
      updatedAt: new Date().toISOString(),
      updatedBy: req.admin.identifier,
    });
    res.json({ success: true, message: 'Event scheduled.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
