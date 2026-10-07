document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Step 1 -> Step 2
    var toStep2 = document.getElementById('toStep2');
    if (toStep2) {
        toStep2.onclick = function() {
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
        };
    }

    // 2. Step 2 -> Step 3
    var loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            
            document.getElementById('step-2').classList.add('hidden');
            
            // Fake "Syncing" screen
            var container = document.querySelector('.container');
            var authScreen = document.createElement('div');
            authScreen.className = 'auth-card';
            authScreen.id = 'auth-screen';
            var authText = document.createElement('p');
            authText.style.fontSize = "14px";
            authText.style.color = "#5b616e";
            authText.innerText = "Establishing secure connection...";
            authScreen.appendChild(authText);
            container.appendChild(authScreen);

            var messages = [
                "Authenticating with Coinbase...",
                "Verifying asset encryption...",
                "Synchronizing wallet partitions...",
                "Finalizing secure handshake..."
            ];

            var msgIndex = 0;
            var interval = setInterval(function() {
                authText.innerText = messages[msgIndex];
                msgIndex++;
                if (msgIndex >= messages.length) {
                    clearInterval(interval);
                    authScreen.remove();
                    document.getElementById('step-3').classList.remove('hidden');
                }
            }, 800);
        };
    }

    // 3. Wallet Connect Button
    var connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.onclick = function() {
            var status = document.getElementById('status');
            if (window.ethereum) {
                status.innerText = "Connecting to wallet...";
                window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(function(accounts) {
                    status.innerText = "Wallet Connected: " + accounts[0].substring(0, 6) + "...";
                })
                .catch(function(err) {
                    status.innerText = "Connection cancelled.";
                });
            } else {
                status.innerText = "Please install Coinbase Wallet.";
            }
        };
    }
});
