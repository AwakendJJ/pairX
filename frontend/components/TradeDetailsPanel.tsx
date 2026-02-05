'use client';

import { formatEther } from 'viem';

interface TradeDetailsPanelProps {
  trade: {
    seller: string;
    buyer: string;
    amount: bigint;
    state: number;
    paymentMethod: string;
    createdAt: bigint;
    paidAt: bigint;
  };
  tradeId: bigint;
}

/**
 * TradeDetailsPanel Component
 * 
 * Displays comprehensive trade information:
 * - USDC amount with formatting
 * - Payment method details
 * - Timestamps (created, paid)
 * - Trade state information
 * 
 * Task 3.3.3: Build Trade Details Panel
 */
export function TradeDetailsPanel({ trade, tradeId }: TradeDetailsPanelProps) {
  // Format USDC amount (18 decimals on Arc L1)
  const usdcAmount = formatEther(trade.amount);
  
  // Format timestamps
  const formatTimestamp = (timestamp: bigint) => {
    if (timestamp === 0n) return 'Not yet';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Calculate elapsed time
  const getElapsedTime = (timestamp: bigint) => {
    if (timestamp === 0n) return null;
    const now = Date.now();
    const created = Number(timestamp) * 1000;
    const elapsed = now - created;
    
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const isBuyerAssigned = trade.buyer !== '0x0000000000000000000000000000000000000000';
  const stateNames = ['OPEN', 'LOCKED', 'PAID', 'RELEASED', 'CANCELLED', 'DISPUTED'];
  const stateName = stateNames[Number(trade.state)] || 'UNKNOWN';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Trade Details</h2>

      <div className="space-y-6">
        {/* Amount Section */}
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
            Amount
          </label>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {usdcAmount}
            </span>
            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
              USDC
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            Arc L1 Native Token (18 decimals)
          </div>
        </div>

        <div className="border-t dark:border-gray-700"></div>

        {/* Payment Method */}
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
            Payment Method
          </label>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-900 dark:text-gray-100">
              {trade.paymentMethod}
            </p>
          </div>
          {!isBuyerAssigned && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 italic">
              Payment details will be visible after buyer accepts the trade
            </p>
          )}
        </div>

        <div className="border-t dark:border-gray-700"></div>

        {/* Timestamps */}
        <div className="space-y-4">
          {/* Created At */}
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
              Trade Created
            </label>
            <div className="text-gray-900 dark:text-gray-100">
              {formatTimestamp(trade.createdAt)}
            </div>
            {trade.createdAt !== 0n && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {getElapsedTime(trade.createdAt)}
              </div>
            )}
          </div>

          {/* Paid At */}
          {trade.paidAt !== 0n && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Payment Marked
              </label>
              <div className="text-gray-900 dark:text-gray-100">
                {formatTimestamp(trade.paidAt)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {getElapsedTime(trade.paidAt)}
              </div>
            </div>
          )}
        </div>

        <div className="border-t dark:border-gray-700"></div>

        {/* Trade State Info */}
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
            Current State
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`
                w-3 h-3 rounded-full
                ${stateName === 'OPEN' ? 'bg-blue-500' : ''}
                ${stateName === 'LOCKED' ? 'bg-yellow-500' : ''}
                ${stateName === 'PAID' ? 'bg-purple-500' : ''}
                ${stateName === 'RELEASED' ? 'bg-green-500' : ''}
                ${stateName === 'CANCELLED' ? 'bg-red-500' : ''}
                ${stateName === 'DISPUTED' ? 'bg-orange-500' : ''}
              `}></div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {stateName}
              </span>
            </div>
            
            {/* State-specific information */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stateName === 'OPEN' && (
                <p>💼 Waiting for a buyer to accept this trade</p>
              )}
              {stateName === 'LOCKED' && (
                <p>🔒 Buyer accepted. Waiting for off-chain payment confirmation</p>
              )}
              {stateName === 'PAID' && (
                <p>💳 Buyer marked as paid. Seller should verify and release funds</p>
              )}
              {stateName === 'RELEASED' && (
                <p>✅ Trade completed successfully! USDC transferred to buyer</p>
              )}
              {stateName === 'CANCELLED' && (
                <p>❌ Trade was cancelled. USDC refunded to seller</p>
              )}
              {stateName === 'DISPUTED' && (
                <p>⚠️ Trade is under dispute. Awaiting resolution</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t dark:border-gray-700"></div>

        {/* Contract Details */}
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
            Contract Details
          </label>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Trade ID:</span>{' '}
              <span className="font-mono text-gray-900 dark:text-gray-100">
                #{tradeId.toString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Network:</span>{' '}
              <span className="text-gray-900 dark:text-gray-100">
                Arc L1 Testnet
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Chain ID:</span>{' '}
              <span className="font-mono text-gray-900 dark:text-gray-100">
                5042002
              </span>
            </div>
          </div>
        </div>

        {/* View on Explorer */}
        <a
          href={`https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
        >
          View Contract on Explorer →
        </a>
      </div>
    </div>
  );
}
