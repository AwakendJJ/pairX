'use client';

import { useReadPairXEscrowGetReputation } from '@/lib/generated';
import { useEnsName, useEnsAvatar } from 'wagmi';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import Image from 'next/image';

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
  const isEmptyAddress = address === '0x0000000000000000000000000000000000000000';

  // Fetch reputation from contract (Task 4.3.1)
  const { data: reputation } = useReadPairXEscrowGetReputation({
    chainId: 5042002,
    args: [address as `0x${string}`],
    query: {
      enabled: !isEmptyAddress,
    },
  });

  // Fetch ENS name from mainnet (Task 4.2.1)
  const { data: ensName, isLoading: ensNameLoading } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: {
      enabled: !isEmptyAddress,
    },
  });

  // Fetch ENS avatar from mainnet (Task 4.2.2)
  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: mainnet.id,
    query: {
      enabled: !isEmptyAddress && !!ensName,
    },
  });

  // Display logic: ENS name if available, otherwise shortened address
  const displayName = ensName || (isEmptyAddress 
    ? 'Not assigned yet' 
    : `${address.slice(0, 6)}...${address.slice(-4)}`);

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

      {/* Address with ENS name and avatar */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          {/* ENS Avatar or fallback */}
          {ensAvatar && !ensAvatarLoading ? (
            <Image 
              src={ensAvatar} 
              alt={ensName || 'Avatar'} 
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold shadow-sm">
              {isEmptyAddress ? '?' : address.slice(2, 4).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {/* Primary display: ENS name or shortened address */}
            <div className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">
              {ensNameLoading ? (
                <span className="text-gray-400 dark:text-gray-600 italic text-sm">Resolving ENS...</span>
              ) : (
                displayName
              )}
            </div>
            
            {/* Secondary display: address if ENS exists, or ENS status */}
            {!isEmptyAddress && (
              <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                {ensName ? (
                  // Show address when ENS name is displayed
                  <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                ) : ensNameLoading ? (
                  <span className="italic">Loading ENS...</span>
                ) : (
                  <span className="italic">No ENS name</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reputation Display (Task 4.3.1 & 4.3.2) */}
      {!isEmptyAddress && (
        <div className="space-y-2">
          {/* Reputation count with color-coded badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Reputation:
            </span>
            <ReputationBadge reputation={reputation || 0n} />
          </div>
          
          {/* Reputation level indicator */}
          <ReputationLevelBar reputation={reputation || 0n} />
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

/**
 * ReputationBadge Component (Task 4.3.2)
 * 
 * Displays reputation count with color-coded badge based on level:
 * - New: 0-9 trades (gray)
 * - Trusted: 10-49 trades (yellow with 1 star)
 * - Veteran: 50-99 trades (orange with 2 stars)
 * - Elite: 100+ trades (purple with 3 stars)
 */
function ReputationBadge({ reputation }: { reputation: bigint }) {
  const count = Number(reputation);
  
  let badgeColor = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  let badgeLabel = 'New Trader';
  let stars = '';
  
  if (count >= 100) {
    badgeColor = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    badgeLabel = 'Elite';
    stars = '⭐⭐⭐';
  } else if (count >= 50) {
    badgeColor = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    badgeLabel = 'Veteran';
    stars = '⭐⭐';
  } else if (count >= 10) {
    badgeColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    badgeLabel = 'Trusted';
    stars = '⭐';
  }
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
      {stars && <span>{stars}</span>}
      <span>{count} trades</span>
      <span className="opacity-60">•</span>
      <span>{badgeLabel}</span>
    </div>
  );
}

/**
 * ReputationLevelBar Component (Task 4.3.2)
 * 
 * Visual progress bar showing reputation level progress
 */
function ReputationLevelBar({ reputation }: { reputation: bigint }) {
  const count = Number(reputation);
  
  // Determine current level and progress to next
  let currentLevel = 'New';
  let nextLevel = 'Trusted';
  let currentCount = count;
  let nextThreshold = 10;
  let progressPercent = Math.min((count / 10) * 100, 100);
  let barColor = 'bg-gray-400';
  
  if (count >= 100) {
    currentLevel = 'Elite';
    nextLevel = 'Elite';
    progressPercent = 100;
    barColor = 'bg-purple-600';
  } else if (count >= 50) {
    currentLevel = 'Veteran';
    nextLevel = 'Elite';
    currentCount = count - 50;
    nextThreshold = 100;
    progressPercent = ((count - 50) / 50) * 100;
    barColor = 'bg-orange-600';
  } else if (count >= 10) {
    currentLevel = 'Trusted';
    nextLevel = 'Veteran';
    currentCount = count - 10;
    nextThreshold = 50;
    progressPercent = ((count - 10) / 40) * 100;
    barColor = 'bg-yellow-600';
  }
  
  return (
    <div className="space-y-1">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Progress text */}
      {count < 100 && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
          <span>{currentLevel}</span>
          <span className="text-gray-400 dark:text-gray-600">
            {currentCount} / {nextThreshold} to {nextLevel}
          </span>
        </div>
      )}
      {count >= 100 && (
        <div className="text-xs text-center text-purple-600 dark:text-purple-400 font-semibold">
          🏆 Maximum Level Reached!
        </div>
      )}
    </div>
  );
}
