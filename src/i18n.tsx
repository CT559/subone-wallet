/**
 * i18n — EN / VI language context + dark mode context.
 * ALL user-visible strings live here. Components call useT(key).
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export const translations = {
  vi: {
    // Landing
    tagline: 'Nhận thanh toán quốc tế bằng USDC',
    feat1: 'Xác nhận dưới 1 giây trên Arc Chain',
    feat2: 'Phí dưới 1% — phí tính bằng USDC, không cần ETH',
    feat3: 'Smart contract escrow — không ai giữ tiền của bạn',
    connectWallet: 'Kết nối ví',
    walletSupport: 'Hỗ trợ MetaMask · WalletConnect · Coinbase Wallet',
    // Header / wallet
    myWallet: 'Ví SubOne',
    balance: 'SỐ DƯ USDC',
    arcInfo: 'Arc Testnet · Phí <0.5% · Xác nhận <1s',
    receive: 'Nhận',
    send: 'Gửi',
    offRamp: 'Rút VND',
    escrow: 'Escrow',
    history: 'Lịch sử',
    disconnect: 'Ngắt kết nối',
    // TxHistory
    noTx: 'Chưa có giao dịch nào',
    noTxHint: 'Bấm "Nhận" để tạo payment request gửi cho client',
    txIn: 'Nhận từ',
    txOut: 'Gửi đến',
    // SendSheet
    sendTitle: 'Gửi USDC',
    sendAmountLabel: 'SỐ TIỀN USDC',
    sendBalanceLabel: 'Số dư:',
    sendMax: 'Tối đa',
    sendRecipient: 'Địa chỉ nhận (0x...)',
    sendFeeLabel: 'Phí ước tính (~0.5%)',
    sendButton: 'Gửi',
    sendPending: 'Chờ xác nhận trong ví...',
    sendConfirming: 'Đang xử lý giao dịch...',
    sendArcHint: 'Arc Chain xác nhận dưới 1 giây',
    sendSuccess: 'Giao dịch thành công!',
    sendSuccessHint: 'Đã gửi',
    sendViewExplorer: 'Xem trên ArcScan',
    sendClose: 'Đóng',
    sendInvalidAddr: 'Địa chỉ không hợp lệ',
    sendNoUsdc: 'Không tìm thấy hợp đồng USDC',
    // ReceiveSheet
    receiveTitle: 'Nhận USDC',
    receiveSubtitle: 'Gửi link hoặc QR cho client',
    receiveAddrLabel: 'ĐỊA CHỈ VÍ · ARC TESTNET',
    receiveRequestLabel: 'TẠO PAYMENT REQUEST',
    receiveAmountPlaceholder: 'Số tiền USDC (không bắt buộc)',
    receiveNotePlaceholder: 'Mô tả công việc (không bắt buộc)',
    receiveCopyLink: 'Sao chép Payment Link',
    receiveCopied: 'Đã sao chép link!',
    // OffRampSheet
    offRampTitle: 'Rút về VND',
    offRampSubtitle: 'Qua Dragon Lab – MIMO sandbox',
    offRampStepsLabel: 'CÁCH THỰC HIỆN',
    offRampStep1: 'Gửi USDC từ SubOne lên Binance / OKX (rút về ví trên Polygon hoặc BSC)',
    offRampStep2: 'Trên sàn: đổi USDC → USDT (nếu cần), rút USDT về ví Polygon/BSC',
    offRampStep3: 'Mở app MIMO → chọn "Bán USDT" → nhận VND vào ngân hàng (~5–15 phút)',
    offRampMimoSandbox: 'Sandbox được cấp phép · Non-custodial · eKYC VNPT AI',
    offRampFeeLabel: 'Phí',
    offRampTimeLabel: 'Thời gian',
    offRampTimeValue: '5–15 phút',
    offRampInvoiceLabel: 'Hóa đơn',
    offRampInvoiceValue: 'VAT điện tử',
    offRampLicense: 'Giấy phép sandbox: GP 1724/GP-SKHCN · Sở KH&CN Đà Nẵng · Hiệu lực đến 17/12/2028 · Nghị quyết 05/2025/NQ-CP',
    offRampGpsTitle: 'Yêu cầu: có mặt tại một trong 3 địa điểm',
    offRampLoc1: 'Công viên phần mềm số 1 – 02 Quang Trung, Hải Châu, Đà Nẵng',
    offRampLoc2: 'Công viên phần mềm số 2 – Đường Như Nguyệt, Hải Châu, Đà Nẵng',
    offRampLoc3: 'Trung tâm Khởi nghiệp ĐMST – 58 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng',
    offRampBanksLabel: 'NGÂN HÀNG HỖ TRỢ',
    // EscrowDashboard
    escrowAvailable: 'USDC khả dụng',
    escrowCreateJob: 'Tạo Job',
    escrowTabReceive: 'Tôi nhận tiền',
    escrowTabPay: 'Tôi trả tiền',
    escrowEmptyFreelancer: 'Chưa có job nào cần nhận tiền',
    escrowEmptyClient: 'Chưa có job nào đang trả tiền',
    escrowEmptyHintFreelancer: 'Client tạo job và gửi USDC vào escrow, bạn sẽ thấy ở đây',
    escrowEmptyHintClient: 'Bấm "Tạo Job" để tạo escrow USDC cho freelancer',
    escrowDirIn: 'Nhận',
    escrowDirOut: 'Gửi',
    // CreateJobSheet
    createJobTitle: 'Tạo job mới',
    createJobSubtitle: 'Escrow USDC trên Arc · phí 0.5%',
    createJobFieldFreelancer: 'Địa chỉ ví freelancer',
    createJobFieldAmount: 'Số tiền (USDC)',
    createJobFieldDesc: 'Mô tả công việc',
    createJobDescPlaceholder: 'Ví dụ: Design UI cho landing page, 3 màn hình',
    createJobFieldAutoRelease: 'Tự động release sau (ngày)',
    createJobAutoReleaseHint: 'Nếu client không release sau {n} ngày, bất kỳ ai cũng có thể kích hoạt auto-release.',
    createJobPreviewEscrow: 'Số tiền escrow',
    createJobPreviewFee: 'Phí nền tảng (0.5%)',
    createJobPreviewNet: 'Freelancer nhận',
    createJobWrongChain: 'Vui lòng chuyển sang Arc Testnet để tiếp tục.',
    createJobSubmit: 'Approve USDC & Tạo job',
    createJobSwitchChain: 'Chuyển sang Arc Testnet',
    createJobTxNote: 'Gồm 2 giao dịch: approve USDC cho contract, sau đó tạo job escrow.',
    createJobStep1Label: '1. Approve USDC',
    createJobStep1Desc: 'Cho phép contract giữ {n} USDC',
    createJobStep2Label: '2. Tạo job escrow',
    createJobStep2Desc: 'Khóa USDC vào contract, job bắt đầu',
    createJobWalletConfirm: 'Xác nhận trong ví MetaMask…',
    createJobArcConfirm: 'Đang xác nhận trên Arc…',
    createJobSuccessTitle: 'Job đã tạo thành công',
    createJobSuccessDesc: 'USDC đã được khóa trong escrow. Freelancer có thể bắt đầu làm việc ngay.',
    createJobViewTx: 'Xem giao dịch trên ArcScan',
    createJobViewJob: 'Xem job vừa tạo',
    createJobBalance: 'Số dư:',
    // JobDetailSheet
    jobNoDesc: 'Không có mô tả',
    jobCreatedAt: 'Tạo lúc',
    jobAutoRelease: 'Auto-release',
    jobAutoReleaseReady: '(sẵn sàng)',
    jobTxConfirmed: 'Giao dịch đã xác nhận · Xem trên ArcScan',
    jobErrRejected: 'Giao dịch bị hủy.',
    jobErrDisputeClosed: 'Cửa sổ tranh chấp đã đóng (đã qua auto-release).',
    jobErrAutoReleaseNotReady: 'Chưa đến thời gian auto-release.',
    jobErrGeneric: 'Giao dịch thất bại. Vui lòng thử lại.',
    jobReleased: 'Đã giải phóng (Released)',
    jobRefunded: 'Đã hoàn tiền (Refunded)',
    jobActionMarkComplete: 'Xác nhận hoàn thành',
    jobActionRelease: 'Release tiền cho Freelancer',
    jobActionAutoRelease: 'Auto-release',
    jobActionAutoReleaseReady: '(sẵn sàng)',
    jobActionAutoReleaseNotReady: '(chưa đến hạn)',
    jobActionDispute: 'Mở tranh chấp',
    jobBusyWallet: 'Xác nhận trong ví…',
    jobBusyArc: 'Đang xác nhận trên Arc…',
    jobWrongChain: 'Cần chuyển sang Arc Testnet để thực hiện.',
    jobSecurityNote: 'Tiền được giữ bởi SubOne Escrow Contract trên Arc Chain — không ai (kể cả SubOne) có thể lấy tiền mà không có hành động của bạn.',
    jobFreelancerNet: 'Freelancer nhận',
    jobPlatformFee: 'Phí nền tảng',
    jobYou: 'Bạn',
  },

  en: {
    // Landing
    tagline: 'Receive international payments in USDC',
    feat1: 'Confirmed in under 1 second on Arc Chain',
    feat2: 'Under 1% fee — paid in USDC, no ETH needed',
    feat3: 'Smart contract escrow — no one holds your funds',
    connectWallet: 'Connect Wallet',
    walletSupport: 'Supports MetaMask · WalletConnect · Coinbase Wallet',
    // Header / wallet
    myWallet: 'SubOne Wallet',
    balance: 'USDC BALANCE',
    arcInfo: 'Arc Testnet · Fee <0.5% · Confirmed <1s',
    receive: 'Receive',
    send: 'Send',
    offRamp: 'Cash Out',
    escrow: 'Escrow',
    history: 'History',
    disconnect: 'Disconnect',
    // TxHistory
    noTx: 'No transactions yet',
    noTxHint: 'Tap "Receive" to create a payment request for your client',
    txIn: 'Received from',
    txOut: 'Sent to',
    // SendSheet
    sendTitle: 'Send USDC',
    sendAmountLabel: 'USDC AMOUNT',
    sendBalanceLabel: 'Balance:',
    sendMax: 'Max',
    sendRecipient: 'Recipient address (0x...)',
    sendFeeLabel: 'Estimated fee (~0.5%)',
    sendButton: 'Send',
    sendPending: 'Waiting for wallet confirmation...',
    sendConfirming: 'Processing transaction...',
    sendArcHint: 'Arc Chain confirms in under 1 second',
    sendSuccess: 'Transaction successful!',
    sendSuccessHint: 'Sent',
    sendViewExplorer: 'View on ArcScan',
    sendClose: 'Close',
    sendInvalidAddr: 'Invalid address',
    sendNoUsdc: 'USDC contract not found',
    // ReceiveSheet
    receiveTitle: 'Receive USDC',
    receiveSubtitle: 'Share link or QR with your client',
    receiveAddrLabel: 'WALLET ADDRESS · ARC TESTNET',
    receiveRequestLabel: 'CREATE PAYMENT REQUEST',
    receiveAmountPlaceholder: 'USDC amount (optional)',
    receiveNotePlaceholder: 'Job description (optional)',
    receiveCopyLink: 'Copy Payment Link',
    receiveCopied: 'Link copied!',
    // OffRampSheet
    offRampTitle: 'Cash Out to VND',
    offRampSubtitle: 'Via Dragon Lab – MIMO sandbox',
    offRampStepsLabel: 'HOW TO DO IT',
    offRampStep1: 'Send USDC from SubOne to Binance / OKX (withdraw to your Polygon or BSC wallet)',
    offRampStep2: 'On the exchange: swap USDC → USDT if needed, withdraw USDT to Polygon/BSC wallet',
    offRampStep3: 'Open MIMO app → tap "Sell USDT" → receive VND to your bank account (~5–15 min)',
    offRampMimoSandbox: 'Licensed sandbox · Non-custodial · eKYC VNPT AI',
    offRampFeeLabel: 'Fee',
    offRampTimeLabel: 'Time',
    offRampTimeValue: '5–15 min',
    offRampInvoiceLabel: 'Invoice',
    offRampInvoiceValue: 'E-VAT receipt',
    offRampLicense: 'Sandbox license: GP 1724/GP-SKHCN · Da Nang Dept. of Science & Technology · Valid until 17/12/2028 · Resolution 05/2025/NQ-CP',
    offRampGpsTitle: 'Required: be present at one of 3 locations',
    offRampLoc1: 'Software Park No.1 – 02 Quang Trung, Hai Chau, Da Nang',
    offRampLoc2: 'Software Park No.2 – Nhu Nguyet St., Hai Chau, Da Nang',
    offRampLoc3: 'Innovation Startup Center – 58 Nguyen Chi Thanh, Hai Chau, Da Nang',
    offRampBanksLabel: 'SUPPORTED BANKS',
    // EscrowDashboard
    escrowAvailable: 'available',
    escrowCreateJob: 'New Job',
    escrowTabReceive: 'I get paid',
    escrowTabPay: 'I pay out',
    escrowEmptyFreelancer: 'No jobs awaiting payment',
    escrowEmptyClient: 'No active jobs',
    escrowEmptyHintFreelancer: 'When a client creates a job and deposits USDC, it will appear here',
    escrowEmptyHintClient: 'Tap "New Job" to create a USDC escrow for a freelancer',
    escrowDirIn: 'Receive',
    escrowDirOut: 'Send',
    // CreateJobSheet
    createJobTitle: 'New job',
    createJobSubtitle: 'USDC escrow on Arc · 0.5% fee',
    createJobFieldFreelancer: 'Freelancer wallet address',
    createJobFieldAmount: 'Amount (USDC)',
    createJobFieldDesc: 'Job description',
    createJobDescPlaceholder: 'e.g. Landing page UI design, 3 screens',
    createJobFieldAutoRelease: 'Auto-release after (days)',
    createJobAutoReleaseHint: 'If the client does not release after {n} days, anyone can trigger auto-release.',
    createJobPreviewEscrow: 'Escrow amount',
    createJobPreviewFee: 'Platform fee (0.5%)',
    createJobPreviewNet: 'Freelancer receives',
    createJobWrongChain: 'Please switch to Arc Testnet to continue.',
    createJobSubmit: 'Approve USDC & Create job',
    createJobSwitchChain: 'Switch to Arc Testnet',
    createJobTxNote: '2 transactions: approve USDC for the contract, then create the escrow job.',
    createJobStep1Label: '1. Approve USDC',
    createJobStep1Desc: 'Allow the contract to hold {n} USDC',
    createJobStep2Label: '2. Create escrow job',
    createJobStep2Desc: 'Lock USDC into the contract — job starts',
    createJobWalletConfirm: 'Confirm in MetaMask wallet…',
    createJobArcConfirm: 'Confirming on Arc…',
    createJobSuccessTitle: 'Job created successfully',
    createJobSuccessDesc: 'USDC is locked in escrow. The freelancer can start working right away.',
    createJobViewTx: 'View transaction on ArcScan',
    createJobViewJob: 'View new job',
    createJobBalance: 'Balance:',
    // JobDetailSheet
    jobNoDesc: 'No description',
    jobCreatedAt: 'Created',
    jobAutoRelease: 'Auto-release',
    jobAutoReleaseReady: '(ready)',
    jobTxConfirmed: 'Transaction confirmed · View on ArcScan',
    jobErrRejected: 'Transaction cancelled.',
    jobErrDisputeClosed: 'Dispute window closed (auto-release already passed).',
    jobErrAutoReleaseNotReady: 'Auto-release time has not arrived yet.',
    jobErrGeneric: 'Transaction failed. Please try again.',
    jobReleased: 'Released',
    jobRefunded: 'Refunded',
    jobActionMarkComplete: 'Mark as complete',
    jobActionRelease: 'Release funds to freelancer',
    jobActionAutoRelease: 'Auto-release',
    jobActionAutoReleaseReady: '(ready)',
    jobActionAutoReleaseNotReady: '(not yet due)',
    jobActionDispute: 'Open dispute',
    jobBusyWallet: 'Confirm in wallet…',
    jobBusyArc: 'Confirming on Arc…',
    jobWrongChain: 'Switch to Arc Testnet to proceed.',
    jobSecurityNote: 'Funds are held by the SubOne Escrow Contract on Arc Chain — no one (including SubOne) can access them without your action.',
    jobFreelancerNet: 'Freelancer receives',
    jobPlatformFee: 'Platform fee',
    jobYou: 'You',
  },
}

export type Lang = 'vi' | 'en'
export type TKeys = keyof typeof translations.vi

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'vi', setLang: () => {},
})

export function useLang() { return useContext(LangCtx) }
export function useT() {
  const { lang } = useLang()
  return (key: TKeys) => translations[lang][key]
}

const ThemeCtx = createContext<{ dark: boolean; toggle: () => void }>({
  dark: false, toggle: () => {},
})

export function useTheme() { return useContext(ThemeCtx) }

export function AppProviders({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() =>
    (localStorage.getItem('subone_lang') as Lang) ?? 'vi'
  )
  const [dark, setDark] = useState(() =>
    localStorage.getItem('subone_theme') === 'dark'
  )

  useEffect(() => {
    localStorage.setItem('subone_theme', dark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => { localStorage.setItem('subone_lang', lang) }, [lang])

  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <ThemeCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
        {children}
      </ThemeCtx.Provider>
    </LangCtx.Provider>
  )
}
