# SubOne — Product Specification & Pitch Deck Narrative

**Version:** 1.0 — September 2026  
**Tagline:** *Receive international payments in under 1 minute, under 1% fee.*

---

## 1. Problem Statement

Vietnamese freelancers working with international clients face a broken payment stack:

| Method | Time to receive | Fee | Pain points |
|---|---|---|---|
| SWIFT / bank wire | 3–5 business days | 3–8% | Compliance holds, correspondent bank cuts |
| Payoneer | 1–3 days | 2–3% + FX spread | Account approval takes weeks, funds locked |
| Wise | 1–2 days | 0.5–2% | Requires verified recipient bank, limited VN coverage |
| Crypto (self-custody) | Minutes | <1% | Too complex for non-technical clients and freelancers |

**The gap:** There is no tool that lets an international client pay a Vietnamese freelancer directly, instantly, cheaply, and with built-in dispute protection — without either party needing a bank account, a CEX account, or technical crypto knowledge.

---

## 2. What SubOne Is

SubOne is a **USDC payment wallet** built for cross-continental freelance work. It runs on **Arc Chain** and uses a **smart contract escrow** to give both client and freelancer trustless protection.

- The **freelancer** creates a wallet with one click, generates a payment request link (with name, amount, and job description), and shares it with their client.
- The **client** opens the link, connects their wallet (MetaMask, WalletConnect, Coinbase Wallet), and deposits USDC into an escrow contract.
- The **freelancer** completes the work, marks it done, and USDC is released to their wallet — confirmed on-chain in under 1 second.
- If there is a dispute, either party can escalate to an arbiter. If neither acts, funds auto-release after a set window (default 30 days).

No CEX. No bank. No SWIFT. No waiting.

---

## 3. Arc Chain Technologies Used

SubOne uses Arc Chain as its primary infrastructure layer. Every technology below was chosen deliberately for the product's core value proposition.

### 3.1 USDC as Native Gas Token

Arc Chain is unique: **USDC is the native gas token**. On every other chain (Ethereum, Base, Polygon), you need ETH/MATIC to pay gas — a separate asset the freelancer must acquire before they can receive or send anything.

On Arc, the freelancer only needs USDC. Gas fees are paid in USDC automatically. There is no "you need 0.001 ETH to start" onboarding friction.

**Impact on SubOne:** A freelancer who receives their first USDC payment can immediately send it, approve escrow contracts, or pay out — without ever buying a gas token.

### 3.2 Sub-Second Finality

Arc Chain confirms transactions in **under 1 second** with finality. Ethereum: ~12 seconds per block, 2–3 minutes for safe finality. Polygon: ~2 seconds. Base: ~2 seconds.

**Impact on SubOne:** When a client deposits USDC into escrow, the freelancer sees it confirmed in under a second. When USDC is released from escrow, the freelancer sees their balance update immediately. The "payment sent" moment feels instant — as fast as a Venmo notification, not a bank wire.

### 3.3 Predictable, Stable Fees

Because USDC is the gas token, Arc fees are denominated in USDC — a stable asset. On Ethereum, gas costs fluctuate wildly with ETH price and network congestion. On Arc, a $100 USDC payment costs a predictable fraction of a cent in gas regardless of market conditions.

**Impact on SubOne:** Freelancers and clients can calculate their net payment precisely. The UI shows "Fee: ~$0.50 (0.5%)" and that number is accurate. No surprises.

### 3.4 SubOneEscrow Smart Contract (deployed on Arc Testnet)

Address: `0x2fcb5f8c35bd16cb26c151f2ede8020683d5f3f5`

A custom escrow contract written specifically for freelance work with the following properties:

- **Job lifecycle:** Active → Completed → Released / Disputed / Refunded
- **Per-job fee snapshot:** fee (default 0.5%, max 2%) is locked at job creation — not changeable mid-job
- **Auto-release:** if neither party acts within the agreed window, any address can trigger auto-release to the freelancer
- **Dispute window:** closes at `autoReleaseAt` — prevents disputes being opened on already-auto-released funds
- **Arbiter resolution:** a designated arbiter (initially the platform wallet, upgradeable to a multisig or DAO) can resolve disputes
- **Emergency resolve:** for funds locked after timeout, arbiter can force-resolve in either direction
- **No custodian:** SubOne itself cannot touch funds. Only the contract logic determines fund movement.

This contract underwent **3 rounds of security review** before deployment, with 5 Critical/High findings fixed.

### 3.5 Arc Testnet RPC and Block Explorer

SubOne reads on-chain state (balance, job list, transaction history) directly from Arc Testnet RPC (`https://rpc.testnet.arc.io`) using `viem` public client. All transaction links point to `https://explorer.testnet.arc.io`.

---

## 4. How SubOne Helps Cross-Continental Freelancers

### The Freelancer (Vietnam side)

