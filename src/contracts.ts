/**
 * SubOneEscrow contract config — ABI inlined so Vercel build does not need
 * Foundry artifacts. Address is the Arc Testnet deployment.
 */

export const SUBONE_ESCROW_ABI = [
  { type: 'constructor', inputs: [{ name: 'initialArbiter', type: 'address', internalType: 'address' }, { name: 'initialFeeRecipient', type: 'address', internalType: 'address' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'BPS_DENOMINATOR', inputs: [], outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'MAX_DESCRIPTION_LENGTH', inputs: [], outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'MAX_FEE_BPS', inputs: [], outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'arbiter', inputs: [], outputs: [{ name: '', type: 'address', internalType: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'autoRelease', inputs: [{ name: 'jobId', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'autoReleasePeriod', inputs: [], outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'createJob', inputs: [{ name: 'freelancer', type: 'address', internalType: 'address' }, { name: 'amount', type: 'uint256', internalType: 'uint256' }, { name: 'description', type: 'string', internalType: 'string' }, { name: 'paymentRef', type: 'bytes32', internalType: 'bytes32' }, { name: 'customAutoReleaseDays', type: 'uint256', internalType: 'uint256' }], outputs: [{ name: 'jobId', type: 'uint256', internalType: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'emergencyResolve', inputs: [{ name: 'jobId', type: 'uint256', internalType: 'uint256' }, { name: 'sendToClient', type: 'bool', internalType: 'bool' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'feeBps', inputs: [], outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'feeRecipient', inputs: [], outputs: [{ name: '', type: 'address', internalType: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'getJob', inputs: [{ name: 'jobId', type: 'uint256', internalType: 'uint256' }], outputs: [{ name: '', type: 'tuple', internalType: 'struct SubOneEscrow.Job', components: [{ name: 'jobId', type: 'uint256', internalType: 'uint256' }, { name: 'client', type: 'address', internalType: 'address' }, { name: 'freelancer', type: 'address', internalType: 'address' }, { name: 'amount', type: 'uint256', internalType: 'uint256' }, { name: 'createdAt', type: 'uint256', internalType: 'uint256' }, { name: 'autoReleaseAt', type: 'uint256', internalType: 'uint256' }, { name: 'feeBpsAtCreation', type: 'uint256', internalType: 'uint256' }, { name: 'status', type: 'uint8', internalType: 'enum SubOneEscrow.JobStatus' }, { name: 'description', type: 'string', internalType: 'string' }, { name: 'paymentRef', type: 'bytes32', internalType: 'bytes32' }] }], stateMutability: 'view' },
  { type: 'function', name: 'getJobsByClient', inputs: [{ name: 'client', type: 'address', internalType: 'address' }], outputs: [{ name: '', type: 'uint256[]', internalType: 'uint256[]' }], stateMutability: 'view' },
  { type: 'function', name: 'getJobsByFreelancer', inputs: [{ name: 'freelancer', type: 'address', internalType: 'address' }], outputs: [{ name: '', type: 'uint256[]', internalType: 'uint256[]' }], stateMutability: 'view' },
  { type: 'function', name: 'jobCounter', inputs: [], outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'markComplete', inputs: [{ name: 'jobId', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'openDispute', inputs: [{ name: 'jobId', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'owner', inputs: [], outputs: [{ name: '', type: 'address', internalType: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'refund', inputs: [{ name: 'jobId', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'release', inputs: [{ name: 'jobId', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'renounceOwnership', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'resolveDispute', inputs: [{ name: 'jobId', type: 'uint256', internalType: 'uint256' }, { name: 'freelancerBps', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'setArbiter', inputs: [{ name: 'newArbiter', type: 'address', internalType: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'setAutoReleasePeriod', inputs: [{ name: 'days_', type: 'uint256', internalType: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'setFee', inputs: [{ name: 'newFeeBps', type: 'uint256', internalType: 'uint256' }, { name: 'newFeeRecipient', type: 'address', internalType: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transferOwnership', inputs: [{ name: 'newOwner', type: 'address', internalType: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'usdc', inputs: [], outputs: [{ name: '', type: 'address', internalType: 'contract IERC20' }], stateMutability: 'view' },
  { type: 'event', name: 'ArbiterUpdated', inputs: [{ name: 'oldArbiter', type: 'address', indexed: false, internalType: 'address' }, { name: 'newArbiter', type: 'address', indexed: false, internalType: 'address' }], anonymous: false },
  { type: 'event', name: 'AutoReleasePeriodUpdated', inputs: [{ name: 'oldPeriod', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'newPeriod', type: 'uint256', indexed: false, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'DisputeOpened', inputs: [{ name: 'jobId', type: 'uint256', indexed: true, internalType: 'uint256' }, { name: 'opener', type: 'address', indexed: true, internalType: 'address' }], anonymous: false },
  { type: 'event', name: 'DisputeResolved', inputs: [{ name: 'jobId', type: 'uint256', indexed: true, internalType: 'uint256' }, { name: 'freelancerBps', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'freelancerAmount', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'clientAmount', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'fee', type: 'uint256', indexed: false, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'EmergencyResolved', inputs: [{ name: 'jobId', type: 'uint256', indexed: true, internalType: 'uint256' }, { name: 'recipient', type: 'address', indexed: false, internalType: 'address' }, { name: 'sentToClient', type: 'bool', indexed: false, internalType: 'bool' }], anonymous: false },
  { type: 'event', name: 'FeeUpdated', inputs: [{ name: 'oldFeeBps', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'newFeeBps', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'oldFeeRecipient', type: 'address', indexed: false, internalType: 'address' }, { name: 'newFeeRecipient', type: 'address', indexed: false, internalType: 'address' }], anonymous: false },
  { type: 'event', name: 'JobCompleted', inputs: [{ name: 'jobId', type: 'uint256', indexed: true, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'JobCreated', inputs: [{ name: 'jobId', type: 'uint256', indexed: true, internalType: 'uint256' }, { name: 'client', type: 'address', indexed: true, internalType: 'address' }, { name: 'freelancer', type: 'address', indexed: true, internalType: 'address' }, { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'autoReleaseAt', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'description', type: 'string', indexed: false, internalType: 'string' }, { name: 'paymentRef', type: 'bytes32', indexed: false, internalType: 'bytes32' }], anonymous: false },
  { type: 'event', name: 'JobRefunded', inputs: [{ name: 'jobId', type: 'uint256', indexed: true, internalType: 'uint256' }, { name: 'client', type: 'address', indexed: true, internalType: 'address' }, { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'JobReleased', inputs: [{ name: 'jobId', type: 'uint256', indexed: true, internalType: 'uint256' }, { name: 'freelancer', type: 'address', indexed: true, internalType: 'address' }, { name: 'netAmount', type: 'uint256', indexed: false, internalType: 'uint256' }, { name: 'fee', type: 'uint256', indexed: false, internalType: 'uint256' }], anonymous: false },
  { type: 'event', name: 'OwnershipTransferred', inputs: [{ name: 'previousOwner', type: 'address', indexed: true, internalType: 'address' }, { name: 'newOwner', type: 'address', indexed: true, internalType: 'address' }], anonymous: false },
  { type: 'error', name: 'AutoReleaseNotReady', inputs: [] },
  { type: 'error', name: 'DescriptionTooLong', inputs: [] },
  { type: 'error', name: 'DisputeWindowClosed', inputs: [] },
  { type: 'error', name: 'EmergencyNotAvailable', inputs: [] },
  { type: 'error', name: 'FeeTooHigh', inputs: [] },
  { type: 'error', name: 'InvalidFreelancerBps', inputs: [] },
  { type: 'error', name: 'InvalidStatus', inputs: [] },
  { type: 'error', name: 'NotArbiter', inputs: [] },
  { type: 'error', name: 'NotArbiterOrOwner', inputs: [] },
  { type: 'error', name: 'NotClient', inputs: [] },
  { type: 'error', name: 'NotFreelancer', inputs: [] },
  { type: 'error', name: 'OwnableInvalidOwner', inputs: [{ name: 'owner', type: 'address', internalType: 'address' }] },
  { type: 'error', name: 'OwnableUnauthorizedAccount', inputs: [{ name: 'account', type: 'address', internalType: 'address' }] },
  { type: 'error', name: 'ReentrancyGuardReentrantCall', inputs: [] },
  { type: 'error', name: 'SafeERC20FailedOperation', inputs: [{ name: 'token', type: 'address', internalType: 'address' }] },
  { type: 'error', name: 'ZeroAddress', inputs: [] },
  { type: 'error', name: 'ZeroAmount', inputs: [] },
] as const

export const SUBONE_ESCROW = {
  address: '0x2fcb5f8c35bd16cb26c151f2ede8020683d5f3f5' as `0x${string}`,
  abi: SUBONE_ESCROW_ABI,
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
  Pending:   '#7a6000',
  Active:    '#1a6040',
  Completed: '#1a3070',
  Disputed:  '#a03020',
  Released:  '#1a6040',
  Refunded:  '#505070',
}
