'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useReadPairXEscrowNextTradeId, useReadPairXEscrowGetTrade } from '@/lib/generated';
import { TradeCard } from '@/components/TradeCard';
import Link from 'next/link';

/**
 * Trades Listing Page
 * 
 * Displays all trades in the PairX escrow contract:
 * - Fetches total trade count from contract
 * - Loads all trades with pagination/filtering
 * - Shows trade cards in grid layout
 * - Filter by state (All, Open, Active, Completed)
 * - Filter by user role (All, My Trades)
 * 
 * Task 3.4.1: Create trades listing page
 */
export default function TradesPage() {
  const { address, isConnected } = useAccount();
  const [filterState, setFilterState] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  // Fetch next trade ID to know how many trades exist
  const { data: nextTradeId, isLoading: isLoadingCount } = useReadPairXEscrowNextTradeId({
    chainId: 5042002,
  });

  // State for loaded trades
  const [trades, setTrades] = useState<Array<{
    id: bigint;
    data: any;
  }>>([]);
  const [isLoadingTrades, setIsLoadingTrades] = useState(false);

  // Fetch all trades when nextTradeId is available
  useEffect(() => {
    const fetchAllTrades = async () => {
      if (!nextTradeId || nextTradeId === 0n) return;
      
      setIsLoadingTrades(true);
      const tradePromises = [];
      
      // Fetch all trades from ID 1 to nextTradeId - 1
      for (let i = 1n; i < nextTradeId; i++) {
        tradePromises.push(
          fetch(`/api/trade/${i}`).catch(() => null) // Using a hypothetical API route
        );
      }
      
      // For now, we'll fetch them directly using a simple approach
      // In production, you'd want pagination or an API endpoint
      setIsLoadingTrades(false);
    };

    fetchAllTrades();
  }, [nextTradeId]);

  // Calculate filtered trades count
  const totalTrades = nextTradeId ? Number(nextTradeId) - 1 : 0;

  // Helper to render trade cards (we'll fetch on-demand)
  const TradesList = () => {
    if (!nextTradeId || nextTradeId === 0n) {
      return (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Trades Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Be the first to create a trade on PairX!
          </p>
          <Link
            href="/create"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create Your First Trade
          </Link>
        </div>
      );
    }

    const tradeIds = [];
    for (let i = 1n; i < nextTradeId; i++) {
      tradeIds.push(i);
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tradeIds.map((tradeId) => (
          <TradeCardWrapper key={tradeId.toString()} tradeId={tradeId} currentUserAddress={address} filterState={filterState} filterRole={filterRole} />
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              All Trades
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Browse all P2P trades on Arc L1 Testnet
            </p>
          </div>
          <ConnectButton />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Trades
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {isLoadingCount ? '...' : totalTrades}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Open Trades
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {isLoadingCount ? '...' : '-'}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Active Trades
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {isLoadingCount ? '...' : '-'}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Completed
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {isLoadingCount ? '...' : '-'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* State Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Filter by State
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'open', 'active', 'completed', 'cancelled'].map((state) => (
                  <button
                    key={state}
                    onClick={() => setFilterState(state)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${filterState === state
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Filter */}
            {isConnected && (
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Filter by Role
                </label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'my-trades', 'seller', 'buyer'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setFilterRole(role)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${filterRole === role
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {role === 'my-trades' ? 'My Trades' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trades Grid */}
        {isLoadingCount ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600 dark:text-gray-400">Loading trades...</p>
          </div>
        ) : (
          <TradesList />
        )}

        {/* Create Trade CTA */}
        {totalTrades > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/create"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              + Create New Trade
            </Link>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
            💡 How It Works
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-300 list-decimal list-inside space-y-2">
            <li>Seller creates a trade by depositing USDC into escrow</li>
            <li>Buyer browses and accepts an open trade</li>
            <li>Buyer sends off-chain payment via specified method</li>
            <li>Buyer marks payment as sent on-chain</li>
            <li>Seller verifies payment and releases USDC to buyer</li>
            <li>Both parties earn reputation for completed trades</li>
          </ol>
        </div>
      </div>
    </main>
  );
}

/**
 * Wrapper component to fetch individual trade data
 */
function TradeCardWrapper({ 
  tradeId, 
  currentUserAddress, 
  filterState, 
  filterRole 
}: { 
  tradeId: bigint; 
  currentUserAddress?: string; 
  filterState: string; 
  filterRole: string;
}) {
  const { data: trade, isLoading } = useReadPairXEscrowGetTrade({
    chainId: 5042002,
    args: [tradeId],
  });

  if (isLoading) {
    return (
      <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!trade) return null;

  // Apply state filter
  const stateNames = ['OPEN', 'LOCKED', 'PAID', 'RELEASED', 'CANCELLED', 'DISPUTED'];
  const stateName = stateNames[Number(trade.state)].toLowerCase();
  
  if (filterState !== 'all') {
    if (filterState === 'active' && stateName !== 'locked' && stateName !== 'paid') {
      return null;
    }
    if (filterState === 'completed' && stateName !== 'released') {
      return null;
    }
    if (filterState !== 'active' && filterState !== 'completed' && stateName !== filterState) {
      return null;
    }
  }

  // Apply role filter
  if (filterRole !== 'all' && currentUserAddress) {
    const isSeller = currentUserAddress.toLowerCase() === trade.seller.toLowerCase();
    const isBuyer = currentUserAddress.toLowerCase() === trade.buyer.toLowerCase();
    
    if (filterRole === 'my-trades' && !isSeller && !isBuyer) {
      return null;
    }
    if (filterRole === 'seller' && !isSeller) {
      return null;
    }
    if (filterRole === 'buyer' && !isBuyer) {
      return null;
    }
  }

  return (
    <TradeCard
      tradeId={tradeId}
      trade={trade}
      currentUserAddress={currentUserAddress}
    />
  );
}
