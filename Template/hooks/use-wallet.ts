"use client"

import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import { useState, useCallback } from "react"
import { toast } from "sonner"

export interface PaymentRequest {
  amount: number // in ETH
  recipient: string
  sessionId: string
  description?: string
}

export interface PaymentResult {
  hash: string
  amount: number
  timestamp: Date
}

export function useWallet() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const { sendTransaction, data: hash, isPending } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const sendPayment = useCallback(
    async (request: PaymentRequest): Promise<PaymentResult | null> => {
      if (!address || !isConnected) {
        toast.error("Please connect your wallet first")
        return null
      }

      if (!request.recipient.startsWith('0x')) {
        toast.error("Invalid recipient address")
        return null
      }

      setIsProcessing(true)

      try {
        const txHash = await sendTransaction({
          to: request.recipient as `0x${string}`,
          value: parseEther(request.amount.toString()),
        })

        // Wait for confirmation
        if (txHash) {
          const result: PaymentResult = {
            hash: txHash,
            amount: request.amount,
            timestamp: new Date(),
          }

          toast.success(`Payment of ${request.amount} ETH sent successfully!`)
          return result
        }

        return null
      } catch (error: any) {
        console.error("Payment failed:", error)
        toast.error(error.message || "Payment failed. Please try again.")
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [address, isConnected, sendTransaction],
  )

  const getBalance = useCallback(async (): Promise<number | null> => {
    if (!balance) return null

    try {
      // Convert balance from wei to ETH
      return Number(balance.formatted)
    } catch (error) {
      console.error("Failed to get balance:", error)
      return null
    }
  }, [balance])

  return {
    sendPayment,
    getBalance,
    isProcessing: isProcessing || isPending || isConfirming,
    connected: isConnected,
    publicKey: address || null,
    address: address || null,
    balance: balance ? Number(balance.formatted) : null,
    chain: chain?.name || 'Unknown',
  }
}

