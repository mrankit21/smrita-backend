const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, toggleUserStatus, makeAdmin } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getAllUsers);
router.get('/:id', protect, adminOnly, getUser);
router.put('/:id/toggle-status', protect, adminOnly, toggleUserStatus);
router.put('/:id/make-admin', protect, adminOnly, makeAdmin);

module.exports = router;
