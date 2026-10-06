window.addEventListener('DOMContentLoaded', () => {
    
    // Step 1 -> Step 2 (Landing to Login)
    const toStep2 = document.getElementById('toStep2');
    if (toStep2) {
        toStep2.onclick = () => {
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
        };
    }

    // Step 2 -> Step 3 (Login to Wallet Verification)
    const toStep3 = document.getElementById('toStep3');
    if (toStep3) {
        toStep3.onclick = () => {
            document.getElementById('step-2').classList.add('hidden');
            document.getElementById('step-3').classList.remove('hidden');
        };
    }

    // Step 3: Wallet Logic
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.onclick = async () => {
            const status = document.getElementById('status');
            if (window.ethereum) {
                try {
                    status.innerText = "Verifying...";
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    
                    // Shows as: Wallet Verified: 0x1234...
                    status.innerText = "Wallet Verified: " + accounts[0].substring(0, 6) + "...";
                    
                    connectBtn.innerText = "Continue to Sync";
                    connectBtn.onclick = () => {
                        status.innerText = "Synchronizing holdings...";
                    };
                } catch (err) {
                    status.innerText = "Verification failed. Please try again.";
                }
            } else {
                status.innerText = "Wallet not detected. Please install Coinbase Wallet.";
            }
        };
    }
});
