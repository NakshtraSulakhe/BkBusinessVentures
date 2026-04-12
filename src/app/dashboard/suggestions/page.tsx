"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { AmountDisplay } from "@/components/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface SuggestedEntry {
  id: string
  accountId: string
  type: string
  amount: number
  description?: string
  runDate: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  account: {
    accountNumber: string
    customer: { name: string }
  }
}

function SuggestionsContent() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [processing, setProcessing] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    if (user) fetchSuggestions()
  }, [user, statusFilter])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const res = await fetchWithAuth(`/api/suggestions?${params.toString()}`, { token })
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setProcessing(prev => [...prev, id])
      const res = await fetchWithAuth(`/api/suggestions/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        token,
        body: JSON.stringify({ suggestionIds: [id] })
      })
      
      if (res.ok) {
        fetchSuggestions()
      }
    } catch (error) {
      console.error('Failed to approve suggestion:', error)
    } finally {
      setProcessing(prev => prev.filter(p => p !== id))
    }
  }

  const handleReject = async (id: string, reason?: string) => {
    try {
      setProcessing(prev => [...prev, id])
      const res = await fetchWithAuth(`/api/suggestions/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        token,
        body: JSON.stringify({ suggestionIds: [id], reason })
      })
      
      if (res.ok) {
        fetchSuggestions()
      }
    } catch (error) {
      console.error('Failed to reject suggestion:', error)
    } finally {
      setProcessing(prev => prev.filter(p => p !== id))
    }
  }

  if (!mounted) return null

  const filteredSuggestions = suggestions.filter(s => 
    s.account.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    pending: suggestions.filter(s => s.status === 'pending').length,
    approved: suggestions.filter(s => s.status === 'approved').length,
    rejected: suggestions.filter(s => s.status === 'rejected').length,
    total: suggestions.length
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'MATURITY': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'INTEREST': 'bg-blue-50 text-blue-700 border-blue-100',
      'EMI': 'bg-amber-50 text-amber-700 border-amber-100',
      'PENALTY': 'bg-rose-50 text-rose-700 border-rose-100',
      'DEPOSIT': 'bg-green-50 text-green-700 border-green-100',
      'WITHDRAWAL': 'bg-purple-50 text-purple-700 border-purple-100'
    }
    return colors[type] || 'bg-slate-50 text-slate-700 border-slate-100'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-amber-50 text-amber-700 border-amber-100',
      'approved': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'rejected': 'bg-rose-50 text-rose-700 border-rose-100'
    }
    return colors[status] || 'bg-slate-50 text-slate-700 border-slate-100'
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Suggestions Management"
        subtitle="Review and manage system-generated transaction suggestions"
        actions={
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
              <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search suggestions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent text-sm focus:ring-0 outline-none placeholder:text-slate-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => router.push('/dashboard/operations/suggestions')}
              className="h-9 finance-gradient-primary text-white rounded-xl px-6 font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Advanced View
            </Button>
          </div>
        }
      />

      {/* Suggestions Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:py-5 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
            <ClockIcon className="h-4 w-4 mr-3 text-primary" />
            Recent Suggestions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSuggestions}
            disabled={loading}
            className="text-[10px] font-black uppercase text-primary hover:bg-primary/5 h-8 px-3 rounded-xl transition-all"
          >
            <ArrowPathIcon className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow>
                <TableHead className="px-5 sm:px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest h-12 min-w-[200px]">Customer / Account</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest h-12 text-center">Type</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest h-12 text-center">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest h-12 text-right">Amount</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest h-12 text-center">Run Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest h-12 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuggestions.map((suggestion) => (
                <TableRow key={suggestion.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                  <TableCell className="px-4 sm:px-8 py-4 sm:py-5">
                    <div className="text-sm font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
                      {suggestion.account.customer.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        {suggestion.account.accountNumber}
                      </span>
                      {suggestion.description && (
                        <>
                          <span className="text-[8px] text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">
                            {suggestion.description}
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`uppercase font-black text-[9px] tracking-widest px-3 py-1 rounded-sm border ${getTypeColor(suggestion.type)}`}>
                      {suggestion.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`uppercase font-black text-[9px] tracking-widest px-3 py-1 rounded-sm border ${getStatusColor(suggestion.status)}`}>
                      {suggestion.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 sm:px-8 text-right">
                    <AmountDisplay 
                      amount={suggestion.amount} 
                      size="sm" 
                      weight="bold" 
                      className="text-base font-black tracking-tighter tabular-nums" 
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-[10px] font-bold text-slate-400">
                      {new Date(suggestion.runDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {suggestion.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(suggestion.id)}
                            disabled={processing.includes(suggestion.id)}
                            className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <HandThumbUpIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(suggestion.id, 'Rejected by user')}
                            disabled={processing.includes(suggestion.id)}
                            className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <HandThumbDownIcon className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/accounts/${suggestion.accountId}`)}
                        className="h-7 w-7 p-0 text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                      >
                        <EyeIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSuggestions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 bg-white">
                    <ClockIcon className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {loading ? 'Loading suggestions...' : 'No suggestions found'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

export default function SuggestionsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <SuggestionsContent />
      </Suspense>
    </DashboardLayout>
  )
}
