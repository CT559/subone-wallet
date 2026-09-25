# SubOne

> Built with Arc Studio — Freelancer USDC payment escrow on Arc Chain

## What This App Does

SubOne là ví USDC escrow cho freelancer Việt Nam nhận thanh toán quốc tế. Client gửi USDC trực tiếp vào smart contract (không cần CEX), freelancer confirm hoàn thành, client release. Auto-release sau timeout. Dispute resolution qua arbiter. Phí 0.5%. Chạy trên Arc Testnet — USDC là native gas token, không cần ETH.

## Deployed Contracts

| Contract         | Chain        | Address                                      | Explorer |
|------------------|--------------|----------------------------------------------|---------|
| SubOneEscrow     | Arc Testnet  | `0x2fcb5f8c35bd16cb26c151f2ede8020683d5f3f5` | [ArcScan](https://explorer.testnet.arc.io/address/0x2fcb5f8c35bd16cb26c151f2ede8020683d5f3f5) |

Constructor args:
- `arbiter`: `0x5B12Ce46C7194aD57d143bC22847224047b1Ef42` (platform deployer wallet)
- `feeRecipient`: `0x5B12Ce46C7194aD57d143bC22847224047b1Ef42`

Contract ABI + bytecode: `contracts/out/SubOneEscrow.sol/SubOneEscrow.json`
Metadata: `contracts/contract-metadata/SubOneEscrow.json`

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS
- Web3: wagmi v2, viem v2, ConnectKit
- Contracts: Solidity ^0.8.20, OpenZeppelin 5.1.0, Foundry
- Chain: Arc Testnet (Chain ID: 5042002)
- USDC: `0x3600000000000000000000000000000000000000` (6 decimals on Arc)

## Key Files

- `src/App.tsx` — Landing (disconnect) / EscrowDashboard (connected)
- `src/contracts.ts` — Contract address + ABI import + status enums
- `src/components/EscrowDashboard.tsx` — Main screen: balance, job list (freelancer/client tabs)
- `src/components/CreateJobSheet.tsx` — Client creates job (approve USDC → createJob 2-step)
- `src/components/JobDetailSheet.tsx` — Job detail + actions (markComplete, release, dispute, autoRelease)
- `contracts/SubOneEscrow.sol` — Escrow smart contract

## Job Lifecycle

```
Client calls createJob (USDC locked in contract)
    ↓ status: Active
Freelancer calls markComplete
    ↓ status: Completed
Client calls release  ←→  or auto-release after timeout
    ↓ status: Released
Freelancer receives net USDC (amount - 0.5% fee)
```

## To Run

```bash
bun install
bun run dev
```
