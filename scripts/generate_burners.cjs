const { ethers } = require("ethers");
const fs = require("fs");

function generateWallets(count) {
    let envContent = "\n# Auto-generated Burner Wallets (Run 10)\n";
    const wallets = [];
    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        wallets.push(wallet);
        envContent += `AGENT_${i}_ADDRESS=${wallet.address}\n`;
        envContent += `AGENT_${i}_PRIVATE_KEY=${wallet.privateKey}\n`;
    }
    fs.appendFileSync(".env", envContent);
    console.log("Generated " + count + " new burner wallets and appended to .env");
    return wallets;
}

generateWallets(3);
