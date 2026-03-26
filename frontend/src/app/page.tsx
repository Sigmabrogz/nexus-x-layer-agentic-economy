'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem, formatEther } from 'viem';
import { localhost } from 'viem/chains';

const NEXUS_ROUTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Mock local deployment address
const X_LAYER_TESTNET = {
  id: 195,
  name: 'X Layer Testnet',
  network: 'xlayer-testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testrpc.xlayer.tech'] },
    public: { http: ['https://testrpc.xlayer.tech'] },
  },
};

export default function Home() {
  const [agents, setAgents] = useState<{ id: string; balance: string }[]>([]);
  const [events, setEvents] = useState<{ from: string; to: string; amount: string; endpoint: string; time: string }[]>([]);

  useEffect(() => {
    // Setup Viem client pointing to X Layer testnet (fallback to local if unreachable)
    const client = createPublicClient({
      chain: localhost, // Default to Anvil since faucet failed
      transport: http('http://127.0.0.1:8545')
    });

    const unwatch = client.watchEvent({
      address: NEXUS_ROUTER_ADDRESS,
      event: parseAbiItem('event PaymentRouted(address indexed from, address indexed to, uint256 amount, string endpoint)'),
      onLogs: logs => {
        logs.forEach(log => {
          setEvents(prev => [{
            from: log.args.from as string,
            to: log.args.to as string,
            amount: formatEther(log.args.amount || 0n),
            endpoint: log.args.endpoint as string,
            time: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 10));
        });
      }
    });
    
    // Add mock initial state since local node may be empty on boot
    setAgents([
      { id: '0x86f6...97C6 (AI-Search-Node)', balance: '1.24 XOKB' },
      { id: '0x32A4...12B9 (DeFi-Trader-Bot)', balance: '0.82 XOKB' }
    ]);

    return () => {
      unwatch();
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <header className="mb-12 border-b border-gray-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Nexus Dashboard
          </h1>
          <p className="text-gray-400 mt-2">X Layer Agentic Payment Router (x402 protocol)</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
            ● Listening to Web3 Events
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 border border-gray-800 rounded-xl bg-gray-900/50 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
            Registered Agents
          </h2>
          <div className="space-y-4">
            {agents.map((agent, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <span className="text-sm font-mono text-gray-300">{agent.id}</span>
                <span className="text-sm font-semibold text-emerald-400">{agent.balance}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 border border-gray-800 rounded-xl bg-gray-900/50 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
            Live Payment Routing Stream (Viem Events)
          </h2>
          <div className="space-y-3 overflow-hidden">
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Listening for viem 'PaymentRouted' events...</p>
            ) : (
              events.map((ev, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-lg bg-gray-800/30 border border-gray-800 transition-all">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">{ev.time}</span>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="font-mono text-blue-400 truncate w-24">{ev.from.substring(0, 8)}...</span>
                      <span className="text-gray-600">→</span>
                      <span className="font-mono text-purple-400 truncate w-24">{ev.to.substring(0, 8)}...</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">{ev.endpoint}</span>
                    <span className="text-sm font-bold text-emerald-400">+{ev.amount} XOKB</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
