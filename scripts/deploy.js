/**
 * PairXEscrow Deployment Script for Arc L1
 * 
 * This script deploys the PairXEscrow contract to Arc L1 Testnet
 * 
 * Arc L1 Specifications:
 * - Chain ID: 5042002 (Testnet)
 * - Native Gas Token: USDC (NOT ETH)
 * - USDC has 18 decimals on Arc L1
 * - Gas fees are paid in USDC
 * 
 * Usage:
 * - Local: npx hardhat run scripts/deploy.js
 * - Arc L1 Testnet: npx hardhat run scripts/deploy.js --network arcTestnet
 */

import hre from "hardhat";

async function main() {
  console.log("\n🚀 PairXEscrow Deployment Script");
  console.log("═".repeat(50));
  
  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;
  const networkName = hre.network.name;
  
  console.log(`\n📡 Network Information:`);
  console.log(`   Network: ${networkName}`);
  console.log(`   Chain ID: ${chainId}`);
  
  // Determine if on Arc L1
  const isArcL1 = chainId === 5042002n || chainId === 5042001n;
  const gasTokenName = isArcL1 ? "USDC" : "ETH";
  
  if (isArcL1) {
    console.log(`   ⚠️  Arc L1 Network - Gas paid in USDC!`);
    console.log(`   USDC System Contract: 0x3600000000000000000000000000000000000000`);
  }
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = deployer.address;
  
  console.log(`\n👤 Deployer Account:`);
  console.log(`   Address: ${deployerAddress}`);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  const balanceFormatted = hre.ethers.formatEther(balance);
  
  console.log(`   Balance: ${balanceFormatted} ${gasTokenName}`);
  
  // Warning if balance is low
  if (balance < hre.ethers.parseEther("10")) {
    console.log(`   ⚠️  WARNING: Low balance! Ensure you have enough ${gasTokenName} for gas fees.`);
    if (isArcL1) {
      console.log(`   💡 TIP: Get USDC from Arc L1 testnet faucet`);
    }
  }
  
  // Confirm deployment
  console.log(`\n📝 Deployment Configuration:`);
  console.log(`   Contract: PairXEscrow`);
  console.log(`   Initial Owner: ${deployerAddress}`);
  console.log(`   Compiler: Solidity 0.8.20`);
  console.log(`   Optimizer: Enabled (200 runs)`);
  
  // Wait for user confirmation on testnet/mainnet
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log(`\n⏳ Deploying in 3 seconds... (Press Ctrl+C to cancel)`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log(`\n🔨 Deploying PairXEscrow contract...`);
  
  // Deploy contract
  const PairXEscrow = await hre.ethers.getContractFactory("PairXEscrow");
  const startTime = Date.now();
  
  const escrow = await PairXEscrow.deploy(deployerAddress);
  
  console.log(`   Transaction submitted...`);
  console.log(`   Tx Hash: ${escrow.deploymentTransaction().hash}`);
  
  // Wait for deployment
  await escrow.waitForDeployment();
  
  const deploymentTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const contractAddress = await escrow.getAddress();
  
  console.log(`\n✅ Deployment Successful!`);
  console.log(`═`.repeat(50));
  console.log(`\n📍 Contract Address: ${contractAddress}`);
  console.log(`   Deployment Time: ${deploymentTime}s`);
  
  // Get deployment transaction details
  const deployTx = escrow.deploymentTransaction();
  const receipt = await deployTx.wait();
  
  console.log(`\n⛽ Gas Information:`);
  console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
  console.log(`   Gas Price: ${hre.ethers.formatUnits(receipt.gasPrice, "gwei")} gwei`);
  
  const gasCost = receipt.gasUsed * receipt.gasPrice;
  const gasCostFormatted = hre.ethers.formatEther(gasCost);
  console.log(`   Total Cost: ${gasCostFormatted} ${gasTokenName}`);
  
  // Verify contract state
  console.log(`\n🔍 Verifying Contract State...`);
  
  const version = await escrow.VERSION();
  const owner = await escrow.owner();
  const nextTradeId = await escrow.nextTradeId();
  const timeoutDuration = await escrow.TIMEOUT_DURATION();
  const usdcSystemContract = await escrow.USDC_SYSTEM_CONTRACT();
  const isPaused = await escrow.paused();
  
  console.log(`   Version: ${version}`);
  console.log(`   Owner: ${owner}`);
  console.log(`   Next Trade ID: ${nextTradeId}`);
  console.log(`   Timeout Duration: ${timeoutDuration / 3600n} hours`);
  console.log(`   USDC System Contract: ${usdcSystemContract}`);
  console.log(`   Paused: ${isPaused}`);
  
  // Check final balance
  const finalBalance = await hre.ethers.provider.getBalance(deployerAddress);
  const balanceChange = balance - finalBalance;
  const balanceChangeFormatted = hre.ethers.formatEther(balanceChange);
  
  console.log(`\n💰 Deployer Balance After Deployment:`);
  console.log(`   Balance: ${hre.ethers.formatEther(finalBalance)} ${gasTokenName}`);
  console.log(`   Used: ${balanceChangeFormatted} ${gasTokenName}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: chainId.toString(),
    contractAddress: contractAddress,
    deployerAddress: deployerAddress,
    deploymentTime: new Date().toISOString(),
    transactionHash: deployTx.hash,
    gasUsed: receipt.gasUsed.toString(),
    gasCost: gasCostFormatted,
    blockNumber: receipt.blockNumber,
    version: version,
  };
  
  console.log(`\n📄 Deployment Information:`);
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Instructions for next steps
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Save the contract address: ${contractAddress}`);
  console.log(`   2. Verify contract on block explorer (if on testnet/mainnet):`);
  console.log(`      npx hardhat verify --network ${networkName} ${contractAddress} "${deployerAddress}"`);
  console.log(`   3. Test the deployment:`);
  console.log(`      npx hardhat run scripts/test-deployment.js --network ${networkName}`);
  
  if (isArcL1) {
    console.log(`   4. View on Arc Explorer:`);
    console.log(`      https://testnet.arcscan.io/address/${contractAddress}`);
  }
  
  console.log(`\n✨ Deployment Complete!\n`);
  
  return {
    contractAddress,
    deploymentInfo,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed!");
    console.error(error);
    process.exit(1);
  });
