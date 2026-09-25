/**
 * SubOneEscrow contract config — wired to Arc Testnet deployment.
 * Address and ABI come from the Foundry artifact; never hardcode the ABI inline.
 */
import artifact from '../contracts/out/SubOneEscrow.sol/SubOneEscrow.json'

export const SUBONE_ESCROW = {
  address: '0x2fcb5f8c35bd16cb26c151f2ede8020683d5f3f5' as `0x${string}`,
  abi: artifact.abi,
} as const

export type JobStatus = 'Pending' | 'Active' | 'Completed' | 'Disputed' | 'Released' | 'Refunded'

export const JOB_STATUS_LABEL: Record<number, JobStatus> = {
  0: 'Pending',
  1: 'Active',
  2: 'Completed',
  3: 'Disputed',
  4: 'Released',
  5: 'Refunded',
}

export const JOB_STATUS_COLOR: Record<JobStatus, string> = {
  Pending:   'rgba(180,140,0,0.12)',
  Active:    'rgba(26,128,71,0.12)',
  Completed: 'rgba(59,95,192,0.12)',
  Disputed:  'rgba(200,60,40,0.12)',
  Released:  'rgba(26,128,71,0.10)',
  Refunded:  'rgba(100,100,120,0.10)',
}

export const JOB_STATUS_TEXT: Record<JobStatus, string> = {
  Pending:   '#7a5800',
  Active:    '#1a6b3c',
  Completed: '#2a4a9e',
  Disputed:  '#a03020',
  Released:  '#1a6b3c',
  Refunded:  '#555570',
}
