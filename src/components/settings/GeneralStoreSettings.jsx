import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import DrAquaLogo from '../ui/DrAquaLogo'
import { mockGeneralSettings } from '../../data/mock/settings.mock'
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Save,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'

export default function GeneralStoreSettings({ onSaveToast }) {
  const [settings, setSettings] = useState(mockGeneralSettings)
  const [isSaved, setIsSaved] = useState(false)

  const handleChange = (field, val) => {
    setSettings((prev) => ({ ...prev, [field]: val }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
    if (onSaveToast) onSaveToast('Store profile & tax invoicing configuration updated!')
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 text-left font-sans">
      {/* Brand Identity & Main Branch Card */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Corporate Branding & Flagship Branch</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Official enterprise trade credentials printed on customer A4 PDF tax invoices and thermal receipts.
            </CardDescription>
          </div>
          <DrAquaLogo size="sm" />
        </CardHeader>

        <CardContent className="p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Registered Business Title</Label>
              <Input
                value={settings.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="font-outfit font-semibold text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Primary Branch Identifier</Label>
              <Input
                value={settings.branchName}
                onChange={(e) => handleChange('branchName', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Physical Head Office & Workshop Address</Label>
            <Input
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Customer Helpline (WhatsApp UAN)</Label>
              <Input
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Corporate Email Address</Label>
              <Input
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax & Invoicing Configuration */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60">
          <CardTitle className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>FBR Fiscal Tax & Invoicing Rules</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Tax identification numbers and legal invoice disclaimers.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">National Tax Number (NTN)</Label>
              <Input
                value={settings.ntn}
                onChange={(e) => handleChange('ntn', e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Sales Tax Registration (STRN)</Label>
              <Input
                value={settings.strn}
                onChange={(e) => handleChange('strn', e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold">Invoice Number Prefix</Label>
              <Input
                value={settings.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-muted/25 rounded-xl border border-border/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-foreground">
                GST Drinking Water Exemption (0% Tax)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Under Sixth Schedule FBR, clean packaged and reverse osmosis drinking water is sales tax exempt.
              </p>
            </div>
            <Badge variant="success" className="font-mono text-[10px]">
              Exempted (0%)
            </Badge>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Urdu Customer Tagline (Invoice Footer)</Label>
            <Input
              value={settings.invoiceFooterUrdu}
              onChange={(e) => handleChange('invoiceFooterUrdu', e.target.value)}
              className="text-right text-xs font-serif"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Warranty & Service Radar Disclaimer Clause</Label>
            <Input
              value={settings.warrantyClause}
              onChange={(e) => handleChange('warrantyClause', e.target.value)}
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Action Bar */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="submit" size="sm" className="font-bold font-outfit gap-1.5 shadow-md">
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Settings Saved!' : 'Save Store Configuration'}</span>
        </Button>
      </div>
    </form>
  )
}
