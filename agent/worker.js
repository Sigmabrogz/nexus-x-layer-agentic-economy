const { ethers } = require("ethers");
require("dotenv").config({ path: "../.env" });

const RPC_URL = process.env.RPC_URL || "https://rpc.xlayer.tech";
const provider = new ethers.JsonRpcProvider(RPC_URL);

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(`Agent worker started for address: ${wallet.address}`);
  
  // Simulated Agent Loop watching for intents
  setInterval(async () => {
    try {
      const block = await provider.getBlockNumber();
      console.log(`[Agent] Polling intents at block ${block}... No pending intents.`);
    } catch (err) {
      console.error("[Agent Error]", err.message);
    }
  }, 10000);
}

main().catch(console.error);
