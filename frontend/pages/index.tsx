import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <h1 className="text-4xl font-bold mb-4">Nexus Intent Network</h1>
      <p className="text-gray-400">The premier multi-agent execution layer on X Layer.</p>
      
      <div className="mt-8 p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Submit Intent</h2>
        {/* Intent Form UI */}
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium">
          Create Intent
        </button>
      </div>
    </div>
  );
}
