# 🪔 SMRITA Backend — Made with Devotion
## Node.js + Express + MongoDB REST API

---

## 📁 Folder Structure

```
smrita-backend/
├── src/
│   ├── server.js              ← Main entry point
│   ├── config/
│   │   ├── db.js              ← MongoDB connection
│   │   └── email.js           ← Nodemailer + email templates
│   ├── models/
│   │   ├── User.js            ← User schema
│   │   ├── Product.js         ← Product schema
│   │   ├── Order.js           ← Order schema (with combo logic)
│   │   ├── Contact.js         ← Contact form schema
│   │   └── Wishlist.js        ← Wishlist schema
│   ├── controllers/
│   │   ├── authController.js  ← Register, Login, Profile
│   │   ├── productController.js ← CRUD + Reviews
│   │   ├── orderController.js ← Orders + Admin stats
│   │   ├── contactController.js ← Contact form
│   │   ├── paymentController.js ← Razorpay integration
│   │   ├── userController.js  ← Admin user management
│   │   └── wishlistController.js ← Wishlist toggle
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── userRoutes.js
│   │   └── wishlistRoutes.js
│   ├── middleware/
│   │   ├── auth.js            ← JWT protect + adminOnly
│   │   ├── errorHandler.js    ← Global error handler
│   │   └── upload.js          ← Multer image upload
│   └── utils/
│       └── seed.js            ← Database seeder (9 products + admin)
├── uploads/                   ← Product images stored here
├── .env.example               ← Copy to .env and fill values
├── package.json
├── API_REFERENCE.txt          ← All API endpoints documented
└── README.md
```

---

## ⚙️ Setup Commands

### Step 1 — Install MongoDB
Download from: https://www.mongodb.com/try/download/community
Or use MongoDB Atlas (free cloud): https://cloud.mongodb.com

### Step 2 — Install dependencies
```bash
cd smrita-backend
npm install
```

### Step 3 — Configure environment
```bash
# Copy the example env file
copy .env.example .env       # Windows
cp .env.example .env         # Mac/Linux

# Then open .env and fill in:
# - MONGO_URI (your MongoDB URL)
# - JWT_SECRET (any random string)
# - EMAIL_USER + EMAIL_PASS (Gmail credentials)
# - RAZORPAY keys (optional)
```

### Step 4 — Seed the database (first time only)
```bash
npm run seed
```
This creates:
- ✅ Admin account (admin@smrita.com / Admin@123)
- ✅ All 9 SMRITA products with real details

### Step 5 — Start the server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**
Health check: **http://localhost:5000/api/health**

---

## 🔗 Connect Frontend to Backend

In your React frontend (`smrita/`), create `src/utils/api.js`:

```js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('smrita_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
```

Install axios in your frontend:
```bash
cd smrita
npm install axios
```

### Example API calls in React:

```js
import API from '../utils/api';

// Login
const { data } = await API.post('/auth/login', { email, password });
localStorage.setItem('smrita_token', data.token);

// Get products
const { data } = await API.get('/products?category=Sandalwood');

// Place order
const { data } = await API.post('/orders', {
  items: cartItems,
  shippingAddress: formData,
  paymentMethod: 'cod'
});

// Contact form
await API.post('/contact', { name, email, message });
```

---

## 💡 Gmail App Password Setup (for emails)

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords → Create one for "Mail"
4. Copy the 16-character password
5. Paste into `.env` as `EMAIL_PASS`

---

## 💳 Razorpay Setup (for online payments)

1. Sign up at https://razorpay.com
2. Go to Dashboard → API Keys → Generate Test Key
3. Copy Key ID and Key Secret into `.env`
4. Without Razorpay keys, payment runs in mock mode (development only)

---

## 🔥 Combo Pricing (Auto-applied server-side)

| Items | Price | Savings |
|-------|-------|---------|
| 1     | ₹100  | —       |
| 2     | ₹200  | —       |
| 3     | ₹250  | ₹50     |
| 4     | ₹350  | ₹50     |
| 6     | ₹500  | ₹100    |
| 9     | ₹750  | ₹150    |

Formula: `(floor(qty/3) × 250) + (qty%3 × 100)`

---

## 🏢 Brand Details
- **SMRITA Enterprises**
- k-22/201, Azadpur village, North West Delhi - 110033
- Tel: +91 8970202304
- Email: smritasacred@gmail.com
