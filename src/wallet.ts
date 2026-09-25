/**
 * Circle Modular Wallet singleton — passkey-based smart account on Arc Testnet.
 * Import { walletStore } and subscribe to live state throughout the app.
 */
import {
  WebAuthnMode,
  toCircleSmartAccount,
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
  encodeTransfer,
  ContractAddress,
} from '@circle-fin/modular-wallets-core'
import { createPublicClient } from 'viem'
import { arcTestnet } from 'viem/chains'
import { createBundlerClient, toWebAuthnAccount } from 'viem/account-abstraction'
import type { P256Credential, SmartAccount } from 'viem/account-abstraction'
import { parseUsdc, formatUsdc } from '@/onchain-money'
import { buildTxExplorerUrl } from '@/onchain-facts'

const ARC_CHAIN_ID = 5042002
const CRED_KEY = 'subone_passkey_credential'

const clientKey = import.meta.env.VITE_CLIENT_KEY as string
const clientUrl = import.meta.env.VITE_CLIENT_URL as string

// ── Transports ────────────────────────────────────────────────────────────────
export const passkeyTransport = toPasskeyTransport(clientUrl, clientKey)
export const modularTransport = toModularTransport(clientUrl, clientKey)

export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: modularTransport,
})

export const bundlerClient = createBundlerClient({
  chain: arcTestnet,
  transport: modularTransport,
})

// ── Credential persistence ────────────────────────────────────────────────────
export function saveCredential(cred: P256Credential) {
  localStorage.setItem(CRED_KEY, JSON.stringify(cred))
}

export function loadCredential(): P256Credential | null {
  try {
    const raw = localStorage.getItem(CRED_KEY)
    return raw ? (JSON.parse(raw) as P256Credential) : null
  } catch {
    return null
  }
}

export function clearCredential() {
  localStorage.removeItem(CRED_KEY)
}

// ── Register (new user) ───────────────────────────────────────────────────────
export async function registerPasskey(username: string): Promise<SmartAccount> {
  // Append a short unique suffix so Circle's global username registry never collides.
  // The display name shown in the UI is the raw username; this internal ID is never shown.
  const uniqueUsername = `${username.trim()}_${Date.now().toString(36)}`
  const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Register,
    username: uniqueUsername,
  })
  saveCredential(credential)
  const account = await toCircleSmartAccount({
    client: publicClient,
    owner: toWebAuthnAccount({ credential }),
    name: username,
  })
  return account
}

// ── Login (returning user) ────────────────────────────────────────────────────
export async function loginPasskey(): Promise<SmartAccount> {
  const credential = await toWebAuthnCredential({
    transport: passkeyTransport,
    mode: WebAuthnMode.Login,
  })
  saveCredential(credential)
  const account = await toCircleSmartAccount({
    client: publicClient,
    owner: toWebAuthnAccount({ credential }),
  })
  return account
}

// ── Restore session from saved credential ────────────────────────────────────
export async function restoreSession(): Promise<SmartAccount | null> {
  const credential = loadCredential()
  if (!credential) return null
  try {
    const account = await toCircleSmartAccount({
      client: publicClient,
      owner: toWebAuthnAccount({ credential }),
    })
    return account
  } catch {
    return null
  }
}

// ── Read USDC balance ─────────────────────────────────────────────────────────
export async function getUsdcBalance(address: string): Promise<string> {
  const { erc20Abi } = await import('viem')
  const raw = await publicClient.readContract({
    address: ContractAddress.ArcTestnet_USDC,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  })
  return formatUsdc(raw)
}

// ── Send USDC ─────────────────────────────────────────────────────────────────
export async function sendUsdc(
  account: SmartAccount,
  to: string,
  amountUsdc: string,
): Promise<string> {
  const amountRaw = parseUsdc(amountUsdc)
  const callData = encodeTransfer(
    to as `0x${string}`,
    ContractAddress.ArcTestnet_USDC,
    amountRaw,
  )
  const userOpHash = await bundlerClient.sendUserOperation({
    account,
    calls: [callData],
    paymaster: true,
  })
  const { receipt } = await bundlerClient.waitForUserOperationReceipt({ hash: userOpHash })
  return buildTxExplorerUrl(ARC_CHAIN_ID, receipt.transactionHash)
}
