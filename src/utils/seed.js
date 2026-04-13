require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smrita_db');
  console.log('✅  MongoDB Connected for seeding');
};

const products = [
  {
    name: 'Chandan Dhoop',
    nameHindi: 'चंदन',
    subtitle: 'Sacred Sandalwood',
    description: 'Hand-rolled with pure sandalwood paste. 0% charcoal, 100% natural.',
    longDescription: 'Crafted from the finest Chandan (Sandalwood Powder) sourced from trusted suppliers. Our Chandan Dhoop is made with Cow-Dung, Chandan, Wood Powder, and Natural Essential Oils — completely charcoal-free. Each pack contains 50 sticks of 3 inches extra length for a 30-35 minute burn. Available in our signature Refill & Reuse Jar.',
    price: 100, mrp: 120,
    image: '',
    category: 'Sandalwood',
    scent: 'Woody, Warm, Sacred',
    burnTime: '30-35 mins',
    netWeight: '100g',
    sticksPerPack: 50,
    ingredients: ['Cow-Dung', 'Chandan (Sandalwood Powder)', 'Wood Powder', 'Essential Oils (Natural Fragrance Oils)'],
    usps: ['0% Charcoal', 'Natural Essential Oils', '3 Inches Longer Sticks', 'Refill & Reuse Jar'],
    tags: ['bestseller', 'meditation'],
    rating: 4.9, numReviews: 128,
    inStock: true, stockCount: 200, featured: true,
  },
  {
    name: 'Gulab Agarbatti',
    nameHindi: 'गुलाब',
    subtitle: 'Rose of the Divine',
    description: 'Distilled from fresh rose petals. Pure love in fragrance form.',
    longDescription: 'Our Gulab Agarbatti captures the essence of fresh rose petals blended with natural essential oils. Made with Cow-Dung base and zero charcoal, these 3-inch longer sticks burn for 30-35 minutes. The floral, sweet scent opens the heart chakra and creates an atmosphere of love and devotion. Comes in our Refill & Reuse Jar.',
    price: 100, mrp: 120,
    image: '',
    category: 'Floral',
    scent: 'Sweet, Floral, Romantic',
    burnTime: '30-35 mins',
    netWeight: '100g',
    sticksPerPack: 50,
    ingredients: ['Cow-Dung', 'Rose Petal Extract', 'Wood Powder', 'Essential Oils (Natural Fragrance Oils)'],
    usps: ['0% Charcoal', 'Natural Essential Oils', '3 Inches Longer Sticks', 'Refill & Reuse Jar'],
    tags: ['popular', 'floral'],
    rating: 4.8, numReviews: 95,
    inStock: true, stockCount: 150, featured: true,
  },
  {
    name: 'Nagchampa Premium',
    nameHindi: 'नागचंपा',
    subtitle: 'The Temple Classic',
    description: 'Legendary blend of champaca flower and sandalwood — temple-grade quality.',
    longDescription: 'The world\'s most recognized incense fragrance, reimagined by SMRITA with our signature 0% charcoal formula. Made with Cow-Dung, Champaca Extract, Wood Powder, and Natural Essential Oils. 50 sticks per pack, each 3 inches longer than standard, burning 30-35 minutes. Our Refill & Reuse Jar makes it eco-friendly.',
    price: 100, mrp: 120,
    image: '',
    category: 'Classic',
    scent: 'Earthy, Sweet, Mystical',
    burnTime: '30-35 mins',
    netWeight: '100g',
    sticksPerPack: 50,
    ingredients: ['Cow-Dung', 'Champaca Extract', 'Wood Powder', 'Essential Oils (Natural Fragrance Oils)'],
    usps: ['0% Charcoal', 'Natural Essential Oils', '3 Inches Longer Sticks', 'Refill & Reuse Jar'],
    tags: ['classic', 'temple'],
    rating: 5.0, numReviews: 212,
    inStock: true, stockCount: 300, featured: true,
  },
  {
    name: 'Kesar Kasturi',
    nameHindi: 'केसर कस्तूरी',
    subtitle: 'Saffron & Musk',
    description: 'Royal blend of saffron and plant-based musk. Once burned only in royal courts.',
    longDescription: 'Kesar Kasturi is SMRITA\'s most luxurious offering. Saffron essence blended with plant-based musk, Cow-Dung base, and Natural Essential Oils. Zero charcoal, 50 sticks at 3 inches longer, 30-35 min burn. The golden-red fragrance transforms any room into a sacred space. Limited production — handcrafted in small batches.',
    price: 100, mrp: 120,
    image: '',
    category: 'Luxury',
    scent: 'Rich, Royal, Warm',
    burnTime: '30-35 mins',
    netWeight: '100g',
    sticksPerPack: 50,
    ingredients: ['Cow-Dung', 'Saffron Essence', 'Plant-based Musk', 'Wood Powder', 'Essential Oils'],
    usps: ['0% Charcoal', 'Natural Essential Oils', '3 Inches Longer Sticks', 'Refill & Reuse Jar'],
    tags: ['luxury', 'limited'],
    rating: 4.9, numReviews: 67,
    inStock: true, stockCount: 80, featured: false,
  },
  {
    name: 'Tulsi Dhoop',
    nameHindi: 'तुलसी',
    subtitle: 'Holy Basil Purifier',
    description: 'The most revered plant in Hinduism. Purifies air and soul simultaneously.',
    longDescription: 'Tulsi (Holy Basil) is the most sacred plant in Hindu tradition. Our Tulsi Dhoop uses pure Tulsi leaf extract blended with Cow-Dung, Wood Powder, and Natural Essential Oils. 0% charcoal. Each of the 50 sticks is 3 inches longer and burns 30-35 minutes. Antibacterial properties help clear negative energy from living spaces.',
    price: 100, mrp: 120,
    image: '',
    category: 'Herbal',
    scent: 'Fresh, Green, Purifying',
    burnTime: '30-35 mins',
    netWeight: '100g',
    sticksPerPack: 50,
    ingredients: ['Cow-Dung', 'Tulsi (Holy Basil) Extract', 'Wood Powder', 'Essential Oils (Natural Fragrance Oils)'],
    usps: ['0% Charcoal', 'Natural Essential Oils', '3 Inches Longer Sticks', 'Refill & Reuse Jar'],
    tags: ['herbal', 'purifying'],
    rating: 4.7, numReviews: 88,
    inStock: true, stockCount: 120, featured: false,
  },
  {
    name: 'Loban Resin',
    nameHindi: 'लोबान',
    subtitle: 'Ancient Frankincense',
    description: 'Pure Loban resin — burned in temples, mosques and churches for millennia.',
    longDescription: 'Loban (Benzoin/Frankincense) is one of humanity\'s oldest sacred substances. SMRITA\'s Loban Resin sticks use 100% pure Loban extract with Cow-Dung base, Wood Powder, and Natural Essential Oils. No charcoal, no fillers. 50 sticks per pack, 3 inches longer, 30-35 min burn. Intensely grounding, perfect for deep meditation.',
    price: 100, mrp: 120,
    image: '',
    category: 'Resin',
    scent: 'Deep, Balsamic, Ancient',
    burnTime: '30-35 mins',
    netWeight: '100g',
    sticksPerPack: 50,
    ingredients: ['Cow-Dung', 'Loban (Benzoin) Resin', 'Wood Powder', 'Essential Oils (Natural Fragrance Oils)'],
    usps: ['0% Charcoal', 'Natural Essential Oils', '3 Inches Longer Sticks', 'Refill & Reuse Jar'],
    tags: ['ancient', 'meditation'],
    rating: 4.8, numReviews: 74,
    inStock: true, stockCount: 90, featured: false,
  },
  {
    name: 'Mogra Bela',
    nameHindi: 'मोगरा बेला',
    subtitle: 'Jasmine Moonlight',
    description: 'Intoxicating Mogra jasmine. Traditionally offered to goddesses.',
    longDescription: 'Mogra (Arabian Jasmine) is the queen of night-blooming flowers. SMRITA\'s Mogra Bela captures her essence in our signature formula — Cow-Dung base, Mogra extract, Wood Powder, and Natural Essential Oils. 0% charcoal. 50 sticks, 3 inches longer, 30-35 min burn per stick. Attracts love, abundance, and spiritual blessings.',
    price: 100, mrp: 120,
    image: '',
    category: 'Floral',
    scent: 'Jasmine, Sweet, Intoxicating',
    burnTime: '30-35 mins',
    netWeight: '100g',
    sticksPerPack: 50,
    ingredients: ['Cow-Dung', 'Mogra (Jasmine) Extract', 'Wood Powder', 'Essential Oils (Natural Fragrance Oils)'],
    usps: ['0% Charcoal', 'Natural Essential Oils', '3 Inches Longer Sticks', 'Refill & Reuse Jar'],
    tags: ['floral', 'goddess'],
    rating: 4.8, numReviews: 103,
    inStock: true, stockCount: 110, featured: false,
  },
  {
    name: 'Havan Samagri',
    nameHindi: 'हवन सामग्री',
    subtitle: 'Sacred Fire Blend',
    description: '21 sacred herbs and resins from Vedic fire ceremonies in stick form.',
    longDescription: 'Our Havan Samagri stick is based on an ancient Vedic recipe — Cow-Dung base, camphor, guggul, clove, cardamom, and 16 other sacred herbs blended with Natural Essential Oils. 0% charcoal. 50 sticks per pack, each 3 inches longer, 30-35 min burn. Purifies the environment and creates a bridge between the earthly and divine realms.',
    price: 100, mrp: 120,
    image: '',
    category: 'Vedic',
    scent: 'Camphor, Herbal, Sacred',
    burnTime: '30-35 mins',
    netWeight: '100g',
    sticksPerPack: 50,
    ingredients: ['Cow-Dung', 'Camphor', 'Guggul', 'Clove', 'Cardamom', 'Sacred Herbs Blend', 'Essential Oils'],
    usps: ['0% Charcoal', 'Natural Essential Oils', '3 Inches Longer Sticks', 'Refill & Reuse Jar'],
    tags: ['vedic', 'ceremony'],
    rating: 4.9, numReviews: 156,
    inStock: true, stockCount: 180, featured: false,
  },
  {
    name: 'Oud Majlis',
    nameHindi: 'ऊद',
    subtitle: 'Arabian Oud Wood',
    description: 'Genuine agarwood — the rarest and most prized fragrance in the world.',
    longDescription: 'Oud (Agarwood) is the most precious wood in the world. SMRITA\'s Oud Majlis blends genuine agarwood extract into our Cow-Dung base with Natural Essential Oils and Wood Powder. 0% charcoal. 50 sticks, 3 inches longer, 30-35 min burn. The complex, deep, smoky-sweet fragrance is our most prestigious and unique offering.',
    price: 100, mrp: 120,
    image: '',
    category: 'Luxury',
    scent: 'Smoky, Complex, Deep',
    burnTime: '30-35 mins',
    netWeight: '100g',
    sticksPerPack: 50,
    ingredients: ['Cow-Dung', 'Agarwood (Oud) Extract', 'Wood Powder', 'Essential Oils (Natural Fragrance Oils)'],
    usps: ['0% Charcoal', 'Natural Essential Oils', '3 Inches Longer Sticks', 'Refill & Reuse Jar'],
    tags: ['luxury', 'oud', 'rare'],
    rating: 5.0, numReviews: 45,
    inStock: true, stockCount: 60, featured: false,
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️   Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'SMRITA Admin',
      email: process.env.ADMIN_EMAIL || 'admin@smrita.com',
      password: adminPassword,
      role: 'admin',
      phone: '+91 8970202304',
    });
    console.log(`👤  Admin created: ${admin.email}`);

    // Seed products
    const createdProducts = await Product.insertMany(products);
    console.log(`🪔  ${createdProducts.length} products seeded successfully`);

    console.log('\n✅  Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧  Admin Email    : ${admin.email}`);
    console.log(`🔑  Admin Password : ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌  Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
