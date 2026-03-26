import { ethers } from "ethers";
import fs from "fs";

async function main() {
    console.log("Starting E2E Integration Test Script");

    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner();

    // The ABI and Bytecode are in contracts/artifacts/contracts/NexusRouter.sol/NexusRouter.json
    // But since this is hardhat, it's compiled to artifacts/src/NexusRouter.sol/NexusRouter.json
    const artifactPath = "./contracts/artifacts/src/NexusRouter.sol/NexusRouter.json";
    
    if (!fs.existsSync(artifactPath)) {
        console.error("Please run `npx hardhat compile` in the contracts directory first.");
        return;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

    console.log("Deploying NexusRouter...");
    const router = await factory.deploy();
    await router.waitForDeployment();
    
    const address = await router.getAddress();
    console.log(`NexusRouter deployed to: ${address}`);

    // Register two agents
    console.log("Registering agents...");
    const agent1 = await provider.getSigner(0);
    const agent2 = await provider.getSigner(1);

    const routerAgent1 = new ethers.Contract(address, artifact.abi, agent1);
    const routerAgent2 = new ethers.Contract(address, artifact.abi, agent2);

    await (await routerAgent1.registerAgent()).wait();
    await (await routerAgent2.registerAgent()).wait();
    console.log("Agents registered successfully.");

    // Deposit funds
    const depositAmount = ethers.parseEther("1.0");
    console.log(`Depositing ${ethers.formatEther(depositAmount)} ETH...`);
    await (await routerAgent1.deposit({ value: depositAmount })).wait();

    // Trigger PaymentRouted
    const paymentAmount = ethers.parseEther("0.1");
    console.log(`Triggering payForInference for ${ethers.formatEther(paymentAmount)} ETH...`);
    await (await routerAgent1.payForInference(await agent2.getAddress(), paymentAmount, "/v1/chat/completions")).wait();

    console.log("Integration test transaction completed successfully.");
}

main().catch(console.error);
