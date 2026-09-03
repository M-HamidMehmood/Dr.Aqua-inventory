import React, { useState } from 'react'
import GeneralStoreSettings from './GeneralStoreSettings'
import WhatsAppAutomationBuilder from './WhatsAppAutomationBuilder'
import StaffRBACMatrix from './StaffRBACMatrix'
import CloudSyncBackupHub from './CloudSyncBackupHub'
import { Badge } from '../ui/badge'
import {
  Building2,
  MessageSquare,
  Users,
  Cloud,
  CheckCircle2,
  Settings,
  ShieldCheck,
} from 'lucide-react'

export default function SettingsManager() {
  const [activeSubTab, setActiveSubTab] = useState('store') // 'store' | 'whatsapp' | 'staff' | 'cloud'
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const subTabs = [
    { id: 'store', label: 'Store & Invoicing', icon: Building2, screen: 'Screen 23' },
    { id: 'whatsapp', label: 'WhatsApp Automation', icon: MessageSquare, screen: 'Screen 24' },
    { id: 'staff', label: 'Staff & RBAC Matrix', icon: Users, screen: 'Screen 25' },
    { id: 'cloud', label: 'Cloud Sync & Backups', icon: Cloud, screen: 'Screen 26' },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[640px] space-y-4 font-sans text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base font-outfit text-foreground">
              Enterprise System Settings & Configuration
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              Dr. Aqua OS v1.0
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage corporate branding, fiscal tax rules, automated WhatsApp templates, staff permissions, and cloud backups.
          </p>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-2xl border border-border/70 overflow-x-auto text-xs">
          {subTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap text-xs ${
                  isActive
                    ? 'bg-background text-foreground shadow-xs font-bold ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Settings Workspace Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeSubTab === 'store' && <GeneralStoreSettings onSaveToast={showToast} />}
        {activeSubTab === 'whatsapp' && <WhatsAppAutomationBuilder onSaveToast={showToast} />}
        {activeSubTab === 'staff' && <StaffRBACMatrix onSaveToast={showToast} />}
        {activeSubTab === 'cloud' && <CloudSyncBackupHub onSaveToast={showToast} />}
      </div>
    </div>
  )
}
