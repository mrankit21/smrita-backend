const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist, clearWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWishlist);
router.post('/toggle/:productId', protect, toggleWishlist);
router.delete('/clear', protect, clearWishlist);

module.exports = router;
