import React, { useRef } from 'react'
import { jsPDF } from 'jspdf'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import DrAquaLogo from '../ui/DrAquaLogo'
import {
  Printer,
  Download,
  MessageSquare,
  CheckCircle2,
  FileText,
  Building2,
  ShieldCheck,
} from 'lucide-react'

export default function ReceiptPreviewModal({
  isOpen,
  onClose,
  sale,
  customer,
}) {
  const receiptRef = useRef(null)

  if (!sale) return null

  const items = sale.items || []
  const invoiceNum = sale.invoice || `INV-${Date.now()}`
  const formattedDate = new Date(sale.date || Date.now()).toLocaleString()
  const total = sale.total || items.reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0)

  // Generate Official A4 PDF via jsPDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4')

    // Header Branding
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(49, 39, 131) // Dr. Aqua Purple
    doc.text('Dr. AQUA', 14, 20)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Pure Water Solutions & Engineering Hub', 14, 26)
    doc.text('Model Town B, Circular Road, Bahawalpur, Punjab', 14, 30)
    doc.text('Phone: +92 334 7071759 | NTN: 8942103-7', 14, 34)

    // Invoice Meta Right-Aligned
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.text('TAX INVOICE / RECEIPT', 140, 20)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Invoice #: ${invoiceNum}`, 140, 26)
    doc.text(`Date: ${formattedDate}`, 140, 30)
    doc.text(`Status: PAID IN FULL`, 140, 34)

    // Divider
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.line(14, 38, 196, 38)

    // Bill To Customer Section
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text('BILL TO CLIENT:', 14, 45)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(51, 65, 85)
    doc.text(`Name: ${customer?.name || 'Walk-in Retail Customer'}`, 14, 50)
    doc.text(`Contact: ${customer?.contact || 'N/A'}`, 14, 54)
    doc.text(`Sector: ${customer?.sector || 'Bahawalpur'}`, 14, 58)
    doc.text(`Address: ${customer?.address || 'Counter POS Sale'}`, 14, 62)

    // Items Table Header
    let startY = 70
    doc.setFillColor(241, 245, 249)
    doc.rect(14, startY, 182, 7, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(71, 85, 105)
    doc.text('ITEM DESCRIPTION', 16, startY + 5)
    doc.text('QTY', 120, startY + 5)
    doc.text('UNIT PRICE', 142, startY + 5)
    doc.text('TOTAL (PKR)', 172, startY + 5)

    // Rows
    startY += 12
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(15, 23, 42)

    items.forEach((item) => {
      const itemTitle = item.name.length > 50 ? item.name.slice(0, 48) + '...' : item.name
      doc.text(itemTitle, 16, startY)
      doc.text(String(item.qty || 1), 122, startY)
      doc.text(`Rs. ${(item.price || 0).toLocaleString()}`, 142, startY)
      doc.text(`Rs. ${((item.price || 0) * (item.qty || 1)).toLocaleString()}`, 172, startY)
      startY += 7
    })

    // Totals Section
    startY += 4
    doc.line(14, startY, 196, startY)
    startY += 8

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text('GRAND TOTAL:', 130, startY)
    doc.setTextColor(8, 145, 178) // Dr. Aqua Cyan
    doc.text(`PKR ${total.toLocaleString()}`, 168, startY)

    // Service Radar Footnote
    startY += 20
    doc.setFillColor(248, 250, 252)
    doc.rect(14, startY, 182, 18, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(15, 23, 42)
    doc.text('SMART SERVICE RADAR & WARRANTY ASSURANCE', 18, startY + 5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text('• 1-Month Complimentary TDS audit and 2-Month filter replacement schedule registered.', 18, startY + 10)
    doc.text('• Original membrane seal guaranteed for 12 months. For emergency service call: 0334-7071759.', 18, startY + 14)

    doc.save(`Receipt-${invoiceNum}.pdf`)
  }

  const handleSendWhatsAppReceipt = () => {
    if (!customer?.contact) return
    const rawNumber = customer.contact.replace(/\D/g, '')
    const itemsSummary = items
      .map((i) => `• ${i.name} (x${i.qty || 1}) - Rs. ${(i.price * (i.qty || 1)).toLocaleString()}`)
      .join('\n')

    const message = encodeURIComponent(
      `Assalam-o-Alaikum ${customer.name},\nThank you for choosing Dr. Aqua Pure Water Solutions!\n\nHere is your official receipt:\nInvoice: ${invoiceNum}\nDate: ${formattedDate}\n\n${itemsSummary}\n\nTotal Paid: PKR ${total.toLocaleString()}\nPayment Method: ${sale.paymentMethod || 'Paid'}\n\nYour service radar has been activated. We will notify you for your complimentary 1-month check!`
    )
    window.open(`https://wa.me/${rawNumber}?text=${message}`, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-6 rounded-3xl border-border/80 shadow-2xl space-y-4 text-left font-sans">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider font-mono">
              Official Tax Invoice
            </span>
            <Badge variant="success" className="text-[10px] font-bold">
              PAID IN FULL
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold font-outfit text-foreground">
            A4 & Thermal Receipt Preview
          </DialogTitle>
          <DialogDescription className="text-xs">
            Invoice: <strong className="font-mono text-foreground">{invoiceNum}</strong> • Customer: <strong className="text-foreground">{customer?.name || 'Retail POS Customer'}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Realistic A4 Document Preview Card */}
        <div
          ref={receiptRef}
          className="p-5 bg-white text-slate-900 rounded-2xl border border-border shadow-md space-y-4 text-xs select-none"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <div>
              <DrAquaLogo size="sm" />
              <div className="text-[10px] text-slate-500 mt-1">
                Model Town B, Circular Road, Bahawalpur
              </div>
              <div className="text-[10px] text-slate-500">
                Phone: +92 334 7071759 • NTN: 8942103-7
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="font-bold text-xs text-slate-900 font-outfit">INVOICE #{invoiceNum}</div>
              <div className="text-[10px] text-slate-500">{formattedDate}</div>
              <div className="text-[10px] text-emerald-600 font-bold">Counter Terminal 01</div>
            </div>
          </div>

          {/* Customer */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-500">Billed To: </span>
              <strong className="text-slate-900">{customer?.name || 'Walk-in Retail Client'}</strong>
              {customer?.contact && <span className="text-slate-500"> ({customer.contact})</span>}
            </div>
            <div className="text-slate-500">
              {customer?.sector || 'Bahawalpur'}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-1">
            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-1 uppercase">
              <span className="col-span-7">Item Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-right">Total (PKR)</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 py-1.5 text-xs">
                  <div className="col-span-7 font-medium text-slate-900 truncate">
                    {item.name}
                  </div>
                  <div className="col-span-2 text-center font-mono text-slate-600">
                    {item.qty || 1}
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-slate-900">
                    Rs. {((item.price || 0) * (item.qty || 1)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 pt-2 flex items-baseline justify-between">
            <div className="text-[10px] text-slate-500">
              Payment via: <strong className="text-slate-900">{sale.paymentMethod || 'Cash / Raast'}</strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-600 font-semibold mr-2">Grand Total:</span>
              <span className="text-lg font-bold font-outfit text-cyan-700 font-mono">
                PKR {total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Urdu Footer */}
          <div className="text-center text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-serif">
            صاف اور شفاف پانی، صحت مند زندگی کی ضمانت — شکریہ!
          </div>
        </div>

        <DialogFooter className="pt-2 flex flex-wrap items-center justify-between sm:justify-end gap-2">
          {customer?.contact && (
            <Button
              variant="whatsapp"
              size="sm"
              onClick={handleSendWhatsAppReceipt}
              className="gap-1.5 font-outfit font-bold"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Receipt</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Thermal (80mm)</span>
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPDF}
            className="gap-1.5 font-bold font-outfit shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download A4 PDF</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
