require('dotenv').config(); // 1. Sabse upar ye
const express = require('express'); // 2. Phir ye
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI; // 3. MONGO_URI use kar rahe hain
const UPI_ID = process.env.UPI_ID; // 4. UPI_ID bhi yaha
const DB_NAME = "dealbazaar";

const client = new MongoClient(MONGO_URI);
let db;

// MongoDB Connect
async function connectDB() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Error:", err);
  }
}
connectDB();

// 1. Test Route
app.get('/', (req, res) => {
  res.json({ status: "DealBazaar API is Live!" });
});

// 2. Login - Phone OTP
app.post('/api/login', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone chahiye" });
  
  // Abhi direct login karwa rahe. Baad me OTP add karenge
  res.json({ 
    message: "Login Success", 
    token: "dummy-token-" + phone,
    phone: phone 
  });
});

// 3. Get All Deals - Middle class + Premium filter
app.get('/api/deals', async (req, res) => {
  try {
    const { type, maxPrice, minPrice } = req.query;
    let filter = { status: "active" };
    
    if (type === "bachat" && maxPrice) filter.price = { $lte: parseInt(maxPrice) };
    if (type === "premium" && minPrice) filter.price = { $gte: parseInt(minPrice) };

    const deals = await db.collection('deals').find(filter).toArray();
    res.json({ success: true, deals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Deal Accept
app.post('/api/deals/:id/accept', async (req, res) => {
  await db.collection('deals').updateOne(
    { id: req.params.id },
    { $set: { status: "accepted", acceptedBy: req.body.acceptedBy } }
  );
  res.json({ message: "Deal Accept ho gayi!" });
});

// 5. CREATE PAYMENT ORDER - UPI Link banega
app.post("/api/payment/create", async (req, res) => {
  try {
    const { dealId, amount, buyerPhone } = req.body;
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=DealBazaar&am=${amount}&cu=INR&tn=DealId-${dealId}`;
    
    res.json({ 
      success: true, 
      upiLink: upiLink,
      message: "UPI Link ready. PhonePe/GPay se pay karo" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Deal Complete karke UPI dena - YE WALA FIX KIYA HAI
app.post('/complete-deal/:id', async (req, res) => {
  try {
    const deal = await db.collection('deals').findOne({ id: req.params.id });
    if (!deal) return res.status(404).json({ error: "Deal not found" });

    await db.collection('deals').updateOne(
      { id: req.params.id },
      { $set: { status: "completed", yourUPI: UPI_ID } } // 5. Yaha process.env.UPI_ID use hua
    );

    res.json({
      message: "Payment Released!",
      yourUPI: UPI_ID, // 6. Aur yaha bhi
      yourCommission: deal.yourCommission
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
