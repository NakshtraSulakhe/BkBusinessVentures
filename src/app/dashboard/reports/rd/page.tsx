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
  QueueListIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"

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

function RDReportContent() {
  const router = useRouter()
  const { token } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [rdData, setRdData] = useState<RDReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setMounted(true)
    fetchRDData()
  }, [])

  const fetchRDData = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth('/api/accounts?accountType=RD', { token })
      if (response.ok) {
        const data = await response.json()
        const mapped = data.accounts.map((acc: any) => ({
          id: acc.id,
          accountNumber: acc.accountNumber,
          customerName: acc.customer.name,
          installmentAmount: acc.principalAmount / acc.tenure,
          interestRate: acc.interestRate,
          totalTenure: acc.tenure,
          paidInstallments: acc._count?.transactions || 0,
          nextPaymentDate: acc.startDate,
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
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount)
  }

  const filtered = rdData.filter(item => 
    item.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const monthlyProjection = rdData.reduce((sum, item) => sum + item.installmentAmount, 0)
  const totalVolume = rdData.length

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="RD Collection Velocity"
        subtitle="Monitoring systematic monthly installment efficiency and inward portfolio growth"
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
              Download Audit Log
            </Button>
          </div>
        }
      />

      {/* Analytics Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Projected Monthly Inflow"
          value={formatCurrency(monthlyProjection)}
          icon={<QueueListIcon />}
          trend={{ value: "Target Volume", isPositive: true }}
          className="border-primary"
        />
        <StatCard
          title="Collection Stability"
          value="92%"
          icon={<ShieldCheckIcon />}
          trend={{ value: "System health", isPositive: true }}
          className="border-blue-500"
        />
        <StatCard
          title="Active RD Streams"
          value={totalVolume}
          icon={<BanknotesIcon />}
          trend={{ value: "Open protocols", isPositive: true }}
          className="border-indigo-500"
        />
        <StatCard
          title="Yield Variance"
          value="Stable"
          icon={<PresentationChartBarIcon />}
          trend={{ value: "Normal Operating", isPositive: true }}
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
            <ArrowPathIcon className="h-4 w-4 mr-2 text-primary" />
            Installment Velocity Registry
          </CardTitle>
          <Badge className="bg-purple-50 text-purple-700 border-none font-bold text-[10px] uppercase">
            {filtered.length} ACTIVE STREAMS RESOLVED
          </Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing RD Store...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest">Client Identity / Domain</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Periodic Dues</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">APY Yield</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Velocity (Cycles)</TableHead>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Maturity Goal</TableHead>
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
                        {formatCurrency(item.installmentAmount)}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly Inflow</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-lg font-black text-slate-400 tabular-nums leading-none">
                        {item.interestRate.toFixed(1)}%
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Normalized Yield</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex h-9 px-4 items-center justify-center bg-white border border-slate-200 rounded-xl font-black text-slate-600 shadow-sm group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-105 text-xs">
                        {item.paidInstallments} / {item.totalTenure}
                      </div>
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

export default function RDReportsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Querying RD Registry...</div>}>
        <RDReportContent />
      </Suspense>
    </DashboardLayout>
  )
}
