const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../utils/email');

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (name.length > 100 || email.length > 150 || message.length > 1500) {
      return res.status(400).json({ error: 'Input exceeds maximum allowed length' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    await sendContactEmail(name, email, message);
    
    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact route error:', error);
    res.status(500).json({ error: 'Failed to send your message. Please try again later.' });
  }
});

module.exports = router;
