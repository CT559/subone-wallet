# SubOne — Ví USDC cho Freelancer Việt Nam

Nhận thanh toán quốc tế bằng USDC trên Arc Chain. Phí dưới 0.5%, xác nhận dưới 1 giây, không cần tài khoản ngân hàng nước ngoài.

## Tính năng

- **Ví Modular Wallet** — đăng nhập bằng Passkey (Face ID / vân tay), không cần seed phrase
- **Nhận USDC** — địa chỉ ví cố định, QR code, payment request link gửi cho client
- **Gửi USDC** — gasless via Circle Gas Station (phí tính bằng USDC, không cần ETH)
- **Escrow** — smart contract on Arc Testnet, client gửi USDC vào contract, release khi freelancer done
- **Rút VND** — hướng dẫn qua Dragon Lab MIMO (sandbox Đà Nẵng, GP 1724/GP-SKHCN)

## Chạy trên PC (Windows PowerShell)

### Yêu cầu

- Node.js 18+ hoặc [Bun](https://bun.sh) (khuyến nghị)
- Git

### Cài đặt

```powershell
# Clone hoặc giải nén project
cd subone

# Cài dependencies
bun install
# hoặc: npm install
```

### Cấu hình

Tạo file `.env` trong thư mục gốc:

```env
# Circle Modular Wallets — lấy từ console.circle.com > Keys > Client Keys
VITE_CLIENT_KEY=TEST_CLIENT_KEY:xxxxxxxxxx
VITE_CLIENT_URL=https://modular-sdk.circle.com/v1/rpc/w3s/buidl
```

**Quan trọng — Circle Console Setup:**

1. Vào [console.circle.com](https://console.circle.com) → chọn **Testnet**
2. **Keys → Client Keys** → tạo key → Allowed Domain: `localhost`
3. **Wallets → Modular Wallets → Configurator → Passkeys** → Domain Name: `localhost`
4. Paste Client Key vào `VITE_CLIENT_KEY` trong `.env`

> Lưu ý: Khi chạy local dùng `localhost` cho cả Allowed Domain và Passkey Domain.
> Khi deploy lên hosting, đổi sang domain thực của bạn.

### Chạy

```powershell
bun run dev
# hoặc: npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

### Build production

```powershell
bun run build
# hoặc: npm run build
```

## Smart Contract

`SubOneEscrow` đã được deploy tại:

- **Arc Testnet**: `0x2fcb5f8c35bd16cb26c151f2ede8020683d5f3f5`
- [Xem trên ArcScan](https://explorer.testnet.arc.io/address/0x2fcb5f8c35bd16cb26c151f2ede8020683d5f3f5)

## Tech Stack

- React 18 + Vite + TypeScript + Tailwind CSS
- Circle Modular Wallets (`@circle-fin/modular-wallets-core`)
- Arc Testnet (Chain ID: 5042002) — USDC là native gas token
- wagmi v2 + viem (cho escrow contract calls)
- Foundry (Solidity contract)

## Lưu ý pháp lý

App đang chạy trên **testnet** — không có tiền thật. Tính năng rút VND qua MIMO chỉ khả dụng trong sandbox Đà Nẵng theo GP 1724/GP-SKHCN (hiệu lực đến 17/12/2028).
