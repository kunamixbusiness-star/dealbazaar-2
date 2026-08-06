<<<<<<< HEAD
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname)); // HTML file serve karne ke liye

let db;

// MongoDB connect
MongoClient.connect('mongodb://localhost:27017').then(client => {
  db = client.db('dealwebsite');
  console.log('MongoDB Connected ✅');
  
  app.listen(3000, () => {
    console.log('Website chal rahi hai: http://localhost:3000');
  });
});

// 1. Deal Post karna
app.post('/post-deal', async (req, res) => {
  const commission = req.body.budget * 0.20;
  const deal = {
    id: Date.now().toString(),
    ...req.body,
    status: "open",
    yourCommission: commission,
    date: new Date()
  };
  await db.collection('deals').insertOne(deal);
  res.json({ message: "Deal Post ho gayi!", deal });
});

// 2. Saari deals dekhna - PAN INDIA + OUT OF COUNTRY
app.get('/deals', async (req, res) => {
  const deals = await db.collection('deals').find({}).sort({date: -1}).toArray();
  res.json(deals);
});

// 3. Deal Accept karna
app.post('/accept-deal/:id', async (req, res) => {
  await db.collection('deals').updateOne(
    { id: req.params.id },
    { $set: { status: "accepted", acceptedBy: req.body.acceptedBy } }
  );
  res.json({ message: "Deal Accept ho gayi!" });
});

// 4. Deal Complete karke UPI dena
app.post('/complete-deal/:id', async (req, res) => {
  const deal = await db.collection('deals').findOne({ id: req.params.id });
  await db.collection('deals').updateOne(
    { id: req.params.id },
    { $set: { status: "completed", yourUPI: "8851589873-3@ybl" } }
  );
  res.json({ 
    message: "Payment Released!", 
    yourUPI: "8851589873-3@ybl",
    yourCommission: deal.yourCommission 
  });
});
=======
const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 10000;
const mongoUrl = process.env.MONGO_URL;
mongoose.connect(MONGO_URL)
const DB_NAME = "dealbazaar";
const client = new MongoClient(mongoUrl);
let db;

// DB Connect
async function connectDB() {
  await client.connect();
  db = client.db(DB_NAME);
  console.log("MongoDB Connected");
}
connectDB();

// 1. Nayi Deal Banana
app.post('/create-deal', async (req, res) => {
  try {
    const { buyerUPI, sellerUPI, amount, yourCommission } = req.body;
    const dealId = "deal_" + Date.now();
    const newDeal = {
      id: dealId,
      buyerUPI,
      sellerUPI,
      amount: Number(amount),
      yourCommission: Number(yourCommission),
      status: "pending",
      createdAt: new Date()
    };
    await db.collection('deals').insertOne(newDeal);
    res.json({ success: true, dealId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Deal Status Check karna
app.get('/deal/:id', async (req, res) => {
  try {
    const deal = await db.collection('deals').findOne({ id: req.params.id });
    if (!deal) return res.status(404).json({ error: "Deal not found" });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Buyer ne Payment kiya
app.post('/pay/:id', async (req, res) => {
  try {
    await db.collection('deals').updateOne(
      { id: req.params.id },
      { $set: { status: "paid" } }
    );
    res.json({ message: "Payment Received. Waiting for confirmation" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Deal Complete karke UPI dena - YE WALA THEEK HAI
app.post('/complete-deal/:id', async (req, res) => {
  try {
    const deal = await db.collection('deals').findOne({ id: req.params.id });
    if (!deal) return res.status(404).json({ error: "Deal not found" });
    
    await db.collection('deals').updateOne(
      { id: req.params.id },
      { $set: { status: "completed", yourUPI: process.env.UPI_ID } }
    );
    
    res.json({
      message: "Payment Released!",
      yourUPI: process.env.UPI_ID,
      yourCommission: deal.yourCommission
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send("DealBazaar API is Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
>>>>>>> 0185b88131743560029b537bf99f0142584cd38a
