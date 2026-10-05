window.addEventListener('DOMContentLoaded', () => {
    
    // Transition Logic
    document.getElementById('toStep2').onclick = () => {
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('step-2').classList.remove('hidden');
    };

    document.getElementById('toStep3').onclick = () => {
        document.getElementById('step-2').classList.add('hidden');
        document.getElementById('step-3').classList.remove('hidden');
    };

    document.getElementById('toStep4').onclick = () => {
        document.getElementById('step-3').classList.add('hidden');
        document.getElementById('step-4').classList.remove('hidden');
    };

    // Wallet Logic
    document.getElementById('connectBtn').onclick = async () => {
        const status = document.getElementById('status');
        if (window.ethereum) {
            try {
                status.innerText = "Synchronizing...";
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                status.innerText = "Authenticated: " + accounts[0].substring(0, 6) + "...";
            } catch (err) {
                status.innerText = "Connection failed. Try again.";
            }
        } else {
            status.innerText = "Please install a crypto wallet.";
        }
    };
});
