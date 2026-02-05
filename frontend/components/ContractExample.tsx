'use client';

import { useAccount } from 'wagmi';
import { 
  useReadPairXEscrowGetReputation,
  useReadPairXEscrowVersion,
  useReadPairXEscrowNextTradeId,
  useReadPairXEscrowTimeoutDuration,
} from '@/lib/generated';

/**
 * Example Component showing generated contract hooks usage
 * 
 * Demonstrates:
 * - Type-safe contract reads
 * - Automatic type inference
 * - Loading and error states
 */
export function ContractExample() {
  const { address } = useAccount();

  // Read contract version with full type safety
  const { data: version, isLoading: versionLoading } = useReadPairXEscrowVersion({
    chainId: 5042002, // Arc L1 Testnet
  });

  // Read next trade ID
  const { data: nextTradeId } = useReadPairXEscrowNextTradeId({
    chainId: 5042002,
  });

  // Read timeout duration
  const { data: timeoutDuration } = useReadPairXEscrowTimeoutDuration({
    chainId: 5042002,
  });

  // Read user reputation (only if wallet connected)
  const { data: reputation } = useReadPairXEscrowGetReputation({
    chainId: 5042002,
    args: address ? [address] : undefined,
    query: {
      enabled: !!address, // Only run query if address exists
    },
  });

  if (versionLoading) {
    return <div className="p-4">Loading contract data...</div>;
  }

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Version:</span>{' '}
          <span className="text-gray-600 dark:text-gray-400">{version || 'Loading...'}</span>
        </div>
        
        <div>
          <span className="font-medium">Next Trade ID:</span>{' '}
          <span className="text-gray-600 dark:text-gray-400">{nextTradeId?.toString() || 'Loading...'}</span>
        </div>
        
        <div>
          <span className="font-medium">Timeout Duration:</span>{' '}
          <span className="text-gray-600 dark:text-gray-400">
            {timeoutDuration ? `${Number(timeoutDuration) / 3600} hours` : 'Loading...'}
          </span>
        </div>

        {address && (
          <div>
            <span className="font-medium">Your Reputation:</span>{' '}
            <span className="text-gray-600 dark:text-gray-400">
              {reputation?.toString() || '0'} completed trades
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
        <p>✅ All data fetched with type-safe hooks from generated.ts</p>
        <p>✅ TypeScript autocomplete working for all contract functions</p>
      </div>
    </div>
  );
}
