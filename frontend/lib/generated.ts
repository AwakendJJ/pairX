import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PairXEscrow
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const pairXEscrowAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tradeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DisputeResolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tradeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'triggeredBy',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DisputeTriggered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tradeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TradeAccepted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tradeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TradeCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tradeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'paymentMethod',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TradeCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tradeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TradePaid',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tradeId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TradeReleased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'function',
    inputs: [],
    name: 'TIMEOUT_DURATION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'USDC_SYSTEM_CONTRACT',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tradeId', internalType: 'uint256', type: 'uint256' }],
    name: 'acceptTrade',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tradeId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tradeId', internalType: 'uint256', type: 'uint256' }],
    name: 'checkTimeout',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'completedTrades',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'paymentMethod', internalType: 'string', type: 'string' }],
    name: 'createTrade',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tradeId', internalType: 'uint256', type: 'uint256' }],
    name: 'disputeTimeout',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getContractBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getReputation',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tradeId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTrade',
    outputs: [
      {
        name: '',
        internalType: 'struct PairXEscrow.Trade',
        type: 'tuple',
        components: [
          { name: 'tradeId', internalType: 'uint256', type: 'uint256' },
          { name: 'seller', internalType: 'address', type: 'address' },
          { name: 'buyer', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          {
            name: 'state',
            internalType: 'enum PairXEscrow.TradeState',
            type: 'uint8',
          },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'lockedAt', internalType: 'uint256', type: 'uint256' },
          { name: 'paidAt', internalType: 'uint256', type: 'uint256' },
          { name: 'paymentMethod', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTradeCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tradeId', internalType: 'uint256', type: 'uint256' }],
    name: 'markAsPaid',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextTradeId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tradeId', internalType: 'uint256', type: 'uint256' }],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tradeId', internalType: 'uint256', type: 'uint256' },
      { name: 'releaseToSeller', internalType: 'bool', type: 'bool' },
    ],
    name: 'resolveDispute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'trades',
    outputs: [
      { name: 'tradeId', internalType: 'uint256', type: 'uint256' },
      { name: 'seller', internalType: 'address', type: 'address' },
      { name: 'buyer', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      {
        name: 'state',
        internalType: 'enum PairXEscrow.TradeState',
        type: 'uint8',
      },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'lockedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'paidAt', internalType: 'uint256', type: 'uint256' },
      { name: 'paymentMethod', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const pairXEscrowAddress = {
  5042002: '0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7',
} as const

/**
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const pairXEscrowConfig = {
  address: pairXEscrowAddress,
  abi: pairXEscrowAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrow = /*#__PURE__*/ createUseReadContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"TIMEOUT_DURATION"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowTimeoutDuration =
  /*#__PURE__*/ createUseReadContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'TIMEOUT_DURATION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"USDC_SYSTEM_CONTRACT"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowUsdcSystemContract =
  /*#__PURE__*/ createUseReadContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'USDC_SYSTEM_CONTRACT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"VERSION"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowVersion = /*#__PURE__*/ createUseReadContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
  functionName: 'VERSION',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"checkTimeout"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowCheckTimeout =
  /*#__PURE__*/ createUseReadContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'checkTimeout',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"completedTrades"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowCompletedTrades =
  /*#__PURE__*/ createUseReadContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'completedTrades',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"getContractBalance"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowGetContractBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'getContractBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"getReputation"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowGetReputation =
  /*#__PURE__*/ createUseReadContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'getReputation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"getTrade"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowGetTrade = /*#__PURE__*/ createUseReadContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
  functionName: 'getTrade',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"getTradeCount"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowGetTradeCount =
  /*#__PURE__*/ createUseReadContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'getTradeCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"nextTradeId"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowNextTradeId =
  /*#__PURE__*/ createUseReadContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'nextTradeId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowOwner = /*#__PURE__*/ createUseReadContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"paused"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowPaused = /*#__PURE__*/ createUseReadContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"trades"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useReadPairXEscrowTrades = /*#__PURE__*/ createUseReadContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
  functionName: 'trades',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrow = /*#__PURE__*/ createUseWriteContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"acceptTrade"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowAcceptTrade =
  /*#__PURE__*/ createUseWriteContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'acceptTrade',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"cancel"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowCancel = /*#__PURE__*/ createUseWriteContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
  functionName: 'cancel',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"createTrade"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowCreateTrade =
  /*#__PURE__*/ createUseWriteContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'createTrade',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"disputeTimeout"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowDisputeTimeout =
  /*#__PURE__*/ createUseWriteContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'disputeTimeout',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"markAsPaid"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowMarkAsPaid =
  /*#__PURE__*/ createUseWriteContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'markAsPaid',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"pause"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowPause = /*#__PURE__*/ createUseWriteContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"release"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowRelease = /*#__PURE__*/ createUseWriteContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
  functionName: 'release',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"resolveDispute"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowResolveDispute =
  /*#__PURE__*/ createUseWriteContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'resolveDispute',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"unpause"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWritePairXEscrowUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrow = /*#__PURE__*/ createUseSimulateContract({
  abi: pairXEscrowAbi,
  address: pairXEscrowAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"acceptTrade"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowAcceptTrade =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'acceptTrade',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"cancel"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowCancel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'cancel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"createTrade"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowCreateTrade =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'createTrade',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"disputeTimeout"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowDisputeTimeout =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'disputeTimeout',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"markAsPaid"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowMarkAsPaid =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'markAsPaid',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"pause"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"release"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowRelease =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'release',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"resolveDispute"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowResolveDispute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'resolveDispute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pairXEscrowAbi}__ and `functionName` set to `"unpause"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useSimulatePairXEscrowUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__ and `eventName` set to `"DisputeResolved"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowDisputeResolvedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    eventName: 'DisputeResolved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__ and `eventName` set to `"DisputeTriggered"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowDisputeTriggeredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    eventName: 'DisputeTriggered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__ and `eventName` set to `"Paused"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__ and `eventName` set to `"TradeAccepted"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowTradeAcceptedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    eventName: 'TradeAccepted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__ and `eventName` set to `"TradeCancelled"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowTradeCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    eventName: 'TradeCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__ and `eventName` set to `"TradeCreated"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowTradeCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    eventName: 'TradeCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__ and `eventName` set to `"TradePaid"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowTradePaidEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    eventName: 'TradePaid',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__ and `eventName` set to `"TradeReleased"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowTradeReleasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    eventName: 'TradeReleased',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pairXEscrowAbi}__ and `eventName` set to `"Unpaused"`
 *
 * [__View Contract on Arc Testnet Arc Scan__](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)
 */
export const useWatchPairXEscrowUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pairXEscrowAbi,
    address: pairXEscrowAddress,
    eventName: 'Unpaused',
  })
