# Base Blockchain Integration Guide

## 🎯 Overview

This guide explains how to integrate Base blockchain payments into your Gossiper application for session payments. The integration replaces Solana with Base blockchain using a custom smart contract.

## 📦 What's Been Created

### 1. Smart Contract (`/contracts/SessionPayment.sol`)
A Solidity smart contract that handles:
- Session payment pool creation
- Student contributions
- Fund management and withdrawal
- Platform fee collection (2%)
- Transparent on-chain tracking

### 2. Deployment Infrastructure
- **Hardhat Configuration** (`hardhat.config.js`)
- **Deployment Script** (`scripts/deploy.js`)
- **Test Suite** (`test/SessionPayment.test.js`)
- **Contract ABI** (`SessionPaymentABI.json`)

### 3. Frontend Hook (`/hooks/use-base.ts`)
A React hook that provides:
- Wallet connection (MetaMask, etc.)
- Network switching to Base
- Payment transactions
- Session data queries
- Balance checking

## 🚀 Quick Start

### Step 1: Deploy the Smart Contract

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
npm install

# Set up environment variables
# Create .env file with:
# PRIVATE_KEY=your_wallet_private_key
# BASESCAN_API_KEY=your_basescan_api_key

# Deploy to Base Sepolia (testnet)
npm run deploy:sepolia

# Or deploy to Base Mainnet (production)
npm run deploy:mainnet
```

After deployment, you'll get a contract address like: `0x1234567890abcdef...`

### Step 2: Configure Your Application

Add the contract address to your `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SESSION_PAYMENT_CONTRACT=0xYourContractAddressHere
NEXT_PUBLIC_BASE_NETWORK=sepolia  # or 'mainnet'
```

### Step 3: Install Required Dependencies

```bash
# In your root directory
npm install ethers@^6.9.0
```

### Step 4: Update Your Frontend

The `use-base` hook is already created and ready to use. Here's how to integrate it:

#### Example: Payment Modal Integration

```typescript
import { useBase } from "@/hooks/use-base"

function PaymentComponent({ sessionId }) {
  const { 
    isConnected, 
    address, 
    connectWallet, 
    sendPayment, 
    isProcessing 
  } = useBase()

  const handlePayment = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    const result = await sendPayment({
      amount: 0.01, // 0.01 ETH
      sessionId: sessionId,
      description: "Session contribution"
    })

    if (result) {
      console.log("Payment successful:", result.transactionHash)
    }
  }

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <button onClick={handlePayment} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Pay 0.01 ETH"}
        </button>
      )}
    </div>
  )
}
```

## 🔄 Migration from Solana

### Changes Required

1. **Replace Solana Hook Usage**
   - Old: `import { useSolana } from "@/hooks/use-solana"`
   - New: `import { useBase } from "@/hooks/use-base"`

2. **Update Wallet Connection**
   - Old: Solana wallet adapters
   - New: MetaMask/Web3 wallet (automatically handled by `use-base`)

3. **Update Payment Amounts**
   - Old: SOL amounts
   - New: ETH amounts (Base uses ETH)

4. **Update Network References**
   - Old: Solana network
   - New: Base network (Sepolia testnet or Mainnet)

### Side-by-Side Comparison

#### Before (Solana)
```typescript
const { connected, publicKey, sendPayment } = useSolana()

await sendPayment({
  amount: 0.01, // SOL
  recipient: "SolanaAddress...",
  sessionId: sessionId
})
```

#### After (Base)
```typescript
const { isConnected, address, sendPayment } = useBase()

await sendPayment({
  amount: 0.01, // ETH
  sessionId: sessionId
})
```

## 💰 Payment Flow

### For Students (Contributing to Sessions)

1. **Connect Wallet**
   ```typescript
   const { connectWallet } = useBase()
   await connectWallet()
   ```

2. **Switch to Base Network** (automatic)
   - The hook automatically prompts users to switch to Base if needed

3. **Make Payment**
   ```typescript
   const result = await sendPayment({
     amount: 0.01,
     sessionId: "session-123"
   })
   ```

4. **Confirm Transaction**
   - User confirms in MetaMask
   - Transaction is submitted to Base blockchain
   - Smart contract records the contribution

### For Lecturers (Creating Sessions)

1. **Create Session in Database**
   - Use existing session creation flow
   - Get session ID from database

2. **Create Payment Pool on Blockchain**
   ```typescript
   const { contract } = useBase()
   
   // Create session with 0.5 ETH goal
   const tx = await contract.createSession(
     sessionId, 
     parseEther("0.5")
   )
   await tx.wait()
   ```

3. **Share Session Code**
   - Students join and contribute

4. **Close Session and Withdraw**
   ```typescript
   // Close session
   await contract.closeSession(sessionId)
   
   // Withdraw funds
   await contract.withdrawFunds(sessionId)
   ```

## 📊 Querying Session Data

### Get Session Payment Pool Status

```typescript
const { getSessionData } = useBase()

const sessionData = await getSessionData("session-123")

