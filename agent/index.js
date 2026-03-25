const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

// We connect to the local Anvil / Hardhat node running on port 8545
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

// We'll read the contract address from a local config file populated during deployment
const contractConfig = require('../contracts/deploy_config.json');

const nexusRouterAbi = [
    "event AgentRegistered(address indexed agent)",
    "event PaymentRouted(address indexed from, address indexed to, uint256 amount, string endpoint)",
    "event FundsDeposited(address indexed agent, uint256 amount)",
    "function registerAgent() external",
    "function deposit() external payable",
    "function payForInference(address to, uint256 amount, string calldata endpoint) external",
    "function agentBalances(address) external view returns (uint256)",
    "function registeredAgents(address) external view returns (bool)"
];

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const router = new ethers.Contract(contractConfig.address, nexusRouterAbi, wallet);

    console.log(`[Agent] Started Nexus Agent on ${wallet.address}`);
    console.log(`[Agent] Listening to NexusRouter at ${router.target}...`);

    router.on("PaymentRouted", async (from, to, amount, endpoint, event) => {
        if (to.toLowerCase() === wallet.address.toLowerCase()) {
            console.log(`\n[Agent] Received Payment!`);
            console.log(`[Agent] Amount: ${ethers.formatEther(amount)} OKB`);
            console.log(`[Agent] From: ${from}`);
            console.log(`[Agent] Endpoint requested: ${endpoint}`);

            // Simulate the AI inference payload
            console.log(`[Agent] Processing inference for endpoint ${endpoint}...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(`[Agent] Inference complete! Payload returned to ${from}`);
        }
    });
}

main().catch(console.error);
