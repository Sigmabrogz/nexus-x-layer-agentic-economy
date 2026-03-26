import { ethers } from 'ethers';
import fs from 'fs';

function generateBurnerWallet() {
  const wallet = ethers.Wallet.createRandom();
  console.log('Address:', wallet.address);
  console.log('Private Key:', wallet.privateKey);
  console.log('Mnemonic:', wallet.mnemonic.phrase);
  
  // Save to .env.testnet for local testing
  const envContent = `NEXT_PUBLIC_DEPLOYER_ADDRESS=${wallet.address}\nDEPLOYER_PRIVATE_KEY=${wallet.privateKey}\n`;
  fs.appendFileSync('.env', envContent);
  console.log('Wallet saved to .env');
}

generateBurnerWallet();
