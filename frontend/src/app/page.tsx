/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem, formatEther, createWalletClient, custom } from 'viem';
import { localhost } from 'viem/chains';

const NEXUS_ROUTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const EVENT_PAYMENT_ROUTED = parseAbiItem('event PaymentRouted(address indexed from, address indexed to, uint256 amount, string endpoint)');
const EVENT_ERC20_PAYMENT_ROUTED = parseAbiItem('event ERC20PaymentRouted(address indexed from, address indexed to, address indexed token, uint256 amount, string endpoint)');
const EVENT_AGENT_REGISTERED = parseAbiItem('event AgentRegistered(address indexed agent)');
const ABI = [
  parseAbiItem('function registerAgent() external'),
  parseAbiItem('event PaymentRouted(address indexed from, address indexed to, uint256 amount, string endpoint)'),
  parseAbiItem('event ERC20PaymentRouted(address indexed from, address indexed to, address indexed token, uint256 amount, string endpoint)'),
  parseAbiItem('event AgentRegistered(address indexed agent)')
];

export default function Home() {
  const [agents, setAgents] = useState<{ id: string; balance: string }[]>([]);
  const [events, setEvents] = useState<{ from: string; to: string; amount: string; endpoint: string; time: string; type: string }[]>([]);
  const [inferences, setInferences] = useState<{ prompt: string; result: string; agent: string; requester: string; time: string }[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const client = createPublicClient({
      chain: localhost,
      transport: http('http://127.0.0.1:8545')
    });

    const unwatchPayments = client.watchEvent({
      address: NEXUS_ROUTER_ADDRESS,
      event: EVENT_PAYMENT_ROUTED,
      onLogs: logs => {
        logs.forEach(log => {
          setEvents(prev => [{
            from: log.args.from as string,
            to: log.args.to as string,
            amount: formatEther(log.args.amount || BigInt(0)),
            endpoint: log.args.endpoint as string,
            time: new Date().toLocaleTimeString(),
            type: 'Native'
          }, ...prev].slice(0, 10));
        });
      }
    });

    const unwatchERC20Payments = client.watchEvent({
      address: NEXUS_ROUTER_ADDRESS,
      event: EVENT_ERC20_PAYMENT_ROUTED,
      onLogs: logs => {
        logs.forEach(log => {
          setEvents(prev => [{
            from: log.args.from as string,
            to: log.args.to as string,
            amount: formatEther(log.args.amount || BigInt(0)),
            endpoint: log.args.endpoint as string,
            time: new Date().toLocaleTimeString(),
            type: 'ERC20 (USDT)'
          }, ...prev].slice(0, 10));
        });
      }
    });

    const unwatchRegistrations = client.watchEvent({
      address: NEXUS_ROUTER_ADDRESS,
      event: EVENT_AGENT_REGISTERED,
      onLogs: logs => {
        logs.forEach(log => {
          const newAgent = log.args.agent as string;
          setAgents(prev => {
            if (prev.some(a => a.id.includes(newAgent.substring(0, 6)))) return prev;
            return [{ id: `${newAgent.substring(0, 6)}...${newAgent.substring(38)} (New Agent)`, balance: '0.00' }, ...prev];
          });
        });
      }
    });
    
    setAgents([
      { id: '0x86f6...97C6 (AI-Search-Node)', balance: '1.24 XOKB' },
      { id: '0x32A4...12B9 (DeFi-Trader-Bot)', balance: '0.82 XOKB' }
    ]);

    const pollInterval = setInterval(() => {
      fetch('/api/inference')
        .then(res => res.json())
        .then(data => {
          if (data.inferences) setInferences(data.inferences);
        })
        .catch(() => {});
    }, 2000);

    return () => {
      unwatchPayments();
      unwatchERC20Payments();
      unwatchRegistrations();
      clearInterval(pollInterval);
    };
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const [address] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(address);
      } catch (err) {
        console.error("Failed to connect wallet", err);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet.");
    }
  };

  const registerAgent = async () => {
    if (!account || !(window as any).ethereum) return;
    setIsRegistering(true);
    try {
      const walletClient = createWalletClient({
        account: account as `0x${string}`,
        chain: localhost,
        transport: custom((window as any).ethereum)
      });
      const hash = await walletClient.writeContract({
        address: NEXUS_ROUTER_ADDRESS,
        abi: ABI,
        functionName: 'registerAgent'
      });
      console.log("Registration tx submitted:", hash);
      alert("Registration transaction sent! Check your wallet.");
    } catch (err: unknown) {
      console.error(err);
      alert("Registration failed: " + ((err as Error).message || "Unknown error"));
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8 font-sans pb-24">
      <header className="mb-12 border-b border-gray-800 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
            Nexus Dashboard
          </h1>
          <p className="text-gray-400 mt-2 font-medium">X Layer Agentic Payment Router (x402 protocol)</p>
        </div>
        <div className="flex flex-col items-end space-y-3">
          <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20 shadow-sm shadow-green-900/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5"></span>
            Listening to Web3 Events
          </span>
          {account ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400 font-mono bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
                {account.substring(0, 6)}...{account.substring(38)}
              </span>
              <button 
                onClick={registerAgent} 
                disabled={isRegistering}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-lg"
              >
                {isRegistering ? "Registering..." : "Register Agent"}
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-md"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="col-span-1 border border-gray-800 rounded-2xl bg-gray-900/50 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-100">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-3"></span>
            Registered Agents
          </h2>
          <div className="space-y-4">
            {agents.map((agent, idx) => (
              <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl bg-gray-800/40 border border-gray-700/50">
                <span className="text-sm font-mono text-gray-300">{agent.id}</span>
                <span className="text-sm font-semibold text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded-md">{agent.balance}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 border border-gray-800 rounded-2xl bg-gray-900/50 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
            Live Payment Routing Stream (x402)
          </h2>
          <div className="space-y-3 overflow-hidden">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-800 rounded-xl">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 text-sm font-medium">Awaiting on-chain inference payments...</p>
              </div>
            ) : (
              events.map((ev, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                  <div className="flex items-center space-x-5">
                    <span className="text-xs text-gray-500 font-medium w-16">{ev.time}</span>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="font-mono text-blue-400 bg-blue-950/30 px-2 py-1 rounded border border-blue-900/50">{ev.from.substring(0, 6)}...{ev.from.substring(38)}</span>
                      <span className="text-gray-500">→</span>
                      <span className="font-mono text-purple-400 bg-purple-950/30 px-2 py-1 rounded border border-purple-900/50">{ev.to.substring(0, 6)}...{ev.to.substring(38)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs px-2.5 py-1 bg-gray-900/80 rounded-md text-gray-400 border border-gray-800 font-mono tracking-wide">{ev.endpoint}</span>
                    <span className="text-sm font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-900/50">+{ev.amount} {ev.type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="col-span-3 border border-gray-800 rounded-2xl bg-gray-900/50 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-100">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-3 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
          Off-Chain AI Inference Stream (Responses)
        </h2>
        <div className="space-y-4">
          {inferences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-gray-800 rounded-xl">
              <p className="text-gray-500 text-sm font-medium">Awaiting node agent completions...</p>
            </div>
          ) : (
            inferences.map((inf, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-gray-800/30 border border-gray-700/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500 font-medium">Prompt: <span className="text-blue-300 font-mono bg-blue-900/20 px-2 py-0.5 rounded">{inf.prompt}</span></span>
                  <span className="text-xs text-gray-500">{new Date(inf.time).toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-300 text-sm border-l-2 border-purple-500 pl-4 py-1 italic">
                  "{inf.result}"
                </p>
                <div className="mt-3 flex items-center space-x-3 text-xs text-gray-500">
                  <span>Processed by: <span className="font-mono text-purple-400">{inf.agent.substring(0, 8)}</span></span>
                  <span>|</span>
                  <span>Requested by: <span className="font-mono text-blue-400">{inf.requester.substring(0, 8)}</span></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
