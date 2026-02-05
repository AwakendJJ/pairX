'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  useAcceptTrade,
  useMarkAsPaid,
  useReleaseFunds,
  useCancelTrade,
} from '@/hooks/usePairXContract';

interface ActionPanelProps {
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
  userRole: 'Seller' | 'Buyer' | 'Viewer';
  onSuccess?: () => void;
}

/**
 * ActionPanel Component
 * 
 * State-dependent action buttons for trade lifecycle
 * Shows appropriate actions based on:
 * - Current trade state
 * - User role (Seller/Buyer/Viewer)
 * - Transaction permissions
 * 
 * Task 3.3.4: Implement Action Panel (state-dependent)
 */
export function ActionPanel({ trade, tradeId, userRole, onSuccess }: ActionPanelProps) {
  const { address } = useAccount();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'release' | 'cancel' | null>(null);

  // Contract hooks
  const acceptTrade = useAcceptTrade();
  const markAsPaid = useMarkAsPaid();
  const releaseFunds = useReleaseFunds();
  const cancelTrade = useCancelTrade();

  const stateNames = ['OPEN', 'LOCKED', 'PAID', 'RELEASED', 'CANCELLED', 'DISPUTED'];
  const stateName = stateNames[Number(trade.state)] || 'UNKNOWN';
  const isSeller = address?.toLowerCase() === trade.seller.toLowerCase();
  const isBuyer = address?.toLowerCase() === trade.buyer.toLowerCase();

  // Handle success callbacks
  const handleSuccess = () => {
    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 2000); // Delay to allow blockchain to update
    }
  };

  // Monitor transaction success
  if (acceptTrade.isSuccess || markAsPaid.isSuccess || releaseFunds.isSuccess || cancelTrade.isSuccess) {
    if (onSuccess) {
      handleSuccess();
    }
  }

  // Execute actions with confirmation
  const executeWithConfirmation = async (action: 'release' | 'cancel') => {
    setShowConfirmModal(true);
    setConfirmAction(action);
  };

  const confirmExecution = async () => {
    if (confirmAction === 'release') {
      await releaseFunds.releaseFunds(Number(tradeId));
    } else if (confirmAction === 'cancel') {
      await cancelTrade.cancelTrade(Number(tradeId));
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  // Render based on state and user role
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
      <h2 className="text-xl font-semibold mb-4">Actions</h2>

      {/* User Role Indicator */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded">
        <div className="text-sm text-gray-600 dark:text-gray-400">Your Role:</div>
        <div className="font-semibold text-gray-900 dark:text-gray-100">{userRole}</div>
      </div>

      {/* Viewer (not participant) */}
      {userRole === 'Viewer' && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            👁️ You are viewing this trade
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Only the seller and buyer can perform actions
          </p>
        </div>
      )}

      {/* OPEN State - Buyer can accept, Seller can cancel */}
      {stateName === 'OPEN' && (
        <div className="space-y-3">
          {isBuyer || userRole === 'Viewer' ? (
            <>
              <button
                onClick={() => acceptTrade.acceptTrade(Number(tradeId))}
                disabled={acceptTrade.isLoading || userRole === 'Viewer'}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {acceptTrade.isLoading ? '⏳ Accepting Trade...' : '✅ Accept Trade'}
              </button>
              
              {acceptTrade.isSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 text-sm font-semibold">
                    ✅ Trade Accepted!
                  </p>
                  <a
                    href={`https://testnet.arcscan.app/tx/${acceptTrade.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 underline"
                  >
                    View Transaction
                  </a>
                </div>
              )}
              
              {acceptTrade.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    ❌ {acceptTrade.error.message}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                By accepting, you commit to sending the payment via the specified method
              </p>
            </>
          ) : null}

          {isSeller && (
            <>
              <button
                onClick={() => executeWithConfirmation('cancel')}
                disabled={cancelTrade.isLoading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {cancelTrade.isLoading ? '⏳ Cancelling...' : '❌ Cancel Trade'}
              </button>

              {cancelTrade.isSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 text-sm font-semibold">
                    ✅ Trade Cancelled & Refunded!
                  </p>
                  <a
                    href={`https://testnet.arcscan.app/tx/${cancelTrade.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 underline"
                  >
                    View Transaction
                  </a>
                </div>
              )}

              {cancelTrade.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    ❌ {cancelTrade.error.message}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                Cancel and receive full refund
              </p>
            </>
          )}
        </div>
      )}

      {/* LOCKED State - Buyer can mark as paid */}
      {stateName === 'LOCKED' && (
        <div className="space-y-3">
          {isBuyer ? (
            <>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                  ⚠️ Important Instructions
                </p>
                <ol className="text-xs text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1">
                  <li>Send payment using the specified method</li>
                  <li>Keep proof of payment</li>
                  <li>Click "Mark as Paid" only after completing payment</li>
                </ol>
              </div>

              <button
                onClick={() => markAsPaid.markAsPaid(Number(tradeId))}
                disabled={markAsPaid.isLoading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {markAsPaid.isLoading ? '⏳ Confirming...' : '💳 Mark as Paid'}
              </button>

              {markAsPaid.isSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 text-sm font-semibold">
                    ✅ Payment Marked!
                  </p>
                  <a
                    href={`https://testnet.arcscan.app/tx/${markAsPaid.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 underline"
                  >
                    View Transaction
                  </a>
                </div>
              )}

              {markAsPaid.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    ❌ {markAsPaid.error.message}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🔒 Waiting for buyer to send payment
              </p>
            </div>
          )}
        </div>
      )}

      {/* PAID State - Seller can release */}
      {stateName === 'PAID' && (
        <div className="space-y-3">
          {isSeller ? (
            <>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-4">
                <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold mb-2">
                  ⚠️ Verify Payment Before Release
                </p>
                <ul className="text-xs text-orange-700 dark:text-orange-300 list-disc list-inside space-y-1">
                  <li>Check your payment account</li>
                  <li>Confirm you received the full amount</li>
                  <li>Verify sender matches buyer details</li>
                  <li>Only release after payment confirmed</li>
                </ul>
              </div>

              <button
                onClick={() => executeWithConfirmation('release')}
                disabled={releaseFunds.isLoading}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {releaseFunds.isLoading ? '⏳ Releasing...' : '💰 Release Funds'}
              </button>

              {releaseFunds.isSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 text-sm font-semibold">
                    ✅ Funds Released!
                  </p>
                  <a
                    href={`https://testnet.arcscan.app/tx/${releaseFunds.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 underline"
                  >
                    View Transaction
                  </a>
                </div>
              )}

              {releaseFunds.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    ❌ {releaseFunds.error.message}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                This will transfer USDC to the buyer
              </p>
            </>
          ) : (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                💳 Payment sent. Waiting for seller to verify and release
              </p>
            </div>
          )}
        </div>
      )}

      {/* RELEASED State - Completed */}
      {stateName === 'RELEASED' && (
        <div className="space-y-3">
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-green-800 dark:text-green-200 font-bold text-lg mb-2">
              Trade Completed!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              USDC successfully transferred to buyer
            </p>
          </div>
          
          {(isSeller || isBuyer) && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Your reputation has been updated! 🎉</p>
              <p className="text-xs mt-1">+1 completed trade</p>
            </div>
          )}
        </div>
      )}

      {/* CANCELLED State */}
      {stateName === 'CANCELLED' && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
          <div className="text-4xl mb-3">❌</div>
          <p className="text-red-800 dark:text-red-200 font-bold text-lg mb-2">
            Trade Cancelled
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            USDC was refunded to seller
          </p>
        </div>
      )}

      {/* DISPUTED State */}
      {stateName === 'DISPUTED' && (
        <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-orange-800 dark:text-orange-200 font-bold text-lg mb-2">
            Under Dispute
          </p>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Awaiting admin resolution
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">
              {confirmAction === 'release' ? 'Confirm Release' : 'Confirm Cancellation'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {confirmAction === 'release' 
                ? 'Are you sure you want to release the funds? This action cannot be undone. Only release after confirming payment receipt.'
                : 'Are you sure you want to cancel this trade? The USDC will be refunded to you.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmExecution}
                className={`flex-1 py-2 px-4 rounded-lg text-white font-semibold ${
                  confirmAction === 'release'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200 font-semibold mb-2">
          💡 Trade Flow:
        </p>
        <ol className="text-xs text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
          <li>Buyer accepts trade (LOCKED)</li>
          <li>Buyer sends off-chain payment</li>
          <li>Buyer marks as paid (PAID)</li>
          <li>Seller verifies payment</li>
          <li>Seller releases USDC (RELEASED)</li>
        </ol>
      </div>
    </div>
  );
}
