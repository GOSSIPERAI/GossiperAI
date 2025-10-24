# Base Blockchain Payment Integration for Gossiper

This directory contains the smart contract and deployment scripts for handling session payments on the Base blockchain.

## 📋 Overview

The `SessionPayment` smart contract enables:
- **Session Payment Pools**: Lecturers create payment pools for their sessions
- **Student Contributions**: Students contribute ETH to support sessions
- **Automated Fee Collection**: 2% platform fee automatically collected
- **Secure Fund Management**: Only session creators can withdraw funds
- **Transparent Tracking**: All contributions and transactions are recorded on-chain

## 🏗️ Contract Architecture

### Core Functions

#### For Lecturers
- `createSession(sessionId, goalAmount)` - Create a new payment pool
- `closeSession(sessionId)` - Close a session (stops accepting contributions)
- `withdrawFunds(sessionId)` - Withdraw collected funds after closing

#### For Students
- `contribute(sessionId)` - Contribute ETH to a session

#### View Functions
- `getSession(sessionId)` - Get session details
- `getSessionContributions(sessionId)` - Get all contributions
- `getUserContribution(sessionId, userAddress)` - Get user's contribution amount

### Contract Features

✅ **Security**
- Only session creators can close and withdraw
- Prevents double withdrawals
- Validates all inputs
- Reentrancy protection

✅ **Transparency**
- All transactions emit events
- Full contribution history on-chain
- Public view functions

✅ **Fee Management**
- 2% platform fee (configurable by owner)
- Maximum 10% fee cap
- Separate platform fee tracking

## 🚀 Deployment Guide

### Prerequisites

1. **Install Dependencies**
```bash
cd contracts
npm install
```

2. **Set Up Environment Variables**

Create a `.env` file in the `contracts` directory:

```env
# Private key of the deployer wallet (DO NOT COMMIT THIS)
PRIVATE_KEY=your_private_key_here

# Base RPC URLs (optional, defaults provided)
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Basescan API Key for contract verification
BASESCAN_API_KEY=your_basescan_api_key
```

⚠️ **SECURITY WARNING**: Never commit your `.env` file or private keys to version control!

### Deployment Steps

#### 1. Compile the Contract
```bash
npm run compile
```

#### 2. Run Tests (Optional but Recommended)
```bash
npm test
```

#### 3. Deploy to Base Sepolia (Testnet)
```bash
npm run deploy:sepolia
```

This will:
- Deploy the contract to Base Sepolia testnet
- Verify the contract on Basescan
- Save deployment info to `deployments/latest.json`

#### 4. Deploy to Base Mainnet (Production)
```bash
npm run deploy:mainnet
```

⚠️ **WARNING**: Make sure you have enough ETH in your wallet for deployment gas fees!

### Post-Deployment

After deployment, you'll receive:
- **Contract Address**: Copy this address
- **Transaction Hash**: Deployment transaction
- **Basescan Link**: View your contract on Basescan

**Important**: Add the contract address to your `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SESSION_PAYMENT_CONTRACT=0xYourContractAddressHere
```

## 📝 Contract Verification

If automatic verification fails during deployment, verify manually:

```bash
npx hardhat verify --network base YOUR_CONTRACT_ADDRESS
```

Or for Sepolia testnet:

```bash
npx hardhat verify --network baseSepolia YOUR_CONTRACT_ADDRESS
```

## 🧪 Testing

Run the full test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npx hardhat coverage
```

Run tests on local network:

```bash
npm run deploy:local
```

## 💡 Usage Examples

### Creating a Session (Lecturer)

```javascript
// In your frontend code
const contract = new Contract(contractAddress, SessionPaymentABI, signer)

// Create session with 0.5 ETH goal
const tx = await contract.createSession("session-123", parseEther("0.5"))
await tx.wait()
```

### Contributing to a Session (Student)

```javascript
// Contribute 0.01 ETH to a session
const tx = await contract.contribute("session-123", {
  value: parseEther("0.01")
})
await tx.wait()
```

### Getting Session Data

```javascript
const session = await contract.getSession("session-123")
console.log("Current Amount:", formatEther(session.currentAmount))
console.log("Goal Amount:", formatEther(session.goalAmount))
console.log("Contributors:", session.contributionCount.toString())
```

### Closing and Withdrawing (Lecturer)

```javascript
// Close the session
await contract.closeSession("session-123")

// Withdraw funds
await contract.withdrawFunds("session-123")
```

## 🔧 Configuration

### Network Configuration

The contract is configured for:
- **Base Mainnet** (Chain ID: 8453)
- **Base Sepolia Testnet** (Chain ID: 84532)
- **Local Hardhat Network** (Chain ID: 31337)

### Gas Optimization

The contract is optimized with:
- Solidity 0.8.20
- Optimizer enabled (200 runs)
- Efficient storage patterns

## 📊 Contract Events

The contract emits the following events:

```solidity
event SessionCreated(string indexed sessionId, address indexed creator, uint256 goalAmount, uint256 timestamp)
event ContributionMade(string indexed sessionId, address indexed contributor, uint256 amount, uint256 timestamp)
event SessionClosed(string indexed sessionId, uint256 totalCollected, uint256 timestamp)
event FundsWithdrawn(string indexed sessionId, address indexed recipient, uint256 amount, uint256 timestamp)
```

Listen to these events in your frontend for real-time updates.

## 🔐 Security Considerations

1. **Private Keys**: Never expose private keys in code or commit them to git
2. **Contract Ownership**: The deployer becomes the contract owner
3. **Platform Fees**: Only owner can withdraw platform fees
4. **Session Funds**: Only session creators can withdraw their session funds
5. **Reentrancy**: Contract uses checks-effects-interactions pattern

## 🛠️ Troubleshooting

### Common Issues

**Issue**: "Insufficient funds for gas"
- **Solution**: Ensure your wallet has enough ETH for gas fees

**Issue**: "Contract verification failed"
- **Solution**: Verify manually using the command provided after deployment

**Issue**: "Network not found"
- **Solution**: Check your RPC URLs in `.env` file

**Issue**: "Transaction reverted"
- **Solution**: Check error message and ensure all conditions are met (e.g., session exists, is active, etc.)

## 📚 Additional Resources

- [Base Documentation](https://docs.base.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Basescan](https://basescan.org/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the test files for usage examples
3. Check Base network status
4. Review transaction on Basescan for detailed error messages

## 📄 License

MIT License - See LICENSE file for details
