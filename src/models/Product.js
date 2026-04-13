const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  nameHindi: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  longDescription: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    default: 100,
  },
  mrp: {
    type: Number,
    default: 120,
  },
  image: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
    enum: ['Sandalwood', 'Floral', 'Classic', 'Luxury', 'Herbal', 'Resin', 'Vedic', 'Other'],
  },
  scent: { type: String, default: '' },
  burnTime: { type: String, default: '30-35 mins' },
  netWeight: { type: String, default: '100g' },
  sticksPerPack: { type: Number, default: 50 },
  ingredients: {
    type: [String],
    default: ['Cow-Dung', 'Chandan (Sandalwood Powder)', 'Wood Powder', 'Essential Oils (Natural Fragrance Oils)'],
  },
  usps: {
    type: [String],
    default: ['0% Charcoal', 'Natural Essential Oils', '3 Inches Longer Sticks', 'Refill & Reuse Jar'],
  },
  tags: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      rating: { type: Number, required: true },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  inStock: {
    type: Boolean,
    default: true,
  },
  stockCount: {
    type: Number,
    default: 100,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Calculate avg rating before save
productSchema.pre('save', function (next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
