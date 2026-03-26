const { ethers } = require("ethers");
require("dotenv").config({ path: "../.env" });

async function fundBurners() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  // Default Anvil account 0 private key
  const anvilKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const signer = new ethers.Wallet(anvilKey, provider);
  
  const walletsToFund = [
    process.env.AGENT_0_ADDRESS,
    process.env.AGENT_1_ADDRESS,
    process.env.AGENT_2_ADDRESS
  ].filter(Boolean);

  if (walletsToFund.length === 0) {
    console.log("No burner wallets found in .env.");
    return;
  }

  console.log(`Funding ${walletsToFund.length} burner wallets from Anvil account...`);

  for (let i = 0; i < walletsToFund.length; i++) {
    const address = walletsToFund[i];
    console.log(`Funding ${address} with 10 ETH...`);
    const tx = await signer.sendTransaction({
      to: address,
      value: ethers.parseEther("10.0")
    });
    await tx.wait();
    console.log(`Funded! Tx Hash: ${tx.hash}`);
  }

  console.log("All burner wallets funded on local Anvil network. Ready for local testing.");
}

fundBurners().catch(console.error);
