import hre from "hardhat";

/**
 * Script to verify Arc L1 network connection and configuration
 * 
 * Usage: npx hardhat run scripts/check-network.js --network arcTestnet
 */

async function main() {
  console.log("\n🔍 Checking Arc L1 Network Configuration...\n");

  // Get network information
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;

  console.log(`📡 Network: ${network}`);
  console.log(`🔗 Chain ID: ${chainId}`);

  // Get provider and signer
  const [signer] = await hre.ethers.getSigners();
  const provider = hre.ethers.provider;

  console.log(`\n👤 Signer Address: ${signer.address}`);

  try {
    // Check network connection
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Connected to network - Current block: ${blockNumber}`);

    // Check signer balance (should be USDC on Arc L1, not ETH)
    const balance = await provider.getBalance(signer.address);
    const balanceInUsdc = hre.ethers.formatEther(balance); // 18 decimals for Arc USDC

    console.log(`\n💰 Wallet Balance:`);
    console.log(`   ${balanceInUsdc} USDC (native gas token)`);
    console.log(`   Note: On Arc L1, this is USDC balance (not ETH)`);

    // Validate Arc L1 specific configuration
    if (network === "arcTestnet") {
      if (chainId !== 5042002) {
        console.warn(`\n⚠️  Warning: Expected Chain ID 5042002 for Arc Testnet, got ${chainId}`);
      } else {
        console.log(`\n✅ Arc L1 Testnet Chain ID verified: ${chainId}`);
      }

      // Display Arc L1 native USDC system contract
      const USDC_SYSTEM_CONTRACT = "0x3600000000000000000000000000000000000000";
      console.log(`\n📝 Arc L1 Native USDC System Contract:`);
      console.log(`   ${USDC_SYSTEM_CONTRACT}`);
      console.log(`   (This is referenced but not directly called - use msg.value for USDC)`);
    }

    // Gas price check
    const feeData = await provider.getFeeData();
    if (feeData.gasPrice) {
      const gasPriceGwei = hre.ethers.formatUnits(feeData.gasPrice, "gwei");
      console.log(`\n⛽ Current Gas Price: ${gasPriceGwei} Gwei`);
      console.log(`   Note: Gas is paid in USDC on Arc L1`);
    }

    // Verify deployer has sufficient balance for deployment
    const estimatedDeploymentCost = hre.ethers.parseEther("0.1"); // Rough estimate
    if (balance < estimatedDeploymentCost) {
      console.warn(`\n⚠️  Warning: Low USDC balance for deployment`);
      console.warn(`   Current: ${balanceInUsdc} USDC`);
      console.warn(`   Recommended: At least 0.1 USDC for gas`);
    } else {
      console.log(`\n✅ Sufficient USDC balance for deployment`);
    }

    console.log("\n✅ Network check complete!\n");

  } catch (error) {
    console.error("\n❌ Error checking network:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
