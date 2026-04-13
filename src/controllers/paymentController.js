const crypto = require('crypto');
const Order = require('../models/Order');

// Razorpay is optional - only loaded if keys exist
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.log('Razorpay not installed - payment routes will use mock mode');
}

const getRazorpayInstance = () => {
  if (!Razorpay || !process.env.RAZORPAY_KEY_ID) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body; // amount in rupees
    const razorpay = getRazorpayInstance();

    if (!razorpay) {
      // Mock response for development without Razorpay
      return res.json({
        success: true,
        mock: true,
        order: {
          id: `mock_order_${Date.now()}`,
          amount: amount * 100,
          currency: 'INR',
        },
        key: 'mock_key',
      });
    }

    const options = {
      amount: amount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `smrita_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Mock verification for development
    if (razorpay_order_id?.startsWith('mock_order_')) {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          isPaid: true,
          paidAt: new Date(),
          orderStatus: 'Confirmed',
          paymentResult: { razorpay_order_id, razorpay_payment_id: 'mock_payment', status: 'paid' },
        },
        { new: true }
      );
      return res.json({ success: true, message: 'Payment verified (mock mode).', order });
    }

    // Real Razorpay signature verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        isPaid: true,
        paidAt: new Date(),
        orderStatus: 'Confirmed',
        paymentResult: { razorpay_order_id, razorpay_payment_id, razorpay_signature, status: 'paid' },
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    res.json({ success: true, message: 'Payment verified successfully!', order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRazorpayOrder, verifyPayment };
