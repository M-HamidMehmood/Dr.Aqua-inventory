import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select } from '../ui/select'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import {
  MessageSquare,
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
} from 'lucide-react'

export default function BulkWhatsAppModal({
  isOpen,
  onClose,
  customers = [],
}) {
  const [targetGroup, setTargetGroup] = useState('overdue') // 'overdue' | 'due_soon' | 'all'
  const [templateText, setTemplateText] = useState(
    `Assalam-o-Alaikum {{customer_name}},\n\nThis is a priority notification from Dr. Aqua Pure Water Solutions regarding your installed {{installed_model}}.\n\nOur service telemetry records show that your plant's scheduled filter replacement is overdue by {{days_overdue}} days. Operating with depleted filters can reduce membrane life in high-TDS groundwater.\n\nOur Bahawalpur field van is operating in your sector tomorrow. Would you like to schedule a complimentary TDS test and cartridge renewal?`
  )

  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastProgress, setBroadcastProgress] = useState(0)
  const [sentCount, setSentCount] = useState(0)

  const targetedCustomers = customers.filter((c) => {
    if (targetGroup === 'all') return true
    if (targetGroup === 'overdue') return c.radarStatus === 'overdue'
    if (targetGroup === 'due_soon') return c.radarStatus === 'due_soon'
    return true
  })

  // Insert template placeholder chip
  const handleInsertPlaceholder = (placeholder) => {
    setTemplateText((prev) => `${prev} ${placeholder}`)
  }

  // Preview interpolation with the first targeted customer
  const sampleCustomer = targetedCustomers[0] || {
    name: 'Tariq Mehmood',
    installedUnit: 'R.O 100 GPD Plant (Heavy Stand)',
    daysSinceLastService: 68,
    permeateTdsPpm: 24,
  }

  const previewMessage = templateText
    .replace(/{{customer_name}}/g, sampleCustomer.name)
    .replace(/{{installed_model}}/g, sampleCustomer.installedUnit)
    .replace(/{{days_overdue}}/g, String(sampleCustomer.daysSinceLastService - 60))
    .replace(/{{last_tds}}/g, String(sampleCustomer.permeateTdsPpm))

  // Simulate Broadcast Execution
  const handleStartBroadcast = () => {
    if (targetedCustomers.length === 0) return
    setIsBroadcasting(true)
    setBroadcastProgress(0)
    setSentCount(0)

    let current = 0
    const total = targetedCustomers.length
    const interval = setInterval(() => {
      current += 1
      setSentCount(current)
      setBroadcastProgress(Math.round((current / total) * 100))

      if (current >= total) {
        clearInterval(interval)
        setTimeout(() => {
          setIsBroadcasting(false)
          alert(`Successfully dispatched ${total} WhatsApp broadcast reminders!`)
          onClose()
        }, 600)
      }
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-6 rounded-3xl border-border/80 shadow-2xl space-y-4">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider font-mono flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct WhatsApp Meta API Gateway</span>
            </span>
            <Badge variant="whatsapp" className="text-[10px] font-bold">
              {targetedCustomers.length} Recipients Selected
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold font-outfit text-foreground">
            Bulk WhatsApp Service Reminder Broadcast Center
          </DialogTitle>
          <DialogDescription className="text-xs">
            Automated service radar dispatch via Dr. Aqua verified business WhatsApp channel.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
          {/* Left Column: Composer Controls (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            {/* Target Audience Selector */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Target Audience Segment</Label>
              <Select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)}>
                <option value="overdue">🚨 Overdue Filter Replacements (&gt;60 Days)</option>
                <option value="due_soon">🟡 Scheduled Due This Month (30-60 Days)</option>
                <option value="all">👥 All Registered Clients (12 Active)</option>
              </Select>
            </div>

            {/* Placeholder Chips */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Dynamic Fields:</span>
                <span>Click to insert tag</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  { tag: '{{customer_name}}', label: 'Client Name' },
                  { tag: '{{installed_model}}', label: 'RO Model' },
                  { tag: '{{days_overdue}}', label: 'Days Overdue' },
                  { tag: '{{last_tds}}', label: 'TDS PPM' },
                ].map((chip) => (
                  <button
                    key={chip.tag}
                    type="button"
                    onClick={() => handleInsertPlaceholder(chip.tag)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-mono font-semibold border border-border/60 transition-colors cursor-pointer"
                  >
                    + {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Textarea */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Message Template Body</Label>
              <Textarea
                rows={6}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                className="font-sans text-xs leading-relaxed resize-none"
              />
            </div>

            {/* Throttler note */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Smart dispatch throttler: 1 message every 500ms</span>
            </div>
          </div>

          {/* Right Column: Live WhatsApp Chat Bubble Preview (5 cols) */}
          <div className="md:col-span-5 space-y-2">
            <Label className="text-xs font-semibold">Live Message Preview</Label>
            <div className="p-3.5 rounded-2xl bg-[#0b141a] text-white space-y-2 min-h-[260px] flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold">
                    A
                  </div>
                  <span className="text-[11px] font-bold">Dr. Aqua Verified</span>
                </div>
                <span className="text-[9px] text-emerald-400 font-semibold font-mono">10:45 AM</span>
              </div>

              {/* Chat Bubble */}
              <div className="bg-[#005c4b] p-3 rounded-2xl rounded-tl-xs text-[11px] text-slate-100 leading-relaxed space-y-2 shadow-xs">
                <div className="whitespace-pre-wrap">{previewMessage}</div>
                <div className="text-[9px] text-emerald-200 text-right">✓✓ Read</div>
              </div>

              <div className="text-[9px] text-center text-slate-400">
                Preview interpolated with {sampleCustomer.name}
              </div>
            </div>
          </div>
        </div>

        {/* Broadcast Execution Status */}
        {isBroadcasting && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Broadcasting Queue In Progress...</span>
              </span>
              <span className="font-mono font-bold text-emerald-800">
                {sentCount} / {targetedCustomers.length} Dispatched ({broadcastProgress}%)
              </span>
            </div>
            <Progress
              value={broadcastProgress}
              className="h-2"
              indicatorClassName="bg-emerald-500"
            />
          </div>
        )}

        <DialogFooter className="pt-2 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isBroadcasting}>
            Cancel
          </Button>
          <Button
            variant="whatsapp"
            size="sm"
            onClick={handleStartBroadcast}
            disabled={isBroadcasting || targetedCustomers.length === 0}
            className="font-bold font-outfit gap-1.5 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isBroadcasting
                ? 'Dispatching...'
                : `Broadcast to ${targetedCustomers.length} Customers`}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
