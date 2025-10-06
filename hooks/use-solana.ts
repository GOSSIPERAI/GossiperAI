"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useState, useCallback } from "react"
import { toast } from "sonner"

export interface PaymentRequest {
  amount: number // in SOL
  recipient: string
  sessionId: string
  description?: string
}

export interface PaymentResult {
  signature: string
  amount: number
  timestamp: Date
}

export function useSolana() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)

  const sendPayment = useCallback(
    async (request: PaymentRequest): Promise<PaymentResult | null> => {
      if (!publicKey || !connected) {
        toast.error("Please connect your Solana wallet first")
        return null
      }

      setIsProcessing(true)

      try {
        const recipientPubkey = new PublicKey(request.recipient)
        const lamports = request.amount * LAMPORTS_PER_SOL

        // Create transaction
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubkey,
            lamports,
          }),
        )

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = publicKey

        // Send transaction
        const signature = await sendTransaction(transaction, connection)

        // Wait for confirmation
        await connection.confirmTransaction(signature, "confirmed")

        const result: PaymentResult = {
          signature,
          amount: request.amount,
          timestamp: new Date(),
        }

        toast.success(`Payment of ${request.amount} SOL sent successfully!`)
        return result
      } catch (error) {
        console.error("Payment failed:", error)
        toast.error("Payment failed. Please try again.")
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [publicKey, connected, sendTransaction, connection],
  )

  const getBalance = useCallback(async (): Promise<number | null> => {
    if (!publicKey || !connected) return null

    try {
      const balance = await connection.getBalance(publicKey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error("Failed to get balance:", error)
      return null
    }
  }, [publicKey, connected, connection])

  return {
    sendPayment,
    getBalance,
    isProcessing,
    connected,
    publicKey: publicKey?.toString() || null,
  }
}
