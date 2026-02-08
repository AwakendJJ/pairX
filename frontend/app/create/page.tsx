'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { CreateTradeForm } from '@/components/CreateTradeForm';

/**
 * Create Trade Page
 * 
 * Main page for creating a new P2P trade:
 * - Wallet connection requirement
 * - Create trade form with validation
 * - Educational information
 * - Navigation
 * 
 * Task 3.5.1: Build create trade form (page layout)
 */
export default function CreateTradePage() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/trades"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-2 inline-block"
            >
              ← Back to All Trades
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Create New Trade
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sell USDC via off-chain payment methods
            </p>
          </div>
          <ConnectButton />
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔐</div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                  Connect Your Wallet
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  You need to connect your wallet to create a trade and deposit USDC into escrow.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Trade Details
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Fill in the details below to create your P2P trade listing
            </p>
          </div>

          <CreateTradeForm />
        </div>

        {/* How It Works Info Panel */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>💡</span>
            How Creating a Trade Works
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Deposit USDC into Escrow
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Your USDC is securely locked in the smart contract. You remain in control until a buyer accepts.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Buyer Accepts Your Trade
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Your trade appears in the marketplace. A buyer accepts and commits to send payment via your specified method.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Verify Payment & Release
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Buyer sends off-chain payment. After you verify receipt, you release the USDC from escrow to the buyer.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Earn Reputation
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Both parties earn +1 reputation for completed trades, building trust in the community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>🛡️</span>
            Safety Tips
          </h3>
          
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Be specific and clear in your payment method details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Only release USDC after confirming payment receipt in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Communicate clearly with buyers through the trade room</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>You can cancel before a buyer accepts (full refund)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
              <span>Never share sensitive account credentials publicly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
              <span>Don&apos;t release funds without verifying payment first</span>
            </li>
          </ul>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Need help?{' '}
            <a
              href="https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Smart Contract
            </a>
            {' • '}
            <Link href="/trades" className="text-blue-600 dark:text-blue-400 hover:underline">
              Browse Trades
            </Link>
            {' • '}
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
