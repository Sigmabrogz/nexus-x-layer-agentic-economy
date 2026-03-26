'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem, formatEther, createWalletClient, custom } from 'viem';
import { localhost } from 'viem/chains';

const NEXUS_ROUTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = [
  parseAbiItem('function registerAgent() external'),
  parseAbiItem('function agentBalances(address) view returns (uint256)'),
  parseAbiItem('event PaymentRouted(address indexed from, address indexed to, uint256 amount, uint256 fee, string endpoint)'),
  parseAbiItem('event ERC20PaymentRouted(address indexed from, address indexed to, address indexed token, uint256 amount, uint256 fee, string endpoint)'),
  parseAbiItem('event AgentRegistered(address indexed agent)')
];

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [treasuryRevenue, setTreasuryRevenue] = useState(0n);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    const client = createPublicClient({
      chain: localhost,
      transport: http("http://127.0.0.1:8545")
    });

    const unwatch = client.watchEvent({
      address: NEXUS_ROUTER_ADDRESS,
      event: parseAbiItem('event PaymentRouted(address indexed from, address indexed to, uint256 amount, uint256 fee, string endpoint)'),
      onLogs: logs => {
        logs.forEach(log => {
          if (log.args.fee) {
            setTreasuryRevenue(prev => prev + log.args.fee!);
          }
          setEvents(prev => [{
            type: 'Native Payment',
            from: log.args.from,
            to: log.args.to,
            amount: log.args.amount?.toString(),
            fee: log.args.fee?.toString(),
            endpoint: log.args.endpoint,
            txHash: log.transactionHash
          }, ...prev]);
        });
      }
    });

    return () => unwatch();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xc3' }], // X Layer Testnet is 195 (0xc3)
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await eth.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xc3',
                  chainName: 'X Layer Testnet',
                  rpcUrls: ['https://testrpc.xlayer.tech'],
                  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
                  blockExplorerUrls: ['https://www.okx.com/explorer/xlayer-test'],
                },
              ],
            });
          } catch (addError) {
            console.error('Failed to add X Layer Testnet', addError);
          }
        } else {
          console.error('Failed to switch to X Layer Testnet', switchError);
        }
      }

      const client = createWalletClient({
        chain: localhost, // We keep the viem transport simple for localhost fallback in UI while wallet is on X Layer
        transport: custom(eth)
      });
      const [addr] = await client.requestAddresses();
      setAddress(addr);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Nexus | X Layer Protocol
        </h1>
        <button 
          onClick={connectWallet}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium transition-colors"
        >
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-neutral-400 text-sm font-medium mb-2">Protocol Treasury Revenue</h2>
          <p className="text-4xl font-bold text-emerald-400">{formatEther(treasuryRevenue)} <span className="text-lg">XLR</span></p>
          <p className="text-xs text-neutral-500 mt-2">2% fee on all agentic micro-transactions</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-neutral-400 text-sm font-medium mb-2">Live Agents Active</h2>
          <p className="text-4xl font-bold text-blue-400">42</p>
          <p className="text-xs text-neutral-500 mt-2">Agents connected via X402</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-neutral-400 text-sm font-medium mb-2">Total Inferences</h2>
          <p className="text-4xl font-bold text-purple-400">{events.length}</p>
          <p className="text-xs text-neutral-500 mt-2">Inferences routed through Nexus</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6">Real-Time Inference Feed</h2>
        {events.length === 0 ? (
          <p className="text-neutral-500 text-center py-8">Waiting for on-chain events...</p>
        ) : (
          <div className="space-y-4">
            {events.map((evt, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                <div>
                  <p className="text-sm font-medium text-emerald-400">Payment Routed</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    From: {evt.from?.slice(0,6)}...{evt.from?.slice(-4)} → To: {evt.to?.slice(0,6)}...{evt.to?.slice(-4)}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">Endpoint: {evt.endpoint}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{evt.amount ? formatEther(BigInt(evt.amount)) : '0'} XLR</p>
                  <p className="text-xs text-neutral-500">Fee: {evt.fee ? formatEther(BigInt(evt.fee)) : '0'} XLR</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
