/**
 * Verify Deployment Transaction
 * 
 * Checks the specific deployment transaction from the recent deployment attempt
 */

import hre from "hardhat";

async function main() {
  const txHash = "0x78a7f2141f399e45423bf90b8e0552c1ce07a7d11744da190420d3b46bc6822a";
  
  console.log(`\n🔍 Checking Deployment Transaction...`);
  console.log(`   Tx Hash: ${txHash}`);
  
  try {
    // Get transaction receipt
    console.log(`\n⏳ Fetching transaction receipt...`);
    const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      console.log(`\n⚠️  Transaction not yet mined or not found.`);
      console.log(`   This could mean:`);
      console.log(`   1. Transaction is still pending`);
      console.log(`   2. RPC endpoint doesn't have this transaction yet`);
      console.log(`\n   Check on explorer: https://testnet.arcscan.io/tx/${txHash}`);
      return;
    }
    
    console.log(`✅ Transaction confirmed!`);
    
    console.log(`\n📋 Transaction Details:`);
    console.log(`   Status: ${receipt.status === 1 ? "✅ Success" : "❌ Failed"}`);
    console.log(`   Block Number: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`   Gas Price: ${hre.ethers.formatUnits(receipt.gasPrice || 0, "gwei")} gwei`);
    
    const gasCost = receipt.gasUsed * (receipt.gasPrice || 0n);
    console.log(`   Total Cost: ${hre.ethers.formatEther(gasCost)} USDC`);
    
    if (receipt.contractAddress) {
      console.log(`\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!`);
      console.log(`═`.repeat(50));
      console.log(`\n📍 Contract Address: ${receipt.contractAddress}`);
      
      // Verify contract works by calling a view function
      console.log(`\n🔍 Verifying Contract State...`);
      const PairXEscrow = await hre.ethers.getContractFactory("PairXEscrow");
      const escrow = PairXEscrow.attach(receipt.contractAddress);
      
      try {
        const version = await escrow.VERSION();
        const owner = await escrow.owner();
        const nextTradeId = await escrow.nextTradeId();
        const timeoutDuration = await escrow.TIMEOUT_DURATION();
        const usdcSystemContract = await escrow.USDC_SYSTEM_CONTRACT();
        
        console.log(`   Version: ${version}`);
        console.log(`   Owner: ${owner}`);
        console.log(`   Next Trade ID: ${nextTradeId}`);
        console.log(`   Timeout Duration: ${Number(timeoutDuration) / 3600} hours`);
        console.log(`   USDC System Contract: ${usdcSystemContract}`);
        
        // Test getReputation - Task 2.1.2 verification requirement
        console.log(`\n✅ Task 2.1.2 Verification: Testing getReputation()`);
        const testAddress = "0x0000000000000000000000000000000000000001";
        const reputation = await escrow.getReputation(testAddress);
        console.log(`   getReputation(${testAddress}): ${reputation}`);
        
        if (reputation === 0n) {
          console.log(`   ✅ VERIFICATION PASSED: Returns 0 for new address`);
        }
        
        console.log(`\n✅ Contract is fully operational!`);
      } catch (error) {
        console.log(`   ⚠️  Error verifying contract state: ${error.message}`);
      }
      
      console.log(`\n🔗 View on Explorer:`);
      console.log(`   https://testnet.arcscan.io/address/${receipt.contractAddress}`);
      
      console.log(`\n📋 Next Steps:`);
      console.log(`   1. Verify contract source code:`);
      const ownerAddr = await escrow.owner();
      console.log(`      npx hardhat verify --network arcTestnet ${receipt.contractAddress} "${ownerAddr}"`);
      console.log(`   2. Save contract address to .env or deployment records`);
      console.log(`   3. Proceed to Task 2.2: Contract Verification`);
      
    } else {
      console.log(`\n❌ No contract address found in receipt`);
      console.log(`   This means the transaction was not a contract deployment`);
    }
    
  } catch (error) {
    console.error(`\n❌ Error checking transaction:`);
    console.error(error);
    
    console.log(`\n💡 Try checking on Arc Explorer:`);
    console.log(`   https://testnet.arcscan.io/tx/${txHash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
