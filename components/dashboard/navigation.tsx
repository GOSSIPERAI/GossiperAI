"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Bell, Settings, LogOut, Wallet } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface DashboardNavigationProps {
  walletBalance: number | null
  onSignOut: () => void
}

export function DashboardNavigation({ walletBalance, onSignOut }: DashboardNavigationProps) {
  const { user } = useAuth()

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 p-0.5">
              <div className="w-full h-full rounded-md bg-primary/80 flex items-center justify-center">
                <Image
                  src="/gossiper-logo-white.png"
                  alt="Gossiper Logo"
                  width={128}
                  height={128}
                  className="w-20 h-20 object-contain scale-[2.5]"
                />
              </div>
            </div>
            <span className="text-xl font-bold">Gossiper</span>
          </Link>
          <div className="flex items-center space-x-4">
            {user?.wallet_connected && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {walletBalance !== null ? `${walletBalance.toFixed(4)} SOL` : "Connected"}
                </span>
              </div>
            )}
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.full_name?.charAt(0) || "U"}
                </span>
              </div>
              <span className="text-sm font-medium">{user?.full_name}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}