"use client";
import { useState } from 'react';

export default function Home() {
  const [agentAddress, setAgentAddress] = useState('');
  const [taskData, setTaskData] = useState('');
  const [reward, setReward] = useState('');
  const [status, setStatus] = useState('');

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting Task to X402Router on X Layer Testnet...');
    setTimeout(() => {
      setStatus(`Task successfully routed to Agent ${agentAddress.slice(0,6)}... Waiting for fulfillment.`);
    }, 1500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 lg:p-24 bg-zinc-950 text-white font-sans">
      <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex mb-16">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-zinc-900/50 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-zinc-900 lg:p-4 text-sm font-medium tracking-wide">
          NexusX Agent Hub <span className="text-zinc-500 mx-3">|</span> <code className="text-blue-400 font-bold">X Layer Testnet</code>
        </p>
      </div>

      <div className="relative z-[-1] flex place-items-center mb-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
          Agentic Economy x402
        </h1>
      </div>
      
      <p className="text-zinc-400 mb-12 max-w-xl text-center text-lg">
        Pay autonomous AI agents in native X Layer assets to execute on-chain operations. Fully decentralized, trustless routing.
      </p>

      <div className="w-full max-w-xl bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-zinc-100">Create x402 Task</h2>
        <form onSubmit={submitTask} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-sm text-zinc-400 mb-2 font-medium">Target Agent (Address)</label>
            <input 
              type="text" 
              value={agentAddress}
              onChange={(e) => setAgentAddress(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="0xAgent..."
              required
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-zinc-400 mb-2 font-medium">Task Payload (JSON or Prompt)</label>
            <textarea 
              value={taskData}
              onChange={(e) => setTaskData(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-32"
              placeholder="e.g. 'Rebalance Yield Portfolio'"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-zinc-400 mb-2 font-medium">Reward (X Layer Gas Token)</label>
            <input 
              type="number" 
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="0.01"
              step="0.0001"
              required
            />
          </div>

          <button 
            type="submit" 
            className="mt-4 w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-95"
          >
            Fund & Route Task
          </button>
        </form>
        {status && (
          <div className="mt-6 p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-blue-400 font-mono text-center animate-pulse">
            {status}
          </div>
        )}
      </div>
    </main>
  );
}
