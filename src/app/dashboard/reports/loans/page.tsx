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
import { 
  BuildingLibraryIcon, 
  ArrowLeftIcon, 
  SparklesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PresentationChartBarIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ShieldExclamationIcon,
  CreditCardIcon,
  UserIcon
} from "@heroicons/react/24/outline"
import { Input } from "@/components/ui/input"

interface LoanReportItem {
  id: string
  accountNumber: string
  customerName: string
  principalAmount: number
  interestRate: number
  loanMethod: string
  overdueCount: number
  overdueAmount: number
  totalPaid: number
  status: string
}

export default function LoanReportsPage() {
  const router = useRouter()
  const [loanData, setLoanData] = useState<LoanReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLoanReport()
  }, [])

  const fetchLoanReport = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/loans')
      if (response.ok) {
        const data = await response.json()
        setLoanReport(data.report)
      }
    } catch (error) {
       console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Fallback if API not yet perfect
  const setLoanReport = (data: any) => {
     setLoanData(data || [])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR'
    }).format(amount)
  }

  const filtered = loanData.filter(item => 
    item.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalOutstanding = loanData.reduce((sum, item) => sum + item.principalAmount, 0)
  const totalOverdue = loanData.reduce((sum, item) => sum + item.overdueAmount, 0)
  const overdueAccounts = loanData.filter(item => item.overdueCount > 0).length

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
                onClick={() => router.push('/dashboard/reports')}
                className="h-10 w-10 p-0 rounded-full hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent italic tracking-tighter">
                  Risk & Recovery Intelligence
                </h1>
                <p className="text-gray-600 mt-2 flex items-center font-medium">
                  <SparklesIcon className="h-4 w-4 mr-2 text-red-500" />
                  Portfolio exposure, delinquency analysis, and recovery tracking
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
               <div className="relative">
                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <Input
                   placeholder="Refine audit..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 h-11 w-64 border-slate-200 bg-white/60"
                 />
               </div>
               <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 px-6 font-bold rounded-xl active:scale-95 transition-all">
                 <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                 Download Risk Audit
               </Button>
            </div>
          </div>

          {/* Core Analytics Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Book Exposure</p>
                         <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">{formatCurrency(totalOutstanding)}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg border-2 border-white">
                         <CurrencyDollarIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className={`bg-white/60 backdrop-blur-sm shadow-sm border-rose-200 ${totalOverdue > 0 ? 'ring-2 ring-red-500' : ''}`}>
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-red-600 uppercase tracking-widest leading-none">Delinquent Volume</p>
                         <p className="text-2xl font-black text-red-700 mt-2 tabular-nums">{formatCurrency(totalOverdue)}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg border-2 border-white">
                         <ExclamationTriangleIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Risk Accounts</p>
                         <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">{overdueAccounts}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg border-2 border-white">
                         <ShieldExclamationIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Recovery Velocity</p>
                         <p className="text-2xl font-black text-emerald-600 mt-2 italic tracking-tighter">Normal Trend</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg border-2 border-white">
                         <PresentationChartBarIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Recovery Registry */}
          <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200 overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-slate-100 bg-white/40 h-20 flex flex-row items-center px-8">
               <CardTitle className="text-lg font-bold flex items-center text-slate-900 tracking-tight italic">
                  <CreditCardIcon className="h-5 w-5 mr-3 text-red-600" />
                  Portfolio Risk Audit
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {loading ? (
                  <div className="py-24 text-center">
                     <div className="h-10 w-10 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mx-auto" />
                     <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs tracking-[0.2em] italic">Accessing Risk Store...</p>
                  </div>
               ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                       <TableRow className="border-none">
                          <TableHead className="px-8 font-black text-slate-900 uppercase text-[10px] tracking-widest h-14">Identity Domain</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-right">Exposure (Bal)</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-center">APY / Method</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-center">Delinquencies</TableHead>
                          <TableHead className="px-8 font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-right">Magnitude (Overdue)</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filtered.map((item) => (
                          <TableRow key={item.id} className={`hover:bg-red-50/10 transition-colors border-b border-slate-50 group ${item.overdueCount > 0 ? 'bg-red-50/20' : ''}`}>
                             <TableCell className="px-8 py-8">
                                <div className="space-y-1">
                                   <p className="text-lg font-black tracking-tighter text-slate-900 group-hover:text-red-700 transition-colors italic leading-none">{item.customerName}</p>
                                   <Badge variant="outline" className="text-[10px] font-mono font-bold tracking-widest border-slate-100 text-slate-300 uppercase leading-none italic">{item.accountNumber}</Badge>
                                </div>
                             </TableCell>
                             <TableCell className="text-right">
                                <p className="text-lg font-black text-slate-900 tabular-nums italic tracking-tighter uppercase leading-none">{formatCurrency(item.principalAmount)}</p>
                             </TableCell>
                             <TableCell className="text-center font-bold text-slate-400 text-xs tabular-nums uppercase leading-none">
                                {item.interestRate.toFixed(1)}% ({item.loanMethod})
                             </TableCell>
                             <TableCell className="text-center">
                                <div className={`inline-flex h-10 px-4 rounded-xl items-center justify-center font-black transition-all transform group-hover:scale-110 ${item.overdueCount > 0 ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                   {item.overdueCount} MISSED
                                </div>
                             </TableCell>
                             <TableCell className="px-8 text-right">
                                <div className="space-y-1">
                                   <p className={`text-xl font-black tabular-nums italic tracking-tighter uppercase leading-none ${item.overdueAmount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                      {formatCurrency(item.overdueAmount)}
                                   </p>
                                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic flex items-center justify-end">
                                      <ClockIcon className="h-3 w-3 mr-1" /> Accretive Dues
                                   </p>
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
    </DashboardLayout>
  )
}
