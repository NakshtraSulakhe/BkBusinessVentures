"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { TableActions } from "@/components/ui/table-actions"
import {
  PlusIcon, 
  MagnifyingGlassIcon, 
  UserIcon, 
  CheckCircleIcon,
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BoltIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string; 
  email: string; 
  name: string | null; 
  role: string; 
  isActive: boolean; 
  createdAt: string;
}

function UsersContent() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { 
    setMounted(true)
    fetchUsers() 
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/auth/users', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      })
      if (res.ok) { 
        const d = await res.json()
        setUsers(d || []) 
      }
    } catch (e) { 
      console.error(e) 
    } finally { 
      setLoading(false) 
    }
  }

  const handleToggle = async (userId: string, current: boolean) => {
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`/api/auth/users/${userId}`, { 
        method: 'PATCH', 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }, 
        body: JSON.stringify({ isActive: !current }) 
      })
      fetchUsers()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user? This action is irreversible.')) return
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`/api/auth/users/${userId}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      })
      fetchUsers()
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = users.filter(u => {
    const q = searchTerm.toLowerCase()
    return (u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (roleFilter === 'all' || u.role === roleFilter) &&
      (statusFilter === 'all' || (statusFilter === 'active' && u.isActive) || (statusFilter === 'inactive' && !u.isActive))
  })

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Institutional Governance"
        subtitle="Manage authorization matrices and verified system operator identities"
        actions={
          isAdmin() ? (
            <Button 
               onClick={() => router.push('/dashboard/users/create')} 
               className="h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 mr-2" /> Authorize Identity
            </Button>
          ) : undefined
        }
      />

      {/* Analytics Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Consolidated Identities"
          value={users.length}
          icon={<UserGroupIcon />}
          trend={{ value: "System wide", isPositive: true }}
          className="border-primary"
        />
        <StatCard
          title="Administrative Tier"
          value={users.filter(u => u.role === 'admin').length}
          icon={<ShieldCheckIcon />}
          trend={{ value: "Privileged Access", isPositive: true }}
          className="border-orange-500"
        />
        <StatCard
          title="Operational Entities"
          value={users.filter(u => u.role === 'operator').length}
          icon={<BoltIcon />}
          trend={{ value: "Standard Access", isPositive: true }}
          className="border-blue-500"
        />
        <StatCard
          title="Active Sessions"
          value={users.filter(u => u.isActive).length}
          icon={<CheckCircleIcon />}
          trend={{ value: "Verified Active", isPositive: true }}
          className="border-emerald-500"
        />
      </div>

      {/* Filter Segment */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Query by identity string or email domain..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl text-xs font-bold transition-all shadow-none" 
            />
          </div>
          <div className="lg:col-span-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl text-xs font-bold shadow-none"><SelectValue placeholder="Access Tier" /></SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200">
                <SelectItem value="all">Consolidated Roles</SelectItem>
                <SelectItem value="admin">Administrative</SelectItem>
                <SelectItem value="operator">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl text-xs font-bold shadow-none"><SelectValue placeholder="Identity Status" /></SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200">
                <SelectItem value="all">Verified Status</SelectItem>
                <SelectItem value="active">Active Tiers</SelectItem>
                <SelectItem value="inactive">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Records Registry */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
            <UserIcon className="h-4 w-4 mr-2 text-primary" />
            Operator Registry
          </h2>
          <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] uppercase">
            {filtered.length} IDENTITIES RESOLVED
          </Badge>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Authenticating Registry...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/10">
                <TableRow>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest">Identity Mapping</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Authorization Tier</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Onboarding Date</TableHead>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                    <TableCell className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 text-primary flex items-center justify-center flex-shrink-0 text-sm font-black shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{u.name || 'Anonymous Entity'}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`uppercase font-black text-[9px] tracking-widest px-3 py-1 rounded-sm border ${u.role === 'admin' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`uppercase font-black text-[9px] tracking-widest px-3 py-1 rounded-sm border ${u.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {u.isActive ? 'Active' : 'Locked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-xs font-black text-slate-900 tabular-nums tracking-tighter uppercase leading-none">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      {isAdmin() ? (
                        <TableActions actions={[
                          { label: "Refine Identity", icon: <PencilIcon />, onClick: () => router.push(`/dashboard/users/${u.id}/edit`) },
                          { label: u.isActive ? "Withdraw Access" : "Grant Access", icon: u.isActive ? <EyeSlashIcon /> : <EyeIcon />, onClick: () => handleToggle(u.id, u.isActive) },
                          { label: "Purge Identity", icon: <TrashIcon />, onClick: () => handleDelete(u.id), variant: "danger", separator: true },
                        ]} />
                      ) : <span className="text-slate-300">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Querying Identity Matrix...</div>}>
        <UsersContent />
      </Suspense>
    </DashboardLayout>
  )
}
