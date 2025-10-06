"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useSolana } from "@/hooks/use-solana"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Wallet, CreditCard, Zap } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  sessionTitle: string
  onPaymentSuccess: (amount: number) => void
}

export function PaymentModal({ isOpen, onClose, sessionId, sessionTitle, onPaymentSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState("0.01")
  const { sendPayment, isProcessing, connected, publicKey } = useSolana()

  const handlePayment = async () => {
    const paymentAmount = Number.parseFloat(amount)
    if (paymentAmount <= 0) return

    const result = await sendPayment({
      amount: paymentAmount,
      recipient: "GossipPoolAddress123456789", // This would be the actual pool address
      sessionId,
      description: `Payment for session: ${sessionTitle}`,
    })

    if (result) {
      onPaymentSuccess(paymentAmount)
      onClose()
    }
  }

  const presetAmounts = [0.01, 0.05, 0.1, 0.25]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Support This Session
          </DialogTitle>
          <DialogDescription>
            Make a payment to support this session's AI captioning and translation services.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            <p>
              Session: <span className="font-medium text-foreground">{sessionTitle}</span>
            </p>
            <p className="mt-1">Your contribution helps fund AI captioning and translation services.</p>
          </div>

          {!connected ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Connect Your Wallet</h3>
                <p className="text-sm text-muted-foreground mt-1">Connect your Solana wallet to make payments</p>
              </div>
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>
                    Connected: {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="amount">Payment Amount (SOL)</Label>
                <div className="flex gap-2">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                      className="flex-1"
                    >
                      {preset} SOL
                    </Button>
                  ))}
                </div>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter custom amount"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span>Network Fee:</span>
                <span className="text-muted-foreground">~0.000005 SOL</span>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing || Number.parseFloat(amount) <= 0}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay {amount} SOL
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
