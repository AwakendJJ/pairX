# PairX Deployment Quick Reference

## 🚀 Live Deployment - Arc L1 Testnet

### Contract Information

| Property | Value |
|----------|-------|
| **Contract Name** | PairXEscrow |
| **Network** | Arc L1 Testnet |
| **Chain ID** | 5042002 |
| **Contract Address** | `0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7` |
| **Owner** | `0x50b96483A8e20e3636EEaEB37a2fA02B1aF2C51d` |
| **Version** | 1.0.0 |
| **Status** | ✅ Active |

### Deployment Transaction

| Property | Value |
|----------|-------|
| **Transaction Hash** | `0x78a7f2141f399e45423bf90b8e0552c1ce07a7d11744da190420d3b46bc6822a` |
| **Block Number** | 25462060 |
| **Deployment Date** | February 5, 2026 |
| **Gas Used** | 1,646,171 |
| **Gas Cost** | 0.0329 USDC |

### Explorer Links

- **Contract:** https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7
- **Verified Code:** https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7#code
- **Transaction:** https://testnet.arcscan.app/tx/0x78a7f2141f399e45423bf90b8e0552c1ce07a7d11744da190420d3b46bc6822a

## 🔧 Interact with Contract

### Via Hardhat Console

```bash
npx hardhat console --network arcTestnet
```

```javascript
const contract = await ethers.getContractAt(
  "PairXEscrow", 
  "0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7"
);

// Read contract state
await contract.VERSION();           // "1.0.0"
await contract.owner();             // Owner address
await contract.nextTradeId();       // Current trade ID counter
await contract.TIMEOUT_DURATION();  // 86400 (24 hours)
await contract.paused();            // false

// Get reputation
await contract.getReputation("0xYourAddress");

// Create trade (requires USDC value)
await contract.createTrade(
  "Bank Transfer", 
  "Details here", 
  { value: ethers.parseEther("100") }
);
```

### Via Frontend (Wagmi/Viem)

```typescript
const contractAddress = "0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7";

// Import ABI from artifacts
import PairXEscrowABI from "./artifacts/contracts/PairXEscrow.sol/PairXEscrow.json";

// Use with wagmi hooks
const { data } = useReadContract({
  address: contractAddress,
  abi: PairXEscrowABI.abi,
  functionName: "getReputation",
  args: [userAddress],
});
```

## 📋 Next Tasks

According to the implementation plan:

### ✅ Completed
- [x] Task 2.1.1: Create deployment script
- [x] Task 2.1.2: Deploy to Arc L1 Testnet

### 🔄 Next Up
- [ ] **Task 2.2.1**: Verify contract on Arc L1 Explorer
  ```bash
  npx hardhat verify --network arcTestnet \
    0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7 \
    "0x50b96483A8e20e3636EEaEB37a2fA02B1aF2C51d"
  ```

- [ ] **Task 2.3.1**: Smoke test on testnet
  - Create test trade with real USDC
  - Accept trade from second wallet
  - Complete full flow

## 🔐 Contract Functions

### User Functions

| Function | Parameters | Description |
|----------|-----------|-------------|
| `createTrade` | `paymentMethod`, `paymentDetails`, `{value}` | Create new trade (seller) |
| `acceptTrade` | `tradeId` | Accept open trade (buyer) |
| `markAsPaid` | `tradeId` | Mark payment sent (buyer) |
| `release` | `tradeId` | Release USDC to buyer (seller) |
| `cancel` | `tradeId` | Cancel trade (seller, OPEN only) |
| `getReputation` | `user` | Get completed trade count |
| `getTrade` | `tradeId` | Get trade details |

### Admin Functions

| Function | Description |
|----------|-------------|
| `pause` | Pause contract (emergency) |
| `unpause` | Unpause contract |
| `resolveDispute` | Resolve disputed trade |

## 📊 Contract State

Current state (as of deployment):

- **Next Trade ID:** 1 (no trades yet)
- **Contract Balance:** 0 USDC
- **Paused:** false (active)
- **Total Trades:** 0

## 🧪 Testing Commands

```bash
# Check network connection
npx hardhat run scripts/check-network.js --network arcTestnet

# Verify deployment
npx hardhat run scripts/verify-deployment-tx.js --network arcTestnet

# Run full test suite
npx hardhat test

# Gas reporting
REPORT_GAS=true npx hardhat test
```

## 🌐 Network Configuration

Add to MetaMask or other wallet:

| Field | Value |
|-------|-------|
| **Network Name** | Arc L1 Testnet |
| **RPC URL** | https://arc-testnet.drpc.org |
| **Chain ID** | 5042002 |
| **Currency Symbol** | USDC |
| **Block Explorer** | https://testnet.arcscan.io |

## 📚 Documentation

- **Full Verification:** `TASK_2.1.2_VERIFICATION.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Implementation Tasks:** Referenced in plan files
- **PRD:** Referenced in plan files

## ⚠️ Important Notes

1. **Gas Token:** Arc L1 uses USDC for gas, NOT ETH
2. **Decimals:** USDC has 18 decimals on Arc (not standard 6)
3. **msg.value:** Represents USDC amount, not ETH
4. **System Contract:** `0x3600000000000000000000000000000000000000`

---

**Last Updated:** February 5, 2026  
**Status:** ✅ Deployed and Verified  
**Next Task:** 2.2.1 - Contract Verification on Explorer
