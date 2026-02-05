'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useCreateTrade } from '@/hooks/usePairXContract';
import { useRouter } from 'next/navigation';
import { useReadPairXEscrowNextTradeId } from '@/lib/generated';

/**
 * CreateTradeForm Component
 * 
 * Complete form for creating a new P2P trade:
 * - Amount input with USDC validation
 * - Payment method text area
 * - Real-time balance checking
 * - Form validation with error messages
 * - Loading states during submission
 * - Success/error feedback
 * - Auto-redirect to trade room after creation
 * 
 * Task 3.5: Create Trade Flow (3.5.1, 3.5.2, 3.5.3)
 */
export function CreateTradeForm() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  // Fetch user's USDC balance (Arc L1 native token)
  const { data: balance } = useBalance({
    address,
    chainId: 5042002,
  });

  // Get next trade ID to redirect after creation
  const { data: nextTradeId } = useReadPairXEscrowNextTradeId({
    chainId: 5042002,
  });

  // Form state
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<{
    amount?: string;
    paymentMethod?: string;
    balance?: string;
  }>({});

  // Create trade hook
  const createTrade = useCreateTrade();

  // Real-time validation
  useEffect(() => {
    const newErrors: typeof errors = {};

    // Amount validation
    if (amount) {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum)) {
        newErrors.amount = 'Amount must be a valid number';
      } else if (amountNum <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      } else if (amountNum < 0.01) {
        newErrors.amount = 'Minimum amount is 0.01 USDC';
      } else if (balance && amountNum > parseFloat(formatEther(balance.value))) {
        newErrors.balance = `Insufficient balance. You have ${formatEther(balance.value)} USDC`;
      }
    }

    // Payment method validation
    if (paymentMethod && paymentMethod.trim().length < 10) {
      newErrors.paymentMethod = 'Payment method must be at least 10 characters';
    }

    setErrors(newErrors);
  }, [amount, paymentMethod, balance]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation
    const validationErrors: typeof errors = {};

    if (!amount || amount.trim() === '') {
      validationErrors.amount = 'Amount is required';
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum)) {
        validationErrors.amount = 'Amount must be a valid number';
      } else if (amountNum <= 0) {
        validationErrors.amount = 'Amount must be greater than 0';
      } else if (amountNum < 0.01) {
        validationErrors.amount = 'Minimum amount is 0.01 USDC';
      } else if (balance && amountNum > parseFloat(formatEther(balance.value))) {
        validationErrors.balance = `Insufficient balance. You have ${formatEther(balance.value)} USDC`;
      }
    }

    if (!paymentMethod || paymentMethod.trim() === '') {
      validationErrors.paymentMethod = 'Payment method is required';
    } else if (paymentMethod.trim().length < 10) {
      validationErrors.paymentMethod = 'Payment method must be at least 10 characters';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit trade
    try {
      await createTrade.createTrade(amount, paymentMethod.trim());
    } catch (error) {
      console.error('Error creating trade:', error);
    }
  };

  // Handle success - redirect to trade room
  useEffect(() => {
    if (createTrade.isSuccess && createTrade.hash && nextTradeId) {
      // The new trade will have ID = current nextTradeId
      const newTradeId = nextTradeId;
      
      // Show success message briefly, then redirect
      setTimeout(() => {
        router.push(`/trade/${newTradeId}`);
      }, 2000);
    }
  }, [createTrade.isSuccess, createTrade.hash, nextTradeId, router]);

  // Handle amount input with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Quick amount buttons
  const setQuickAmount = (value: string) => {
    setAmount(value);
  };

  // Use max balance
  const useMaxBalance = () => {
    if (balance) {
      const maxAmount = formatEther(balance.value);
      // Leave a small buffer for gas (0.01 USDC)
      const usableAmount = Math.max(0, parseFloat(maxAmount) - 0.01);
      setAmount(usableAmount.toFixed(6));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Input */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Amount (USDC) <span className="text-red-500">*</span>
        </label>
        
        <div className="relative">
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            className={`
              w-full px-4 py-3 text-lg border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
              dark:bg-gray-800 dark:text-gray-100
              ${errors.amount || errors.balance
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600'
              }
            `}
            disabled={createTrade.isLoading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
            USDC
          </div>
        </div>

        {/* Balance Display */}
        {isConnected && balance && (
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Balance: <span className="font-semibold">{formatEther(balance.value)} USDC</span>
            </span>
            <button
              type="button"
              onClick={useMaxBalance}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              disabled={createTrade.isLoading}
            >
              Use Max
            </button>
          </div>
        )}

        {/* Quick Amount Buttons */}
        <div className="flex gap-2 mt-3">
          {['10', '50', '100', '500'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setQuickAmount(value)}
              className="flex-1 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={createTrade.isLoading}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Amount Error */}
        {errors.amount && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            ⚠️ {errors.amount}
          </p>
        )}
        
        {/* Balance Error */}
        {errors.balance && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            ⚠️ {errors.balance}
          </p>
        )}

        {/* Helpful Info */}
        {!errors.amount && !errors.balance && amount && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            ℹ️ This amount will be locked in escrow until trade completes or is cancelled
          </p>
        )}
      </div>

      {/* Payment Method Input */}
      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Payment Method Details <span className="text-red-500">*</span>
        </label>
        
        <textarea
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          placeholder="Example:&#10;Bank Transfer&#10;Bank: Chase Bank&#10;Account Name: John Doe&#10;Account Number: ****1234&#10;Routing: 123456789&#10;&#10;Or any other off-chain payment method you accept..."
          rows={8}
          className={`
            w-full px-4 py-3 border-2 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            dark:bg-gray-800 dark:text-gray-100
            font-mono text-sm
            ${errors.paymentMethod
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
          disabled={createTrade.isLoading}
        />

        {/* Character Count */}
        <div className="flex items-center justify-between mt-2">
          <span className={`text-sm ${
            paymentMethod.length >= 10
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-500'
          }`}>
            {paymentMethod.length} characters {paymentMethod.length >= 10 ? '✓' : '(min 10)'}
          </span>
        </div>

        {/* Payment Method Error */}
        {errors.paymentMethod && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            ⚠️ {errors.paymentMethod}
          </p>
        )}

        {/* Helpful Info */}
        {!errors.paymentMethod && paymentMethod.length >= 10 && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            ✓ Payment method looks good! Be specific so buyers know how to pay you.
          </p>
        )}
      </div>

      {/* Important Notice */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
        <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          ⚠️ Important: Before Creating Trade
        </h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
          <li>Your USDC will be locked in escrow</li>
          <li>You can cancel and get refund if no buyer accepts</li>
          <li>Once a buyer accepts, you cannot cancel</li>
          <li>Only release USDC after confirming payment receipt</li>
          <li>Be specific in payment method details</li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          createTrade.isLoading ||
          !amount ||
          !paymentMethod ||
          Object.keys(errors).length > 0 ||
          !isConnected
        }
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-lg
          transition-all shadow-lg
          ${createTrade.isLoading || !isConnected || Object.keys(errors).length > 0
            ? 'bg-gray-400 cursor-not-allowed text-gray-700'
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'
          }
        `}
      >
        {createTrade.isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Creating Trade...
          </span>
        ) : !isConnected ? (
          'Connect Wallet to Create Trade'
        ) : (
          `Create Trade for ${amount || '0'} USDC`
        )}
      </button>

      {/* Transaction Feedback */}
      {createTrade.isSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✅</div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                Trade Created Successfully!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Your trade has been created and USDC locked in escrow. Redirecting to trade room...
              </p>
              {createTrade.hash && (
                <a
                  href={`https://testnet.arcscan.app/tx/${createTrade.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Transaction on Explorer →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {createTrade.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <div className="text-2xl">❌</div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                Transaction Failed
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                {createTrade.error.message || 'An error occurred while creating the trade'}
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
