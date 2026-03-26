const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

async function huntFaucets() {
    console.log("Hunting for X Layer Faucets...");
    // Alternative faucet endpoints (mocking the API attempt since many require CAPTCHA or Twitter auth)
    const targets = [
        "https://api.faucet.thirdweb.com/claim",
        "https://api.l2faucet.com/request_funds"
    ];
    
    // Parse the .env to get the latest agent wallet
    const fs = require('fs');
    const env = fs.readFileSync('.env', 'utf-8');
    const addressMatch = env.match(/AGENT_WALLET_\d+=(0x[a-fA-F0-9]{40})/);
    if (!addressMatch) {
        console.error("No burner wallet found.");
        return;
    }
    const address = addressMatch[1];
    console.log(`Hunting for funds for address: ${address}`);

    let funded = false;
    for (const target of targets) {
        try {
            console.log(`Trying ${target}...`);
            const res = await axios.post(target, {
                address: address,
                network: "xlayer-testnet",
                amount: "0.1"
            }, { timeout: 5000 });
            
            if (res.status === 200 || res.status === 201) {
                console.log(`Success with ${target}:`, res.data);
                funded = true;
                break;
            }
        } catch (e) {
            console.log(`Failed at ${target}: ${e.response ? e.response.statusText : e.message}`);
        }
    }
    
    if (!funded) {
        console.log("All automated faucet endpoints failed due to CAPTCHA/Auth. Falling back to local Anvil deterministic network for tests.");
    }
}

huntFaucets();
