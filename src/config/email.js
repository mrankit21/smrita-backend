const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'SMRITA <smritasacred@gmail.com>',
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// Order confirmation email template
const orderConfirmationTemplate = (order, user) => `
  <div style="font-family: Georgia, serif; background: #0a0a0a; color: #e8d5a3; padding: 40px; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; border-bottom: 1px solid #3a2800; padding-bottom: 24px; margin-bottom: 24px;">
      <h1 style="color: #f4c430; letter-spacing: 6px; font-size: 32px; margin: 0;">SMRITA</h1>
      <p style="color: rgba(232,213,163,0.4); font-size: 11px; letter-spacing: 3px; margin: 4px 0 0;">Made with Devotion</p>
    </div>
    <h2 style="color: #f4c430; font-size: 22px; margin-bottom: 8px;">Order Confirmed! 🪔</h2>
    <p style="color: rgba(232,213,163,0.6); margin-bottom: 20px;">Dear ${user.name}, your sacred fragrances are on their way.</p>
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(244,196,48,0.2); padding: 20px; margin-bottom: 20px;">
      <p style="color: rgba(180,130,0,0.6); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Order ID</p>
      <p style="color: #f4c430; font-size: 16px; font-weight: bold; margin: 0 0 16px;">${order._id}</p>
      ${order.items.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(244,196,48,0.08);">
          <span style="color: rgba(232,213,163,0.7);">${item.name} × ${item.quantity}</span>
          <span style="color: #f4c430;">₹${item.price * item.quantity}</span>
        </div>
      `).join('')}
      <div style="display: flex; justify-content: space-between; padding-top: 12px; margin-top: 4px;">
        <strong style="color: rgba(232,213,163,0.8);">Total Paid</strong>
        <strong style="color: #f4c430; font-size: 20px;">₹${order.totalAmount}</strong>
      </div>
    </div>
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(244,196,48,0.15); padding: 16px; margin-bottom: 20px;">
      <p style="color: rgba(180,130,0,0.6); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">Shipping To</p>
      <p style="color: rgba(232,213,163,0.6); margin: 0; line-height: 1.7;">
        ${order.shippingAddress.address}, ${order.shippingAddress.city},<br>
        ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
      </p>
    </div>
    <p style="color: rgba(232,213,163,0.3); font-size: 12px; font-style: italic; text-align: center; margin-bottom: 20px;">
      "May these sacred fragrances fill your home with peace and devotion."
    </p>
    <div style="text-align: center; border-top: 1px solid #3a2800; padding-top: 20px;">
      <p style="color: rgba(180,130,0,0.4); font-size: 10px; margin: 0;">SMRITA Enterprises | k-22/201, Azadpur village, North West Delhi - 110033</p>
      <p style="color: rgba(180,130,0,0.4); font-size: 10px; margin: 4px 0 0;">Tel: +91 8970202304 | smritasacred@gmail.com</p>
    </div>
  </div>
`;

// Contact form email template
const contactEmailTemplate = (data) => `
  <div style="font-family: Georgia, serif; background: #0a0a0a; color: #e8d5a3; padding: 32px; max-width: 500px;">
    <h2 style="color: #f4c430;">New Contact Message - SMRITA</h2>
    <p><strong style="color: rgba(244,196,48,0.7);">From:</strong> ${data.name}</p>
    <p><strong style="color: rgba(244,196,48,0.7);">Email:</strong> ${data.email}</p>
    <p><strong style="color: rgba(244,196,48,0.7);">Message:</strong></p>
    <p style="color: rgba(232,213,163,0.6); border-left: 3px solid #b8860b; padding-left: 12px;">${data.message}</p>
  </div>
`;

module.exports = { sendEmail, orderConfirmationTemplate, contactEmailTemplate };
