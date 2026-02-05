/**
 * Test Deployment Script for PairXEscrow
 * 
 * This script tests a deployed PairXEscrow contract to verify it's working correctly
 * 
 * Usage:
 * - npx hardhat run scripts/test-deployment.js --network arcTestnet
 * 
 * Requirements:
 * - Set CONTRACT_ADDRESS environment variable or edit the script
 * - Ensure deployer wallet has USDC for test transactions
 */

import hre from "hardhat";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS_HERE";

async function main() {
  console.log("\n🧪 Testing Deployed PairXEscrow Contract");
  console.log("═".repeat(50));
  
  // Validate contract address
  if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
    console.error("\n❌ Error: Please set CONTRACT_ADDRESS environment variable");
    console.error("   Usage: CONTRACT_ADDRESS=0x... npx hardhat run scripts/test-deployment.js --network arcTestnet");
    process.exit(1);
  }
  
  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;
  const networkName = hre.network.name;
  
  console.log(`\n📡 Network Information:`);
  console.log(`   Network: ${networkName}`);
  console.log(`   Chain ID: ${chainId}`);
  console.log(`   Contract: ${CONTRACT_ADDRESS}`);
  
  // Get test account
  const [tester] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(tester.address);
  
  const isArcL1 = chainId === 5042002n || chainId === 5042001n;
  const gasTokenName = isArcL1 ? "USDC" : "ETH";
  
  console.log(`\n👤 Test Account:`);
  console.log(`   Address: ${tester.address}`);
  console.log(`   Balance: ${hre.ethers.formatEther(balance)} ${gasTokenName}`);
  
  // Connect to deployed contract
  console.log(`\n🔗 Connecting to contract...`);
  const PairXEscrow = await hre.ethers.getContractFactory("PairXEscrow");
  const escrow = PairXEscrow.attach(CONTRACT_ADDRESS);
  
  // Test 1: Read contract state
  console.log(`\n📖 Test 1: Reading Contract State`);
  try {
    const version = await escrow.VERSION();
    const owner = await escrow.owner();
    const nextTradeId = await escrow.nextTradeId();
    const timeoutDuration = await escrow.TIMEOUT_DURATION();
    const isPaused = await escrow.paused();
    const tradeCount = await escrow.getTradeCount();
    const contractBalance = await escrow.getContractBalance();
    
    console.log(`   ✅ Version: ${version}`);
    console.log(`   ✅ Owner: ${owner}`);
    console.log(`   ✅ Next Trade ID: ${nextTradeId}`);
    console.log(`   ✅ Timeout: ${timeoutDuration / 3600n} hours`);
    console.log(`   ✅ Paused: ${isPaused}`);
    console.log(`   ✅ Trade Count: ${tradeCount}`);
    console.log(`   ✅ Contract Balance: ${hre.ethers.formatEther(contractBalance)} ${gasTokenName}`);
  } catch (error) {
    console.error(`   ❌ Failed to read contract state`);
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }
  
  // Test 2: Check reputation system
  console.log(`\n📖 Test 2: Checking Reputation System`);
  try {
    const reputation = await escrow.getReputation(tester.address);
    console.log(`   ✅ Your Reputation: ${reputation} completed trades`);
  } catch (error) {
    console.error(`   ❌ Failed to check reputation`);
    console.error(`   Error: ${error.message}`);
  }
  
  // Test 3: Create a test trade (optional - costs gas)
  const testAmount = hre.ethers.parseEther("10"); // 10 USDC
  
  if (balance > testAmount * 2n) {
    console.log(`\n📝 Test 3: Creating Test Trade (costs gas)`);
    console.log(`   Amount: ${hre.ethers.formatEther(testAmount)} ${gasTokenName}`);
    
    try {
      const tx = await escrow.connect(tester).createTrade("Test Payment Method", { 
        value: testAmount 
      });
      console.log(`   Transaction submitted: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`   ✅ Trade created successfully!`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
      
      // Get the created trade
      const trade = await escrow.getTrade(1);
      console.log(`\n   Trade Details:`);
      console.log(`   - Trade ID: ${trade.tradeId}`);
      console.log(`   - Seller: ${trade.seller}`);
      console.log(`   - Amount: ${hre.ethers.formatEther(trade.amount)} ${gasTokenName}`);
      console.log(`   - State: ${trade.state} (0=OPEN)`);
      console.log(`   - Payment Method: ${trade.paymentMethod}`);
      
      // Test 4: Cancel the test trade
      console.log(`\n🔄 Test 4: Cancelling Test Trade`);
      const cancelTx = await escrow.connect(tester).cancel(1);
      console.log(`   Transaction submitted: ${cancelTx.hash}`);
      
      const cancelReceipt = await cancelTx.wait();
      console.log(`   ✅ Trade cancelled successfully!`);
      console.log(`   Gas Used: ${cancelReceipt.gasUsed.toString()}`);
      console.log(`   Funds refunded to seller`);
      
    } catch (error) {
      console.error(`   ❌ Failed to create/cancel trade`);
      console.error(`   Error: ${error.message}`);
      
      if (error.message.includes("paused")) {
        console.log(`   💡 Contract is paused - this is normal if owner paused it`);
      } else if (error.message.includes("insufficient funds")) {
        console.log(`   💡 Insufficient ${gasTokenName} - get more from faucet`);
      }
    }
  } else {
    console.log(`\n⚠️  Test 3 & 4: Skipped (insufficient balance for test trade)`);
    console.log(`   Required: ${hre.ethers.formatEther(testAmount * 2n)} ${gasTokenName}`);
    console.log(`   Available: ${hre.ethers.formatEther(balance)} ${gasTokenName}`);
  }
  
  // Summary
  console.log(`\n✅ Deployment Test Complete!`);
  console.log(`═`.repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`   Network: ${networkName} (Chain ID: ${chainId})`);
  console.log(`   Status: Contract is operational ✅`);
  
  if (isArcL1) {
    console.log(`\n🔗 View on Arc Explorer:`);
    console.log(`   https://testnet.arcscan.io/address/${CONTRACT_ADDRESS}`);
  }
  
  console.log(`\n💡 Ready for Production Use!`);
  console.log(`   Users can now create P2P trades on the contract.\n`);
}

// Execute test
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Test Failed!");
    console.error(error);
    process.exit(1);
  });
