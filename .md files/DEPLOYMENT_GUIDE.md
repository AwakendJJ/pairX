# PairXEscrow Deployment Guide

Complete guide for deploying PairXEscrow contract to Arc L1 Testnet.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Network Verification](#network-verification)
- [Local Testing](#local-testing)
- [Arc L1 Testnet Deployment](#arc-l1-testnet-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Contract Verification on Explorer](#contract-verification-on-explorer)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- Node.js v18+ and npm
- Git
- Hardhat (installed via npm)

### Required Accounts

- **Wallet**: MetaMask or any Ethereum-compatible wallet
- **USDC**: Arc L1 uses USDC as native gas token (NOT ETH!)
- **Arc L1 Testnet USDC**: Get from faucet (see below)

### Important Arc L1 Specifications

```
Chain ID (Testnet):  5042002
Native Gas Token:    USDC (NOT ETH!)
USDC Decimals:       18 (different from standard 6)
USDC System:         0x3600000000000000000000000000000000000000
RPC URL:             https://rpc-testnet.arc.network
Explorer:            https://testnet.arcscan.io
```

---

## Environment Setup

### Step 1: Clone and Install

```bash
# Clone repository (if not already done)
git clone <your-repo-url>
cd PairX

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example env file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your private key:
```bash
# CRITICAL: Never commit this file!
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Arc L1 Testnet RPC (default is fine)
ARC_RPC_URL=https://rpc-testnet.arc.network

# Optional: Arc Explorer API Key for verification
ARC_EXPLORER_API_KEY=your_api_key_here
```

**⚠️ SECURITY WARNING:**
- Never commit `.env` to git
- Never share your private key
- Use a dedicated wallet for testnet deployment
- Keep separate wallets for testnet and mainnet

### Step 3: Get Arc L1 Testnet USDC

Since Arc L1 uses USDC as gas, you need USDC for deployment:

1. Add Arc L1 Testnet to your wallet:
   - Network Name: Arc L1 Testnet
   - RPC URL: `https://rpc-testnet.arc.network`
   - Chain ID: `5042002`
   - Currency Symbol: USDC
   - Explorer: `https://testnet.arcscan.io`

2. Get testnet USDC from faucet:
   - Visit Arc L1 testnet faucet (check Arc L1 docs for URL)
   - You'll need at least 1 USDC for deployment (~0.1-0.5 USDC for gas)

---

## Network Verification

Before deploying, verify your network connection and configuration:

```bash
npx hardhat run scripts/check-network.js --network arcTestnet
```

**Expected Output:**
```
🔍 Checking Arc L1 Network Configuration...

📡 Network: arcTestnet
🔗 Chain ID: 5042002
👤 Signer Address: 0x...
✅ Connected to network - Current block: 12345

💰 Wallet Balance:
   10.5 USDC (native gas token)
   Note: On Arc L1, this is USDC balance (not ETH)

✅ Arc L1 Testnet Chain ID verified: 5042002
📝 Arc L1 Native USDC System Contract:
   0x3600000000000000000000000000000000000000

⛽ Current Gas Price: 1.5 Gwei
   Note: Gas is paid in USDC on Arc L1

✅ Sufficient USDC balance for deployment
✅ Network check complete!
```

---

## Local Testing

Always test deployment locally first:

```bash
# Test deployment on local Hardhat network
npx hardhat run scripts/deploy.js

# Run full test suite
npx hardhat test
```

**What to check:**
- ✅ All 51 tests should pass
- ✅ Deployment script completes without errors
- ✅ Gas estimates are reasonable

---

## Arc L1 Testnet Deployment

### Step 1: Final Pre-Deployment Checks

```bash
# Verify network connection
npx hardhat run scripts/check-network.js --network arcTestnet

# Compile contracts
npx hardhat compile

# Run tests one more time
npx hardhat test
```

### Step 2: Deploy Contract

```bash
npx hardhat run scripts/deploy.js --network arcTestnet
```

**Deployment Output:**
```
🚀 PairXEscrow Deployment Script
═══════════════════════════════════════════

📡 Network Information:
   Network: arcTestnet
   Chain ID: 5042002
   ⚠️  Arc L1 Network - Gas paid in USDC!

👤 Deployer Account:
   Address: 0xYourAddress...
   Balance: 10.5 USDC

📝 Deployment Configuration:
   Contract: PairXEscrow
   Initial Owner: 0xYourAddress...
   Compiler: Solidity 0.8.20
   Optimizer: Enabled (200 runs)

⏳ Deploying in 3 seconds...
🔨 Deploying PairXEscrow contract...
   Transaction submitted...
   Tx Hash: 0x...

✅ Deployment Successful!
═══════════════════════════════════════════

📍 Contract Address: 0xYourContractAddress...
   Deployment Time: 5.23s

⛽ Gas Information:
   Gas Used: 1646171
   Total Cost: 0.0031 USDC
```

### Step 3: Save Contract Address

**IMPORTANT:** Save the deployed contract address from the output!

```bash
export CONTRACT_ADDRESS=0xYourContractAddress...
```

---

## Post-Deployment Verification

### Test the Deployment

```bash
CONTRACT_ADDRESS=0xYourContractAddress... npx hardhat run scripts/test-deployment.js --network arcTestnet
```

**Expected Output:**
```
🧪 Testing Deployed PairXEscrow Contract
═══════════════════════════════════════════

📖 Test 1: Reading Contract State
   ✅ Version: 1.0.0
   ✅ Owner: 0x...
   ✅ Next Trade ID: 1
   ✅ Timeout: 24 hours
   ✅ Paused: false
   ✅ Trade Count: 0
   ✅ Contract Balance: 0.0 USDC

📖 Test 2: Checking Reputation System
   ✅ Your Reputation: 0 completed trades

📝 Test 3: Creating Test Trade
   ✅ Trade created successfully!

🔄 Test 4: Cancelling Test Trade
   ✅ Trade cancelled successfully!

✅ Deployment Test Complete!
💡 Ready for Production Use!
```

### Manual Verification

1. **View on Explorer:**
   ```
   https://testnet.arcscan.io/address/0xYourContractAddress
   ```

2. **Check Contract State via Hardhat Console:**
   ```bash
   npx hardhat console --network arcTestnet
   ```
   
   ```javascript
   const contract = await ethers.getContractAt("PairXEscrow", "0xYourContractAddress");
   await contract.VERSION();           // "1.0.0"
   await contract.owner();             // Your address
   await contract.nextTradeId();       // 1
   await contract.paused();            // false
   await contract.TIMEOUT_DURATION();  // 86400 (24 hours)
   ```

---

## Contract Verification on Explorer

Verify your contract source code on Arc Explorer:

```bash
npx hardhat verify --network arcTestnet 0xYourContractAddress "0xYourOwnerAddress"
```

**Expected Output:**
```
Verifying contract...
Successfully submitted source code for contract
Contract verified!
https://testnet.arcscan.io/address/0xYourContractAddress#code
```

**Benefits of Verification:**
- Users can read contract source code
- Better transparency and trust
- Easier debugging
- Explorer shows function names and parameters

---

## Troubleshooting

### Issue: "Insufficient funds for gas"

**Cause:** Not enough USDC for gas fees

**Solution:**
```bash
# Check your balance
npx hardhat run scripts/check-network.js --network arcTestnet

# Get more USDC from Arc L1 testnet faucet
```

### Issue: "Invalid private key"

**Cause:** Private key format incorrect in `.env`

**Solution:**
- Remove `0x` prefix from private key
- Ensure no spaces or quotes
- Use 64 character hex string

### Issue: "Network connection timeout"

**Cause:** RPC endpoint not responding

**Solution:**
```bash
# Try alternate RPC (if available)
ARC_RPC_URL=https://alternate-rpc.arc.network

# Or check Arc L1 status page
```

### Issue: "Contract deployment failed"

**Cause:** Various reasons (gas, network, etc.)

**Solution:**
1. Check gas balance: `npx hardhat run scripts/check-network.js --network arcTestnet`
2. Verify network connection
3. Try deploying again (idempotent)
4. Check transaction hash on explorer for details

### Issue: "Cannot find module"

**Cause:** Dependencies not installed

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Contract verification fails

**Cause:** Wrong constructor arguments or compiler settings

**Solution:**
```bash
# Verify with exact constructor args and compiler version
npx hardhat verify --network arcTestnet \
  --contract contracts/PairXEscrow.sol:PairXEscrow \
  --constructor-args arguments.js \
  0xYourContractAddress
```

Create `arguments.js`:
```javascript
module.exports = [
  "0xYourOwnerAddress" // initialOwner parameter
];
```

---

## Deployment Checklist

Before deploying to Arc L1 Testnet:

- [x] `.env` file configured with private key
- [x] Wallet has sufficient USDC (at least 1 USDC)
- [x] Network connection verified (`check-network.js`)
- [x] All tests passing (`npx hardhat test`)
- [x] Contract compiles successfully
- [x] Local deployment tested
- [x] Backup of private key stored securely
- [x] Owner address verified

After deployment:

- [x] Contract address saved
- [x] Deployment tested (via `verify-deployment-tx.js`)
- [ ] Contract verified on explorer (Next: Task 2.2.1)
- [x] Contract state verified (owner, version, etc.)
- [x] Document deployment details (address, tx hash, date)

## ✅ Current Deployment Status

**Task 2.1.2 - Arc L1 Testnet Deployment: COMPLETED**

**Deployed Contract Details:**
- **Address:** `0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7`
- **Transaction:** `0x78a7f2141f399e45423bf90b8e0552c1ce07a7d11744da190420d3b46bc6822a`
- **Block:** 25462060
- **Date:** February 5, 2026
- **Gas Cost:** 0.0329 USDC
- **Status:** ✅ Verified and operational

**View on Explorer:**
- Contract: https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7
- Verified Code: https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7#code
- Transaction: https://testnet.arcscan.app/tx/0x78a7f2141f399e45423bf90b8e0552c1ce07a7d11744da190420d3b46bc6822a

**Verification Details:**
See `TASK_2.1.2_VERIFICATION.md` for complete verification report.

---

## Useful Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Check network
npx hardhat run scripts/check-network.js --network arcTestnet

# Deploy to testnet
npx hardhat run scripts/deploy.js --network arcTestnet

# Test deployment
CONTRACT_ADDRESS=0x... npx hardhat run scripts/test-deployment.js --network arcTestnet

# Verify contract
npx hardhat verify --network arcTestnet 0xAddress "0xOwner"

# Open console
npx hardhat console --network arcTestnet

# Check gas reporter
REPORT_GAS=true npx hardhat test
```

---

## Next Steps After Deployment

1. **Frontend Integration**: Integrate contract with Next.js frontend (Phase 3)
2. **ENS Integration**: Add ENS name resolution (Phase 4)
3. **Create Trades**: Test creating real P2P trades
4. **Monitor Activity**: Watch for events and transactions
5. **Gather Feedback**: Get user testing feedback

---

## Support & Resources

- **Arc L1 Documentation**: [docs.arc.network]
- **Arc L1 Testnet Explorer**: https://testnet.arcscan.io
- **Hardhat Documentation**: https://hardhat.org/docs
- **PairX GitHub**: [Your repo URL]

---

## Security Notes

⚠️ **CRITICAL SECURITY REMINDERS:**

1. **Never share private keys**
2. **Keep `.env` out of git** (in `.gitignore`)
3. **Use separate wallets for testnet/mainnet**
4. **Verify contract addresses before interactions**
5. **Test thoroughly on testnet first**
6. **Consider multi-sig for production owner**
7. **Have contracts audited before mainnet**
8. **Monitor contract for unusual activity**

---

**Last Updated:** February 2026  
**Contract Version:** 1.0.0  
**Network:** Arc L1 Testnet (Chain ID: 5042002)
