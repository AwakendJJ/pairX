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

---

### Phase 3: Frontend Integration ✅ COMPLETE

**Status:** ✅ All Tasks Completed (February 5, 2026)

**Frontend URL:** http://localhost:3000

**Completed Tasks:**
- ✅ Task 3.1: Next.js Project Setup (TypeScript + TailwindCSS)
- ✅ Task 3.2: Contract Integration (Wagmi + type generation)
- ✅ Task 3.3: Trade Room Interface (5 components)
- ✅ Task 3.4: Trade List View with filters
- ✅ Task 3.5: Create Trade Flow with validation

**Key Features:**
- Wallet connection (RainbowKit + MetaMask)
- Type-safe contract hooks
- Trade creation with USDC validation
- Browse all trades with state/role filters
- Individual trade rooms with full lifecycle
- Real-time transaction feedback
- Responsive design + dark mode

**Verification Documents:**
- `TASK_3.1.1_VERIFICATION.md`, `TASK_3.1.2_VERIFICATION.md` - Project setup
- `TASK_3.2.1_VERIFICATION.md`, `TASK_3.2.2_VERIFICATION.md` - Contract integration
- `TASK_3.3_VERIFICATION.md` - Trade Room (5 components)
- `TASK_3.4_VERIFICATION.md` - Trade listing
- `TASK_3.5_VERIFICATION.md` - Create trade flow
- `PHASE_3_COMPLETE.md` - Complete Phase 3 summary

---

### Phase 4: ENS/Identity Layer ✅ COMPLETE

**Status:** ✅ All Tasks Completed (February 6, 2026)

**Completed Tasks:**
- ✅ Task 4.1: ENS Resolution Setup (mainnet integration)
- ✅ Task 4.2: ENS Integration in UI (names + avatars)
- ✅ Task 4.3: Enhanced Reputation Display (4-tier system)

**Key Features:**
- ENS name resolution (e.g., "vitalik.eth")
- ENS avatar display with fallback
- 4-tier reputation system:
  - New Trader (0-9 trades) - Gray
  - Trusted (10-49 trades) - Yellow ⭐
  - Veteran (50-99 trades) - Orange ⭐⭐
  - Elite (100+ trades) - Purple ⭐⭐⭐
- Visual progress bars to next level
- Color-coded badges
- ENS throughout the app (trade rooms, listings)

**Verification Documents:**
- `TASK_4_VERIFICATION.md` - Complete ENS integration verification
- `PHASE_4_COMPLETE.md` - Complete Phase 4 summary

---

## 🎊 Project Status: ALL PHASES COMPLETE!

✅ **Phase 1:** Smart Contract Development  
✅ **Phase 2:** Arc L1 Deployment & Verification  
✅ **Phase 3:** Frontend Integration  
✅ **Phase 4:** ENS/Identity Layer  

**PairX is now production-ready for Arc L1 Testnet!** 🚀

## 📁 Project Structure

```
pairx/
├── contracts/              # Solidity smart contracts
│   └── PairXEscrow.sol    # Main escrow contract
├── scripts/               # Deployment and utility scripts
│   ├── deploy.js          # Deployment script
│   └── smoke-test.js      # Testing script
├── test/                  # Contract tests
├── frontend/              # Next.js frontend application
│   ├── app/               # Next.js 15 App Router
│   │   ├── trade/[id]/    # Trade room pages
│   │   ├── trades/        # Trade listing page
│   │   ├── create/        # Create trade page
│   │   └── page.tsx       # Homepage
│   ├── components/        # React components
│   │   ├── ParticipantCard.tsx
│   │   ├── TradeCard.tsx
│   │   ├── ActionPanel.tsx
│   │   ├── ActivityLog.tsx
│   │   └── CreateTradeForm.tsx
│   ├── lib/               # Utilities & config
│   │   ├── wagmi.ts       # Wagmi + Arc L1 config
│   │   └── generated.ts   # Auto-generated contract hooks
│   └── hooks/             # Custom React hooks
│       └── usePairXContract.ts
├── hardhat.config.js      # Hardhat configuration (Arc L1 setup)
├── .deployment-info.json  # Deployed contract info
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
