'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { ReactNode, useState } from 'react';

import '@rainbow-me/rainbowkit/styles.css';

/**
 * Web3 Providers for PairX
 * 
 * Wraps the app with:
 * - WagmiProvider: Web3 hooks and chain configuration
 * - QueryClientProvider: React Query for data fetching
 * - RainbowKitProvider: Wallet connection UI
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
