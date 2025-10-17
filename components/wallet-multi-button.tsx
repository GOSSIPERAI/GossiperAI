'use client'

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface WalletMultiButtonWrapperProps {
  className?: string
}

export function WalletMultiButtonWrapper({ className }: WalletMultiButtonWrapperProps) {
  const [mounted, setMounted] = useState(false)
  const { wallets, select, connecting, connected, publicKey } = useWallet()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <span>Loading wallet options...</span>
      </div>
    )
  }

  // Check if any wallets are available
  const availableWallets = wallets.filter(wallet => wallet.readyState === 'Installed')
  
  // If no wallets are installed, show a helpful message
  if (availableWallets.length === 0) {
    return (
      <div className={`${className} flex flex-col items-center justify-center space-y-2`}>
        <Button 
          disabled 
          className="w-full"
          variant="outline"
        >
          No wallet detected
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Please install Phantom or Solflare wallet extension
        </p>
      </div>
    )
  }

  return <WalletMultiButton className={className} />
}
