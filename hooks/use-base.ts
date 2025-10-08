"use client"

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers"
import SessionPaymentABI from "@/contracts/SessionPaymentABI.json"

// Base Network Configuration
const BASE_MAINNET_CHAIN_ID = "0x2105" // 8453 in hex
const BASE_SEPOLIA_CHAIN_ID = "0x14a34" // 84532 in hex

const BASE_NETWORKS = {
  mainnet: {
    chainId: BASE_MAINNET_CHAIN_ID,
    chainName: "Base",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  sepolia: {
    chainId: BASE_SEPOLIA_CHAIN_ID,
    chainName: "Base Sepolia",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
}

export interface PaymentRequest {
  amount: number // in ETH
  sessionId: string
  description?: string
}

export interface PaymentResult {
  transactionHash: string
  amount: number
  timestamp: Date
}

export interface SessionData {
  creator: string
  goalAmount: bigint
  currentAmount: bigint
  contributionCount: bigint
  isActive: boolean
  fundsWithdrawn: boolean
  createdAt: bigint
  closedAt: bigint
}

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useBase() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [chainId, setChainId] = useState<string | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)

  // Get contract address from environment
  const contractAddress = process.env.NEXT_PUBLIC_SESSION_PAYMENT_CONTRACT

  // Initialize provider and contract
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum && isConnected) {
      const initProvider = async () => {
        try {
          const browserProvider = new BrowserProvider(window.ethereum)
          setProvider(browserProvider)

          if (contractAddress) {
            const signer = await browserProvider.getSigner()
            const sessionContract = new Contract(contractAddress, SessionPaymentABI, signer)
            setContract(sessionContract)
          }
        } catch (error) {
          console.error("Failed to initialize provider:", error)
        }
      }

      initProvider()
    }
  }, [isConnected, contractAddress])

  // Check if wallet is already connected
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      checkConnection()
      
      // Listen for account changes
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false)
      setAddress(null)
    } else {
      setAddress(accounts[0])
      setIsConnected(true)
    }
  }

  const handleChainChanged = (newChainId: string) => {
    setChainId(newChainId)
    window.location.reload()
  }

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(currentChainId)
      }
    } catch (error) {
      console.error("Failed to check connection:", error)
    }
  }

  const connectWallet = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("Please install MetaMask or another Web3 wallet")
      return false
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)

        const currentChainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(currentChainId)

        // Check if on Base network
        const isBaseNetwork =
          currentChainId === BASE_MAINNET_CHAIN_ID || currentChainId === BASE_SEPOLIA_CHAIN_ID

        if (!isBaseNetwork) {
          toast.info("Please switch to Base network")
          await switchToBaseNetwork()
        } else {
          toast.success("Wallet connected successfully!")
        }

        return true
      }

      return false
    } catch (error: any) {
      console.error("Failed to connect wallet:", error)
      toast.error(error.message || "Failed to connect wallet")
      return false
    }
  }, [])

  const switchToBaseNetwork = useCallback(
    async (network: "mainnet" | "sepolia" = "sepolia"): Promise<boolean> => {
      if (typeof window === "undefined" || !window.ethereum) {
        toast.error("Please install MetaMask or another Web3 wallet")
        return false
      }

      try {
        const networkConfig = BASE_NETWORKS[network]

        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: networkConfig.chainId }],
        })

        setChainId(networkConfig.chainId)
        toast.success(`Switched to ${networkConfig.chainName}`)
        return true
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            const networkConfig = BASE_NETWORKS[network]
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [networkConfig],
            })
            setChainId(networkConfig.chainId)
            toast.success(`Added and switched to ${networkConfig.chainName}`)
            return true
          } catch (addError: any) {
            console.error("Failed to add network:", addError)
            toast.error("Failed to add Base network")
            return false
          }
        }
        console.error("Failed to switch network:", switchError)
        toast.error("Failed to switch to Base network")
        return false
      }
    },
    [],
  )

  const sendPayment = useCallback(
    async (request: PaymentRequest): Promise<PaymentResult | null> => {
      if (!isConnected || !address) {
        toast.error("Please connect your wallet first")
        return null
      }

      if (!contract || !contractAddress) {
        toast.error("Smart contract not configured")
        return null
      }

      setIsProcessing(true)

      try {
        // Convert amount to wei
        const amountInWei = parseEther(request.amount.toString())

        // Call the contribute function
        const tx = await contract.contribute(request.sessionId, {
          value: amountInWei,
        })

        toast.info("Transaction submitted. Waiting for confirmation...")

        // Wait for transaction confirmation
        const receipt = await tx.wait()

        const result: PaymentResult = {
          transactionHash: receipt.hash,
          amount: request.amount,
          timestamp: new Date(),
        }

        toast.success(`Payment of ${request.amount} ETH sent successfully!`)
        return result
      } catch (error: any) {
        console.error("Payment failed:", error)
        
        // Handle specific error cases
        if (error.code === "ACTION_REJECTED") {
          toast.error("Transaction rejected by user")
        } else if (error.message?.includes("insufficient funds")) {
          toast.error("Insufficient funds for transaction")
        } else {
          toast.error(error.reason || error.message || "Payment failed. Please try again.")
        }
        
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [isConnected, address, contract, contractAddress],
  )

  const getSessionData = useCallback(
    async (sessionId: string): Promise<SessionData | null> => {
      if (!contract) {
        console.error("Contract not initialized")
        return null
      }

      try {
        const session = await contract.getSession(sessionId)
        return {
          creator: session.creator,
          goalAmount: session.goalAmount,
          currentAmount: session.currentAmount,
          contributionCount: session.contributionCount,
          isActive: session.isActive,
          fundsWithdrawn: session.fundsWithdrawn,
          createdAt: session.createdAt,
          closedAt: session.closedAt,
        }
      } catch (error) {
        console.error("Failed to get session data:", error)
        return null
      }
    },
    [contract],
  )

  const createSession = useCallback(
    async (sessionId: string, goalAmount: number): Promise<boolean> => {
      if (!isConnected || !address) {
        toast.error("Please connect your wallet first")
        return false
      }

      if (!contract || !contractAddress) {
        toast.error("Smart contract not configured")
        return false
      }

      setIsProcessing(true)

      try {
        // Convert goal amount to wei
        const goalAmountInWei = parseEther(goalAmount.toString())

        // Call the createSession function
        const tx = await contract.createSession(sessionId, goalAmountInWei)

        toast.info("Creating session on blockchain...")

        // Wait for transaction confirmation
        await tx.wait()

        toast.success("Session created on blockchain successfully!")
        return true
      } catch (error: any) {
        console.error("Failed to create session:", error)
        
        // Handle specific error cases
        if (error.code === "ACTION_REJECTED") {
          toast.error("Transaction rejected by user")
        } else if (error.message?.includes("Session already exists")) {
          console.log("Session already exists on blockchain")
          return true // Session already exists, treat as success
        } else {
          toast.error(error.reason || error.message || "Failed to create session")
        }
        
        return false
      } finally {
        setIsProcessing(false)
      }
    },
    [isConnected, address, contract, contractAddress],
  )

  const getBalance = useCallback(async (): Promise<string | null> => {
    if (!provider || !address) return null

    try {
      const balance = await provider.getBalance(address)
      return formatEther(balance)
    } catch (error) {
      console.error("Failed to get balance:", error)
      return null
    }
  }, [provider, address])

  const disconnectWallet = useCallback(() => {
    setIsConnected(false)
    setAddress(null)
    setProvider(null)
    setContract(null)
    toast.info("Wallet disconnected")
  }, [])

  return {
    // Connection state
    isConnected,
    address,
    chainId,
    isProcessing,

    // Actions
    connectWallet,
    disconnectWallet,
    switchToBaseNetwork,
    sendPayment,
    createSession,
    getSessionData,
    getBalance,

    // Contract
    contract,
    contractAddress,
  }
}
