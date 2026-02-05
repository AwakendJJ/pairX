import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'viem/chains';

/**
 * Arc L1 Testnet Chain Configuration
 * 
 * Arc L1 Specifications:
 * - Chain ID: 5042002 (Testnet)
 * - Native Gas Token: USDC (NOT ETH!)
 * - USDC has 18 decimals on Arc L1
 * - RPC: https://arc-testnet.drpc.org
 * - Explorer: https://testnet.arcscan.app
 */
export const arcL1Testnet = {
  id: 5042002,
  name: 'Arc L1 Testnet',
  network: 'arc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://arc-testnet.drpc.org'],
    },
    public: {
      http: ['https://arc-testnet.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arc Testnet Explorer',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
} as const satisfies Chain;

/**
 * Arc L1 Mainnet Chain Configuration (for future use)
 */
export const arcL1Mainnet = {
  id: 5042001,
  name: 'Arc L1',
  network: 'arc',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.arc.network'],
    },
    public: {
      http: ['https://rpc.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arc Explorer',
      url: 'https://arcscan.app',
    },
  },
  testnet: false,
} as const satisfies Chain;

/**
 * Wagmi Configuration for PairX
 * 
 * Configured for Arc L1 Testnet with:
 * - RainbowKit wallet connection
 * - Arc L1 custom chain
 * - Mainnet for ENS resolution (Phase 4)
 */
export const config = getDefaultConfig({
  appName: 'PairX - P2P DEX on Arc L1',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [arcL1Testnet],
  ssr: true, // Enable server-side rendering for Next.js
});
