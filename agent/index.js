const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

// Connect to the local RPC node
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const contractConfig = require('../deploy_config.json');

const nexusRouterAbi = [
    "event AgentRegistered(address indexed agent)",
    "event PaymentRouted(address indexed from, address indexed to, uint256 amount, uint256 fee, string endpoint)",
    "event ERC20PaymentRouted(address indexed from, address indexed to, address indexed token, uint256 amount, uint256 fee, string endpoint)",
    "function registeredAgents(address) external view returns (bool)"
];

async function generateAIResponse(prompt) {
    if (process.env.OPENROUTER_API_KEY) {
        try {
            const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
                model: "google/gemma-7b-it:free",
                messages: [{ role: "user", content: prompt }]
            }, {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            });
            return res.data.choices[0].message.content;
        } catch (err) {
            console.error("[Agent] OpenRouter API Failed:", err.message);
        }
    }
    
    // Fallback to dummy data
    try {
        const res = await axios.get('https://dummyjson.com/quotes/random');
        return `"${res.data.quote}" - ${res.data.author}`;
    } catch(e) {
        return "Simulated Inference Output: " + prompt;
    }
}

async function main() {
    // If no specific private key is given, use the first generated one or a default Hardhat one
    const pk = process.env.PRIVATE_KEY || process.env.AGENT_0_PRIVATE_KEY || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
    const wallet = new ethers.Wallet(pk, provider);
    const router = new ethers.Contract(contractConfig.address, nexusRouterAbi, wallet);

    console.log(`[Agent] Started Nexus Agent on ${wallet.address}`);
    console.log(`[Agent] Listening to NexusRouter at ${router.target}...`);

    const handleEvent = async (...args) => {
        // Handle both PaymentRouted and ERC20PaymentRouted based on args length
        let from, to, amount, fee, endpoint, token, eventPayload;
        
        if (args.length === 7) {
             // ERC20 (from, to, token, amount, fee, endpoint, eventPayload)
             [from, to, token, amount, fee, endpoint, eventPayload] = args;
        } else if (args.length === 6) {
             // Native (from, to, amount, fee, endpoint, eventPayload)
             [from, to, amount, fee, endpoint, eventPayload] = args;
             token = "Native";
        } else {
             console.log("Unknown event signature");
             return;
        }

        console.log(`\n[Agent Listener] Global Event Caught - Payment: ${from} -> ${to} | Token: ${token} | Amount: ${ethers.formatEther(amount)} | Fee: ${ethers.formatEther(fee)}`);
        
        // Trigger inference even if the receiver doesn't strictly match the single pk loaded 
        // (to simulate the network effect since we want to see it in the UI)
        console.log(`[Agent] Processing inference for prompt: "${endpoint}"...`);

        try {
            const responseText = await generateAIResponse(endpoint);
            console.log(`[Agent] Inference Result: ${responseText}`);
            
            // Post result back to Next.js API route
            try {
                await axios.post('http://localhost:3000/api/inference', {
                    prompt: endpoint,
                    result: responseText,
                    agent: to,
                    requester: from
                });
                console.log(`[Agent] Result sent to frontend off-chain.`);
            } catch (postErr) {
                console.error(`[Agent] Frontend not reachable, but inference complete.`);
            }
        } catch (err) {
            console.error(`[Agent] Inference failed:`, err.message);
        }
    };

    router.on("ERC20PaymentRouted", handleEvent);
    router.on("PaymentRouted", handleEvent);
}

main().catch(console.error);
