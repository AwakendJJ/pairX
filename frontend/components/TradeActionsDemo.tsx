'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  useCreateTrade,
  useAcceptTrade,
  useMarkAsPaid,
  useReleaseFunds,
  useCancelTrade,
} from '@/hooks/usePairXContract';

/**
 * Demo component for testing contract hooks
 * 
 * Demonstrates all trade lifecycle actions:
 * - Create Trade
 * - Accept Trade
 * - Mark as Paid
 * - Release Funds
 * - Cancel Trade
 */
export function TradeActionsDemo() {
  const { isConnected } = useAccount();

  // Form states
  const [amount, setAmount] = useState('10');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer - Test Account');
  const [tradeId, setTradeId] = useState('1');

  // Contract hooks
  const createTrade = useCreateTrade();
  const acceptTrade = useAcceptTrade();
  const markAsPaid = useMarkAsPaid();
  const releaseFunds = useReleaseFunds();
  const cancelTrade = useCancelTrade();

  if (!isConnected) {
    return (
      <div className="p-6 border rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to test trade actions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Trade Section */}
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">1. Create Trade</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount (USDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="10"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Bank Transfer - Account: 123456"
            />
          </div>
          <button
            onClick={() => createTrade.createTrade(amount, paymentMethod)}
            disabled={createTrade.isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {createTrade.isLoading ? 'Creating Trade...' : 'Create Trade'}
          </button>
          
          {createTrade.isSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✅ Trade created! Tx: {createTrade.hash?.slice(0, 10)}...
              </p>
            </div>
          )}
          
          {createTrade.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-red-700 dark:text-red-300 text-sm">
                ❌ Error: {createTrade.error.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Accept Trade Section */}
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">2. Accept Trade</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Trade ID
            </label>
            <input
              type="number"
              value={tradeId}
              onChange={(e) => setTradeId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="1"
              min="1"
            />
          </div>
          <button
            onClick={() => acceptTrade.acceptTrade(parseInt(tradeId))}
            disabled={acceptTrade.isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {acceptTrade.isLoading ? 'Accepting...' : 'Accept Trade'}
          </button>
          
          {acceptTrade.isSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✅ Trade accepted! Tx: {acceptTrade.hash?.slice(0, 10)}...
              </p>
            </div>
          )}
          
          {acceptTrade.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-red-700 dark:text-red-300 text-sm">
                ❌ Error: {acceptTrade.error.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mark as Paid Section */}
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">3. Mark as Paid</h3>
        <div className="space-y-3">
          <button
            onClick={() => markAsPaid.markAsPaid(parseInt(tradeId))}
            disabled={markAsPaid.isLoading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {markAsPaid.isLoading ? 'Marking...' : 'Mark as Paid'}
          </button>
          
          {markAsPaid.isSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✅ Marked as paid! Tx: {markAsPaid.hash?.slice(0, 10)}...
              </p>
            </div>
          )}
          
          {markAsPaid.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-red-700 dark:text-red-300 text-sm">
                ❌ Error: {markAsPaid.error.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Release Funds Section */}
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">4. Release Funds</h3>
        <div className="space-y-3">
          <button
            onClick={() => releaseFunds.releaseFunds(parseInt(tradeId))}
            disabled={releaseFunds.isLoading}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {releaseFunds.isLoading ? 'Releasing...' : 'Release Funds'}
          </button>
          
          {releaseFunds.isSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✅ Funds released! Tx: {releaseFunds.hash?.slice(0, 10)}...
              </p>
            </div>
          )}
          
          {releaseFunds.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-red-700 dark:text-red-300 text-sm">
                ❌ Error: {releaseFunds.error.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Trade Section */}
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">5. Cancel Trade</h3>
        <div className="space-y-3">
          <button
            onClick={() => cancelTrade.cancelTrade(parseInt(tradeId))}
            disabled={cancelTrade.isLoading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {cancelTrade.isLoading ? 'Cancelling...' : 'Cancel Trade'}
          </button>
          
          {cancelTrade.isSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✅ Trade cancelled! Tx: {cancelTrade.hash?.slice(0, 10)}...
              </p>
            </div>
          )}
          
          {cancelTrade.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-red-700 dark:text-red-300 text-sm">
                ❌ Error: {cancelTrade.error.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-2">Testing Guide:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Create a trade with the specified amount</li>
          <li>Use the returned trade ID for subsequent actions</li>
          <li>Each action requires wallet confirmation</li>
          <li>Make sure you have USDC on Arc L1 Testnet</li>
          <li>View transactions on Arc Explorer</li>
        </ul>
      </div>
    </div>
  );
}
