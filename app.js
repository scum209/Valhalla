window.addEventListener('DOMContentLoaded', () => {
    // Step 1 -> Step 2
    document.getElementById('toStep2').onclick = () => {
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('step-2').classList.remove('hidden');
    };

    // Step 2 -> Step 4 (Skipping to the connect wallet page)
    document.getElementById('toStep4').onclick = () => {
        document.getElementById('step-2').classList.add('hidden');
        document.getElementById('step-4').classList.remove('hidden');
    };

    // Wallet Logic
    document.getElementById('connectBtn').onclick = async () => {
        const status = document.getElementById('status');
        if (window.ethereum) {
            try {
                status.innerText = "Requesting authorization...";
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                status.innerText = "Connected: " + accounts[0].substring(0, 6) + "...";
            } catch (err) {
                status.innerText = "Connection rejected.";
            }
        } else {
            status.innerText = "Wallet not found.";
        }
    };
});
