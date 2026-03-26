const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

// Connect to the local RPC node
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const contractConfig = require('../deploy_config.json');

const nexusRouterAbi = [
    "event AgentRegistered(address indexed agent)",
    "event PaymentRouted(address indexed from, address indexed to, uint256 amount, string endpoint)",
    "event FundsDeposited(address indexed agent, uint256 amount)",
    "function registerAgent() external",
    "function deposit() external payable",
    "function payForInference(address to, uint256 amount, string calldata endpoint) external",
    "function agentBalances(address) external view returns (uint256)",
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
    const res = await axios.get('https://dummyjson.com/quotes/random');
    return `"${res.data.quote}" - ${res.data.author}`;
}

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const router = new ethers.Contract(contractConfig.address, nexusRouterAbi, wallet);

    console.log(`[Agent] Started Nexus Agent on ${wallet.address}`);
    console.log(`[Agent] Listening to NexusRouter at ${router.target}...`);

    const handleEvent = async (from, to, amount, endpoint, event) => {
        console.log(`\n[Agent Listener] Global Event Caught - PaymentRouted: ${from} -> ${to} | Amount: ${ethers.formatEther(amount)}`);
        if (to.toLowerCase() === wallet.address.toLowerCase()) {
            console.log(`\n[Agent] Received Payment directed to ME!`);
            console.log(`[Agent] Amount: ${ethers.formatEther(amount)} OKB`);
            console.log(`[Agent] From: ${from}`);
            console.log(`[Agent] Endpoint requested: ${endpoint}`);
            console.log(`[Agent] Processing inference for prompt: "${endpoint}"...`);

            try {
                const responseText = await generateAIResponse(endpoint);
                console.log(`[Agent] Inference Result: ${responseText}`);
                console.log(`[Agent] Payload successfully returned to ${from}`);
            } catch (err) {
                console.error(`[Agent] Inference failed:`, err.message);
            }
        }
    };

    router.on("PaymentRouted", handleEvent);

    // Fetch past unhandled logs for robust recovery
    console.log("[Agent] Syncing past missed events...");
    try {
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = currentBlock > 100 ? currentBlock - 100 : 0;
        const pastLogs = await router.queryFilter("PaymentRouted", fromBlock);
        for (const log of pastLogs) {
            console.log(`[Agent] Processing past event from block ${log.blockNumber}...`);
            await handleEvent(log.args[0], log.args[1], log.args[2], log.args[3], log);
        }
    } catch (e) {
        console.error("[Agent] Past sync failed, continuing live:", e.message);
    }
}

main().catch(console.error);
