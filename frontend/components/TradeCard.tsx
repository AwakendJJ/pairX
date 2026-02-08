'use client';

import Link from 'next/link';
import { formatEther } from 'viem';
import { useReadPairXEscrowGetReputation } from '@/lib/generated';
import { useEnsName } from 'wagmi';
import { mainnet } from 'viem/chains';

interface TradeCardProps {
  tradeId: bigint;
  trade: {
    seller: string;
    buyer: string;
    amount: bigint;
    state: number;
    paymentMethod: string;
    createdAt: bigint;
    paidAt: bigint;
  };
  currentUserAddress?: string;
}

/**
 * TradeCard Component
 * 
 * Displays a summary card for a trade in the listing view:
 * - Trade ID and status badge
 * - USDC amount
 * - Seller and buyer (shortened addresses)
 * - Payment method preview
 * - Time elapsed since creation
 * - User's role indicator
 * - Click to navigate to trade room
 * 
 * Task 3.4.2: Create trade card component
 */
export function TradeCard({ tradeId, trade, currentUserAddress }: TradeCardProps) {
  const stateNames = ['OPEN', 'LOCKED', 'PAID', 'RELEASED', 'CANCELLED', 'DISPUTED'];
  const stateName = stateNames[Number(trade.state)] || 'UNKNOWN';
  
  // Format amount
  const usdcAmount = formatEther(trade.amount);
  
  // Check user role
  const isSeller = currentUserAddress?.toLowerCase() === trade.seller.toLowerCase();
  const isBuyer = currentUserAddress?.toLowerCase() === trade.buyer.toLowerCase();
  const userRole = isSeller ? 'Seller' : isBuyer ? 'Buyer' : null;
  
  // Check if buyer is assigned
  const isBuyerAssigned = trade.buyer !== '0x0000000000000000000000000000000000000000';
  
  // Format addresses
  const formatAddress = (address: string) => {
    if (address === '0x0000000000000000000000000000000000000000') {
      return 'Not assigned';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Calculate elapsed time
  const getElapsedTime = (timestamp: bigint) => {
    if (timestamp === 0n) return 'Just now';
    const now = Date.now();
    const created = Number(timestamp) * 1000;
    const elapsed = now - created;
    
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };
  
  // State badge color
  const getStateBadgeColor = () => {
    switch (stateName) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'LOCKED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'PAID':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'RELEASED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'DISPUTED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  
  // Fetch seller reputation for display
  const { data: sellerReputation } = useReadPairXEscrowGetReputation({
    chainId: 5042002,
    args: [trade.seller as `0x${string}`],
  });

  // Fetch ENS names for seller and buyer (Phase 4 enhancement)
  const { data: sellerEnsName } = useEnsName({
    address: trade.seller as `0x${string}`,
    chainId: mainnet.id,
  });

  const { data: buyerEnsName } = useEnsName({
    address: trade.buyer as `0x${string}`,
    chainId: mainnet.id,
    query: {
      enabled: isBuyerAssigned,
    },
  });

  // Display name: ENS if available, otherwise shortened address
  const displaySellerName = sellerEnsName || formatAddress(trade.seller);
  const displayBuyerName = buyerEnsName || formatAddress(trade.buyer);

  return (
    <Link href={`/trade/${tradeId}`}>
      <div className={`
        p-6 border-2 rounded-lg transition-all cursor-pointer
        hover:border-blue-500 hover:shadow-lg
        ${userRole ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}
        ${stateName === 'RELEASED' || stateName === 'CANCELLED' ? 'opacity-75' : ''}
      `}>
        {/* Header: Trade ID, Status, Role */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Trade #{tradeId.toString()}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStateBadgeColor()}`}>
              {stateName}
            </span>
          </div>
          {userRole && (
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
              {userRole}
            </span>
          )}
        </div>

        {/* Amount Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {usdcAmount}
            </span>
            <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">
              USDC
            </span>
          </div>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-1">
              Seller
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100 truncate" title={sellerEnsName || trade.seller}>
              {displaySellerName}
            </div>
            {sellerReputation !== undefined && Number(sellerReputation) > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {Number(sellerReputation)} trades
                {Number(sellerReputation) >= 10 && <span className="ml-1">⭐</span>}
                {Number(sellerReputation) >= 50 && <span className="ml-0.5">⭐</span>}
                {Number(sellerReputation) >= 100 && <span className="ml-0.5">⭐</span>}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-1">
              Buyer
            </div>
            <div className={`text-sm truncate ${isBuyerAssigned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600 italic'}`} title={buyerEnsName || trade.buyer}>
              {displayBuyerName}
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-1">
            Payment Method
          </div>
          <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
            {trade.paymentMethod.length > 50 
              ? `${trade.paymentMethod.slice(0, 50)}...` 
              : trade.paymentMethod}
          </div>
        </div>

        {/* Footer: Time */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-4 border-t dark:border-gray-700">
          <span>Created {getElapsedTime(trade.createdAt)}</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
