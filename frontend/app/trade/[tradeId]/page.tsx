'use client';

import { useParams } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useReadPairXEscrowGetTrade } from '@/lib/generated';
import Link from 'next/link';
import { ParticipantCard } from '@/components/ParticipantCard';
import { TradeDetailsPanel } from '@/components/TradeDetailsPanel';
import { ActionPanel } from '@/components/ActionPanel';
import { ActivityLog } from '@/components/ActivityLog';

/**
 * Trade Room Page
 * 
 * Main interface for individual P2P trades
 * Shows: Participants, Trade Details, Actions, Activity Log
 */
export default function TradeRoomPage() {
  const params = useParams();
  const tradeId = BigInt(params.tradeId as string);
  const { address, isConnected } = useAccount();

  // Fetch trade data
  const { 
    data: trade, 
    isLoading, 
    error,
    refetch 
  } = useReadPairXEscrowGetTrade({
    chainId: 5042002,
    args: [tradeId],
  });

  if (!isConnected) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Trade #{params.tradeId}</h1>
            <ConnectButton />
          </div>
          <div className="p-8 border rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Please connect your wallet to view trade details
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Trade #{params.tradeId}</h1>
            <ConnectButton />
          </div>
          <div className="p-8 border rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Loading trade data...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !trade) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Trade #{params.tradeId}</h1>
            <ConnectButton />
          </div>
          <div className="p-8 border border-red-300 rounded-lg text-center bg-red-50 dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-300 font-semibold mb-2">
              ❌ Trade not found
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trade ID {params.tradeId} doesn't exist or couldn't be loaded
            </p>
            <Link 
              href="/"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Get trade state name
  const stateNames = ['OPEN', 'LOCKED', 'PAID', 'RELEASED', 'CANCELLED', 'DISPUTED'];
  const stateName = stateNames[Number(trade.state)] || 'UNKNOWN';

  // Determine user role
  const isSeller = address?.toLowerCase() === trade.seller.toLowerCase();
  const isBuyer = address?.toLowerCase() === trade.buyer.toLowerCase();
  const isTradeOpen = Number(trade.state) === 0; // OPEN state
  
  // For OPEN trades, non-sellers are potential buyers (can accept)
  // For other states, only actual participants have roles
  const userRole = isSeller 
    ? 'Seller' 
    : isBuyer 
    ? 'Buyer' 
    : (isTradeOpen && !isSeller) 
    ? 'Buyer' // Potential buyer in OPEN state
    : 'Viewer';

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Trade #{tradeId.toString()}
              </h1>
              <div className="flex items-center gap-4">
                <span className={`
                  px-3 py-1 rounded-full text-sm font-semibold
                  ${stateName === 'OPEN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                  ${stateName === 'LOCKED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                  ${stateName === 'PAID' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : ''}
                  ${stateName === 'RELEASED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                  ${stateName === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                  ${stateName === 'DISPUTED' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : ''}
                `}>
                  {stateName}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  You are: <span className="font-semibold">{userRole}</span>
                </span>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Participants & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Participants Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Trade Participants</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ParticipantCard
                  role="seller"
                  address={trade.seller}
                  isCurrentUser={isSeller}
                  reputation={0n} // Will be fetched separately
                />
                <ParticipantCard
                  role="buyer"
                  address={trade.buyer}
                  isCurrentUser={isBuyer}
                  reputation={0n}
                />
              </div>
            </div>

            {/* Trade Details */}
            <TradeDetailsPanel trade={trade} tradeId={tradeId} />

            {/* Activity Log */}
            <ActivityLog tradeId={tradeId} />
          </div>

          {/* Right Column: Action Panel */}
          <div className="lg:col-span-1">
            <ActionPanel
              trade={trade}
              tradeId={tradeId}
              userRole={userRole}
              onSuccess={() => refetch()}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
