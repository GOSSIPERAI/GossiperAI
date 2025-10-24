'use client'

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet } from "lucide-react"

interface WalletConnectButtonProps {
  className?: string
}

export function WalletConnectButton({ className }: WalletConnectButtonProps) {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

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

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={className}>
            <Wallet className="h-4 w-4 mr-2" />
            {address.slice(0, 6)}...{address.slice(-4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => disconnect()}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (connectors.length === 0) {
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
          Please install MetaMask or Coinbase Wallet
        </p>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className}>
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {connectors.map((connector) => (
          <DropdownMenuItem
            key={connector.id}
            onClick={() => connect({ connector })}
          >
            {connector.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

