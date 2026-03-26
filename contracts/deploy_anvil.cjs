const fs = require('fs');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

function findImports(path) {
    if (path.includes('@openzeppelin/contracts/token/ERC20/ERC20.sol')) {
        return { contents: fs.readFileSync('node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol', 'utf8') };
    }
    if (path.includes('@openzeppelin/contracts/token/ERC20/IERC20.sol')) {
        return { contents: fs.readFileSync('node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol', 'utf8') };
    }
    if (path.includes('@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol')) {
        return { contents: fs.readFileSync('node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol', 'utf8') };
    }
    if (path.includes('@openzeppelin/contracts/utils/Context.sol')) {
        return { contents: fs.readFileSync('node_modules/@openzeppelin/contracts/utils/Context.sol', 'utf8') };
    }
    if (path.includes('@openzeppelin/contracts/interfaces/draft-IERC6093.sol')) {
        return { contents: fs.readFileSync('node_modules/@openzeppelin/contracts/interfaces/draft-IERC6093.sol', 'utf8') };
    }
    return { error: 'File not found' };
}

async function main() {
    console.log("Compiling NexusRouter...");
    const routerSource = fs.readFileSync('src/NexusRouter.sol', 'utf8');
    const inputRouter = {
        language: 'Solidity',
        sources: { 'NexusRouter.sol': { content: routerSource } },
        settings: { outputSelection: { '*': { '*': ['*'] } } }
    };
    const outputRouter = JSON.parse(solc.compile(JSON.stringify(inputRouter)));
    if(outputRouter.errors) console.error(outputRouter.errors);
    const routerContract = outputRouter.contracts['NexusRouter.sol']['NexusRouter'];

    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const wallet = new ethers.Wallet(process.env.ANVIL_PRIVATE_KEY, provider);

    const routerFactory = new ethers.ContractFactory(routerContract.abi, routerContract.evm.bytecode.object, wallet);
    const router = await routerFactory.deploy();
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log("NexusRouter Deployed to:", routerAddress);

    fs.writeFileSync('deploy_config.json', JSON.stringify({ 
        address: routerAddress, 
        abi: routerContract.abi 
    }, null, 2));

    fs.writeFileSync('../frontend/src/contract_config.json', JSON.stringify({
        address: routerAddress,
        abi: routerContract.abi
    }, null, 2));

    console.log("Config updated.");
}

main().catch(console.error);
