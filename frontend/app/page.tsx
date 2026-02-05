'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { ContractExample } from '@/components/ContractExample';

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <ConnectButton />
        </div>

        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to PairX
        </h1>
        <p className="text-center text-lg mb-4">
          P2P DEX on Arc L1 with native USDC settlement
        </p>

        {/* Connection Status */}
        {isConnected && (
          <div className="text-center mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-700 dark:text-green-300 font-semibold">
              ✅ Wallet Connected
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Address: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chain ID: {chainId} {chainId === 5042002 && '(Arc L1 Testnet ✅)'}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">✅ Contract Deployed</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              PairXEscrow live on Arc L1 Testnet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">
              0xf4436E...366E7
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">🔗 Native USDC</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gas paid in USDC, not ETH
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              18 decimals
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">🤝 P2P Trading</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trustless escrow for fiat-to-crypto
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Secure & transparent
            </p>
          </div>
        </div>

        {/* Contract Data Example */}
        {isConnected && (
          <div className="mt-8 flex justify-center">
            <ContractExample />
          </div>
        )}

        {/* Primary Actions */}
        <div className="flex justify-center gap-4 mt-8 mb-8">
          <a
            href="/create"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            + Create Trade
          </a>
          <a
            href="/trades"
            className="inline-block bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all border-2 border-blue-600 dark:border-blue-400"
          >
            Browse Trades
          </a>
        </div>

        {/* Quick Links */}
        <div className="flex justify-center gap-4 mt-4 flex-wrap text-sm">
          <a
            href="/test-actions"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            Test Actions →
          </a>
          <span className="text-gray-400">|</span>
          <a
            href="/trade/1"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            View Trade #1 →
          </a>
          <span className="text-gray-400">|</span>
          <a
            href="https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            View Contract →
          </a>
        </div>
      </div>
    </main>
  );
}
