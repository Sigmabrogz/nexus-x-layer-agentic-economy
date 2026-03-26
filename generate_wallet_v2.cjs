const { ethers } = require("ethers");
const fs = require("fs");

const wallet = ethers.Wallet.createRandom();
console.log("Generated new burner wallet:");
console.log("Address:", wallet.address);

const envData = `\n# Block 7 Agent Wallet\nAGENT_WALLET_${Date.now()}=${wallet.address}\nAGENT_PK_${Date.now()}=${wallet.privateKey}\n`;
fs.appendFileSync(".env", envData);
console.log("Saved securely to .env");
