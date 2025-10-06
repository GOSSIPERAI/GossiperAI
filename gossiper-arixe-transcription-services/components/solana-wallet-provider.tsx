"use client"

import type React from "react"

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter
} from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import { useMemo } from "react"

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // Use devnet for development, mainnet-beta for production
  const endpoint = useMemo(() => clusterApiUrl("devnet"), [])

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
  ], [])

  // Error handler for wallet connection issues
  const onError = useMemo(
    () => (error: any) => {
      console.warn('Wallet error:', error.message || error)
      // Don't throw or display errors for auto-connection failures
      // Handle specific wallet errors gracefully
      if (error.name === 'WalletNotReadyError') {
        console.warn('Wallet not ready - extension may not be installed')
      }
    },
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false} 
        onError={onError}
        localStorageKey="gossiper-wallet"
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
