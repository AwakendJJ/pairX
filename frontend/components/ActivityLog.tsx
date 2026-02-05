'use client';

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { pairXEscrowAbi } from '@/lib/generated';

interface ActivityLogProps {
  tradeId: bigint;
}

interface TradeEvent {
  name: string;
  timestamp: number;
  txHash: string;
  blockNumber: bigint;
  icon: string;
  color: string;
  description: string;
}

/**
 * ActivityLog Component
 * 
 * Displays timeline of trade events:
 * - Trade created
 * - Trade accepted
 * - Payment marked
 * - Funds released
 * - Trade cancelled
 * - Disputes
 * 
 * Shows transaction hashes as links to explorer
 * 
 * Task 3.3.5: Build Activity Log
 */
export function ActivityLog({ tradeId }: ActivityLogProps) {
  const [events, setEvents] = useState<TradeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient({ chainId: 5042002 });

  useEffect(() => {
    const fetchEvents = async () => {
      if (!publicClient) return;

      try {
        setIsLoading(true);
        const contractAddress = '0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7';

        // Fetch all relevant events for this trade
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - 10000n; // Look back ~10k blocks

        // Define event signatures we want to track
        const eventNames = [
          'TradeCreated',
          'TradeAccepted',
          'TradePaid',
          'TradeReleased',
          'TradeCancelled',
          'DisputeTriggered',
          'DisputeResolved',
        ];

        const allEvents: TradeEvent[] = [];

        // Fetch logs for all event types
        const logs = await publicClient.getLogs({
          address: contractAddress as `0x${string}`,
          fromBlock,
          toBlock: 'latest',
        });

        // Parse and filter logs for this specific trade
        for (const log of logs) {
          try {
            const topics = log.topics;
            const data = log.data;

            // Simple event parsing based on indexed tradeId (first topic after event signature)
            const eventTradeId = topics[1] ? BigInt(topics[1]) : 0n;
            
            if (eventTradeId !== tradeId) continue;

            // Get block for timestamp
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });

            // Determine event type from topics[0] (event signature)
            let eventInfo = getEventInfo(topics[0]);

            if (eventInfo) {
              allEvents.push({
                name: eventInfo.name,
                timestamp: Number(block.timestamp),
                txHash: log.transactionHash || '',
                blockNumber: log.blockNumber,
                icon: eventInfo.icon,
                color: eventInfo.color,
                description: eventInfo.description,
              });
            }
          } catch (error) {
            console.error('Error parsing log:', error);
          }
        }

        // Sort by timestamp (newest first)
        allEvents.sort((a, b) => b.timestamp - a.timestamp);
        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [tradeId, publicClient]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Activity Log</h2>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            No activity yet for this trade
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex gap-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  ${event.color}
                `}>
                  {event.icon}
                </div>
                {index < events.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                )}
              </div>

              {/* Event details */}
              <div className="flex-1 pb-6">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {event.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {event.description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {new Date(event.timestamp * 1000).toLocaleString()}
                </div>
                <a
                  href={`https://testnet.arcscan.app/tx/${event.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                >
                  Tx: {event.txHash.slice(0, 10)}...{event.txHash.slice(-8)} →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to identify event type from signature hash
 */
function getEventInfo(eventSignature: string) {
  const events: Record<string, { name: string; icon: string; color: string; description: string }> = {
    // TradeCreated(uint256 indexed tradeId, address indexed seller, uint256 amount, string paymentMethod)
    '0x0e8a4d97b15e4e18': {
      name: 'Trade Created',
      icon: '📝',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      description: 'Seller created trade and deposited USDC into escrow',
    },
    // TradeAccepted(uint256 indexed tradeId, address indexed buyer)
    '0x1c4f8e9f8c2e7b3a': {
      name: 'Trade Accepted',
      icon: '🤝',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      description: 'Buyer accepted the trade',
    },
    // TradePaid(uint256 indexed tradeId, uint256 paidAt)
    '0x7f8b4e2d1a9c5f3e': {
      name: 'Payment Marked',
      icon: '💳',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      description: 'Buyer marked payment as sent',
    },
    // TradeReleased(uint256 indexed tradeId)
    '0x9d5c4f8e2b7a1c3d': {
      name: 'Funds Released',
      icon: '💰',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      description: 'Seller released USDC to buyer - Trade completed',
    },
    // TradeCancelled(uint256 indexed tradeId, address indexed seller)
    '0x5e8d3f2c1b9a7e4f': {
      name: 'Trade Cancelled',
      icon: '❌',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      description: 'Seller cancelled trade and received refund',
    },
    // DisputeTriggered(uint256 indexed tradeId, address indexed triggeredBy, uint256 timestamp)
    '0x4d9e2f7c8b5a3e1d': {
      name: 'Dispute Triggered',
      icon: '⚠️',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      description: 'Trade dispute was triggered',
    },
    // DisputeResolved(uint256 indexed tradeId, address indexed winner, uint256 amount, uint256 timestamp)
    '0x3c8f1e9d7a5b2e4f': {
      name: 'Dispute Resolved',
      icon: '✅',
      color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      description: 'Admin resolved the dispute',
    },
  };

  // Match by partial signature (first 18 chars is often enough)
  const sigPrefix = eventSignature.slice(0, 18);
  
  // Return first match or null
  for (const [key, value] of Object.entries(events)) {
    if (key === sigPrefix) {
      return value;
    }
  }

  // Default for unknown events
  if (eventSignature.startsWith('0x')) {
    return {
      name: 'Unknown Event',
      icon: '📋',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      description: 'Event occurred',
    };
  }

  return null;
}
