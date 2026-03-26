/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { createPublicClient, http, parseAbiItem, formatEther, createWalletClient, custom } from 'viem';
import { localhost } from 'viem/chains';

const NEXUS_ROUTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [treasuryRevenue, setTreasuryRevenue] = useState(BigInt(0));
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

  const endpointStats = useMemo(() => {
    const stats: Record<string, number> = {};
    events.forEach(evt => {
      if (evt.endpoint) {
        stats[evt.endpoint] = (stats[evt.endpoint] || 0) + 1;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [events]);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eth = (window as any).ethereum;
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xc3' }], // X Layer Testnet is 195 (0xc3)
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        chain: localhost, 
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl col-span-1">
          <h2 className="text-neutral-400 text-sm font-medium mb-2">Protocol Treasury Revenue</h2>
          <p className="text-4xl font-bold text-emerald-400">{formatEther(treasuryRevenue)} <span className="text-lg">XLR</span></p>
          <p className="text-xs text-neutral-500 mt-2">2% fee on all agentic micro-transactions</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl col-span-1">
          <h2 className="text-neutral-400 text-sm font-medium mb-2">Live Agents Active</h2>
          <p className="text-4xl font-bold text-blue-400">42</p>
          <p className="text-xs text-neutral-500 mt-2">Agents connected via X402</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl col-span-1">
          <h2 className="text-neutral-400 text-sm font-medium mb-2">Total Inferences</h2>
          <p className="text-4xl font-bold text-purple-400">{events.length}</p>
          <p className="text-xs text-neutral-500 mt-2">Inferences routed through Nexus</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl col-span-1 max-h-48 overflow-y-auto">
          <h2 className="text-neutral-400 text-sm font-medium mb-2">Endpoint Usage</h2>
          {endpointStats.length === 0 ? (
            <p className="text-xs text-neutral-500 mt-2">No data yet</p>
          ) : (
            <ul className="space-y-2 mt-4">
              {endpointStats.map(([endpoint, count]) => (
                <li key={endpoint} className="flex justify-between items-center text-sm">
                  <span className="text-blue-300 truncate max-w-[120px]" title={endpoint}>{endpoint}</span>
                  <span className="bg-neutral-800 px-2 py-1 rounded-full text-xs font-bold">{count}</span>
                </li>
              ))}
            </ul>
          )}
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
