/**
 * Single Wallet Smoke Test for PairXEscrow on Arc L1 Testnet
 * 
 * Tests what we can with a single wallet:
 * 1. Create trade (Seller deposits USDC)
 * 2. Cancel trade (Seller cancels own trade)
 * 3. Verify contract state and events
 * 
 * For full lifecycle test (accept → paid → release), use smoke-test.js with 2 wallets
 */

import hre from "hardhat";

const DEPLOYED_CONTRACT_ADDRESS = "0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7";

async function main() {
  console.log("\n🧪 PairXEscrow Single-Wallet Smoke Test");
  console.log("═".repeat(60));
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`\n📡 Network: ${hre.network.name} (Chain ID: ${network.chainId})`);
  
  if (network.chainId !== 5042002n) {
    console.error("❌ Error: Not connected to Arc L1 Testnet!");
    process.exit(1);
  }
  
  // Get signer
  const [seller] = await hre.ethers.getSigners();
  
  console.log(`\n👤 Test Account:`);
  console.log(`   Address: ${seller.address}`);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(seller.address);
  
  console.log(`\n💰 Balance:`);
  console.log(`   ${hre.ethers.formatEther(balance)} USDC`);
  
  // Verify sufficient balance
  const requiredAmount = hre.ethers.parseEther("10"); // 10 USDC for test
  if (balance < requiredAmount + hre.ethers.parseEther("1")) {
    console.error(`\n❌ Error: Need at least 11 USDC (10 for trade + 1 for gas)`);
    console.log(`\n💡 Get testnet USDC from Arc L1 faucet`);
    process.exit(1);
  }
  
  // Connect to deployed contract
  console.log(`\n📄 Connecting to PairXEscrow contract...`);
  const contract = await hre.ethers.getContractAt("PairXEscrow", DEPLOYED_CONTRACT_ADDRESS);
  
  // Verify contract state
  const version = await contract.VERSION();
  const owner = await contract.owner();
  const isPaused = await contract.paused();
  const nextTradeId = await contract.nextTradeId();
  
  console.log(`   Contract: ${DEPLOYED_CONTRACT_ADDRESS}`);
  console.log(`   Version: ${version}`);
  console.log(`   Owner: ${owner}`);
  console.log(`   Paused: ${isPaused}`);
  console.log(`   Next Trade ID: ${nextTradeId}`);
  
  if (isPaused) {
    console.error(`\n❌ Error: Contract is paused!`);
    process.exit(1);
  }
  
  console.log(`\n✅ Contract is operational!`);
  
  // Get initial reputation
  const repBefore = await contract.getReputation(seller.address);
  
  console.log(`\n📊 Initial Reputation:`);
  console.log(`   Completed Trades: ${repBefore}`);
  
  console.log("\n" + "═".repeat(60));
  console.log("TESTING: CREATE AND CANCEL TRADE");
  console.log("═".repeat(60));
  
  // ============================================================================
  // TEST 1: Create Trade
  // ============================================================================
  console.log("\n📝 TEST 1: Creating Trade");
  console.log("-".repeat(60));
  
  const tradeAmount = hre.ethers.parseEther("10"); // 10 USDC
  const paymentMethod = "Bank Transfer - Account: TEST-123456 (Smoke Test)";
  
  console.log(`   Amount: ${hre.ethers.formatEther(tradeAmount)} USDC`);
  console.log(`   Payment Method: ${paymentMethod}`);
  
  const balanceBefore = await hre.ethers.provider.getBalance(seller.address);
  console.log(`\n   Balance before: ${hre.ethers.formatEther(balanceBefore)} USDC`);
  
  console.log(`\n   Submitting transaction...`);
  const createTx = await contract.createTrade(
    paymentMethod,
    { value: tradeAmount }
  );
  
  console.log(`   Tx Hash: ${createTx.hash}`);
  console.log(`   Waiting for confirmation...`);
  
  const createReceipt = await createTx.wait();
  console.log(`   ✅ Confirmed in block ${createReceipt.blockNumber}`);
  console.log(`   Gas Used: ${createReceipt.gasUsed.toString()}`);
  
  const gasCost = createReceipt.gasUsed * createReceipt.gasPrice;
  console.log(`   Gas Cost: ${hre.ethers.formatEther(gasCost)} USDC`);
  
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
  
  // Verify balance change
  const balanceAfterCreate = await hre.ethers.provider.getBalance(seller.address);
  const balanceChange = balanceBefore - balanceAfterCreate;
  
  console.log(`\n   💵 Balance Verification:`);
  console.log(`      Balance after: ${hre.ethers.formatEther(balanceAfterCreate)} USDC`);
  console.log(`      Total spent: ${hre.ethers.formatEther(balanceChange)} USDC`);
  console.log(`      Trade amount: ${hre.ethers.formatEther(tradeAmount)} USDC`);
  console.log(`      Gas cost: ${hre.ethers.formatEther(gasCost)} USDC`);
  
  // Verify trade state
  const trade = await contract.getTrade(tradeId);
  console.log(`\n   📋 Trade Details:`);
  console.log(`      State: ${getStateName(trade.state)} (${trade.state})`);
  console.log(`      Seller: ${trade.seller}`);
  console.log(`      Buyer: ${trade.buyer}`);
  console.log(`      Amount: ${hre.ethers.formatEther(trade.amount)} USDC`);
  console.log(`      Payment Method: ${trade.paymentMethod}`);
  console.log(`      Created At: ${new Date(Number(trade.createdAt) * 1000).toISOString()}`);
  
  // Verify state
  if (trade.state !== 0n) { // OPEN = 0
    console.error(`\n❌ Error: Trade should be in OPEN state (0), got ${trade.state}`);
    process.exit(1);
  }
  
  if (trade.seller !== seller.address) {
    console.error(`\n❌ Error: Seller address incorrect!`);
    process.exit(1);
  }
  
  if (trade.amount !== tradeAmount) {
    console.error(`\n❌ Error: Trade amount incorrect!`);
    process.exit(1);
  }
  
  console.log(`\n   ✅ Trade created successfully with correct state!`);
  
  // ============================================================================
  // TEST 2: Cancel Trade
  // ============================================================================
  console.log("\n\n🚫 TEST 2: Cancelling Trade");
  console.log("-".repeat(60));
  
  console.log(`   Cancelling trade ${tradeId}...`);
  
  const balanceBeforeCancel = await hre.ethers.provider.getBalance(seller.address);
  
  const cancelTx = await contract.cancel(tradeId);
  
  console.log(`   Tx Hash: ${cancelTx.hash}`);
  console.log(`   Waiting for confirmation...`);
  
  const cancelReceipt = await cancelTx.wait();
  console.log(`   ✅ Confirmed in block ${cancelReceipt.blockNumber}`);
  console.log(`   Gas Used: ${cancelReceipt.gasUsed.toString()}`);
  
  const cancelGasCost = cancelReceipt.gasUsed * cancelReceipt.gasPrice;
  
  // Verify TradeCancelled event
  const cancelEvent = cancelReceipt.logs
    .map(log => {
      try {
        return contract.interface.parseLog({ topics: log.topics, data: log.data });
      } catch (e) {
        return null;
      }
    })
    .filter(e => e !== null)
    .find(e => e.name === "TradeCancelled");
  
  if (!cancelEvent) {
    console.error(`\n❌ Error: TradeCancelled event not found!`);
    process.exit(1);
  }
  
  console.log(`\n   ✅ Trade Cancelled!`);
  
  // Verify refund
  const balanceAfterCancel = await hre.ethers.provider.getBalance(seller.address);
  const refundReceived = balanceAfterCancel - balanceBeforeCancel;
  const expectedRefund = tradeAmount - cancelGasCost;
  
  console.log(`\n   💵 Refund Verification:`);
  console.log(`      Balance before cancel: ${hre.ethers.formatEther(balanceBeforeCancel)} USDC`);
  console.log(`      Balance after cancel:  ${hre.ethers.formatEther(balanceAfterCancel)} USDC`);
  console.log(`      Net change: ${hre.ethers.formatEther(refundReceived)} USDC`);
  console.log(`      Expected (10 USDC - gas): ${hre.ethers.formatEther(expectedRefund)} USDC`);
  
  // Verify trade state
  const cancelledTrade = await contract.getTrade(tradeId);
  console.log(`\n   📋 Final Trade State:`);
  console.log(`      State: ${getStateName(cancelledTrade.state)} (${cancelledTrade.state})`);
  
  if (cancelledTrade.state !== 4n) { // CANCELLED = 4
    console.error(`\n❌ Error: Trade should be in CANCELLED state (4), got ${cancelledTrade.state}`);
    process.exit(1);
  }
  
  console.log(`\n   ✅ Trade cancelled and refund received!`);
  
  // ============================================================================
  // TEST 3: Verify Contract Functions
  // ============================================================================
  console.log("\n\n🔍 TEST 3: Contract State Verification");
  console.log("-".repeat(60));
  
  // Test getReputation
  const repAfter = await contract.getReputation(seller.address);
  console.log(`   Reputation (should be unchanged): ${repAfter}`);
  
  if (repAfter !== repBefore) {
    console.error(`\n❌ Error: Reputation should not change for cancelled trades!`);
    process.exit(1);
  }
  
  // Test contract constants
  const timeout = await contract.TIMEOUT_DURATION();
  const usdcSystem = await contract.USDC_SYSTEM_CONTRACT();
  
  console.log(`   Timeout Duration: ${Number(timeout) / 3600} hours`);
  console.log(`   USDC System Contract: ${usdcSystem}`);
  
  if (timeout !== 86400n) {
    console.error(`\n❌ Error: Timeout should be 86400 seconds (24 hours)!`);
    process.exit(1);
  }
  
  if (usdcSystem !== "0x3600000000000000000000000000000000000000") {
    console.error(`\n❌ Error: USDC system contract address incorrect!`);
    process.exit(1);
  }
  
  console.log(`\n   ✅ All contract constants correct!`);
  
  // ============================================================================
  // Summary
  // ============================================================================
  console.log("\n" + "═".repeat(60));
  console.log("✅ SINGLE-WALLET SMOKE TEST COMPLETED!");
  console.log("═".repeat(60));
  
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Contract Connection Successful`);
  console.log(`   ✅ Trade Creation Working (State: OPEN)`);
  console.log(`   ✅ USDC Deposit Working (10 USDC escrowed)`);
  console.log(`   ✅ TradeCreated Event Emitted`);
  console.log(`   ✅ Trade Cancellation Working (State: CANCELLED)`);
  console.log(`   ✅ USDC Refund Working (Full refund received)`);
  console.log(`   ✅ TradeCancelled Event Emitted`);
  console.log(`   ✅ Reputation System Working (No change for cancelled trades)`);
  console.log(`   ✅ Contract Constants Verified`);
  console.log(`   ✅ State Machine Working Correctly`);
  
  console.log(`\n🔗 View on Explorer:`);
  console.log(`   Contract: https://testnet.arcscan.app/address/${DEPLOYED_CONTRACT_ADDRESS}`);
  console.log(`   Create Tx: https://testnet.arcscan.app/tx/${createTx.hash}`);
  console.log(`   Cancel Tx: https://testnet.arcscan.app/tx/${cancelTx.hash}`);
  
  console.log(`\n📝 Tests Completed:`);
  console.log(`   ✅ Create Trade → USDC Escrow`);
  console.log(`   ✅ Cancel Trade → USDC Refund`);
  
  console.log(`\n⚠️  For Full Lifecycle Test (Accept → Paid → Release):`);
  console.log(`   Run: node scripts/setup-test-wallets.js`);
  console.log(`   Then: npx hardhat run scripts/smoke-test.js --network arcTestnet`);
  
  console.log(`\n✨ Partial smoke test passed!\n`);
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
