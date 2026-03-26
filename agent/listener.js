import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

// Simple mocked OpenRouter API call
async function triggerAIInference(agentId, amount) {
    console.log(`[Agent: ${agentId}] Received Payment: ${amount} wei`);
    console.log(`[AI Engine] Requesting inference from OpenRouter for task...`);
    
    // Simulating an API call
    return new Promise(resolve => setTimeout(() => {
        resolve({
            status: 'success',
            result: `Autonomous response generated for ${amount} wei.`
        });
    }, 1500));
}

async function main() {
    console.log("Starting Nexus Payment Listener...");
    
    const providerUrl = process.env.RPC_URL || "http://127.0.0.1:8545"; // Anvil or X Layer RPC
    const provider = new ethers.JsonRpcProvider(providerUrl);
    
    // NexusRouter ABI snippet for the event
    const abi = [
        "event PaymentRouted(address indexed from, address indexed to, uint256 amount, uint256 fee, string endpoint)"
    ];
    
    // Address of the deployed NexusRouter contract
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
    
    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log(`Listening for PaymentRouted events on ${contractAddress}`);

    contract.on("PaymentRouted", async (from, to, amount, fee, endpoint, event) => {
        console.log(`\n--- NEW PAYMENT ROUTED ---`);
        console.log(`From:     ${from}`);
        console.log(`To:       ${to}`);
        console.log(`Amount:   ${amount.toString()}`);
        console.log(`Fee:      ${fee.toString()}`);
        console.log(`Endpoint: ${endpoint}`);
        
        // Trigger off-chain AI inference autonomously
        const response = await triggerAIInference(to, amount.toString());
        console.log(`Inference Result: ${response.result}`);
    });
}

main().catch(console.error);
