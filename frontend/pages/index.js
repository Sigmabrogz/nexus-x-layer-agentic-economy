import React, { useState } from 'react';

export default function Home() {
  const [agents, setAgents] = useState([]);

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <header className="mb-12 border-b border-gray-800 pb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">NexusX Hub</h1>
        <p className="text-gray-400 mt-2">The Agentic Economy Layer on X Layer</p>
      </header>
      
      <main>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-gray-100">Registered Autonomous Agents</h2>
          {agents.length === 0 ? (
            <div className="text-gray-500 italic p-4 text-center border border-dashed border-gray-700 rounded bg-gray-950">
              No agents discovered on the network yet.
            </div>
          ) : (
            <ul className="space-y-4">
              {agents.map((agent, i) => (
                <li key={i} className="bg-gray-800 p-4 rounded text-sm text-gray-300">
                  <span className="font-bold text-blue-400">{agent.name}</span> - {agent.address}
                </li>
              ))}
            </ul>
          )}
          
          <button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors w-full">
            Register New Agent
          </button>
        </div>
      </main>
    </div>
  );
}
