# 🚀 Quick Start - Base Blockchain Payments

## ⚡ 3-Step Setup

### 1️⃣ Deploy Smart Contract

```bash
cd contracts
npm install
```

Create `.env` file:
```env
PRIVATE_KEY=your_wallet_private_key
BASESCAN_API_KEY=your_basescan_api_key
```

Deploy to testnet:
```bash
npm run deploy:sepolia
```

**Copy the contract address from the output!**

### 2️⃣ Configure Your App

Add to root `.env.local`:
```env
NEXT_PUBLIC_SESSION_PAYMENT_CONTRACT=0xYourContractAddressHere
NEXT_PUBLIC_BASE_NETWORK=sepolia
```

### 3️⃣ Install Dependencies

```bash
npm install ethers@^6.9.0
```

## ✅ You're Done!

The `use-base` hook is ready to use in your components.

## 📖 Usage Example

```typescript
import { useBase } from "@/hooks/use-base"

function PaymentButton({ sessionId }) {
  const { isConnected, connectWallet, sendPayment, isProcessing } = useBase()

  const handlePay = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    await sendPayment({
      amount: 0.01, // ETH
      sessionId: sessionId
    })
  }

  return (
    <button onClick={handlePay} disabled={isProcessing}>
      {isProcessing ? "Processing..." : "Pay 0.01 ETH"}
    </button>
  )
}
```

## 📚 Full Documentation

- **Integration Guide**: `BASE_INTEGRATION_GUIDE.md`
- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Contract Docs**: `contracts/README.md`
- **Complete Summary**: `BASE_PAYMENT_SUMMARY.md`

## 🧪 Get Test ETH

Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## 🔍 View on Basescan

- **Testnet**: https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS
- **Mainnet**: https://basescan.org/address/YOUR_CONTRACT_ADDRESS

## 💡 Key Commands

```bash
# Compile contract
npm run compile

# Run tests
npm test

# Deploy to testnet
npm run deploy:sepolia

# Deploy to mainnet
npm run deploy:mainnet

# Verify contract
npx hardhat verify --network baseSepolia YOUR_CONTRACT_ADDRESS
```

## 🆘 Need Help?

Check `BASE_PAYMENT_SUMMARY.md` for troubleshooting and detailed explanations.
