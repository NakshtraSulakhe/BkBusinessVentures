"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  XCircleIcon,
  ExclamationTriangleIcon,
  ArchiveBoxXMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline"

interface SuggestedEntry {
  id: string
  accountId: string
  type: string
  amount: number
  description?: string
  runDate: string
  status: 'rejected'
  rejectionReason?: string
  updatedAt: string
  account: {
    accountNumber: string
    customer: {
      name: string
    }
  }
}

export default function RejectedSuggestionsPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [suggestions, setSuggestions] = useState<SuggestedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRejected()
  }, [])

  const fetchRejected = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth('/api/suggestions?status=rejected', { token })
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR'
    }).format(amount)
  }

  const filtered = suggestions.filter(s => 
    s.account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rejectionReason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.account.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                onClick={() => router.push('/dashboard/operations/suggestions')}
                className="h-10 w-10 p-0 rounded-full hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                   Exception Archive
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-rose-500" />
                  Historical log of system prevented accruals
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
               <div className="relative">
                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <Input
                   placeholder="Search exceptions..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 h-11 w-64 border-slate-200"
                 />
               </div>
               <Button onClick={fetchRejected} size="sm" variant="ghost" className="h-11 w-11 p-0 rounded-xl hover:bg-white shadow">
                  <ArrowPathIcon className="h-5 w-5 text-slate-400" />
               </Button>
            </div>
          </div>

          <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white/40 h-20 flex flex-row items-center px-8">
               <CardTitle className="text-lg font-bold flex items-center text-slate-900 tracking-tight">
                  <ShieldExclamationIcon className="h-6 w-6 mr-3 text-red-500" />
                  Exception Logs
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {loading ? (
                  <div className="py-24 text-center">
                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto" />
                     <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs tracking-[0.2em]">Querying Exception Store...</p>
                  </div>
               ) : filtered.length === 0 ? (
                  <div className="py-24 text-center">
                     <ArchiveBoxXMarkIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-slate-600 tracking-tight">Clean History</h3>
                     <p className="text-slate-400 font-medium">No system rejections found for the current filter.</p>
                  </div>
               ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                       <TableRow>
                          <TableHead className="px-8 font-black text-slate-900 uppercase text-[10px] tracking-widest h-14">Override Date</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14">Principal Identity</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14">Financial Magnitude</TableHead>
                          <TableHead className="font-black text-rose-600 uppercase text-[10px] tracking-[0.2em] h-14">Rejection Vector</TableHead>
                          <TableHead className="px-8 font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-right">Audit Trail</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filtered.map((item) => (
                          <TableRow key={item.id} className="hover:bg-rose-50/10 transition-colors border-b border-slate-50 group">
                             <TableCell className="px-8 py-8 font-mono text-[11px] font-bold text-slate-400 uppercase">
                                {new Date(item.updatedAt).toLocaleDateString()}
                             </TableCell>
                             <TableCell>
                                <div>
                                   <p className="font-bold text-slate-900 group-hover:text-red-700 transition-colors">{item.account.customer.name}</p>
                                   <Badge variant="outline" className="text-[10px] tracking-widest text-slate-300 uppercase border-slate-100 font-mono">{item.account.accountNumber}</Badge>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="space-y-1">
                                   <p className="text-xl font-black text-slate-900 tabular-nums">{formatCurrency(item.amount)}</p>
                                   <Badge className="bg-slate-50 text-slate-500 border-slate-100 font-black text-[9px] tracking-widest uppercase rounded-sm">
                                      {item.type.replace('_', ' ')}
                                   </Badge>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="bg-rose-50/50 p-4 border border-rose-100 rounded-2xl max-w-sm group-hover:bg-white transition-colors">
                                   <div className="flex items-center space-x-2 mb-1">
                                      <NoSymbolIcon className="h-4 w-4 text-red-500" />
                                      <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Prevention Logged</span>
                                   </div>
                                   <p className="text-xs font-bold text-slate-700 leading-tight tracking-tight">
                                      {item.rejectionReason || 'Manually Overridden by Audit Staff'}
                                   </p>
                                </div>
                             </TableCell>
                             <TableCell className="px-8 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => router.push(`/dashboard/operations/generate-suggestions?accountId=${item.accountId}`)} 
                                  className="h-10 text-slate-300 hover:text-red-600 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-white rounded-xl"
                                >
                                   Retry Accrual
                                </Button>
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
    </DashboardLayout>
  )
}
