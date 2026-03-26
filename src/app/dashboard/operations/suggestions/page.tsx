"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  ArrowLeftIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  ArrowPathIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  QueueListIcon,
  BriefcaseIcon
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
    customer: {
      name: string
    }
  }
}

export default function SuggestionsPage() {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<SuggestedEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState('')

  useEffect(() => {
    fetchSuggestions()
  }, [statusFilter])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const params = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const response = await fetch(`/api/suggestions${params}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveSuggestions = async (ids: string[]) => {
    try {
      const response = await fetch('/api/suggestions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (response.ok) {
        setSelectedIds([])
        fetchSuggestions()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const rejectSuggestion = async (id: string, reason: string) => {
    try {
      const response = await fetch(`/api/suggestions/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (response.ok) {
        setShowRejectModal(false)
        setRejectReason('')
        fetchSuggestions()
      }
    } catch (error) {
       console.error(error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filtered = suggestions.filter(s => 
    s.account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.account.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingCount = suggestions.filter(s => s.status === 'pending').length
  const approvedCount = suggestions.filter(s => s.status === 'approved').length
  const rejectedCount = suggestions.filter(s => s.status === 'rejected').length

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Suggestions Queue
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Review and verify automated transactions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
               <div className="relative">
                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <Input
                   placeholder="Filter suggestions..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 w-64 h-11"
                 />
               </div>
               <Button
                onClick={() => router.push('/dashboard/operations/generate-suggestions')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg h-11 px-6 font-bold"
               >
                 <PlayIcon className="h-5 w-5 mr-2" />
                 Run Engine
               </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Awaiting Review</p>
                         <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                         <ClockIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Success</p>
                         <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                         <CheckCircleIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Exceptions</p>
                         <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                         <XCircleIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Discovery Total</p>
                         <p className="text-3xl font-bold text-blue-600">{suggestions.length}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                         <QueueListIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Action Toolbar */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-100">
             <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 bg-white/50 h-11 border-slate-200">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved Logs</SelectItem>
                      <SelectItem value="rejected">Rejected Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" onClick={fetchSuggestions} className="h-11 w-11 p-0 rounded-xl hover:bg-slate-100">
                     <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>

                {selectedIds.length > 0 && (
                   <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-right-4">
                      <span className="text-sm font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-full ring-1 ring-blue-100">
                         {selectedIds.length} Selected
                      </span>
                      <Button 
                        onClick={() => approveSuggestions(selectedIds)}
                        className="bg-green-600 hover:bg-green-700 h-11 px-6 shadow-lg shadow-green-600/10 font-bold"
                      >
                         <CheckCircleIcon className="h-5 w-5 mr-2" />
                         Mass Approve
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedIds([])}
                        className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                      >
                         Clear
                      </Button>
                   </div>
                )}
             </CardContent>
          </Card>

          {/* Table Architecture */}
          <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white/40">
               <CardTitle className="text-lg font-bold flex items-center">
                  <BriefcaseIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Suggested Entries
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {loading ? (
                  <div className="py-20 text-center">
                     <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                     <p className="mt-4 text-gray-500 font-medium">Querying suggestions...</p>
                  </div>
               ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                       <TableRow>
                          <TableHead className="w-12 px-6">
                            <Checkbox 
                                checked={selectedIds.length === filtered.length && filtered.length > 0}
                                onCheckedChange={(checked) => setSelectedIds(checked ? filtered.map(s => s.id) : [])}
                            />
                          </TableHead>
                          <TableHead>Run Date</TableHead>
                          <TableHead>Account Context</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right px-6">Actions</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filtered.map((s) => (
                          <TableRow key={s.id} className="hover:bg-white/80 transition-colors">
                             <TableCell className="px-6">
                               <Checkbox 
                                  checked={selectedIds.includes(s.id)}
                                  onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, s.id] : prev.filter(id => id !== s.id))}
                                  disabled={s.status !== 'pending'}
                               />
                             </TableCell>
                             <TableCell className="text-xs font-medium text-gray-500">
                                {new Date(s.runDate).toLocaleDateString()}
                             </TableCell>
                             <TableCell>
                                <div>
                                   <p className="font-bold text-slate-900">{s.account.customer.name}</p>
                                   <p className="text-xs text-blue-500 font-mono italic">{s.account.accountNumber}</p>
                                </div>
                             </TableCell>
                             <TableCell>
                                <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 border-slate-200">
                                   {s.type.replace('_', ' ')}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right font-black text-slate-900 tabular-nums">
                                {formatCurrency(s.amount)}
                             </TableCell>
                             <TableCell>
                                <Badge className={`text-[10px] uppercase font-black tracking-widest ${getStatusColor(s.status)}`}>
                                   {s.status}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right px-6">
                                <div className="flex justify-end space-x-1">
                                   {s.status === 'pending' && (
                                      <>
                                         <Button size="sm" onClick={() => approveSuggestions([s.id])} className="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border-green-100 shadow-none h-9 w-9 p-0">
                                            <CheckCircleIcon className="h-5 w-5" />
                                         </Button>
                                         <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={() => { setRejectingId(s.id); setShowRejectModal(true); }}
                                            className="text-red-400 hover:bg-red-50 hover:text-red-600 h-9 w-9 p-0"
                                         >
                                            <XCircleIcon className="h-5 w-5" />
                                         </Button>
                                      </>
                                   )}
                                </div>
                             </TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                  </Table>
               )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Modal Logic kept from previous context but styled like Loans */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in">
           <Card className="w-full max-w-md bg-white border-none shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95">
              <CardHeader className="bg-slate-50/50 p-6">
                 <CardTitle className="text-xl font-bold flex items-center">
                    <XCircleIcon className="h-6 w-6 mr-2 text-red-500" />
                    Reject Suggestion
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Reason Category</Label>
                    <Select value={rejectReason} onValueChange={setRejectReason}>
                      <SelectTrigger className="h-12 border-slate-200">
                        <SelectValue placeholder="Select Reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="duplicate">Duplicate Entry</SelectItem>
                        <SelectItem value="incorrect_value">Incorrect Calculation</SelectItem>
                        <SelectItem value="other">Other (Manual Note)</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
                    <Button 
                      onClick={() => rejectSuggestion(rejectingId, rejectReason)} 
                      className="flex-1 bg-red-600 hover:bg-red-700 h-12 rounded-xl font-bold shadow-lg shadow-red-600/10 text-white"
                    >
                      Reject Permanent
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
