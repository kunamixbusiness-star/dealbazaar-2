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
