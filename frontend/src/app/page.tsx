"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import config from "../../../contracts/deploy_config.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const nexusRouterAbi = [
    "function agentBalances(address) external view returns (uint256)",
    "function deposit() external payable",
    "function payForInference(address to, uint256 amount, string calldata endpoint) external",
    "function registerAgent() external",
    "function registeredAgents(address) external view returns (bool)"
];

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [agentBalance, setAgentBalance] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);

  // Hardcoded for the demo agent address we generated
  const AGENT_ADDRESS = "0x85591C776EFd42FD1FEb05AC386cE3F471ec84fF";
  const ROUTER_ADDRESS = config.address;

  useEffect(() => {
    if (window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return alert("Please install MetaMask or another Web3 wallet.");
    const accounts = await provider.send("eth_requestAccounts", []);
    setUserAddress(accounts[0]);
    updateBalances(accounts[0]);
  };

  const updateBalances = async (address: string) => {
    if (!provider) return;
    const contract = new ethers.Contract(ROUTER_ADDRESS, nexusRouterAbi, provider);
    const bal = await contract.agentBalances(address);
    const aBal = await contract.agentBalances(AGENT_ADDRESS);
    
    setBalance(ethers.formatEther(bal));
    setAgentBalance(ethers.formatEther(aBal));
  };

  const registerAndDeposit = async () => {
    if (!provider || !userAddress) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ROUTER_ADDRESS, nexusRouterAbi, signer);
      
      const isReg = await contract.registeredAgents(userAddress);
      if (!isReg) {
        const tx1 = await contract.registerAgent();
        await tx1.wait();
      }
      
      const tx2 = await contract.deposit({ value: ethers.parseEther("0.1") });
      await tx2.wait();
      updateBalances(userAddress);
      alert("Deposited 0.1 OKB successfully!");
    } catch (e) {
      console.error(e);
      alert("Transaction failed");
    }
    setLoading(false);
  };

  const payForInference = async () => {
    if (!provider || !userAddress) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ROUTER_ADDRESS, nexusRouterAbi, signer);
      
      const tx = await contract.payForInference(AGENT_ADDRESS, ethers.parseEther("0.01"), "/v1/chat/completions");
      await tx.wait();
      updateBalances(userAddress);
      alert("Payment sent! Agent is processing your request.");
    } catch (e) {
      console.error(e);
      alert("Payment failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
        X Layer Agentic Economy
      </h1>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl text-center">
        The Nexus Payment Router allows AI agents to transact autonomously via X Layer, unlocking a new standard for decentralized API inference access.
      </p>

      {!userAddress ? (
        <button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-colors mb-8">
          Connect Web3 Wallet
        </button>
      ) : (
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
          <p className="text-sm text-gray-400 mb-2">Connected: {userAddress.slice(0,6)}...{userAddress.slice(-4)}</p>
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-lg">Your Router Balance:</span>
            <span className="text-blue-400 font-mono text-xl">{balance} OKB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">AI Agent Earnings:</span>
            <span className="text-purple-400 font-mono text-xl">{agentBalance} OKB</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Fund Agent Account</h2>
            <p className="text-gray-400 mb-4">Deposit funds into the Nexus Smart Contract to prepay for AI inference.</p>
          </div>
          <button disabled={loading || !userAddress} onClick={registerAndDeposit} className="mt-4 bg-blue-600 disabled:bg-gray-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors w-full">
            Deposit 0.1 OKB
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Request Inference</h2>
            <p className="text-gray-400 mb-4">Stream 0.01 OKB directly to the target AI agent and await real-time response.</p>
          </div>
          <button disabled={loading || !userAddress} onClick={payForInference} className="mt-4 bg-purple-600 disabled:bg-gray-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors w-full">
            Pay & Infer
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-gray-500 text-sm">
        Powered by X Layer • Zero Human Intervention Mode
      </div>
    </div>
  );
}
