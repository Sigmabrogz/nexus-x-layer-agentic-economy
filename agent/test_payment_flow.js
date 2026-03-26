const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), '../.env') });

const network = process.argv[2] || "local";

const RPC_URL = network === "live" ? (process.env.RPC_URL || "https://xlayertestrpc.okx.com") : "http://127.0.0.1:8545";

const provider = new ethers.JsonRpcProvider(RPC_URL);

let NEXUS_ROUTER_ADDRESS = network === "live" ? process.env.NEXUS_ROUTER_ADDRESS : process.env.LOCAL_NEXUS_ROUTER_ADDRESS;

const abi = [
  "function registerAgent() external",
  "function deposit() external payable",
  "function payForInference(address to, uint256 amount, string calldata endpoint) external",
  "function registeredAgents(address) view returns (bool)",
  "function agentBalances(address) view returns (uint256)",
  "event PaymentRouted(address indexed from, address indexed to, uint256 amount, string endpoint)"
];

async function main() {
    console.log(`🚀 Starting Multi-Agent CLI Tester on ${network === "live" ? "X Layer Testnet" : "Local Anvil Network"}`);

    const agentA = ethers.Wallet.createRandom().connect(provider);
    const agentB = ethers.Wallet.createRandom().connect(provider);

    console.log(`🔑 Agent A Address: ${agentA.address}`);
    console.log(`🔑 Agent B Address: ${agentB.address}`);

    const balanceA = await provider.getBalance(agentA.address);
    console.log(`💰 Agent A Balance: ${ethers.formatEther(balanceA)} ETH/OKB`);

    if (balanceA === 0n) {
        const deployerKey = network === "live" ? process.env.PRIVATE_KEY : process.env.ANVIL_PRIVATE_KEY;
        if (deployerKey) {
            try {
                const deployer = new ethers.Wallet(deployerKey, provider);
                const deployerBal = await provider.getBalance(deployer.address);
                if (deployerBal > 0n) {
                     console.log(`✅ Deployer has ${ethers.formatEther(deployerBal)}. Funding Agent A and Agent B...`);
                     const nonce = await deployer.getNonce();
                     let txA = await deployer.sendTransaction({ to: agentA.address, value: ethers.parseEther("0.1"), nonce: nonce });
                     await txA.wait();
                     let txB = await deployer.sendTransaction({ to: agentB.address, value: ethers.parseEther("0.1"), nonce: nonce + 1 });
                     await txB.wait();
                     console.log("✅ Agents funded.");
                } else {
                     console.warn("⚠️ Deployer wallet also has zero balance.");
                }
            } catch (e) {
                console.error("❌ Failed to fund agents:", e.message);
            }
        }
    }

    if (!NEXUS_ROUTER_ADDRESS) {
        console.warn("⚠️ No NEXUS_ROUTER_ADDRESS found. Deploying a temporary contract for this test run...");
        const deployerKey = network === "live" ? process.env.PRIVATE_KEY : process.env.ANVIL_PRIVATE_KEY;
        
        // Use pre-compiled bytecode to deploy standalone
        const artifactsPath = path.resolve(process.cwd(), '../contracts/artifacts/src/NexusRouter.sol/NexusRouter.json');
        if (fs.existsSync(artifactsPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
            const deployer = new ethers.Wallet(deployerKey, provider);
            const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
            const contract = await factory.deploy();
            await contract.waitForDeployment();
            NEXUS_ROUTER_ADDRESS = await contract.getAddress();
            console.log(`🚀 Temporary NexusRouter deployed at ${NEXUS_ROUTER_ADDRESS}`);
        } else {
            console.error("❌ Could not find compiled artifacts. Run `npx hardhat compile` in /contracts first.");
            return;
        }
    }

    try {
        const routerA = new ethers.Contract(NEXUS_ROUTER_ADDRESS, abi, agentA);
        const routerB = new ethers.Contract(NEXUS_ROUTER_ADDRESS, abi, agentB);

        console.log("📝 Registering Agent A...");
        const nonceA0 = await agentA.getNonce();
        let tx = await routerA.registerAgent({ nonce: nonceA0 });
        await tx.wait();
        console.log("✅ Agent A registered.");

        console.log("📝 Registering Agent B...");
        const nonceB0 = await agentB.getNonce();
        tx = await routerB.registerAgent({ nonce: nonceB0 });
        await tx.wait();
        console.log("✅ Agent B registered.");

        console.log("💸 Agent A depositing funds...");
        tx = await routerA.deposit({ value: ethers.parseEther("0.05"), nonce: nonceA0 + 1 });
        await tx.wait();
        console.log("✅ Deposit successful.");

        console.log("🤖 Triggering real-time inference payment from Agent A to Agent B...");
        tx = await routerA.payForInference(agentB.address, ethers.parseEther("0.01"), "google/gemma-7b-it:free", { nonce: nonceA0 + 2 });
        const receipt = await tx.wait();
        
        console.log("✅ Payment routed successfully!");
        console.log(`Transaction Hash: ${receipt.hash}`);
    } catch (e) {
        console.log(`❌ Execution blocked due to network/fund constraints: ${e.message}`);
    }
}

main().catch(console.error);