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
  ArrowTrendingUpIcon,
  PresentationChartBarIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline"
import { Input } from "@/components/ui/input"

interface FDReportItem {
  id: string
  accountNumber: string
  customerName: string
  principalAmount: number
  interestRate: number
  payoutMode: string
  startDate: string
  maturityDate: string
  status: string
}

export default function FDReportsPage() {
  const router = useRouter()
  const [fdData, setFdData] = useState<FDReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFDData()
  }, [])

  const fetchFDData = async () => {
    try {
      setLoading(true)
      // Querying all accounts with type FD
      const response = await fetch('/api/accounts?accountType=FD')
      if (response.ok) {
        const data = await response.json()
        const mapped = data.accounts.map((acc: any) => ({
          id: acc.id,
          accountNumber: acc.accountNumber,
          customerName: acc.customer.name,
          principalAmount: acc.principalAmount,
          interestRate: acc.interestRate,
          payoutMode: acc.accountRules?.payoutMode || 'REINVEST',
          startDate: acc.startDate,
          maturityDate: acc.maturityDate,
          status: acc.status
        }))
        setFdData(mapped)
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

  const filtered = fdData.filter(item => 
    item.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalExposure = fdData.reduce((sum, item) => sum + item.principalAmount, 0)
  const averageRate = fdData.length > 0 ? fdData.reduce((sum, item) => sum + item.interestRate, 0) / fdData.length : 0

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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                  FD Portfolio Intelligence
                </h1>
                <p className="text-gray-600 mt-2 flex items-center font-medium">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Maturity forecasts and principal management for Fixed Deposits
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
               <div className="relative">
                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <Input
                   placeholder="Refine search..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 h-11 w-64 border-slate-200 bg-white/60"
                 />
               </div>
               <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 px-6 font-bold rounded-xl">
                 <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                 Export Analysis
               </Button>
            </div>
          </div>

          {/* Core Analytics Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aggregate Liability</p>
                         <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{formatCurrency(totalExposure)}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                         <CurrencyDollarIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Weighted Yield</p>
                         <p className="text-2xl font-black text-blue-600 mt-1">{averageRate.toFixed(2)}%</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg">
                         <ArrowTrendingUpIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Instruments</p>
                         <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{fdData.length}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
                         <BuildingLibraryIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Forecasting Cyclicity</p>
                         <p className="text-2xl font-black text-emerald-600 mt-1 italic tracking-tighter">Healthy Portfolio</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                         <PresentationChartBarIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Portfolio Table */}
          <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white/40 h-20 flex flex-row items-center px-8">
               <CardTitle className="text-lg font-bold flex items-center text-slate-900 tracking-tight italic">
                  <BuildingLibraryIcon className="h-5 w-5 mr-3 text-blue-600" />
                  Liabilities Registry
               </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {loading ? (
                  <div className="py-24 text-center">
                     <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
                     <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs tracking-[0.2em]">Accessing FD Store...</p>
                  </div>
               ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                       <TableRow className="border-none">
                          <TableHead className="px-8 font-black text-slate-900 uppercase text-[10px] tracking-widest h-14">Identity Domain</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-right">Principal Exposure</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-center">APY Yield</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-center">Payout Strategy</TableHead>
                          <TableHead className="px-8 font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-right">Liquidity Window</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filtered.map((item) => (
                          <TableRow key={item.id} className="hover:bg-blue-50/20 transition-colors border-b border-slate-50 group">
                             <TableCell className="px-8 py-8">
                                <div className="space-y-1">
                                   <p className="text-lg font-black tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors italic leading-none">{item.customerName}</p>
                                   <Badge variant="outline" className="text-[10px] font-mono font-bold tracking-widest border-slate-100 text-slate-400 uppercase leading-none">{item.accountNumber}</Badge>
                                </div>
                             </TableCell>
                             <TableCell className="text-right">
                                <p className="text-lg font-black text-slate-900 tabular-nums italic tracking-tighter uppercase leading-none">{formatCurrency(item.principalAmount)}</p>
                             </TableCell>
                             <TableCell className="text-center font-bold text-blue-600 text-lg tabular-nums italic leading-none">
                                {item.interestRate.toFixed(2)}%
                             </TableCell>
                             <TableCell className="text-center">
                                <Badge className={`uppercase font-black text-[9px] tracking-widest px-3 py-1 rounded-sm border ${item.payoutMode === 'REINVEST' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                   {item.payoutMode}
                                </Badge>
                             </TableCell>
                             <TableCell className="px-8 text-right">
                                <div className="space-y-1">
                                   <p className="text-sm font-black text-slate-900 italic tracking-tighter uppercase leading-none">
                                      {new Date(item.maturityDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                   </p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center justify-end">
                                      <ClockIcon className="h-3 w-3 mr-1 text-slate-300" /> Lifecycle End
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
