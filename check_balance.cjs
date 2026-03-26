const { ethers } = require("ethers");
require("dotenv").config();

async function check() {
    const provider = new ethers.JsonRpcProvider("https://testrpc.xlayer.tech");
    const address = process.env.X_LAYER_TESTNET_ADDRESS;
    try {
        const bal = await provider.getBalance(address);
        console.log("Balance on X Layer Testnet for " + address + ": " + ethers.formatEther(bal) + " OKB");
    } catch (e) {
        console.log("Failed to connect to X Layer testnet RPC.");
    }
}
check();
