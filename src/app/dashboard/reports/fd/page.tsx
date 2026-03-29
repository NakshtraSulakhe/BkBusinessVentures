"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
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
  ChartBarIcon,
  ShieldCheckIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"

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

function FDReportContent() {
  const router = useRouter()
  const { token } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [fdData, setFdData] = useState<FDReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setMounted(true)
    fetchFDData()
  }, [])

  const fetchFDData = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth('/api/accounts?accountType=FD', { token })
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
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount)
  }

  const filtered = fdData.filter(item => 
    item.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalExposure = fdData.reduce((sum, item) => sum + item.principalAmount, 0)
  const averageRate = fdData.length > 0 ? fdData.reduce((sum, item) => sum + item.interestRate, 0) / fdData.length : 0

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="FD Portfolio Intelligence"
        subtitle="Maturity forecasts and principal management for institutional Fixed Deposits"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/reports')}
              className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <Button className="h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-xl px-4 font-bold transition-all shadow-sm">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Analysis
            </Button>
          </div>
        }
      />

      {/* Analytics Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Aggregate Liability"
          value={formatCurrency(totalExposure)}
          icon={<BanknotesIcon />}
          trend={{ value: "Total Principal", isPositive: true }}
          className="border-primary"
        />
        <StatCard
          title="Weighted Yield"
          value={`${averageRate.toFixed(2)}%`}
          icon={<ArrowTrendingUpIcon />}
          trend={{ value: "Average APY", isPositive: true }}
          className="border-blue-500"
        />
        <StatCard
          title="Active Instruments"
          value={fdData.length}
          icon={<BuildingLibraryIcon />}
          trend={{ value: "Live Protocols", isPositive: true }}
          className="border-indigo-500"
        />
        <StatCard
          title="Portfolio Status"
          value="Healthy"
          icon={<ShieldCheckIcon />}
          trend={{ value: "Low Risk Profile", isPositive: true }}
          className="border-emerald-500"
        />
      </div>

      {/* Search Header */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Filter by account# or client identity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl text-xs font-bold transition-all shadow-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 h-16 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
            <PresentationChartBarIcon className="h-4 w-4 mr-2 text-primary" />
            Liabilities Lifecycle Registry
          </CardTitle>
          <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] uppercase">
            {filtered.length} FD Records Resolved
          </Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying Portfolio Store...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest">Identity Domain</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Principal Exposure</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">APY Yield</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Protocol</TableHead>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Termination Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                    <TableCell className="px-8 py-5">
                      <div className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight">
                        {item.customerName || "Anonymous Credit"}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">
                        #{item.accountNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-lg font-black text-slate-900 tabular-nums tracking-tighter uppercase leading-none">
                        {formatCurrency(item.principalAmount)}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Principal</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-lg font-black text-blue-600 tabular-nums leading-none">
                        {item.interestRate.toFixed(2)}%
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized APY</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`uppercase font-black text-[9px] tracking-widest px-3 py-1 rounded-sm border ${item.payoutMode === 'REINVEST' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {item.payoutMode}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <div className="text-sm font-black text-slate-900 tracking-tighter uppercase leading-none">
                        {new Date(item.maturityDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center justify-end font-mono">
                        <ClockIcon className="h-3 w-3 mr-1 text-primary" /> Lifecycle End
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function FDReportsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading Portfolio...</div>}>
        <FDReportContent />
      </Suspense>
    </DashboardLayout>
  )
}
