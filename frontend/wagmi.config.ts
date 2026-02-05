import { defineConfig } from '@wagmi/cli';
import { react } from '@wagmi/cli/plugins';

/**
 * Wagmi CLI Configuration
 * 
 * Generates TypeScript types and React hooks from contract ABIs
 * 
 * Usage: npx wagmi generate
 */
export default defineConfig({
  out: 'lib/generated.ts',
  contracts: [
    {
      name: 'PairXEscrow',
      address: {
        5042002: '0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7', // Arc L1 Testnet
      },
      abi: require('./contracts/PairXEscrow.json').abi,
    },
  ],
  plugins: [
    react({
      useContractRead: true,
      useContractWrite: true,
      useContractEvent: true,
      usePrepareContractWrite: false, // Deprecated in wagmi v2+
    }),
  ],
});
