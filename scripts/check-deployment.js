/**
 * Check Deployment Status
 * 
 * Checks if a transaction was successful and retrieves contract address
 */

import hre from "hardhat";

async function main() {
  const txHash = process.argv[2];
  
  if (!txHash) {
    console.error("❌ Please provide transaction hash as argument");
    console.log("Usage: npx hardhat run scripts/check-deployment.js --network arcTestnet <txHash>");
    process.exit(1);
  }
  
  console.log(`\n🔍 Checking Deployment Transaction...`);
  console.log(`   Tx Hash: ${txHash}`);
  
  try {
    // Try to get transaction receipt
    console.log(`\n⏳ Fetching transaction receipt...`);
    const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      console.log(`\n⚠️  Transaction not yet mined. Waiting...`);
      // Wait for transaction
      const tx = await hre.ethers.provider.getTransaction(txHash);
      if (tx) {
        console.log(`   Transaction found, waiting for confirmation...`);
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed!`);
        printReceipt(receipt);
      } else {
        console.log(`❌ Transaction not found`);
      }
    } else {
      console.log(`✅ Transaction confirmed!`);
      printReceipt(receipt);
    }
  } catch (error) {
    console.error(`\n❌ Error checking transaction:`);
    console.error(error.message);
  }
}

function printReceipt(receipt) {
  console.log(`\n📋 Transaction Details:`);
  console.log(`   Status: ${receipt.status === 1 ? "✅ Success" : "❌ Failed"}`);
  console.log(`   Block Number: ${receipt.blockNumber}`);
  console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
  
  if (receipt.contractAddress) {
    console.log(`\n🎉 Contract Deployed!`);
    console.log(`   Contract Address: ${receipt.contractAddress}`);
    console.log(`\n📍 Save this address for verification and testing!`);
  } else {
    console.log(`\n⚠️  No contract address found (this might be a regular transaction)`);
  }
  
  console.log(`\n🔗 View on Explorer:`);
  console.log(`   https://testnet.arcscan.io/tx/${receipt.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
