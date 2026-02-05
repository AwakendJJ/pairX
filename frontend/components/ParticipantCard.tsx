'use client';

import { useReadPairXEscrowGetReputation } from '@/lib/generated';

interface ParticipantCardProps {
  role: 'seller' | 'buyer';
  address: string;
  isCurrentUser: boolean;
  reputation: bigint;
}

/**
 * ParticipantCard Component
 * 
 * Displays participant information in trade room:
 * - Role (Seller/Buyer)
 * - Address (shortened with ENS placeholder)
 * - Reputation (completed trades)
 * - Current user indicator
 */
export function ParticipantCard({ 
  role, 
  address, 
  isCurrentUser,
}: ParticipantCardProps) {
  // Fetch reputation from contract
  const { data: reputation } = useReadPairXEscrowGetReputation({
    chainId: 5042002,
    args: [address as `0x${string}`],
    query: {
      enabled: address !== '0x0000000000000000000000000000000000000000',
    },
  });

  const isEmptyAddress = address === '0x0000000000000000000000000000000000000000';
  const displayAddress = isEmptyAddress 
    ? 'Not assigned yet' 
    : `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Role styling
  const roleColor = role === 'seller' 
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';

  return (
    <div className={`
      p-6 border-2 rounded-lg transition-all
      ${isCurrentUser ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
      ${isEmptyAddress ? 'opacity-60' : ''}
    `}>
      {/* Role Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${roleColor}`}>
          {role}
        </span>
        {isCurrentUser && (
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            ✓ You
          </span>
        )}
      </div>

      {/* Address with ENS placeholder */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {/* Avatar placeholder - will be replaced with ENS avatar in Phase 4 */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold">
            {isEmptyAddress ? '?' : address.slice(2, 4).toUpperCase()}
          </div>
          <div className="flex-1">
            {/* ENS name placeholder - will be resolved in Phase 4 */}
            <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
              {displayAddress}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {/* ENS name will appear here */}
              {!isEmptyAddress && <span className="italic">ENS: Loading...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Reputation */}
      {!isEmptyAddress && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Reputation:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {reputation?.toString() || '0'} trades
          </span>
          {(reputation || 0n) >= 10n && (
            <span className="text-yellow-500" title="Trusted trader">⭐</span>
          )}
          {(reputation || 0n) >= 50n && (
            <span className="text-yellow-500" title="Veteran trader">⭐⭐</span>
          )}
        </div>
      )}

      {/* Connection Status */}
      {isEmptyAddress && role === 'buyer' && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-500 italic">
          Waiting for buyer to accept trade...
        </div>
      )}
    </div>
  );
}
