/**
 * Simple connection test for Arc L1 Testnet
 */

import hre from "hardhat";

async function main() {
  console.log("Testing Arc L1 Testnet connection...\n");
  
  try {
    // Test provider connection
    const provider = hre.ethers.provider;
    const network = await provider.getNetwork();
    
    console.log("✅ Connected to network:");
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   Name: ${network.name}`);
    
    // Test block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`\n✅ Current block: ${blockNumber}`);
    
    // Test account
    const accounts = await hre.ethers.getSigners();
    if (accounts.length > 0) {
      const account = accounts[0];
      console.log(`\n✅ Account loaded: ${account.address}`);
      
      const balance = await provider.getBalance(account.address);
      console.log(`   Balance: ${hre.ethers.formatEther(balance)} USDC`);
    } else {
      console.log("\n❌ No accounts configured");
    }
    
    console.log("\n✅ Connection test successful!\n");
    
  } catch (error) {
    console.error("\n❌ Connection test failed:");
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
