import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), '../.env') });

const RPC_URL = process.env.RPC_URL || "https://xlayertestrpc.okx.com";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Hardcoded deployed address or read from a build file
// For this script to work on X Layer Testnet, we would need a deployed contract.
// Let's assume an address or deploy it right here if not provided!
const NEXUS_ROUTER_ADDRESS = process.env.NEXUS_ROUTER_ADDRESS;

const abi = [
  "function registerAgent() external",
  "function deposit() external payable",
  "function payForInference(address to, uint256 amount, string calldata endpoint) external",
  "function registeredAgents(address) view returns (bool)",
  "function agentBalances(address) view returns (uint256)",
  "event PaymentRouted(address indexed from, address indexed to, uint256 amount, string endpoint)"
];

async function main() {
    console.log("🚀 Starting Multi-Agent CLI Tester on X Layer Testnet");

    // Create two burner wallets
    const agentA = ethers.Wallet.createRandom().connect(provider);
    const agentB = ethers.Wallet.createRandom().connect(provider);

    console.log(`🔑 Agent A Address: ${agentA.address}`);
    console.log(`🔑 Agent B Address: ${agentB.address}`);

    // Check balance
    const balanceA = await provider.getBalance(agentA.address);
    console.log(`💰 Agent A Balance: ${ethers.formatEther(balanceA)} OKB`);

    if (balanceA === 0n) {
        console.warn("⚠️ Agent A has zero balance. Real-time inference payments on live testnet will fail.");
        console.log("🔧 Attempting to fund Agent A from main deployer wallet if available in .env...");
        
        const deployerKey = process.env.PRIVATE_KEY;
        if (deployerKey) {
            try {
                const deployer = new ethers.Wallet(deployerKey, provider);
                const deployerBal = await provider.getBalance(deployer.address);
                if (deployerBal > 0n) {
                     console.log(`✅ Deployer has ${ethers.formatEther(deployerBal)} OKB. Funding Agent A and Agent B...`);
                     const txA = await deployer.sendTransaction({ to: agentA.address, value: ethers.parseEther("0.01") });
                     await txA.wait();
                     const txB = await deployer.sendTransaction({ to: agentB.address, value: ethers.parseEther("0.01") });
                     await txB.wait();
                     console.log("✅ Agents funded.");
                } else {
                     console.warn("⚠️ Deployer wallet also has zero balance. Please use faucet_puppeteer.js or OKX faucet manually to fund " + deployer.address);
                }
            } catch (e) {
                console.error("❌ Failed to fund agents:", e.message);
            }
        }
    }

    if (!NEXUS_ROUTER_ADDRESS) {
        console.warn("⚠️ No NEXUS_ROUTER_ADDRESS found in environment. Please deploy contract to X Layer Testnet first.");
        return;
    }

    // Assuming we have funds and contract is deployed:
    try {
        const routerA = new ethers.Contract(NEXUS_ROUTER_ADDRESS, abi, agentA);
        const routerB = new ethers.Contract(NEXUS_ROUTER_ADDRESS, abi, agentB);

        console.log("📝 Registering Agent A...");
        let tx = await routerA.registerAgent();
        await tx.wait();
        console.log("✅ Agent A registered.");

        console.log("📝 Registering Agent B...");
        tx = await routerB.registerAgent();
        await tx.wait();
        console.log("✅ Agent B registered.");

        console.log("💸 Agent A depositing funds...");
        tx = await routerA.deposit({ value: ethers.parseEther("0.005") });
        await tx.wait();
        console.log("✅ Deposit successful.");

        console.log("🤖 Triggering real-time inference payment from Agent A to Agent B...");
        tx = await routerA.payForInference(agentB.address, ethers.parseEther("0.001"), "google/gemma-7b-it:free");
        const receipt = await tx.wait();
        
        console.log("✅ Payment routed successfully!");
        console.log(`Transaction Hash: ${receipt.hash}`);
    } catch (e) {
        console.log(`❌ Execution blocked due to network/fund constraints: ${e.message}`);
    }
}

main().catch(console.error);