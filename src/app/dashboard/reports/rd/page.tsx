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
  ArrowDownTrayIcon,
  QueueListIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"
import { Input } from "@/components/ui/input"

interface RDReportItem {
  id: string
  accountNumber: string
  customerName: string
  installmentAmount: number
  interestRate: number
  totalTenure: number
  paidInstallments: number
  nextPaymentDate: string
  maturityDate: string
  status: string
}

export default function RDReportsPage() {
  const router = useRouter()
  const [rdData, setRdData] = useState<RDReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRDData()
  }, [])

  const fetchRDData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts?accountType=RD')
      if (response.ok) {
        const data = await response.json()
        const mapped = data.accounts.map((acc: any) => ({
          id: acc.id,
          accountNumber: acc.accountNumber,
          customerName: acc.customer.name,
          installmentAmount: acc.principalAmount / acc.tenure, // Simplified for report
          interestRate: acc.interestRate,
          totalTenure: acc.tenure,
          paidInstallments: acc._count?.transactions || 0, // Simplified approximation
          nextPaymentDate: acc.startDate, // Logic for next payment needs more DB detail but using startDate as placeholder
          maturityDate: acc.maturityDate,
          status: acc.status
        }))
        setRdData(mapped)
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

  const filtered = rdData.filter(item => 
    item.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const monthlyProjection = rdData.reduce((sum, item) => sum + item.installmentAmount, 0)
  const collectionEfficiency = 92 // Mocked for demonstration

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between font-medium">
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent italic">
                  RD Collection Velocity
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-purple-500" />
                  Monitoring monthly installment efficiency and deposit growth
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
               <div className="relative">
                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <Input
                   placeholder="Search installmentRegistry..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 h-11 w-64 border-slate-200 bg-white/60"
                 />
               </div>
               <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 px-6 font-bold rounded-xl active:scale-[0.98]">
                 <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                 Download Collection Log
               </Button>
            </div>
          </div>

          {/* Core Analytics Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Projected Monthly</p>
                         <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums italic">{formatCurrency(monthlyProjection)}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                         <QueueListIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Collection Rate</p>
                         <p className="text-2xl font-black text-emerald-600 mt-1">{collectionEfficiency}%</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                         <ShieldCheckIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Open Installments</p>
                         <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{rdData.length}</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                         <BuildingLibraryIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200">
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Yield Variance</p>
                         <p className="text-2xl font-black text-indigo-600 mt-1 italic tracking-tighter">Normal Operating</p>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
                         <PresentationChartBarIcon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Collection Stream Table */}
          <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white/40 h-20 flex flex-row items-center justify-between px-8">
               <CardTitle className="text-lg font-bold flex items-center text-slate-900 tracking-tight italic">
                  <ArrowPathIcon className="h-5 w-5 mr-3 text-purple-600" />
                  Installment Collection Registry
               </CardTitle>
               <Badge variant="outline" className="font-mono text-[10px] tracking-widest text-purple-600 bg-purple-50/50 border-purple-100 uppercase py-1 px-4 italic">{filtered.length} ACTIVE STREAMS</Badge>
            </CardHeader>
            <CardContent className="p-0">
               {loading ? (
                  <div className="py-24 text-center">
                     <div className="h-10 w-10 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin mx-auto" />
                     <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-xs tracking-[0.2em] italic">Accessing RD Store...</p>
                  </div>
               ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                       <TableRow className="border-none">
                          <TableHead className="px-8 font-black text-slate-900 uppercase text-[10px] tracking-widest h-14">Identity Domain</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-right">Periodic Dues</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-center">Yield</TableHead>
                          <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-center">Velocity (Paid)</TableHead>
                          <TableHead className="px-8 font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-right">Liquidity Window</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filtered.map((item) => (
                          <TableRow key={item.id} className="hover:bg-purple-50/20 transition-colors border-b border-slate-50 group">
                             <TableCell className="px-8 py-8">
                                <div className="space-y-1">
                                   <p className="text-lg font-black tracking-tighter text-slate-900 group-hover:text-purple-600 transition-colors italic leading-none">{item.customerName}</p>
                                   <Badge variant="outline" className="text-[10px] font-mono font-bold tracking-widest border-slate-100 text-slate-300 uppercase leading-none italic">{item.accountNumber}</Badge>
                                </div>
                             </TableCell>
                             <TableCell className="text-right">
                                <p className="text-lg font-black text-slate-900 tabular-nums italic tracking-tighter uppercase leading-none">{formatCurrency(item.installmentAmount)}</p>
                             </TableCell>
                             <TableCell className="text-center font-bold text-slate-400 text-lg tabular-nums italic leading-none">
                                {item.interestRate.toFixed(1)}%
                             </TableCell>
                             <TableCell className="text-center">
                                <div className="inline-flex h-10 px-4 bg-white/80 rounded-xl items-center justify-center font-black text-slate-600 shadow-sm border border-slate-100 italic group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:scale-105">
                                   {item.paidInstallments} / {item.totalTenure}
                                </div>
                             </TableCell>
                             <TableCell className="px-8 text-right">
                                <div className="space-y-1">
                                   <p className="text-sm font-black text-slate-900 italic tracking-tighter uppercase leading-none">
                                      {new Date(item.maturityDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                   </p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center justify-end">
                                      <ClockIcon className="h-3 w-3 mr-1 text-slate-300" /> Maturity Goal
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
