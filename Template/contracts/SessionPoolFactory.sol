// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SessionPool.sol";

/**
 * @title SessionPoolFactory
 * @dev Factory contract to deploy and manage SessionPool contracts
 */
contract SessionPoolFactory {
    // Mapping of sessionId to pool address
    mapping(string => address) public sessionPools;
    
    // Array of all created pools
    address[] public allPools;
    
    // Events
    event PoolCreated(
        address indexed poolAddress,
        string sessionId,
        address indexed lecturer,
        uint256 goalAmount,
        uint256 deadline
    );
    
    /**
     * @dev Create a new session pool
     * @param sessionId Unique identifier for the session
     * @param goalAmount Target amount to be collected (in wei)
     * @param durationInHours How long the pool should remain active
     */
    function createPool(
        string memory sessionId,
        uint256 goalAmount,
        uint256 durationInHours
    ) external returns (address) {
        require(bytes(sessionId).length > 0, "Session ID cannot be empty");
        require(sessionPools[sessionId] == address(0), "Pool already exists for this session");
        
        // Deploy new SessionPool contract
        SessionPool newPool = new SessionPool(
            msg.sender, // lecturer
            sessionId,
            goalAmount,
            durationInHours
        );
        
        address poolAddress = address(newPool);
        sessionPools[sessionId] = poolAddress;
        allPools.push(poolAddress);
        
        emit PoolCreated(
            poolAddress,
            sessionId,
            msg.sender,
            goalAmount,
            block.timestamp + (durationInHours * 1 hours)
        );
        
        return poolAddress;
    }
    
    /**
     * @dev Get pool address for a session
     */
    function getPoolAddress(string memory sessionId) external view returns (address) {
        return sessionPools[sessionId];
    }
    
    /**
     * @dev Get total number of pools created
     */
    function getPoolCount() external view returns (uint256) {
        return allPools.length;
    }
    
    /**
     * @dev Get all pool addresses
     */
    function getAllPools() external view returns (address[] memory) {
        return allPools;
    }
    
    /**
     * @dev Check if pool exists for session
     */
    function poolExists(string memory sessionId) external view returns (bool) {
        return sessionPools[sessionId] != address(0);
    }
}

