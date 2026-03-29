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
  ExclamationTriangleIcon,
  PresentationChartBarIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ShieldExclamationIcon,
  CreditCardIcon,
  UserIcon,
  BanknotesIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"

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

function LoanReportContent() {
  const router = useRouter()
  const { token } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [loanData, setLoanData] = useState<LoanReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setMounted(true)
    fetchLoanReport()
  }, [])

  const fetchLoanReport = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth('/api/reports/loans', { token })
      if (response.ok) {
        const data = await response.json()
        setLoanData(data.report || [])
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

  const filtered = loanData.filter(item => 
    item.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalOutstanding = loanData.reduce((sum, item) => sum + item.principalAmount, 0)
  const totalOverdue = loanData.reduce((sum, item) => sum + item.overdueAmount, 0)
  const overdueAccounts = loanData.filter(item => item.overdueCount > 0).length

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Risk & Recovery Portfolio"
        subtitle="Consolidated debt exposure, delinquency analysis, and recovery velocity tracking"
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
              Export Risk Audit
            </Button>
          </div>
        }
      />

      {/* Analytics Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Consolidated Principal"
          value={formatCurrency(totalOutstanding)}
          icon={<BanknotesIcon />}
          trend={{ value: "Book Exposure", isPositive: true }}
          className="border-primary"
        />
        <StatCard
          title="Delinquent Volume"
          value={formatCurrency(totalOverdue)}
          icon={<ExclamationTriangleIcon />}
          trend={{ value: "Verified Overdue", isPositive: totalOverdue === 0 }}
          className={totalOverdue > 0 ? "border-rose-500 ring-1 ring-rose-500/20" : "border-slate-200"}
        />
        <StatCard
          title="Risk Account Delta"
          value={overdueAccounts}
          icon={<ShieldExclamationIcon />}
          trend={{ value: "Delinquent count", isPositive: overdueAccounts === 0 }}
          className="border-orange-500"
        />
        <StatCard
          title="Recovery Velocity"
          value="Healthy"
          icon={<PresentationChartBarIcon />}
          trend={{ value: "Normal Operating", isPositive: true }}
          className="border-emerald-500"
        />
      </div>

      {/* Filter Segment */}
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
            <CreditCardIcon className="h-4 w-4 mr-2 text-primary" />
            Portfolio Delinquency Registry
          </CardTitle>
          <Badge className="bg-rose-50 text-rose-700 border-none font-bold text-[10px] uppercase">
            {filtered.length} LOAN PROTOCOLS RESOLVED
          </Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Risk Store...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="h-16 w-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShieldExclamationIcon className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">No risk markers located</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">Adjust your search parameters to locate specific delinquency logs.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest">Client Identity / Domain</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Exposure (Bal)</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Protocol</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Velocity State</TableHead>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Magnitude (Overdue)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} className={`hover:bg-slate-50/50 transition-colors border-b border-slate-50 group ${item.overdueCount > 0 ? 'bg-rose-50/20' : ''}`}>
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
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Balance</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-lg font-black text-slate-400 tabular-nums leading-none">
                        {item.interestRate.toFixed(1)}%
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.loanMethod.toUpperCase()}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`inline-flex h-9 px-4 items-center justify-center rounded-xl font-black transition-all transform group-hover:scale-110 text-xs ${item.overdueCount > 0 ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                        {item.overdueCount} DELINQUENT CYCLES
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <div className={`text-xl font-black tracking-tighter uppercase leading-none ${item.overdueAmount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {formatCurrency(item.overdueAmount)}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center justify-end font-mono">
                        <ClockIcon className="h-3 w-3 mr-1 text-primary" /> Overdue Magnitude
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

export default function LoanReportsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Querying Risk Store...</div>}>
        <LoanReportContent />
      </Suspense>
    </DashboardLayout>
  )
}
