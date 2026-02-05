/**
 * Custom hooks for PairXEscrow contract interactions
 * 
 * These hooks wrap the generated wagmi hooks with:
 * - Better error handling
 * - Transaction status tracking
 * - Loading states
 * - User-friendly return values
 */

import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import {
  useWritePairXEscrowCreateTrade,
  useWritePairXEscrowAcceptTrade,
  useWritePairXEscrowMarkAsPaid,
  useWritePairXEscrowRelease,
  useWritePairXEscrowCancel,
  useSimulatePairXEscrowCreateTrade,
  useSimulatePairXEscrowAcceptTrade,
  useSimulatePairXEscrowMarkAsPaid,
  useSimulatePairXEscrowRelease,
  useSimulatePairXEscrowCancel,
} from '@/lib/generated';

const ARC_L1_TESTNET_CHAIN_ID = 5042002;

/**
 * Hook to create a new trade
 * 
 * @param amount - Amount in USDC (as string, e.g., "10")
 * @param paymentMethod - Payment method description
 * @returns Object with createTrade function and transaction status
 */
export function useCreateTrade() {
  const { address } = useAccount();

  // Simulate transaction for gas estimation
  const { data: simulateData } = useSimulatePairXEscrowCreateTrade({
    chainId: ARC_L1_TESTNET_CHAIN_ID,
  });

  // Write contract function
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWritePairXEscrowCreateTrade();

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Create a new trade
   */
  const createTrade = async (amount: string, paymentMethod: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!paymentMethod || paymentMethod.trim().length === 0) {
      throw new Error('Payment method cannot be empty');
    }

    try {
      // Convert amount to wei (18 decimals for USDC on Arc L1)
      const amountInWei = parseEther(amount);

      // Execute transaction
      writeContract({
        chainId: ARC_L1_TESTNET_CHAIN_ID,
        args: [paymentMethod],
        value: amountInWei,
      });
    } catch (error) {
      console.error('Error creating trade:', error);
      throw error;
    }
  };

  return {
    createTrade,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    error: writeError || confirmError,
    hash,
  };
}

/**
 * Hook to accept an existing trade
 * 
 * @returns Object with acceptTrade function and transaction status
 */
export function useAcceptTrade() {
  const { address } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWritePairXEscrowAcceptTrade();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Accept a trade
   */
  const acceptTrade = async (tradeId: bigint | number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      const tradeIdBigInt = typeof tradeId === 'number' ? BigInt(tradeId) : tradeId;

      writeContract({
        chainId: ARC_L1_TESTNET_CHAIN_ID,
        args: [tradeIdBigInt],
      });
    } catch (error) {
      console.error('Error accepting trade:', error);
      throw error;
    }
  };

  return {
    acceptTrade,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    error: writeError || confirmError,
    hash,
  };
}

/**
 * Hook to mark trade as paid (buyer)
 * 
 * @returns Object with markAsPaid function and transaction status
 */
export function useMarkAsPaid() {
  const { address } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWritePairXEscrowMarkAsPaid();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Mark trade as paid
   */
  const markAsPaid = async (tradeId: bigint | number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      const tradeIdBigInt = typeof tradeId === 'number' ? BigInt(tradeId) : tradeId;

      writeContract({
        chainId: ARC_L1_TESTNET_CHAIN_ID,
        args: [tradeIdBigInt],
      });
    } catch (error) {
      console.error('Error marking as paid:', error);
      throw error;
    }
  };

  return {
    markAsPaid,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    error: writeError || confirmError,
    hash,
  };
}

/**
 * Hook to release funds to buyer (seller)
 * 
 * @returns Object with releaseFunds function and transaction status
 */
export function useReleaseFunds() {
  const { address } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWritePairXEscrowRelease();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Release funds to buyer
   */
  const releaseFunds = async (tradeId: bigint | number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      const tradeIdBigInt = typeof tradeId === 'number' ? BigInt(tradeId) : tradeId;

      writeContract({
        chainId: ARC_L1_TESTNET_CHAIN_ID,
        args: [tradeIdBigInt],
      });
    } catch (error) {
      console.error('Error releasing funds:', error);
      throw error;
    }
  };

  return {
    releaseFunds,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    error: writeError || confirmError,
    hash,
  };
}

/**
 * Hook to cancel a trade (seller only, OPEN state only)
 * 
 * @returns Object with cancelTrade function and transaction status
 */
export function useCancelTrade() {
  const { address } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWritePairXEscrowCancel();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Cancel a trade
   */
  const cancelTrade = async (tradeId: bigint | number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      const tradeIdBigInt = typeof tradeId === 'number' ? BigInt(tradeId) : tradeId;

      writeContract({
        chainId: ARC_L1_TESTNET_CHAIN_ID,
        args: [tradeIdBigInt],
      });
    } catch (error) {
      console.error('Error cancelling trade:', error);
      throw error;
    }
  };

  return {
    cancelTrade,
    isLoading: isWritePending || isConfirming,
    isSuccess,
    error: writeError || confirmError,
    hash,
  };
}
