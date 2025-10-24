// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SessionPayment
 * @dev Smart contract for managing session payments on Base blockchain
 * @notice This contract handles contributions to educational sessions with payment pools
 */
contract SessionPayment {
    // Events
    event SessionCreated(
        string indexed sessionId,
        address indexed creator,
        uint256 goalAmount,
        uint256 timestamp
    );
    
    event ContributionMade(
        string indexed sessionId,
        address indexed contributor,
        uint256 amount,
        uint256 timestamp
    );
    
    event SessionClosed(
        string indexed sessionId,
        uint256 totalCollected,
        uint256 timestamp
    );
    
    event FundsWithdrawn(
        string indexed sessionId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    // Structs
    struct Session {
        address creator;
        uint256 goalAmount;
        uint256 currentAmount;
        uint256 contributionCount;
        bool isActive;
        bool fundsWithdrawn;
        uint256 createdAt;
        uint256 closedAt;
    }

    struct Contribution {
        address contributor;
        uint256 amount;
        uint256 timestamp;
    }

    // State variables
    mapping(string => Session) public sessions;
    mapping(string => Contribution[]) public sessionContributions;
    mapping(string => mapping(address => uint256)) public userContributions;
    
    address public owner;
    uint256 public platformFeePercent = 2; // 2% platform fee
    uint256 public totalPlatformFees;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier sessionExists(string memory sessionId) {
        require(sessions[sessionId].creator != address(0), "Session does not exist");
        _;
    }

    modifier sessionActive(string memory sessionId) {
        require(sessions[sessionId].isActive, "Session is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Create a new session payment pool
     * @param sessionId Unique identifier for the session
     * @param goalAmount Target amount to be collected (in wei)
     */
    function createSession(
        string memory sessionId,
        uint256 goalAmount
    ) external {
        require(sessions[sessionId].creator == address(0), "Session already exists");
        require(goalAmount > 0, "Goal amount must be greater than 0");

        sessions[sessionId] = Session({
            creator: msg.sender,
            goalAmount: goalAmount,
            currentAmount: 0,
            contributionCount: 0,
            isActive: true,
            fundsWithdrawn: false,
            createdAt: block.timestamp,
            closedAt: 0
        });

        emit SessionCreated(sessionId, msg.sender, goalAmount, block.timestamp);
    }

    /**
     * @dev Contribute to a session payment pool
     * @param sessionId The session to contribute to
     */
    function contribute(string memory sessionId) 
        external 
        payable 
        sessionExists(sessionId)
        sessionActive(sessionId)
    {
        require(msg.value > 0, "Contribution must be greater than 0");

        Session storage session = sessions[sessionId];
        
        // Calculate platform fee
        uint256 platformFee = (msg.value * platformFeePercent) / 100;
        uint256 contributionAmount = msg.value - platformFee;

        // Update session data
        session.currentAmount += contributionAmount;
        session.contributionCount++;
        
        // Track platform fees
        totalPlatformFees += platformFee;

        // Record contribution
        sessionContributions[sessionId].push(Contribution({
            contributor: msg.sender,
            amount: contributionAmount,
            timestamp: block.timestamp
        }));

        // Track user's total contribution to this session
        userContributions[sessionId][msg.sender] += contributionAmount;

        emit ContributionMade(sessionId, msg.sender, contributionAmount, block.timestamp);
    }

    /**
     * @dev Close a session (only creator can close)
     * @param sessionId The session to close
     */
    function closeSession(string memory sessionId) 
        external 
        sessionExists(sessionId)
        sessionActive(sessionId)
    {
        Session storage session = sessions[sessionId];
        require(msg.sender == session.creator, "Only session creator can close");

        session.isActive = false;
        session.closedAt = block.timestamp;

        emit SessionClosed(sessionId, session.currentAmount, block.timestamp);
    }

    /**
     * @dev Withdraw funds from a closed session (only creator)
     * @param sessionId The session to withdraw from
     */
    function withdrawFunds(string memory sessionId) 
        external 
        sessionExists(sessionId)
    {
        Session storage session = sessions[sessionId];
        require(msg.sender == session.creator, "Only session creator can withdraw");
        require(!session.isActive, "Session must be closed first");
        require(!session.fundsWithdrawn, "Funds already withdrawn");
        require(session.currentAmount > 0, "No funds to withdraw");

        uint256 amount = session.currentAmount;
        session.fundsWithdrawn = true;
        session.currentAmount = 0;

        (bool success, ) = payable(session.creator).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(sessionId, session.creator, amount, block.timestamp);
    }

    /**
     * @dev Get session details
     * @param sessionId The session to query
     */
    function getSession(string memory sessionId) 
        external 
        view 
        sessionExists(sessionId)
        returns (
            address creator,
            uint256 goalAmount,
            uint256 currentAmount,
            uint256 contributionCount,
            bool isActive,
            bool fundsWithdrawn,
            uint256 createdAt,
            uint256 closedAt
        )
    {
        Session memory session = sessions[sessionId];
        return (
            session.creator,
            session.goalAmount,
            session.currentAmount,
            session.contributionCount,
            session.isActive,
            session.fundsWithdrawn,
            session.createdAt,
            session.closedAt
        );
    }

    /**
     * @dev Get all contributions for a session
     * @param sessionId The session to query
     */
    function getSessionContributions(string memory sessionId) 
        external 
        view 
        sessionExists(sessionId)
        returns (Contribution[] memory)
    {
        return sessionContributions[sessionId];
    }

    /**
     * @dev Get user's contribution to a specific session
     * @param sessionId The session to query
     * @param user The user address
     */
    function getUserContribution(string memory sessionId, address user) 
        external 
        view 
        returns (uint256)
    {
        return userContributions[sessionId][user];
    }

    /**
     * @dev Update platform fee percentage (only owner)
     * @param newFeePercent New fee percentage (0-100)
     */
    function updatePlatformFee(uint256 newFeePercent) 
        external 
        onlyOwner 
    {
        require(newFeePercent <= 10, "Fee cannot exceed 10%");
        platformFeePercent = newFeePercent;
    }

    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawPlatformFees() 
        external 
        onlyOwner 
    {
        require(totalPlatformFees > 0, "No fees to withdraw");
        
        uint256 amount = totalPlatformFees;
        totalPlatformFees = 0;

        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() 
        external 
        view 
        returns (uint256) 
    {
        return address(this).balance;
    }

    /**
     * @dev Transfer ownership (only owner)
     * @param newOwner Address of new owner
     */
    function transferOwnership(address newOwner) 
        external 
        onlyOwner 
    {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
