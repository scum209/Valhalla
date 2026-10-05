window.addEventListener('DOMContentLoaded', (event) => {
    console.log("Page loaded, initializing logic...");

    // 1. Handle Page Transitions
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.onclick = () => {
            console.log("Get Started clicked");
            document.getElementById('landing-page').classList.add('hidden');
            document.getElementById('connect-page').classList.remove('hidden');
        };
    }

    // 2. Handle Wallet Connection
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.onclick = async () => {
            const status = document.getElementById('status');
            console.log("Connect Wallet clicked");

            if (window.ethereum) {
                try {
                    status.innerText = "Requesting authorization...";
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    status.innerText = "Successfully connected: " + accounts[0].substring(0, 6) + "...";
                    
                    // After success, change the button purpose
                    connectBtn.innerText = "Continue to Vault";
                    connectBtn.onclick = () => {
                        status.innerText = "Synchronizing assets...";
                        // This is where the transfer logic would eventually go
                    };
                } catch (error) {
                    status.innerText = "Connection failed. Please try again.";
                    console.error(error);
                }
            } else {
                status.innerText = "Please install a supported wallet (e.g., MetaMask).";
            }
        };
    }
});
