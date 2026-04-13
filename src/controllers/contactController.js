const Contact = require('../models/Contact');
const { sendEmail, contactEmailTemplate } = require('../config/email');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
    }
    if (message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters.' });
    }

    const contact = await Contact.create({ name, email, message });

    // Notify admin
    try {
      await sendEmail({
        to: process.env.EMAIL_USER || 'smritasacred@gmail.com',
        subject: `New Contact Message from ${name} - SMRITA Website`,
        html: contactEmailTemplate({ name, email, message }),
      });
    } catch (emailErr) {
      console.log('Admin notification email failed (non-critical):', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will respond within 24 hours.',
      contact: { _id: contact._id, name, email },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contacts (Admin)
// @route   GET /api/contact
// @access  Admin
const getAllContacts = async (req, res, next) => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;
    const query = isRead !== undefined ? { isRead: isRead === 'true' } : {};
    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, total, contacts });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark contact as read (Admin)
// @route   PUT /api/contact/:id/read
// @access  Admin
const markAsRead = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true, repliedAt: new Date() },
      { new: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found.' });
    res.json({ success: true, message: 'Marked as read.', contact });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContact, getAllContacts, markAsRead };
