import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { mockPaymentGateways } from '../../data/mock/pos.mock'
import {
  QrCode,
  Smartphone,
  Banknote,
  CheckCircle2,
  Clock,
  RefreshCw,
  Building2,
  ShieldCheck,
} from 'lucide-react'

export default function DigitalCheckoutModal({
  isOpen,
  onClose,
  totalAmount = 0,
  customer,
  onConfirmPayment,
}) {
  const [paymentMethod, setPaymentMethod] = useState('raast') // 'raast' | 'jazzcash' | 'easypaisa' | 'cash'
  const [cashReceived, setCashReceived] = useState(String(totalAmount))
  const [transactionRef, setTransactionRef] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // 5-minute dynamic QR expiration timer
  const [qrSecondsLeft, setQrSecondsLeft] = useState(300)

  useEffect(() => {
    if (isOpen) {
      setQrSecondsLeft(300)
      setCashReceived(String(totalAmount))
      setTransactionRef('')
    }
  }, [isOpen, totalAmount])

  useEffect(() => {
    let timer = null
    if (isOpen && qrSecondsLeft > 0) {
      timer = setInterval(() => {
        setQrSecondsLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isOpen, qrSecondsLeft])

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const received = parseFloat(cashReceived) || 0
  const changeDue = Math.max(0, received - totalAmount)

  const handleComplete = (e) => {
    e.preventDefault()
    setIsProcessing(true)

    setTimeout(() => {
      setIsProcessing(false)
      onConfirmPayment({
        method: paymentMethod,
        amount: totalAmount,
        cashReceived: paymentMethod === 'cash' ? received : totalAmount,
        changeDue: paymentMethod === 'cash' ? changeDue : 0,
        transactionRef: transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
        status: 'Paid',
      })
      onClose()
    }, 450)
  }

  const gatewayInfo = mockPaymentGateways[paymentMethod]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 rounded-3xl border-border/80 shadow-2xl space-y-4 text-left font-sans">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider font-mono">
              POS Gateway Checkout
            </span>
            <Badge variant="outline" className="text-[10px]">
              Currency: PKR
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold font-outfit text-foreground">
            Settle Cart & Digital Checkout
          </DialogTitle>
          <DialogDescription className="text-xs">
            Client: <strong className="text-foreground">{customer?.name || 'Walk-in Retail Customer'}</strong> • Total: <strong className="text-foreground font-mono font-bold">PKR {totalAmount.toLocaleString()}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Clean RadioGroup for Payment Method */}
        <div className="space-y-1.5 text-xs">
          <Label className="text-xs font-semibold">Select Settlement Channel</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'raast', label: '📱 Raast P2M', sub: 'SBP Instant' },
              { id: 'jazzcash', label: '🟠 JazzCash', sub: 'Till QR' },
              { id: 'easypaisa', label: '🟢 EasyPaisa', sub: 'Wallet QR' },
              { id: 'cash', label: '💵 Cash Counter', sub: 'Drawer' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id)}
                className={`py-2 px-2 rounded-xl text-center flex flex-col items-center gap-0.5 transition-all cursor-pointer border ${
                  paymentMethod === m.id
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/25'
                    : 'border-border/80 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className="text-xs">{m.label}</span>
                <span className="text-[9px] font-normal opacity-75">{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Payment Body */}
        {paymentMethod !== 'cash' ? (
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider font-mono">
                  {gatewayInfo?.name || 'State Bank Raast Instant Payment'}
                </span>
                <div className="text-xs font-semibold text-foreground">
                  Scan to Pay from any Pakistani Banking App (1Link / Raast)
                </div>
              </div>

              {/* Dynamic QR Expiration Countdown */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background border border-border/80 text-[11px] font-mono text-muted-foreground">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Expires in <strong className="text-foreground">{formatTimer(qrSecondsLeft)}</strong></span>
              </div>
            </div>

            {/* QR Code Graphic Box */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-background p-3.5 rounded-xl border border-border/60">
              <div className="w-32 h-32 bg-white p-2.5 rounded-2xl border border-border flex items-center justify-center shadow-xs shrink-0 relative">
                <QrCode className="w-full h-full text-black" />
                {qrSecondsLeft === 0 && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-center p-2">
                    <span className="text-[10px] font-bold text-destructive">Expired</span>
                    <button
                      type="button"
                      onClick={() => setQrSecondsLeft(300)}
                      className="text-[9px] text-primary underline mt-1 flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Refresh
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground flex-1 w-full">
                <div className="flex justify-between">
                  <span>Merchant ID:</span>
                  <strong className="font-mono text-foreground">{gatewayInfo?.merchantId || 'DRAQUA-BWP-01'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Raast / Till Alias:</span>
                  <strong className="font-mono text-foreground">{gatewayInfo?.alias || gatewayInfo?.tillId || '03347071759'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Settlement Rail:</span>
                  <span className="text-emerald-600 font-semibold">{gatewayInfo?.settlement || 'Instant Real-Time (0% Fee)'}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/50">
                  <span className="font-semibold text-foreground">Amount:</span>
                  <strong className="font-mono text-primary text-sm font-bold">
                    PKR {totalAmount.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {/* Transaction Ref Input */}
            <div className="space-y-1 text-xs">
              <Label htmlFor="txn-ref" className="text-xs font-semibold">
                Customer Reference / Transaction ID (TID)
              </Label>
              <Input
                id="txn-ref"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. RST-99421038"
                className="font-mono text-xs"
              />
            </div>
          </div>
        ) : (
          /* Cash Calculator */
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
            <div className="space-y-1 text-xs">
              <Label className="text-xs font-semibold">Cash Tendered by Customer (PKR)</Label>
              <Input
                type="number"
                min={totalAmount}
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="font-mono text-base font-bold text-foreground"
              />
            </div>

            {/* Quick Currency Note Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[totalAmount, 5000, 10000, 20000, 30000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCashReceived(String(amt))}
                  className="px-2.5 py-1 rounded-lg border border-border/80 bg-background text-[11px] font-mono font-semibold hover:bg-muted cursor-pointer transition-colors"
                >
                  Rs. {amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Change Due Visualizer */}
            <div className="p-3 bg-background rounded-xl border border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Change to Return Customer:</span>
              <span className="text-base font-bold font-mono text-emerald-600 font-outfit">
                PKR {changeDue.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="pt-2 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleComplete}
            disabled={isProcessing || (paymentMethod === 'cash' && received < totalAmount)}
            className="font-bold font-outfit gap-1.5 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isProcessing ? 'Verifying Network...' : `Confirm PKR ${totalAmount.toLocaleString()}`}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
