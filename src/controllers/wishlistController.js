const Wishlist = require('../models/Wishlist');

// @desc    Get my wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    res.json({ success: true, products: wishlist?.products || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle/:productId
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
      return res.json({ success: true, added: true, message: 'Added to wishlist.' });
    }

    const isInWishlist = wishlist.products.includes(productId);
    if (isInWishlist) {
      wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
      await wishlist.save();
      return res.json({ success: true, added: false, message: 'Removed from wishlist.' });
    } else {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ success: true, added: true, message: 'Added to wishlist.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
const clearWishlist = async (req, res, next) => {
  try {
    await Wishlist.findOneAndUpdate({ user: req.user._id }, { products: [] });
    res.json({ success: true, message: 'Wishlist cleared.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, toggleWishlist, clearWishlist };
