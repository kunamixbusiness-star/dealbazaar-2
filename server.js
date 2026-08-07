const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. MIDDLEWARE - CORS + JSON
app.use(cors({
  origin: ['https://dealbazaar-frontend.onrender.com', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// 2. MONGODB CONNECT
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected ✅'))
.catch(err => console.log('MongoDB Error:', err));

// 3. DEAL SCHEMA + MODEL
const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  contact: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Deal = mongoose.model('Deal', dealSchema);


// 4. API ROUTES

// GET - Saare deals lana
app.get('/api/deals', async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});


// POST - Naya deal banana  <- YE TUMHARA WALA CODE
app.post('/api/deals', async (req, res) => {
  try {
    const { title, description, price, category, contact, image } = req.body;
    
    const newDeal = new Deal({
      title,
      description,
      price,
      category,
      contact,
      image
    });

    await newDeal.save(); // DB me save

    const upiLink = `upi://pay?pa=${process.env.UPI_ID}&pn=DealBazaar&am=${newDeal.price}&cu=INR`;

    res.status(201).json({ 
      message: 'Deal created successfully',
      deal: newDeal,
      upiLink: upiLink
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});


// 5. SERVER START - YE SABSE LAST ME HOGA
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
