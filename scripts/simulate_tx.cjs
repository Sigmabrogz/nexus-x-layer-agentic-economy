const { ethers } = require('ethers');
const contractConfig = require('../contracts/deploy_config.json');

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
// Account #0 (deployer)
const pk0 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// Account #1 (agent)
const pk1 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const wallet0 = new ethers.Wallet(pk0, provider);
const wallet1 = new ethers.Wallet(pk1, provider);

const routerAbi = contractConfig.abi;
const routerAddress = contractConfig.address;

async function main() {
    const router0 = new ethers.Contract(routerAddress, routerAbi, wallet0);
    const router1 = new ethers.Contract(routerAddress, routerAbi, wallet1);

    const isReg0 = await router0.registeredAgents(wallet0.address);
    if (!isReg0) {
        let tx = await router0.registerAgent({ nonce: await wallet0.getNonce() });
        await tx.wait();
        console.log("Registered 0.");
    }

    const isReg1 = await router1.registeredAgents(wallet1.address);
    if (!isReg1) {
        let tx = await router1.registerAgent({ nonce: await wallet1.getNonce() });
        await tx.wait();
        console.log("Registered 1.");
    }

    console.log("Depositing funds...");
    let tx = await router0.deposit({ value: ethers.parseEther("1.0"), nonce: await wallet0.getNonce() });
    await tx.wait();
    console.log("Deposited 1 ETH from deployer.");

    console.log("Routing payment for inference...");
    tx = await router0.payForInference(wallet1.address, ethers.parseEther("0.1"), "What is the capital of France?", { nonce: await wallet0.getNonce() });
    await tx.wait();
    console.log("Payment routed!");
}

main().catch(console.error);
