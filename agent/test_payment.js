const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const contractConfig = require('../contracts/deploy_config.json');

const nexusRouterAbi = [
    "function registerAgent() external",
    "function deposit() external payable",
    "function payForInference(address to, uint256 amount, string calldata endpoint) external",
    "function registeredAgents(address) external view returns (bool)"
];

async function main() {
    const agentWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const userWallet = new ethers.Wallet(process.env.ANVIL_PRIVATE_KEY, provider);

    const routerUser = new ethers.Contract(contractConfig.address, nexusRouterAbi, userWallet);
    const routerAgent = new ethers.Contract(contractConfig.address, nexusRouterAbi, agentWallet);

    console.log(`User: ${userWallet.address}`);
    console.log(`Agent: ${agentWallet.address}`);

    const isAgentReg = await routerAgent.registeredAgents(agentWallet.address);
    if (!isAgentReg) {
        console.log("Registering Agent...");
        // fund agent wallet first using userWallet
        let fundTx = await userWallet.sendTransaction({
            to: agentWallet.address,
            value: ethers.parseEther("0.1")
        });
        await fundTx.wait();
        let tx1 = await routerAgent.registerAgent();
        await tx1.wait();
        console.log("Agent registered!");
    }

    let nonce = await userWallet.getNonce("latest");

    const isUserRegistered = await routerUser.registeredAgents(userWallet.address);
    if (!isUserRegistered) {
        console.log("Registering User...");
        let tx2 = await routerUser.registerAgent({ nonce: nonce++ });
        await tx2.wait();
        console.log("User registered!");
    }

    console.log("Depositing funds...");
    let tx3 = await routerUser.deposit({ value: ethers.parseEther("0.1"), nonce: nonce++ });
    await tx3.wait();
    
    console.log("Paying for inference...");
    let tx4 = await routerUser.payForInference(agentWallet.address, ethers.parseEther("0.05"), "/v1/chat/completions", { nonce: nonce++ });
    await tx4.wait();
    
    console.log("Payment sent successfully.");
}

main().catch(console.error);
