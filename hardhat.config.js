import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/**
 * PairX Hardhat Configuration for Arc L1
 * 
 * Arc L1 Specifications:
 * - Chain ID: 5042002 (Testnet)
 * - Native Gas Token: USDC (NOT ETH)
 * - USDC System Contract: 0x3600000000000000000000000000000000000000
 * - Decimals: 18 (native USDC uses 18 decimals on Arc)
 * - msg.value represents USDC, not ETH
 */

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Arc L1 Testnet Configuration
    arcTestnet: {
      url: process.env.ARC_RPC_URL || "https://arc-testnet.drpc.org",
      chainId: 5042002,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      // Native gas token is USDC (18 decimals)
      // No ETH exists on this chain
    },
    // Arc L1 Mainnet (for future use)
    arcMainnet: {
      url: process.env.ARC_MAINNET_RPC_URL || "https://rpc.arc.network",
      chainId: 5042001, // Assumed mainnet chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Local Hardhat Network (for testing)
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    // Note: On Arc L1, gas costs are in USDC, not ETH
  },
  etherscan: {
    apiKey: {
      arcTestnet: process.env.ARC_EXPLORER_API_KEY || "your-api-key",
    },
    customChains: [
      {
        network: "arcTestnet",
        chainId: 5042002,
        urls: {
          apiURL: "https://testnet.arcscan.app/api",
          browserURL: "https://testnet.arcscan.app",
        },
      },
    ],
  },
};

export default config;
