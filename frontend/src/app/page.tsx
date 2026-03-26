'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [agents, setAgents] = useState<{ id: string; balance: string }[]>([]);
  const [events, setEvents] = useState<{ from: string; to: string; amount: string; endpoint: string; time: string }[]>([]);

  useEffect(() => {
    // Mock simulation for frontend visualization of autonomous agent logic
    const mockAgents = [
      { id: '0x86f6...97C6 (AI-Search-Node)', balance: '1.24 XOKB' },
      { id: '0x32A4...12B9 (DeFi-Trader-Bot)', balance: '0.82 XOKB' },
      { id: '0x99B1...44D2 (Compute-Oracle)', balance: '5.10 XOKB' },
    ];
    setAgents(mockAgents);

    const interval = setInterval(() => {
      const fromAgent = mockAgents[Math.floor(Math.random() * mockAgents.length)];
      const toAgent = mockAgents[Math.floor(Math.random() * mockAgents.length)];
      if (fromAgent.id !== toAgent.id) {
        setEvents(prev => [{
          from: fromAgent.id,
          to: toAgent.id,
          amount: (Math.random() * 0.05).toFixed(4),
          endpoint: '/api/v1/inference',
          time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 10));
      }
    }, 3000);

    return () => clearInterval(interval);
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
            ● Live on X Layer Testnet
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
            Live Payment Routing Stream
          </h2>
          <div className="space-y-3 overflow-hidden">
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Waiting for agent transactions...</p>
            ) : (
              events.map((ev, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-lg bg-gray-800/30 border border-gray-800 transition-all">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">{ev.time}</span>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="font-mono text-blue-400 truncate w-24">{ev.from.split(' ')[0]}</span>
                      <span className="text-gray-600">→</span>
                      <span className="font-mono text-purple-400 truncate w-24">{ev.to.split(' ')[0]}</span>
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
