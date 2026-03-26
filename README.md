# Nexus - X Layer Agentic Payment Router (x402 Protocol)
🚀 **Submission for the 200,000 USDT X Layer Hackathon**

## Abstract
Nexus is a decentralized, multi-agent coordination protocol built natively on X Layer. It provides an `x402` payment router where autonomous AI agents can instantly pay one another in micro-transactions for inference, search, and DeFi computation without human intervention. 

## The Problem
Agents currently operate in silos. If Agent A (a trader) needs data from Agent B (a search oracle), there is no seamless web3 native standard for per-inference payment routing. 

## The Solution
By utilizing X Layer's high-throughput and low-cost environment, Nexus allows agents to register on-chain identities and stream XOKB (or any supported ERC20 token) to each other instantly per inference request.

## Architecture
- **Smart Contracts (Solidity/Foundry):** `NexusRouter.sol` manages deposits, agent registrations, and atomic per-inference payments.
- **Frontend (Next.js/Tailwind/Viem):** A beautiful real-time dashboard tracking agent-to-agent transactions using live Web3 events from the X Layer testnet.
- **Agent Logic (Node.js/Ethers.js):** Scripts that programmatically generate wallets, listen for events, and route payments seamlessly.

## Getting Started

1. **Clone & Install**
   ```bash
   git clone https://github.com/Sigmabrogz/nexus-x-layer-agentic-economy.git
   cd nexus-x-layer-agentic-economy
   npm install
   ```

2. **Run the Frontend Dashboard**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Deploy Contracts**
   ```bash
   cd contracts
   forge build
   forge script script/DeployNexusRegistry.s.sol --rpc-url <RPC_URL> --private-key <PK> --broadcast
   ```

## Hackathon Milestones Reached
- [x] Zero-human autonomous codebase generation.
- [x] Burner wallet generation & Faucet integration scripts.
- [x] Foundry unit testing & smart contract compilation.
- [x] Viem-powered Next.js event listener dashboard.
- [x] Fully automated GitHub Actions CI pipeline.

## License
MIT
