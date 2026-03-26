"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline"

interface SuggestedEntry {
  id: string
  accountId: string
  type: string
  amount: number
  description?: string
  runDate: string
  status: 'pending'
  account: {
    accountNumber: string
    customer: {
      name: string
    }
  }
}

export default function PendingSuggestionsPage() {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<SuggestedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    fetchPending()
  }, [])

  const fetchPending = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/suggestions?status=pending')
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

  const approveBulk = async () => {
    if (selectedIds.length === 0) return
    try {
      const response = await fetch('/api/suggestions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      })
      if (response.ok) {
        setSelectedIds([])
        fetchPending()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR'
    }).format(amount)
  }

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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Pending Compliance
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-amber-500" />
                  Manual verification queue for automated accruals
                </p>
              </div>
            </div>
            {selectedIds.length > 0 && (
              <Button 
                onClick={approveBulk}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg h-12 px-8 font-bold text-white rounded-xl"
              >
                <ShieldCheckIcon className="h-5 w-5 mr-3" />
                Mass Approve ({selectedIds.length})
              </Button>
            )}
          </div>

          <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white/40">
               <CardTitle className="text-lg font-bold flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-amber-500" />
                  Verification Registry
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {loading ? (
                  <div className="py-24 text-center">
                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto" />
                     <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Queue...</p>
                  </div>
               ) : suggestions.length === 0 ? (
                  <div className="py-24 text-center">
                     <CheckCircleIcon className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-slate-900">Queue Cleared</h3>
                     <p className="text-slate-500">All system discoveries have been verified.</p>
                  </div>
               ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                       <TableRow>
                          <TableHead className="w-12 px-10">
                            <Checkbox 
                                checked={selectedIds.length === suggestions.length}
                                onCheckedChange={(checked) => setSelectedIds(checked ? suggestions.map(s => s.id) : [])}
                            />
                          </TableHead>
                          <TableHead>Audit Date</TableHead>
                          <TableHead>Principal Identity</TableHead>
                          <TableHead>Schedule Type</TableHead>
                          <TableHead className="text-right">Value Payload</TableHead>
                          <TableHead className="px-10 text-right h-16">Operations</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {suggestions.map((item) => (
                          <TableRow key={item.id} className="hover:bg-white/80 transition-colors">
                             <TableCell className="px-10 py-8">
                               <Checkbox 
                                  checked={selectedIds.includes(item.id)}
                                  onCheckedChange={(checked) => setSelectedIds(prev => checked ? [...prev, item.id] : prev.filter(id => id !== item.id))}
                               />
                             </TableCell>
                             <TableCell className="text-xs font-mono font-bold text-slate-400">
                                {new Date(item.runDate).toLocaleDateString()}
                             </TableCell>
                             <TableCell>
                                <div>
                                   <p className="font-bold text-slate-900">{item.account.customer.name}</p>
                                   <Badge variant="outline" className="text-[10px] tracking-widest text-slate-400 uppercase border-slate-100">{item.account.accountNumber}</Badge>
                                </div>
                             </TableCell>
                             <TableCell>
                                <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-black text-[10px] tracking-widest uppercase">
                                   {item.type.replace('_', ' ')}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right font-black text-slate-900 tabular-nums text-lg">
                                {formatCurrency(item.amount)}
                             </TableCell>
                             <TableCell className="px-10 text-right">
                                <Button 
                                  size="sm" 
                                  onClick={() => approveBulk()} 
                                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white h-10 w-10 p-0 rounded-xl"
                                >
                                   <ShieldCheckIcon className="h-5 w-5" />
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
