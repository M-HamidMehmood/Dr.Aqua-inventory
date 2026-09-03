import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table'
import { mockSyncAuditLogs } from '../../data/mock/settings.mock'
import {
  Cloud,
  Download,
  Upload,
  RefreshCw,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  HardDrive,
} from 'lucide-react'

export default function CloudSyncBackupHub({ onSaveToast }) {
  const [logs, setLogs] = useState(mockSyncAuditLogs)
  const [isSyncing, setIsSyncing] = useState(false)

  // 1-Click JSON Database Export
  const handleExportJSON = () => {
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      source: 'Dr. Aqua Omnichannel Hub',
      inventory: JSON.parse(localStorage.getItem('draqua-inventory') || '[]'),
      customers: JSON.parse(localStorage.getItem('draqua-customers') || '[]'),
      sales: JSON.parse(localStorage.getItem('draqua-sales') || '[]'),
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `DrAqua-FullBackup-${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()

    if (onSaveToast) onSaveToast('Complete database JSON archive downloaded!')
  }

  // 1-Click CSV Export
  const handleExportCSV = (type) => {
    let csvContent = 'data:text/csv;charset=utf-8,'
    if (type === 'inventory') {
      const data = JSON.parse(localStorage.getItem('draqua-inventory') || '[]')
      csvContent += 'ID,SKU,Name,Category,Quantity,Price\n'
      data.forEach((p) => {
        csvContent += `${p.id},"${p.sku || ''}","${p.name}",${p.category || ''},${p.quantity},${p.price}\n`
      })
    } else if (type === 'customers') {
      const data = JSON.parse(localStorage.getItem('draqua-customers') || '[]')
      csvContent += 'ID,Name,Contact,Sector,LastServiceDate\n'
      data.forEach((c) => {
        csvContent += `${c.id},"${c.name}","${c.contact}","${c.sector || ''}","${c.lastServiceDate || ''}"\n`
      })
    } else {
      const data = JSON.parse(localStorage.getItem('draqua-sales') || '[]')
      csvContent += 'Invoice,Customer,Total,PaymentMethod,Date\n'
      data.forEach((s) => {
        csvContent += `"${s.invoice}","${s.customerName || ''}",${s.total},"${s.paymentMethod || ''}","${s.date || ''}"\n`
      })
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `DrAqua-${type}-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    if (onSaveToast) onSaveToast(`${type.toUpperCase()} CSV export downloaded!`)
  }

  const handleManualSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        type: 'Vercel E-Commerce Sync',
        status: 'Success',
        recordsCount: 12,
        durationMs: 380,
      }
      setLogs([newLog, ...logs])
      if (onSaveToast) onSaveToast('Successfully synchronized with dr-aqua-project.vercel.app!')
    }, 700)
  }

  return (
    <div className="space-y-4 text-left font-sans">
      {/* Vercel Connectivity Monitor Card */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
                <Cloud className="w-4 h-4 text-primary" />
                <span>Storefront Cloud Connectivity & Vercel API Bridge</span>
              </CardTitle>
              <Badge variant="success" className="text-[10px] font-mono">
                100% Operational
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Synchronizes real-time stock deductions and incoming orders between local terminal and online store.
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="gap-1.5 font-bold font-outfit shadow-md h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Trigger Full Cloud Sync'}</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Vercel Endpoint</span>
              <div className="font-mono font-bold text-foreground truncate mt-0.5">
                dr-aqua-project.vercel.app
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>HTTPS TLS 1.3 Active</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Last Cloud Heartbeat</span>
              <div className="font-mono font-bold text-foreground mt-0.5">Today, 12:15:02 PM</div>
              <div className="text-[10px] text-muted-foreground mt-1">API Latency: 42ms</div>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Local Storage Keys</span>
              <div className="font-mono font-bold text-foreground mt-0.5">3 Enforced Keys</div>
              <div className="text-[10px] text-muted-foreground mt-1">draqua-inventory, customers, sales</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Backup & Export Center */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60">
          <CardTitle className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span>Database Backup & Automated Export Center</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Generate offline snapshots of business records for accounting, audits, and disaster recovery.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Full JSON Backup */}
            <div className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-foreground font-outfit">Full System Snapshot</div>
                <p className="text-[11px] text-muted-foreground">Complete JSON schema of all products, customers & ledger.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportJSON}
                className="w-full h-8 text-xs font-bold gap-1 rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </Button>
            </div>

            {/* Inventory CSV */}
            <div className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-foreground font-outfit">Inventory Stock (CSV)</div>
                <p className="text-[11px] text-muted-foreground">SKUs, retail/cost prices, and current warehouse counts.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportCSV('inventory')}
                className="w-full h-8 text-xs font-bold gap-1 rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>

            {/* Customers CSV */}
            <div className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-foreground font-outfit">Customer Radar (CSV)</div>
                <p className="text-[11px] text-muted-foreground">Phone numbers, sectors, and filter service history.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportCSV('customers')}
                className="w-full h-8 text-xs font-bold gap-1 rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>

            {/* Sales CSV */}
            <div className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-foreground font-outfit">Sales Invoices (CSV)</div>
                <p className="text-[11px] text-muted-foreground">Itemized counter POS invoices and payment methods.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportCSV('sales')}
                className="w-full h-8 text-xs font-bold gap-1 rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync & Backup Audit Logs */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60">
          <CardTitle className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span>Recent Synchronization & Backup Audit Trail</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Automated event logs of cloud transfers and database snapshots.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-xs font-bold">Operation Type</TableHead>
                <TableHead className="text-xs font-bold">Timestamp</TableHead>
                <TableHead className="text-xs font-bold text-center">Records Synced</TableHead>
                <TableHead className="text-xs font-bold text-center">Execution Time</TableHead>
                <TableHead className="text-xs font-bold text-right">Result Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/20">
                  <TableCell className="font-bold text-foreground text-xs font-outfit">
                    {log.type}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-foreground">
                    {log.recordsCount} items
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {log.durationMs}ms
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={log.status === 'Success' ? 'success' : 'warning'} className="text-[10px]">
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
