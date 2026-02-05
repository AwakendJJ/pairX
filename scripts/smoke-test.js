/**
 * Smoke Test Script for PairXEscrow on Arc L1 Testnet
 * 
 * Tests the complete trade lifecycle:
 * 1. Create trade (Seller deposits USDC)
 * 2. Accept trade (Buyer locks the trade)
 * 3. Mark as paid (Buyer confirms off-chain payment)
 * 4. Release funds (Seller releases USDC to Buyer)
 * 
 * Verifies:
 * - All state transitions work correctly
 * - USDC transfers happen as expected
 * - Events are emitted properly
 * - Reputation system updates correctly
 */

import hre from "hardhat";

const DEPLOYED_CONTRACT_ADDRESS = "0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7";

async function main() {
  console.log("\n🧪 PairXEscrow Smoke Test on Arc L1 Testnet");
  console.log("═".repeat(60));
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`\n📡 Network: ${hre.network.name} (Chain ID: ${network.chainId})`);
  
  if (network.chainId !== 5042002n) {
    console.error("❌ Error: Not connected to Arc L1 Testnet!");
    process.exit(1);
  }
  
  // Get signers
  const [seller, buyer] = await hre.ethers.getSigners();
  
  console.log(`\n👥 Test Participants:`);
  console.log(`   Seller: ${seller.address}`);
  console.log(`   Buyer:  ${buyer.address}`);
  
  // Check balances
  const sellerBalance = await hre.ethers.provider.getBalance(seller.address);
  const buyerBalance = await hre.ethers.provider.getBalance(buyer.address);
  
  console.log(`\n💰 Initial Balances:`);
  console.log(`   Seller: ${hre.ethers.formatEther(sellerBalance)} USDC`);
  console.log(`   Buyer:  ${hre.ethers.formatEther(buyerBalance)} USDC`);
  
  // Verify sufficient balances
  const requiredAmount = hre.ethers.parseEther("10"); // 10 USDC for test
  if (sellerBalance < requiredAmount + hre.ethers.parseEther("1")) {
    console.error(`\n❌ Error: Seller needs at least 11 USDC (10 for trade + 1 for gas)`);
    process.exit(1);
  }
  
  if (buyerBalance < hre.ethers.parseEther("1")) {
    console.error(`\n❌ Error: Buyer needs at least 1 USDC for gas`);
    process.exit(1);
  }
  
  // Connect to deployed contract
  console.log(`\n📄 Connecting to PairXEscrow contract...`);
  const contract = await hre.ethers.getContractAt("PairXEscrow", DEPLOYED_CONTRACT_ADDRESS);
  
  // Verify contract state
  const version = await contract.VERSION();
  const owner = await contract.owner();
  const isPaused = await contract.paused();
  
  console.log(`   Contract: ${DEPLOYED_CONTRACT_ADDRESS}`);
  console.log(`   Version: ${version}`);
  console.log(`   Owner: ${owner}`);
  console.log(`   Paused: ${isPaused}`);
  
  if (isPaused) {
    console.error(`\n❌ Error: Contract is paused!`);
    process.exit(1);
  }
  
  console.log(`\n✅ Contract is operational!`);
  
  // Get initial reputation
  const sellerRepBefore = await contract.getReputation(seller.address);
  const buyerRepBefore = await contract.getReputation(buyer.address);
  
  console.log(`\n📊 Initial Reputation:`);
  console.log(`   Seller: ${sellerRepBefore} completed trades`);
  console.log(`   Buyer:  ${buyerRepBefore} completed trades`);
  
  console.log("\n" + "═".repeat(60));
  console.log("STARTING TRADE LIFECYCLE TEST");
  console.log("═".repeat(60));
  
  // ============================================================================
  // STEP 1: Create Trade (Seller)
  // ============================================================================
  console.log("\n📝 STEP 1: Creating Trade (Seller)");
  console.log("-".repeat(60));
  
  const tradeAmount = hre.ethers.parseEther("10"); // 10 USDC
  const paymentMethod = "Bank Transfer - Account: 1234567890, Bank: Test Bank";
  
  console.log(`   Amount: ${hre.ethers.formatEther(tradeAmount)} USDC`);
  console.log(`   Payment Method: ${paymentMethod}`);
  
  const contractWithSeller = contract.connect(seller);
  
  console.log(`\n   Submitting transaction...`);
  const createTx = await contractWithSeller.createTrade(
    paymentMethod,
    { value: tradeAmount }
  );
  
  console.log(`   Tx Hash: ${createTx.hash}`);
  console.log(`   Waiting for confirmation...`);
  
  const createReceipt = await createTx.wait();
  console.log(`   ✅ Confirmed in block ${createReceipt.blockNumber}`);
  console.log(`   Gas Used: ${createReceipt.gasUsed.toString()}`);
  
  // Get trade ID from event
  const createEvent = createReceipt.logs
    .map(log => {
      try {
        return contract.interface.parseLog({ topics: log.topics, data: log.data });
      } catch (e) {
        return null;
      }
    })
    .filter(e => e !== null)
    .find(e => e.name === "TradeCreated");
  
  if (!createEvent) {
    console.error(`\n❌ Error: TradeCreated event not found!`);
    process.exit(1);
  }
  
  const tradeId = createEvent.args.tradeId;
  console.log(`\n   ✅ Trade Created! Trade ID: ${tradeId}`);
  
  // Verify trade state
  const trade1 = await contract.getTrade(tradeId);
  console.log(`\n   📋 Trade Details:`);
  console.log(`      State: ${getStateName(trade1.state)} (${trade1.state})`);
  console.log(`      Seller: ${trade1.seller}`);
  console.log(`      Buyer: ${trade1.buyer}`);
  console.log(`      Amount: ${hre.ethers.formatEther(trade1.amount)} USDC`);
  console.log(`      Payment Method: ${trade1.paymentMethod}`);
  
  if (trade1.state !== 0n) { // OPEN = 0
    console.error(`\n❌ Error: Trade should be in OPEN state (0), got ${trade1.state}`);
    process.exit(1);
  }
  
  // ============================================================================
  // STEP 2: Accept Trade (Buyer)
  // ============================================================================
  console.log("\n\n🤝 STEP 2: Accepting Trade (Buyer)");
  console.log("-".repeat(60));
  
  const contractWithBuyer = contract.connect(buyer);
  
  console.log(`   Buyer accepting trade ${tradeId}...`);
  const acceptTx = await contractWithBuyer.acceptTrade(tradeId);
  
  console.log(`   Tx Hash: ${acceptTx.hash}`);
  console.log(`   Waiting for confirmation...`);
  
  const acceptReceipt = await acceptTx.wait();
  console.log(`   ✅ Confirmed in block ${acceptReceipt.blockNumber}`);
  console.log(`   Gas Used: ${acceptReceipt.gasUsed.toString()}`);
  
  // Verify TradeAccepted event
  const acceptEvent = acceptReceipt.logs
    .map(log => {
      try {
        return contract.interface.parseLog({ topics: log.topics, data: log.data });
      } catch (e) {
        return null;
      }
    })
    .filter(e => e !== null)
    .find(e => e.name === "TradeAccepted");
  
  if (!acceptEvent) {
    console.error(`\n❌ Error: TradeAccepted event not found!`);
    process.exit(1);
  }
  
  console.log(`\n   ✅ Trade Accepted!`);
  
  // Verify trade state
  const trade2 = await contract.getTrade(tradeId);
  console.log(`\n   📋 Trade Details:`);
  console.log(`      State: ${getStateName(trade2.state)} (${trade2.state})`);
  console.log(`      Buyer: ${trade2.buyer}`);
  
  if (trade2.state !== 1n) { // LOCKED = 1
    console.error(`\n❌ Error: Trade should be in LOCKED state (1), got ${trade2.state}`);
    process.exit(1);
  }
  
  if (trade2.buyer !== buyer.address) {
    console.error(`\n❌ Error: Buyer address not set correctly!`);
    process.exit(1);
  }
  
  // ============================================================================
  // STEP 3: Mark as Paid (Buyer)
  // ============================================================================
  console.log("\n\n💳 STEP 3: Marking as Paid (Buyer)");
  console.log("-".repeat(60));
  
  console.log(`   Buyer marking trade ${tradeId} as paid...`);
  console.log(`   (Simulating off-chain payment completion)`);
  
  const markPaidTx = await contractWithBuyer.markAsPaid(tradeId);
  
  console.log(`   Tx Hash: ${markPaidTx.hash}`);
  console.log(`   Waiting for confirmation...`);
  
  const markPaidReceipt = await markPaidTx.wait();
  console.log(`   ✅ Confirmed in block ${markPaidReceipt.blockNumber}`);
  console.log(`   Gas Used: ${markPaidReceipt.gasUsed.toString()}`);
  
  // Verify TradePaid event
  const paidEvent = markPaidReceipt.logs
    .map(log => {
      try {
        return contract.interface.parseLog({ topics: log.topics, data: log.data });
      } catch (e) {
        return null;
      }
    })
    .filter(e => e !== null)
    .find(e => e.name === "TradePaid");
  
  if (!paidEvent) {
    console.error(`\n❌ Error: TradePaid event not found!`);
    process.exit(1);
  }
  
  console.log(`\n   ✅ Trade Marked as Paid!`);
  
  // Verify trade state
  const trade3 = await contract.getTrade(tradeId);
  console.log(`\n   📋 Trade Details:`);
  console.log(`      State: ${getStateName(trade3.state)} (${trade3.state})`);
  console.log(`      Paid At: ${new Date(Number(trade3.paidAt) * 1000).toISOString()}`);
  
  if (trade3.state !== 2n) { // PAID = 2
    console.error(`\n❌ Error: Trade should be in PAID state (2), got ${trade3.state}`);
    process.exit(1);
  }
  
  // ============================================================================
  // STEP 4: Release Funds (Seller)
  // ============================================================================
  console.log("\n\n💰 STEP 4: Releasing Funds (Seller)");
  console.log("-".repeat(60));
  
  // Get buyer balance before release
  const buyerBalanceBefore = await hre.ethers.provider.getBalance(buyer.address);
  console.log(`   Buyer balance before: ${hre.ethers.formatEther(buyerBalanceBefore)} USDC`);
  
  console.log(`\n   Seller releasing funds for trade ${tradeId}...`);
  const releaseTx = await contractWithSeller.release(tradeId);
  
  console.log(`   Tx Hash: ${releaseTx.hash}`);
  console.log(`   Waiting for confirmation...`);
  
  const releaseReceipt = await releaseTx.wait();
  console.log(`   ✅ Confirmed in block ${releaseReceipt.blockNumber}`);
  console.log(`   Gas Used: ${releaseReceipt.gasUsed.toString()}`);
  
  // Verify TradeReleased event
  const releaseEvent = releaseReceipt.logs
    .map(log => {
      try {
        return contract.interface.parseLog({ topics: log.topics, data: log.data });
      } catch (e) {
        return null;
      }
    })
    .filter(e => e !== null)
    .find(e => e.name === "TradeReleased");
  
  if (!releaseEvent) {
    console.error(`\n❌ Error: TradeReleased event not found!`);
    process.exit(1);
  }
  
  console.log(`\n   ✅ Funds Released!`);
  
  // Get buyer balance after release
  const buyerBalanceAfter = await hre.ethers.provider.getBalance(buyer.address);
  const buyerBalanceChange = buyerBalanceAfter - buyerBalanceBefore;
  
  console.log(`\n   💵 USDC Transfer Verification:`);
  console.log(`      Buyer balance before: ${hre.ethers.formatEther(buyerBalanceBefore)} USDC`);
  console.log(`      Buyer balance after:  ${hre.ethers.formatEther(buyerBalanceAfter)} USDC`);
  console.log(`      Change: +${hre.ethers.formatEther(buyerBalanceChange)} USDC`);
  console.log(`      Expected: +${hre.ethers.formatEther(tradeAmount)} USDC`);
  
  if (buyerBalanceChange !== tradeAmount) {
    console.error(`\n❌ Error: Buyer didn't receive correct amount!`);
    process.exit(1);
  }
  
  // Verify trade state
  const trade4 = await contract.getTrade(tradeId);
  console.log(`\n   📋 Final Trade Details:`);
  console.log(`      State: ${getStateName(trade4.state)} (${trade4.state})`);
  console.log(`      Completed: ✅`);
  
  if (trade4.state !== 3n) { // RELEASED = 3
    console.error(`\n❌ Error: Trade should be in RELEASED state (3), got ${trade4.state}`);
    process.exit(1);
  }
  
  // ============================================================================
  // STEP 5: Verify Reputation Updates
  // ============================================================================
  console.log("\n\n⭐ STEP 5: Verifying Reputation Updates");
  console.log("-".repeat(60));
  
  const sellerRepAfter = await contract.getReputation(seller.address);
  const buyerRepAfter = await contract.getReputation(buyer.address);
  
  console.log(`   📊 Reputation After Trade:`);
  console.log(`      Seller: ${sellerRepBefore} → ${sellerRepAfter} (+${sellerRepAfter - sellerRepBefore})`);
  console.log(`      Buyer:  ${buyerRepBefore} → ${buyerRepAfter} (+${buyerRepAfter - buyerRepBefore})`);
  
  if (sellerRepAfter !== sellerRepBefore + 1n) {
    console.error(`\n❌ Error: Seller reputation should increase by 1!`);
    process.exit(1);
  }
  
  if (buyerRepAfter !== buyerRepBefore + 1n) {
    console.error(`\n❌ Error: Buyer reputation should increase by 1!`);
    process.exit(1);
  }
  
  console.log(`\n   ✅ Reputation system working correctly!`);
  
  // ============================================================================
  // Summary
  // ============================================================================
  console.log("\n" + "═".repeat(60));
  console.log("✅ SMOKE TEST COMPLETED SUCCESSFULLY!");
  console.log("═".repeat(60));
  
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Trade Created (OPEN → ID: ${tradeId})`);
  console.log(`   ✅ Trade Accepted (LOCKED → Buyer set)`);
  console.log(`   ✅ Trade Paid (PAID → Timestamp recorded)`);
  console.log(`   ✅ Funds Released (RELEASED → USDC transferred)`);
  console.log(`   ✅ Reputation Updated (Both parties +1)`);
  console.log(`   ✅ All Events Emitted Correctly`);
  console.log(`   ✅ State Transitions Working`);
  console.log(`   ✅ USDC Transfers Accurate`);
  
  console.log(`\n🔗 View Trade on Explorer:`);
  console.log(`   https://testnet.arcscan.app/address/${DEPLOYED_CONTRACT_ADDRESS}`);
  
  console.log(`\n💡 PairXEscrow is ready for production use!`);
  console.log(`\n✨ All tests passed!\n`);
}

function getStateName(state) {
  const states = ["OPEN", "LOCKED", "PAID", "RELEASED", "CANCELLED", "DISPUTED"];
  return states[Number(state)] || "UNKNOWN";
}

// Execute smoke test
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Smoke Test Failed!");
    console.error(error);
    process.exit(1);
  });
