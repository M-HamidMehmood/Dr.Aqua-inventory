import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table'
import { mockStaffAccounts, mockRBACMatrix } from '../../data/mock/settings.mock'
import {
  Users,
  Shield,
  KeyRound,
  Check,
  X,
  UserPlus,
  Building2,
  Lock,
  Plus,
} from 'lucide-react'

export default function StaffRBACMatrix({ onSaveToast }) {
  const [staffList, setStaffList] = useState(mockStaffAccounts)
  const [rbacMatrix, setRbacMatrix] = useState(mockRBACMatrix)

  // Toggle permission in matrix
  const handleTogglePermission = (rowIndex, roleKey, permKey) => {
    const updated = [...rbacMatrix]
    const currentVal = updated[rowIndex][roleKey][permKey]
    updated[rowIndex] = {
      ...updated[rowIndex],
      [roleKey]: {
        ...updated[rowIndex][roleKey],
        [permKey]: !currentVal,
      },
    }
    setRbacMatrix(updated)
    if (onSaveToast) onSaveToast('RBAC permission modified.')
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">👑 Admin</Badge>
      case 'cashier':
        return <Badge variant="secondary">🧾 Cashier</Badge>
      case 'inventory_manager':
        return <Badge variant="warning">📦 Warehouse</Badge>
      case 'technician':
        return <Badge variant="outline">🛠️ Field Tech</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="space-y-4 text-left font-sans">
      {/* Staff Accounts Directory */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Registered Staff Accounts ({staffList.length})</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Manage terminal login credentials, assigned branch allocations, and system status.
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={() => onSaveToast && onSaveToast('Staff invitation modal opened')}
            className="h-8 gap-1.5 text-xs font-bold font-outfit"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff User</span>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-xs font-bold">Staff Member</TableHead>
                <TableHead className="text-xs font-bold">Email Address</TableHead>
                <TableHead className="text-xs font-bold">System Role</TableHead>
                <TableHead className="text-xs font-bold">Assigned Location</TableHead>
                <TableHead className="text-xs font-bold">Last Active</TableHead>
                <TableHead className="text-xs font-bold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((staff) => (
                <TableRow key={staff.id} className="hover:bg-muted/20">
                  <TableCell className="font-bold text-foreground text-xs font-outfit">
                    {staff.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {staff.email}
                  </TableCell>
                  <TableCell>{getRoleBadge(staff.role)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{staff.branch}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{staff.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={staff.status === 'Active' ? 'success' : 'destructive'} className="text-[10px]">
                      {staff.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role-Based Access Control (RBAC) Permission Matrix */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="p-4 border-b border-border/60">
          <CardTitle className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>Role-Based Access Control (RBAC) Permissions Matrix</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Granular access controls across View, Edit, Delete, and Refund override permissions.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-bold w-64">Application Module</TableHead>
                <TableHead className="text-xs font-bold text-center">👑 Admin</TableHead>
                <TableHead className="text-xs font-bold text-center">🧾 Cashier</TableHead>
                <TableHead className="text-xs font-bold text-center">📦 Warehouse</TableHead>
                <TableHead className="text-xs font-bold text-center">🛠️ Field Tech</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {rbacMatrix.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-muted/10">
                  <TableCell className="font-bold text-xs text-foreground font-outfit">
                    {row.module}
                  </TableCell>

                  {/* Admin Permissions */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Badge variant="success" className="text-[9px] py-0">Full Access</Badge>
                    </div>
                  </TableCell>

                  {/* Cashier Permissions */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {['view', 'create_edit', 'override'].map((p) => {
                        const hasPerm = row.cashier[p]
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleTogglePermission(idx, 'cashier', p)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${
                              hasPerm
                                ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                                : 'bg-muted/50 text-muted-foreground/50 border border-border/40'
                            }`}
                            title={`Cashier ${p}: ${hasPerm ? 'Allowed' : 'Denied'}`}
                          >
                            {hasPerm ? '✓' : '✕'}
                          </button>
                        )
                      })}
                    </div>
                  </TableCell>

                  {/* Inventory Manager */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {['view', 'create_edit', 'delete'].map((p) => {
                        const hasPerm = row.inventory_manager[p]
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleTogglePermission(idx, 'inventory_manager', p)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${
                              hasPerm
                                ? 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
                                : 'bg-muted/50 text-muted-foreground/50 border border-border/40'
                            }`}
                            title={`Inventory Manager ${p}: ${hasPerm ? 'Allowed' : 'Denied'}`}
                          >
                            {hasPerm ? '✓' : '✕'}
                          </button>
                        )
                      })}
                    </div>
                  </TableCell>

                  {/* Technician */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {['view', 'create_edit'].map((p) => {
                        const hasPerm = row.technician[p]
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleTogglePermission(idx, 'technician', p)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${
                              hasPerm
                                ? 'bg-cyan-500/15 text-cyan-700 border border-cyan-500/30'
                                : 'bg-muted/50 text-muted-foreground/50 border border-border/40'
                            }`}
                            title={`Technician ${p}: ${hasPerm ? 'Allowed' : 'Denied'}`}
                          >
                            {hasPerm ? '✓' : '✕'}
                          </button>
                        )
                      })}
                    </div>
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
