// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SubOneEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error NotClient();
    error NotFreelancer();
    error NotArbiter();
    error NotArbiterOrOwner();
    error InvalidStatus();
    error AutoReleaseNotReady();
    error DisputeWindowClosed();
    error EmergencyNotAvailable();
    error ZeroAddress();
    error ZeroAmount();
    error DescriptionTooLong();
    error FeeTooHigh();
    error InvalidFreelancerBps();

    enum JobStatus {
        Pending,
        Active,
        Completed,
        Disputed,
        Released,
        Refunded
    }

    struct Job {
        uint256 jobId;
        address client;
        address freelancer;
        uint256 amount;
        uint256 createdAt;
        uint256 autoReleaseAt;
        uint256 feeBpsAtCreation;
        JobStatus status;
        string description;
        bytes32 paymentRef;
    }

    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant MAX_FEE_BPS = 200;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 200;

    IERC20 public immutable usdc;

    uint256 public jobCounter = 1;
    uint256 public feeBps = 50;
    uint256 public autoReleasePeriod = 30 days;

    address public arbiter;
    address public feeRecipient;

    mapping(uint256 => Job) private _jobs;
    mapping(address => uint256[]) private _jobsByFreelancer;
    mapping(address => uint256[]) private _jobsByClient;

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        uint256 autoReleaseAt,
        string description,
        bytes32 paymentRef
    );
    event JobCompleted(uint256 indexed jobId);
    event JobReleased(uint256 indexed jobId, address indexed freelancer, uint256 netAmount, uint256 fee);
    event DisputeOpened(uint256 indexed jobId, address indexed opener);
    event DisputeResolved(
        uint256 indexed jobId,
        uint256 freelancerBps,
        uint256 freelancerAmount,
        uint256 clientAmount,
        uint256 fee
    );
    event EmergencyResolved(uint256 indexed jobId, address recipient, bool sentToClient);
    event JobRefunded(uint256 indexed jobId, address indexed client, uint256 amount);
    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps, address oldFeeRecipient, address newFeeRecipient);
    event ArbiterUpdated(address oldArbiter, address newArbiter);
    event AutoReleasePeriodUpdated(uint256 oldPeriod, uint256 newPeriod);

    constructor(address initialArbiter, address initialFeeRecipient) Ownable(msg.sender) {
        if (initialArbiter == address(0) || initialFeeRecipient == address(0)) {
            revert ZeroAddress();
        }

        usdc = IERC20(0x3600000000000000000000000000000000000000);
        arbiter = initialArbiter;
        feeRecipient = initialFeeRecipient;
    }

    function createJob(
        address freelancer,
        uint256 amount,
        string calldata description,
        bytes32 paymentRef,
        uint256 customAutoReleaseDays
    ) external nonReentrant returns (uint256 jobId) {
        if (freelancer == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (bytes(description).length > MAX_DESCRIPTION_LENGTH) revert DescriptionTooLong();

        jobId = jobCounter;
        unchecked {
            jobCounter = jobId + 1;
        }

        uint256 releaseDelay = customAutoReleaseDays == 0 ? autoReleasePeriod : customAutoReleaseDays * 1 days;

        _jobs[jobId] = Job({
            jobId: jobId,
            client: msg.sender,
            freelancer: freelancer,
            amount: amount,
            createdAt: block.timestamp,
            autoReleaseAt: block.timestamp + releaseDelay,
            feeBpsAtCreation: feeBps,
            status: JobStatus.Active,
            description: description,
            paymentRef: paymentRef
        });

        _jobsByFreelancer[freelancer].push(jobId);
        _jobsByClient[msg.sender].push(jobId);

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        emit JobCreated(jobId, msg.sender, freelancer, amount, block.timestamp + releaseDelay, description, paymentRef);
    }

    function markComplete(uint256 jobId) external {
        Job storage job = _getJob(jobId);
        if (msg.sender != job.freelancer) revert NotFreelancer();
        if (job.status != JobStatus.Active) revert InvalidStatus();

        job.status = JobStatus.Completed;
        emit JobCompleted(jobId);
    }

    function release(uint256 jobId) external nonReentrant {
        Job storage job = _getJob(jobId);
        if (msg.sender != job.client) revert NotClient();
        if (job.status != JobStatus.Active && job.status != JobStatus.Completed) revert InvalidStatus();

        _releaseJob(jobId, job);
    }

    function autoRelease(uint256 jobId) external nonReentrant {
        Job storage job = _getJob(jobId);
        if (job.status != JobStatus.Active && job.status != JobStatus.Completed) revert InvalidStatus();
        if (block.timestamp < job.autoReleaseAt) revert AutoReleaseNotReady();

        _releaseJob(jobId, job);
    }

    function openDispute(uint256 jobId) external {
        Job storage job = _getJob(jobId);
        if (msg.sender != job.client && msg.sender != job.freelancer) revert InvalidStatus();
        if (job.status != JobStatus.Active && job.status != JobStatus.Completed) revert InvalidStatus();
        if (block.timestamp >= job.autoReleaseAt) revert DisputeWindowClosed();

        job.status = JobStatus.Disputed;
        emit DisputeOpened(jobId, msg.sender);
    }

    function resolveDispute(uint256 jobId, uint256 freelancerBps) external nonReentrant {
        Job storage job = _getJob(jobId);
        if (msg.sender != arbiter) revert NotArbiter();
        if (job.status != JobStatus.Disputed) revert InvalidStatus();
        if (freelancerBps > BPS_DENOMINATOR) revert InvalidFreelancerBps();

        uint256 fee = (job.amount * job.feeBpsAtCreation) / BPS_DENOMINATOR;
        uint256 net = job.amount - fee;
        uint256 freelancerAmount = (net * freelancerBps) / BPS_DENOMINATOR;
        uint256 clientAmount = net - freelancerAmount;

        job.status = JobStatus.Released;

        if (fee > 0) {
            usdc.safeTransfer(feeRecipient, fee);
        }
        if (freelancerAmount > 0) {
            usdc.safeTransfer(job.freelancer, freelancerAmount);
        }
        if (clientAmount > 0) {
            usdc.safeTransfer(job.client, clientAmount);
        }

        emit DisputeResolved(jobId, freelancerBps, freelancerAmount, clientAmount, fee);
    }

    function refund(uint256 jobId) external nonReentrant {
        Job storage job = _getJob(jobId);
        if (msg.sender != arbiter && msg.sender != owner()) revert NotArbiter();
        if (job.status != JobStatus.Disputed) revert InvalidStatus();

        job.status = JobStatus.Refunded;
        usdc.safeTransfer(job.client, job.amount);

        emit JobRefunded(jobId, job.client, job.amount);
    }

    function emergencyResolve(uint256 jobId, bool sendToClient) external nonReentrant {
        Job storage job = _getJob(jobId);
        if (msg.sender != arbiter && msg.sender != owner()) revert NotArbiterOrOwner();
        if (block.timestamp < job.autoReleaseAt) revert EmergencyNotAvailable();
        if (job.status != JobStatus.Active && job.status != JobStatus.Completed) revert EmergencyNotAvailable();

        address recipient = sendToClient ? job.client : job.freelancer;

        job.status = JobStatus.Released;
        usdc.safeTransfer(recipient, job.amount);

        emit EmergencyResolved(jobId, recipient, sendToClient);
    }

    function getJob(uint256 jobId) external view returns (Job memory) {
        return _getJob(jobId);
    }

    function getJobsByFreelancer(address freelancer) external view returns (uint256[] memory) {
        return _jobsByFreelancer[freelancer];
    }

    function getJobsByClient(address client) external view returns (uint256[] memory) {
        return _jobsByClient[client];
    }

    function setFee(uint256 newFeeBps, address newFeeRecipient) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        if (newFeeRecipient == address(0)) revert ZeroAddress();

        uint256 oldFeeBps = feeBps;
        address oldFeeRecipient = feeRecipient;

        feeBps = newFeeBps;
        feeRecipient = newFeeRecipient;

        emit FeeUpdated(oldFeeBps, newFeeBps, oldFeeRecipient, newFeeRecipient);
    }

    function setArbiter(address newArbiter) external onlyOwner {
        if (newArbiter == address(0)) revert ZeroAddress();

        address oldArbiter = arbiter;
        arbiter = newArbiter;

        emit ArbiterUpdated(oldArbiter, newArbiter);
    }

    function setAutoReleasePeriod(uint256 days_) external onlyOwner {
        uint256 oldPeriod = autoReleasePeriod;
        autoReleasePeriod = days_ * 1 days;

        emit AutoReleasePeriodUpdated(oldPeriod, autoReleasePeriod);
    }

    function _releaseJob(uint256 jobId, Job storage job) internal {
        uint256 fee = (job.amount * job.feeBpsAtCreation) / BPS_DENOMINATOR;
        uint256 netAmount = job.amount - fee;

        job.status = JobStatus.Released;

        usdc.safeTransfer(job.freelancer, netAmount);
        if (fee > 0) {
            usdc.safeTransfer(feeRecipient, fee);
        }

        emit JobReleased(jobId, job.freelancer, netAmount, fee);
    }

    function _getJob(uint256 jobId) internal view returns (Job storage job) {
        if (jobId == 0 || jobId >= jobCounter) revert InvalidStatus();
        job = _jobs[jobId];
    }
}