1. Opens SubOne, connects MetaMask wallet in 10 seconds.
2. Taps "Receive" — enters amount ($500 USDC) and job description ("UI design, 3 screens").
3. Gets a payment link: `subone://pay?to=0xABC...&amount=500&note=UI+design`
4. Sends link to client over Telegram / email / Upwork.
5. When client pays, freelancer sees USDC in wallet in under 1 second.
6. Marks job complete. USDC released. Done.

Total time from "client sends payment" to "freelancer has funds": **under 1 minute**.  
Total fee: **0.5%** (vs. 3–8% for SWIFT, 2–3% for Payoneer).

### The Client (international side)

1. Clicks payment link.
2. Connects their existing MetaMask or Coinbase Wallet — no new account needed.
3. Approves USDC + creates escrow in 2 transactions (Arc confirms each in <1s).
4. Funds sit in trustless escrow — client can open a dispute if work is not delivered.
5. Once freelancer marks complete, client releases funds with one tap.

The client does not need to know what Arc is. They just need USDC in a wallet they already have.

---

## 5. Competitive Differentiation

| Feature | SubOne | Payoneer | Wise | Upwork | Request Network |
|---|---|---|---|---|---|
| Settlement time | **<1 minute** | 1–3 days | 1–2 days | 5–7 days | Minutes (manual) |
| Fee | **0.5%** | 2–3% | 0.5–2% | 20% | Gas only |
| Escrow / dispute | **On-chain, trustless** | None | None | Custodial (Upwork holds) | Manual, no arbiter |
| No bank account needed | **Yes** | No | No | No | Yes |
| No CEX needed | **Yes** | No | No | No | Yes |
| USDC as gas (no ETH) | **Yes (Arc)** | N/A | N/A | N/A | No |
| Sub-second confirmation | **Yes (Arc)** | No | No | No | Depends on chain |
| Payment request link | **Yes** | Yes | Yes | No | Partial |
| Vietnamese bank offramp | **Via MIMO sandbox** | Direct | Direct | No | No |

### Key differentiators in one sentence each:

**vs. Payoneer / Wise:** SubOne settles in seconds, not days, at a fraction of the fee — and does not require the freelancer to have a verified bank account.

**vs. Upwork:** Upwork takes 20% and holds funds. SubOne holds 0.5% and the smart contract holds the rest — neither SubOne nor anyone else can access it.

**vs. Request Network / other crypto invoicing:** Those tools require the client to know which chain to use, buy gas, and understand crypto UX. SubOne abstracts all of that: USDC on Arc, gas is USDC, link-based payment flow.

**vs. raw MetaMask USDC transfer:** No dispute protection. No payment request link with job description. No escrow. One wrong address = funds gone forever. SubOne adds all of this.

---

## 6. Regulatory Context (Vietnam)

SubOne operates in alignment with **Nghị quyết 05/2025/NQ-CP** — Vietnam's regulatory sandbox framework for fintech and blockchain applications. The off-ramp path to VND uses **Dragon Lab's MIMO** service, which holds sandbox license **GP 1724/GP-SKHCN** issued by the Da Nang Department of Science & Technology, valid until 17/12/2028. MIMO is non-custodial, uses VNPT AI for eKYC, and requires physical presence at approved locations in Da Nang.

SubOne itself does not hold, exchange, or transmit Vietnamese Dong. It is a USDC payment tool. The VND conversion is a separate, complementary service.

---

## 7. Technical Stack Summary

| Layer | Technology |
|---|---|
| Blockchain | Arc Chain (Testnet, Chain ID 5042002) |
| Smart contract | Solidity 0.8, OpenZeppelin, deployed via Circle SCP |
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Wallet connection | wagmi v2 + ConnectKit (MetaMask, WalletConnect, Coinbase) |
| On-chain reads | viem public client, wagmi useReadContract |
| USDC | ERC-20 at `0x3600000000000000000000000000000000000000` (6 decimals, also native gas at 18 decimals) |
| i18n | Custom React context, EN/VI, localStorage persistence |
| Theme | Dark/Light mode, CSS custom properties, localStorage persistence |
| QR codes | qrcode.react |
| Icons | lucide-react, @web3icons/react |

---

## 8. Roadmap

**MVP (current):** Wallet, send/receive USDC, escrow contract, payment request link, VND offramp guidance, EN/VI, dark/light mode.

**V1.1:** Passkey / biometric login (Circle Modular Wallets) — replaces MetaMask dependency for mobile-first users.

**V1.2:** Payment request link as a hosted page (`subone.app/pay/0xABC`) — client opens in any browser, no app needed.

**V1.3:** Direct MIMO API integration — one-tap VND withdrawal from within SubOne.

**V2.0:** Multi-currency escrow (EURC), DAO arbiter, reputation system, invoice PDF with digital signature.

---

*SubOne is built on Arc Chain — the first blockchain where USDC is the native gas token. Every design decision in SubOne exists because of what Arc makes possible: instant finality, stable fees, and a single-asset UX.*
