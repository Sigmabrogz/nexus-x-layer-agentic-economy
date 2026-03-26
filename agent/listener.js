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
        "event PaymentRouted(address indexed sender, address indexed agent, uint256 amount, uint256 fee)"
    ];
    
    // Address of the deployed NexusRouter contract
    // We mock this for now since we don't have a live deployment
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"; 
    
    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log(`Listening for PaymentRouted events on ${contractAddress}`);

    contract.on("PaymentRouted", async (sender, agent, amount, fee, event) => {
        console.log(`\n--- NEW PAYMENT ROUTED ---`);
        console.log(`Sender: ${sender}`);
        console.log(`Agent:  ${agent}`);
        console.log(`Amount: ${amount.toString()}`);
        console.log(`Fee:    ${fee.toString()}`);
        
        // Trigger off-chain AI inference autonomously
        const response = await triggerAIInference(agent, amount.toString());
        console.log(`Inference Result: ${response.result}`);
    });
}

main().catch(console.error);
