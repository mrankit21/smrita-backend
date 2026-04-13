const express = require('express');
const router = express.Router();
const { submitContact, getAllContacts, markAsRead } = require('../controllers/contactController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/', protect, adminOnly, getAllContacts);
router.put('/:id/read', protect, adminOnly, markAsRead);

module.exports = router;
