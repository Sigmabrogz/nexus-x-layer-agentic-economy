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
    console.log("Compiling NexusRouter for X Layer Testnet...");
    const routerSource = fs.readFileSync('src/NexusRouter.sol', 'utf8');
    const inputRouter = {
        language: 'Solidity',
        sources: { 'NexusRouter.sol': { content: routerSource } },
        settings: { outputSelection: { '*': { '*': ['*'] } } }
    };
    
    // Using an import callback for the basic @openzeppelin imports
    const outputRouter = JSON.parse(solc.compile(JSON.stringify(inputRouter), { import: findImports }));
    
    if (outputRouter.errors) {
        outputRouter.errors.forEach(e => {
            if (e.severity === 'error') console.error(e.formattedMessage);
        });
    }
    
    const routerContract = outputRouter.contracts['NexusRouter.sol']['NexusRouter'];
    if (!routerContract) {
        throw new Error("Compilation failed, contract not found");
    }

    const provider = new ethers.JsonRpcProvider('https://xlayertestrpc.okx.com');
    if (!process.env.DEPLOYER_PRIVATE_KEY) {
        throw new Error("Missing DEPLOYER_PRIVATE_KEY in .env");
    }
    
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    // Check balance before deployment
    const balance = await provider.getBalance(wallet.address);
    console.log(`Deployer Address: ${wallet.address}`);
    console.log(`Deployer Balance: ${ethers.formatEther(balance)} OKB`);
    
    if (balance === 0n) {
        throw new Error("Insufficient OKB on X Layer testnet to deploy. Please fund the deployer wallet.");
    }

    console.log("Deploying contract...");
    const routerFactory = new ethers.ContractFactory(routerContract.abi, routerContract.evm.bytecode.object, wallet);
    const router = await routerFactory.deploy();
    
    console.log("Waiting for deployment confirmation...");
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    
    console.log("NexusRouter Deployed to X Layer Testnet at:", routerAddress);

    fs.writeFileSync('deploy_config_xlayer.json', JSON.stringify({ 
        address: routerAddress, 
        abi: routerContract.abi,
        network: "X Layer Testnet",
        chainId: 195
    }, null, 2));

    fs.writeFileSync('../frontend/src/contract_config.json', JSON.stringify({
        address: routerAddress,
        abi: routerContract.abi
    }, null, 2));

    console.log("Frontend and Backend Config updated successfully for X Layer.");
}

main().catch(console.error);
