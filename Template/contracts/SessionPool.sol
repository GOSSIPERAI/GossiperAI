// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SessionPool
 * @dev A smart contract for pooling funds for educational sessions
 * Students contribute to a pool, funds are released to lecturer when goal is met
 */
contract SessionPool {
    // Session information
    address public lecturer;
    string public sessionId;
    uint256 public goalAmount;
    uint256 public deadline;
    
    // Pool state
    uint256 public totalContributed;
    bool public goalReached;
    bool public fundsReleased;
    bool public cancelled;
    
    // Track contributions
    mapping(address => uint256) public contributions;
    address[] public contributors;
    
    // Events
    event ContributionReceived(address indexed contributor, uint256 amount);
    event GoalReached(uint256 totalAmount);
    event FundsReleased(address indexed lecturer, uint256 amount);
    event RefundIssued(address indexed contributor, uint256 amount);
    event PoolCancelled();
    
    // Modifiers
    modifier onlyLecturer() {
        require(msg.sender == lecturer, "Only lecturer can call this");
        _;
    }
    
    modifier notCancelled() {
        require(!cancelled, "Pool is cancelled");
        _;
    }
    
    modifier notReleased() {
        require(!fundsReleased, "Funds already released");
        _;
    }
    
    /**
     * @dev Constructor to initialize the session pool
     * @param _lecturer Address of the lecturer who will receive funds
     * @param _sessionId Unique identifier for the session
     * @param _goalAmount Target amount to be collected (in wei)
     * @param _durationInHours How long the pool should remain active
     */
    constructor(
        address _lecturer,
        string memory _sessionId,
        uint256 _goalAmount,
        uint256 _durationInHours
    ) {
        require(_lecturer != address(0), "Invalid lecturer address");
        require(_goalAmount > 0, "Goal amount must be positive");
        require(_durationInHours > 0, "Duration must be positive");
        
        lecturer = _lecturer;
        sessionId = _sessionId;
        goalAmount = _goalAmount;
        deadline = block.timestamp + (_durationInHours * 1 hours);
    }
    
    /**
     * @dev Contribute ETH to the pool
     */
    function contribute() external payable notCancelled notReleased {
        require(block.timestamp < deadline, "Pool has expired");
        require(msg.value > 0, "Contribution must be positive");
        
        // Track new contributor
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        
        contributions[msg.sender] += msg.value;
        totalContributed += msg.value;
        
        emit ContributionReceived(msg.sender, msg.value);
        
        // Check if goal is reached
        if (!goalReached && totalContributed >= goalAmount) {
            goalReached = true;
            emit GoalReached(totalContributed);
        }
    }
    
    /**
     * @dev Release funds to the lecturer when goal is reached
     */
    function releaseFunds() external onlyLecturer notCancelled notReleased {
        require(goalReached, "Goal not reached yet");
        
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds to release");
        
        fundsReleased = true;
        
        (bool success, ) = payable(lecturer).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(lecturer, amount);
    }
    
    /**
     * @dev Cancel the pool and allow refunds (only by lecturer)
     */
    function cancelPool() external onlyLecturer notReleased {
        require(!cancelled, "Already cancelled");
        cancelled = true;
        emit PoolCancelled();
    }
    
    /**
     * @dev Request refund (only if pool is cancelled or deadline passed without goal)
     */
    function requestRefund() external notReleased {
        require(
            cancelled || (block.timestamp >= deadline && !goalReached),
            "Refund not available"
        );
        
        uint256 amount = contributions[msg.sender];
        require(amount > 0, "No contribution to refund");
        
        contributions[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund failed");
        
        emit RefundIssued(msg.sender, amount);
    }
    
    /**
     * @dev Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 _totalContributed,
        uint256 _goalAmount,
        uint256 _contributorCount,
        bool _goalReached,
        bool _fundsReleased,
        bool _cancelled,
        uint256 _timeRemaining
    ) {
        uint256 timeLeft = 0;
        if (block.timestamp < deadline) {
            timeLeft = deadline - block.timestamp;
        }
        
        return (
            totalContributed,
            goalAmount,
            contributors.length,
            goalReached,
            fundsReleased,
            cancelled,
            timeLeft
        );
    }
    
    /**
     * @dev Get contribution amount for a specific address
     */
    function getContribution(address contributor) external view returns (uint256) {
        return contributions[contributor];
    }
    
    /**
     * @dev Get all contributors
     */
    function getContributors() external view returns (address[] memory) {
        return contributors;
    }
    
    /**
     * @dev Get progress percentage (0-100)
     */
    function getProgress() external view returns (uint256) {
        if (goalAmount == 0) return 0;
        uint256 progress = (totalContributed * 100) / goalAmount;
        return progress > 100 ? 100 : progress;
    }
}

