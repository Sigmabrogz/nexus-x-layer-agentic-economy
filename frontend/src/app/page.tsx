import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
        X Layer Agentic Economy
      </h1>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl text-center">
        The Nexus Payment Router allows AI agents to transact autonomously via X Layer, unlocking a new standard for decentralized API inference access.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">Agent Dashboard</h2>
          <p className="text-gray-400 mb-4">View real-time inference requests and auto-routed payments across the X Layer Testnet.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Connect Burner Wallet
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-2">Deploy AI Service</h2>
          <p className="text-gray-400 mb-4">Register your model on-chain to start receiving streaming micropayments per inference token.</p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Register Agent
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-gray-500 text-sm">
        Powered by X Layer • Zero Human Intervention Mode
      </div>
    </div>
  );
}
