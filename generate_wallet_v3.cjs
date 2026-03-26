const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const generateWallets = () => {
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  console.log("Generating 3 new burner wallets for ERC20 testing...");
  for(let i = 1; i <= 3; i++) {
    const wallet = ethers.Wallet.createRandom();
    const prefix = `BURNER_${Date.now()}_${i}`;
    const newVars = `
${prefix}_ADDRESS=${wallet.address}
${prefix}_PRIVATE_KEY=${wallet.privateKey}
`;
    envContent += newVars;
    console.log(`Generated wallet ${i}: ${wallet.address}`);
  }

  fs.writeFileSync(envPath, envContent);
  console.log("Appended to .env successfully.");
};

generateWallets();