if (sessionData) {
  console.log("Goal:", formatEther(sessionData.goalAmount), "ETH")
  console.log("Current:", formatEther(sessionData.currentAmount), "ETH")
  console.log("Contributors:", sessionData.contributionCount.toString())
  console.log("Active:", sessionData.isActive)
}
```

### Get User's Balance

```typescript
const { getBalance } = useBase()

const balance = await getBalance()
console.log("Balance:", balance, "ETH")
```

## 🔐 Security Best Practices

### For Development

1. **Never Commit Private Keys**
   - Use `.env` files (already in `.gitignore`)
   - Use separate wallets for development and production

2. **Test on Sepolia First**
   - Always test on Base Sepolia testnet before mainnet
   - Get free testnet ETH from Base Sepolia faucet

3. **Verify Contracts**
   - Always verify contracts on Basescan
   - Makes your contract transparent and trustworthy

### For Production

1. **Use Hardware Wallets**
   - For contract deployment
   - For platform fee withdrawals

2. **Set Reasonable Gas Limits**
   - Monitor gas prices
   - Set appropriate limits in transactions

3. **Monitor Contract Events**
   - Listen to contract events
   - Track all contributions and withdrawals

## 🧪 Testing

### Test Smart Contract

```bash
cd contracts
npm test
```

### Test Frontend Integration

1. **Connect to Sepolia Testnet**
2. **Get Test ETH** from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
3. **Test Payment Flow**:
   - Connect wallet
   - Create test session
   - Make test contribution
   - Verify on Basescan

## 🌐 Network Information

### Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Base Mainnet (Production)
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org

## 📱 User Experience

### Wallet Connection Flow

1. User clicks "Connect Wallet"
2. MetaMask popup appears
3. User approves connection
4. If not on Base network, prompted to switch
5. Ready to make payments

### Payment Flow

1. User enters amount or selects preset
2. Clicks "Pay" button
3. MetaMask shows transaction details
4. User confirms transaction
5. Transaction submitted to blockchain
6. Confirmation toast appears
7. UI updates with new contribution

## 🛠️ Troubleshooting

### Common Issues

**"Please install MetaMask"**
- User needs to install MetaMask or another Web3 wallet
- Provide link: https://metamask.io/

**"Please switch to Base network"**
- Hook automatically prompts to switch
- User needs to approve network switch in wallet

**"Insufficient funds"**
- User doesn't have enough ETH for transaction + gas
- Show current balance and required amount

**"Transaction failed"**
- Check Basescan for detailed error
- Common causes: session doesn't exist, session closed, insufficient gas

**"Contract not configured"**
- Ensure `NEXT_PUBLIC_SESSION_PAYMENT_CONTRACT` is set in `.env.local`
- Verify contract is deployed to the correct network

## 📈 Monitoring and Analytics

### Track Payments

Listen to contract events:

```typescript
const { contract } = useBase()

// Listen for contributions
contract.on("ContributionMade", (sessionId, contributor, amount, timestamp) => {
  console.log(`New contribution: ${formatEther(amount)} ETH`)
  // Update UI, send notifications, etc.
})
```

### View on Basescan

All transactions are visible on Basescan:
- View contract: `https://basescan.org/address/YOUR_CONTRACT_ADDRESS`
- View transaction: `https://basescan.org/tx/TRANSACTION_HASH`

## 🎨 UI Components

### Wallet Connection Button

```typescript
function WalletButton() {
  const { isConnected, address, connectWallet, disconnectWallet } = useBase()

  if (isConnected) {
    return (
      <button onClick={disconnectWallet}>
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    )
  }

  return <button onClick={connectWallet}>Connect Wallet</button>
}
```

### Payment Progress Bar

```typescript
function PaymentProgress({ sessionId }) {
  const { getSessionData } = useBase()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      const data = await getSessionData(sessionId)
      if (data) {
        const percent = (Number(data.currentAmount) / Number(data.goalAmount)) * 100
        setProgress(percent)
      }
    }
    loadData()
  }, [sessionId])

  return (
    <div>
      <div className="progress-bar" style={{ width: `${progress}%` }} />
      <span>{progress.toFixed(1)}% funded</span>
    </div>
  )
}
```

## 📚 Additional Resources

- [Base Documentation](https://docs.base.org/)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 🎯 Next Steps

1. ✅ Deploy smart contract to Base Sepolia
2. ✅ Add contract address to `.env.local`
3. ✅ Test payment flow on testnet
4. ✅ Update UI components to use `use-base` hook
5. ✅ Test with real users on testnet
6. ✅ Deploy to Base Mainnet
7. ✅ Update production environment variables
8. ✅ Monitor transactions and user feedback

## 💡 Tips

- **Start with small amounts** on testnet
- **Test all edge cases** (insufficient funds, network switches, etc.)
- **Provide clear error messages** to users
- **Show transaction status** (pending, confirmed, failed)
- **Display gas estimates** before transactions
- **Cache session data** to reduce RPC calls
- **Use event listeners** for real-time updates

---

**Need Help?** Check the `/contracts/README.md` for detailed smart contract documentation.
