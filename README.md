# PairX - P2P DEX on Arc L1

PairX is a peer-to-peer decentralized exchange built on Arc L1, enabling trustless USDC trading without requiring ETH for gas fees.

## 🌟 Key Features

- **Native USDC Gas**: All transactions use USDC for gas (no ETH needed)
- **P2P Escrow**: Trustless peer-to-peer trading with smart contract escrow
- **ENS Identity**: Display ENS names, avatars, and on-chain reputation
- **State Machine**: Secure trade lifecycle (Open → Locked → Paid → Released)
- **Reputation System**: Track completed trades for all users

## 🔧 Arc L1 Network Details

- **Chain ID (Testnet)**: 5042002
- **Native Gas Token**: USDC (18 decimals)
- **USDC System Contract**: `0x3600000000000000000000000000000000000000`
- **Special Rule**: `msg.value` represents USDC amount (NOT ETH)

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Fill in your `.env` file:
   - `PRIVATE_KEY`: Your wallet private key (must have USDC for gas)
   - `ARC_RPC_URL`: Arc L1 RPC endpoint (default provided)
   - `ARC_EXPLORER_API_KEY`: For contract verification

## 🧪 Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Check Network Connection

Verify Arc L1 testnet connection:

```bash
npm run check-network
```

Or with specific network:

```bash
npx hardhat run scripts/check-network.js --network arcTestnet
```

### Deploy to Arc L1 Testnet

```bash
npm run deploy --network arcTestnet
```

## 🚀 Deployment

### Testnet Deployment - Phase 2 ✅ COMPLETE

**Status:** ✅ Deployed, Verified & Tested

**Network:** Arc L1 Testnet (Chain ID: 5042002)

**Contract Address:** [`0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7`](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7)

**Deployment Transaction:** [`0x78a7f2141f399e45423bf90b8e0552c1ce07a7d11744da190420d3b46bc6822a`](https://testnet.arcscan.app/tx/0x78a7f2141f399e45423bf90b8e0552c1ce07a7d11744da190420d3b46bc6822a)

**Verified Contract:** [View Source Code](https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7#code)

**Deployment Date:** February 5, 2026

**Gas Cost:** 0.0329 USDC

### Phase 2 Completion Status

- ✅ Task 2.1.2: Deployed to Arc L1 Testnet
- ✅ Task 2.2.1: Contract verified on Blockscout
- ✅ Task 2.3.1: Smoke tests passed (Create → Cancel flow)

**Verification Documents:**
- `TASK_2.1.2_VERIFICATION.md` - Deployment verification
- `TASK_2.2.1_VERIFICATION.md` - Source code verification
- `TASK_2.3.1_VERIFICATION.md` - Smoke test results
- `PHASE_2_COMPLETION_SUMMARY.md` - Complete Phase 2 summary

## 📁 Project Structure

```
pairx/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment and utility scripts
├── test/              # Contract tests
├── hardhat.config.ts  # Hardhat configuration (Arc L1 setup)
└── README.md
```

## 🔐 Important Security Notes

- **Never commit your `.env` file** with private keys
- Ensure your wallet has **USDC** (not ETH) for gas on Arc L1
- Test thoroughly on testnet before mainnet deployment

## 📚 Documentation

For detailed product requirements and implementation tasks, see:
- PRD: `pairx-prd.md`
- Tasks: `pairx-implementation-tasks.md`

## 🤝 Contributing

This project is under active development. Stay tuned for contribution guidelines.

## 📄 License

MIT
