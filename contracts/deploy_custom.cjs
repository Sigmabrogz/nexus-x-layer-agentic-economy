const fs = require('fs');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

async function main() {
    const source = fs.readFileSync('src/NexusRouter.sol', 'utf8');
    const input = {
        language: 'Solidity',
        sources: { 'NexusRouter.sol': { content: source } },
        settings: { outputSelection: { '*': { '*': ['*'] } } }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contract = output.contracts['NexusRouter.sol']['NexusRouter'];

    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    console.log("Deploying NexusRouter...");
    const router = await factory.deploy();
    await router.waitForDeployment();
    
    const address = await router.getAddress();
    console.log("Deployed to:", address);

    fs.writeFileSync('deploy_config.json', JSON.stringify({ address: address, abi: abi }, null, 2));
    console.log("Config updated.");
}

main().catch(console.error);
