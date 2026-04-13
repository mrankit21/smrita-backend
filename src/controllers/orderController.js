const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail, orderConfirmationTemplate } = require('../config/email');

const COMBO_SIZE = 3;
const COMBO_PRICE = 250;
const INDIVIDUAL_PRICE = 100;

const calculateCombo = (items) => {
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const combos = Math.floor(totalQty / COMBO_SIZE);
  const remainder = totalQty % COMBO_SIZE;
  const regularTotal = totalQty * INDIVIDUAL_PRICE;
  const actualTotal = (combos * COMBO_PRICE) + (remainder * INDIVIDUAL_PRICE);
  const discount = regularTotal - actualTotal;
  return { combos, itemsTotal: regularTotal, comboDiscount: discount, totalAmount: actualTotal };
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }

    // Verify products exist and are in stock
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.inStock) {
        return res.status(400).json({ success: false, message: `Product ${item.name} is out of stock.` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const pricing = calculateCombo(orderItems);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      notes: notes || '',
      ...pricing,
      statusHistory: [{ status: 'Pending', note: 'Order placed successfully.' }],
    });

    // Update stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stockCount: -item.quantity } });
    }

    // Send confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Order Confirmed - SMRITA #${order._id.toString().slice(-8).toUpperCase()}`,
        html: orderConfirmationTemplate(order, req.user),
      });
    } catch (emailErr) {
      console.log('Email send failed (non-critical):', emailErr.message);
    }

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Confirmation email sent.',
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Allow only owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: `Cannot cancel order with status: ${order.orderStatus}` });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by customer.' });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stockCount: item.quantity } });
    }

    res.json({ success: true, message: 'Order cancelled successfully.', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/admin/:id/status
// @access  Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.orderStatus = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}.` });
    if (trackingId) order.trackingId = trackingId;
    if (status === 'Delivered') order.deliveredAt = new Date();
    if (status === 'Confirmed' && !order.isPaid && order.paymentMethod === 'cod') {
      // COD confirmed
    }
    await order.save();

    res.json({ success: true, message: `Order status updated to ${status}.`, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats (Admin)
// @route   GET /api/orders/admin/stats
// @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        monthlyRevenue,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus, getDashboardStats };
