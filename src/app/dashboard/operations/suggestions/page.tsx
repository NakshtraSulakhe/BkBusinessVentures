"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  CalendarIcon,
  CurrencyDollarIcon, 
  ArrowPathIcon, 
  MagnifyingGlassIcon, 
  QueueListIcon, 
  XMarkIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"

interface SuggestedEntry {
  id: string; 
  accountId: string; 
  type: string; 
  amount: number;
  description?: string; 
  runDate: string; 
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string; 
  createdAt: string; 
  updatedAt: string;
  account: { 
    accountNumber: string; 
    customer: { name: string } 
  }
}

function SuggestionsContent() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState('')

  useEffect(() => { 
    setMounted(true)
    fetchSuggestions() 
  }, [statusFilter])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const params = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const res = await fetch(`/api/suggestions${params}`)
      if (res.ok) { 
        const d = await res.json()
        setSuggestions(d.suggestions || []) 
      }
    } catch (e) { 
      console.error(e) 
    } finally { 
      setLoading(false) 
    }
  }

  const approveSuggestions = async (ids: string[]) => {
    try {
      const res = await fetch('/api/suggestions/approve', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ids }) 
      })
      if (res.ok) { 
        setSelectedIds([])
        fetchSuggestions() 
      }
    } catch (e) { 
      console.error(e) 
    }
  }

  const rejectSuggestion = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/suggestions/${id}/reject`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ reason }) 
      })
      if (res.ok) { 
        setShowRejectModal(false)
        setRejectReason('')
        fetchSuggestions() 
      }
    } catch (e) { 
      console.error(e) 
    }
  }

  const filtered = suggestions.filter(s =>
    s.account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.account.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingCount = suggestions.filter(s => s.status === 'pending').length
  const approvedCount = suggestions.filter(s => s.status === 'approved').length
  const rejectedCount = suggestions.filter(s => s.status === 'rejected').length

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Predictive Discovery Queue"
        subtitle="Systematic verification and batch processing of automated instrument proposals"
        actions={
          <Button 
            onClick={() => router.push('/dashboard/operations/generate-suggestions')} 
            className="h-9 finance-gradient-primary text-white rounded-xl px-6 font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Initialize Engine
          </Button>
        }
      />

      {/* Logic Pulse Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Awaiting Verification"
          value={pendingCount}
          icon={<ClockIcon />}
          iconVariant="warning"
          trend={{ value: "Pending Action", isPositive: false }}
          className="border-amber-500"
        />
        <StatCard
          title="Consolidated Approval"
          value={approvedCount}
          icon={<CheckCircleIcon />}
          iconVariant="success"
          trend={{ value: "Successfully Posted", isPositive: true }}
          className="border-emerald-500"
        />
        <StatCard
          title="System Exceptions"
          value={rejectedCount}
          icon={<ShieldExclamationIcon />}
          iconVariant="danger"
          trend={{ value: "Policy Rejections", isPositive: false }}
          className="border-rose-500"
        />
        <StatCard
          title="Lifecycle Throughput"
          value={suggestions.length}
          icon={<BoltIcon />}
          iconVariant="primary"
          trend={{ value: "Current Run Volume", isPositive: true }}
          className="border-primary"
        />
      </div>

      {/* Command Hub Toolbar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Query by identity string or account number..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl text-xs font-bold transition-all shadow-none" 
            />
          </div>
          <div className="w-full lg:w-auto flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl text-xs font-bold shadow-none w-44"><SelectValue placeholder="Protocol State" /></SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200">
                <SelectItem value="all">Consolidated View</SelectItem>
                <SelectItem value="pending">Verification Required</SelectItem>
                <SelectItem value="approved">Finalized/Posted</SelectItem>
                <SelectItem value="rejected">Exception/Rejection</SelectItem>
              </SelectContent>
            </Select>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchSuggestions} 
                className="h-11 w-11 p-0 rounded-xl border border-slate-200 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 animate-fade-in-up">
              <Badge className="bg-primary text-white border-none font-bold text-[10px] uppercase h-8 px-4 rounded-xl shadow-lg">
                {selectedIds.length} ENTITIES SELECTED
              </Badge>
              <Button 
                onClick={() => approveSuggestions(selectedIds)} 
                className="h-9 px-6 text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" /> Mass Protocol Commit
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedIds([])} 
                className="h-9 px-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 rounded-xl"
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Discovery Registry */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
            <QueueListIcon className="h-4 w-4 mr-2 text-primary" />
            Proposition Registry
          </h2>
          <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] uppercase">
            {filtered.length} PROPOSALS RESOLVED
          </Badge>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synchronizing Proposals...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-white">
              <SparklesIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-sm font-black text-slate-900 uppercase">Registry Depleted</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">No pending propositions detected in the discovery queue.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/10">
                <TableRow>
                  <TableHead className="w-16 px-8 h-14">
                    <Checkbox 
                        checked={selectedIds.length === filtered.length && filtered.length > 0} 
                        onCheckedChange={v => setSelectedIds(v ? filtered.map(s => s.id) : [])} 
                    />
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest">Protocol Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest">Client Instrument</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Class</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Magnitude</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Status</TableHead>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                    <TableCell className="px-8 py-5">
                      <Checkbox 
                        checked={selectedIds.includes(s.id)} 
                        disabled={s.status !== 'pending'} 
                        onCheckedChange={v => setSelectedIds(prev => v ? [...prev, s.id] : prev.filter(id => id !== s.id))} 
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-black text-slate-900 tabular-nums tracking-tighter uppercase leading-none flex items-center gap-2">
                        <CalendarIcon className="h-3 w-3 text-slate-400" />
                        {new Date(s.runDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{s.account.customer.name}</div>
                      <div className="font-mono text-[9px] font-black text-primary tracking-widest uppercase mt-0.5">{s.account.accountNumber}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-slate-50 text-slate-900 border-none font-black text-[9px] uppercase px-2 py-0.5 rounded tracking-tighter">
                        {s.type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-base font-black tracking-tighter tabular-nums text-slate-900">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(s.amount)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`uppercase font-black text-[9px] tracking-widest px-3 py-1 rounded-sm border ${
                        s.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        s.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      {s.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveSuggestions([s.id])}
                            className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Commit Protocol"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => { setRejectingId(s.id); setShowRejectModal(true) }}
                            className="h-9 w-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            title="Reject Protocol"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Rejection Portal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-200 max-w-md w-full mx-4 p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><ShieldExclamationIcon className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter text-slate-900">Declare Exception</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reject Proposal Protocol</p>
                </div>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="h-10 w-10 text-slate-400 hover:text-slate-900 rounded-xl"><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rejection Logistics</Label>
                <Select value={rejectReason} onValueChange={setRejectReason}>
                  <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-bold shadow-none text-left">
                    <SelectValue placeholder="Select Cause..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200">
                    <SelectItem value="duplicate">Identified Duplicate Entry</SelectItem>
                    <SelectItem value="incorrect_value">Magnitudinal Miscalculation</SelectItem>
                    <SelectItem value="matured">Instrument Already Matured</SelectItem>
                    <SelectItem value="other">Institutional Exception (Manual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4 pt-2">
                <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1 border-slate-200 rounded-xl h-11 font-bold text-slate-600">Abandon</Button>
                <Button 
                  onClick={() => rejectSuggestion(rejectingId, rejectReason)} 
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 font-black uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-[0.98]"
                >
                  Verify Rejection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SuggestionsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Querying Proposition Queue...</div>}>
        <SuggestionsContent />
      </Suspense>
    </DashboardLayout>
  )
}
