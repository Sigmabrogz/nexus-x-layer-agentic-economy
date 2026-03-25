const { ethers } = require('ethers');
const fs = require('fs');

const wallet = ethers.Wallet.createRandom();
const envContent = `X_LAYER_TESTNET_PRIVATE_KEY=${wallet.privateKey}\nX_LAYER_TESTNET_ADDRESS=${wallet.address}\n`;

fs.writeFileSync('/home/yatharth/sigma/hackathon-project/.env', envContent);
console.log('Burner wallet generated:', wallet.address);
