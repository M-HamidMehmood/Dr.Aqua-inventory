import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { mockWhatsAppTemplates } from '../../data/mock/settings.mock'
import {
  MessageSquare,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Send,
  Save,
  Tag,
  Clock,
  ShieldCheck,
} from 'lucide-react'

export default function WhatsAppAutomationBuilder({ onSaveToast }) {
  const [templates, setTemplates] = useState(mockWhatsAppTemplates)
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl-1')

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0]

  const handleUpdateText = (newText) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplateId ? { ...t, messageText: newText } : t))
    )
  }

  const handleToggleActive = (enabled) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplateId ? { ...t, enabled } : t))
    )
    if (onSaveToast) onSaveToast(`Automation trigger ${enabled ? 'Enabled' : 'Disabled'}`)
  }

  const handleInsertVariable = (variable) => {
    handleUpdateText(currentTemplate.messageText + ' ' + variable)
  }

  // Generate simulated interpolated message for live phone preview
  const previewText = currentTemplate.messageText
    .replace(/{CustomerName}/g, 'Dr. Zafar Iqbal')
    .replace(/{TDS_Value}/g, '420')
    .replace(/{Sector}/g, 'Satellite Town')
    .replace(/{DueDate}/g, '15-Nov-2023')
    .replace(/{TechnicianName}/g, 'Hamza Abbasi')
    .replace(/{TimeSlot}/g, '02:00 PM - 03:30 PM')
    .replace(/{InvoiceNumber}/g, 'INV-2023-9981')
    .replace(/{TotalAmount}/g, '7,000')
    .replace(/{PaymentMethod}/g, 'Raast Instant QR')

  const handleSendTest = () => {
    const encoded = encodeURIComponent(previewText)
    window.open(`https://wa.me/923347071759?text=${encoded}`, '_blank')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-left font-sans">
      {/* Left Column: Template Editor (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Template Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setSelectedTemplateId(tpl.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 select-none ${
                selectedTemplateId === tpl.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/25 shadow-xs'
                  : 'border-border/80 bg-card hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs font-outfit text-foreground truncate">
                  {tpl.name}
                </span>
                <span className={`w-2 h-2 rounded-full ${tpl.enabled ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">{tpl.triggerEvent}</div>
            </div>
          ))}
        </div>

        {/* Dynamic Template Configuration Card */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{currentTemplate.name}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Triggered automatically by: <strong className="text-foreground">{currentTemplate.triggerEvent}</strong>
              </CardDescription>
            </div>

            {/* Automation Toggle Switch */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {currentTemplate.enabled ? 'Active' : 'Paused'}
              </span>
              <Switch checked={currentTemplate.enabled} onCheckedChange={handleToggleActive} />
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3.5 text-xs">
            {/* Variable Tag Inserters */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Click to Insert Dynamic Placeholder Tags:</span>
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '{CustomerName}',
                  '{TDS_Value}',
                  '{Sector}',
                  '{DueDate}',
                  '{TechnicianName}',
                  '{TimeSlot}',
                  '{InvoiceNumber}',
                  '{TotalAmount}',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertVariable(tag)}
                    className="px-2.5 py-1 rounded-lg bg-muted border border-border/70 text-[11px] font-mono text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Editor */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Message Text Template (WhatsApp UTF-8)</Label>
              <Textarea
                rows={6}
                value={currentTemplate.messageText}
                onChange={(e) => handleUpdateText(e.target.value)}
                className="font-sans text-xs leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="text-[11px] text-muted-foreground">
                Length: {currentTemplate.messageText.length} characters • 1 WhatsApp SMS Unit
              </span>
              <Button
                size="sm"
                onClick={() => onSaveToast && onSaveToast('WhatsApp template saved!')}
                className="gap-1.5 font-bold font-outfit"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Template</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Interactive Mobile Chat Preview Frame (5 cols) */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <div className="w-full max-w-[340px] bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-700 select-none">
          {/* Phone Top Speaker & Camera Notch */}
          <div className="flex justify-center mb-2">
            <div className="w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <div className="w-8 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>

          {/* Screen Body */}
          <div className="bg-[#0b141a] rounded-[2rem] overflow-hidden flex flex-col h-[480px]">
            {/* WhatsApp Top Header */}
            <div className="bg-[#1f2c34] px-3 py-2.5 flex items-center justify-between text-white border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                  DA
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    <span>Dr. Aqua Support</span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 text-[8px] flex items-center justify-center">
                      ✓
                    </span>
                  </div>
                  <div className="text-[9px] text-emerald-400">online</div>
                </div>
              </div>

              <div className="text-[10px] text-white/60">12:00 PM</div>
            </div>

            {/* Chat Wallpaper Canvas */}
            <div className="flex-1 p-3 overflow-y-auto bg-[radial-gradient(#12242a_1px,transparent_1px)] [background-size:12px_12px] flex flex-col justify-end">
              {/* WhatsApp Bubble (Outbound) */}
              <div className="max-w-[90%] self-end bg-[#005c4b] text-[#e9edef] p-3 rounded-2xl rounded-tr-xs shadow-md space-y-1.5 text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="whitespace-pre-wrap">{previewText}</p>
                <div className="flex items-center justify-end gap-1 text-[9px] text-white/60 pt-0.5">
                  <span>12:05 PM</span>
                  <span className="text-cyan-300 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Bottom Simulated Input Bar */}
            <div className="bg-[#1f2c34] p-2 flex items-center gap-2">
              <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[11px] text-white/50">
                Type a message...
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Test Trigger Button */}
        <Button
          variant="whatsapp"
          size="sm"
          onClick={handleSendTest}
          className="mt-3 gap-1.5 text-xs font-bold font-outfit rounded-xl shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Launch WhatsApp Web Test</span>
        </Button>
      </div>
    </div>
  )
}
