"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  UserGroupIcon, 
  ArrowLeftIcon, 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  PhoneIcon,
  EnvelopeIcon,
  WalletIcon,
  IdentificationIcon,
  SparklesIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CustomerReportItem {
  id: string
  name: string
  email: string
  phone: string
  totalPrincipal: number
  activeCount: number
  fdCount: number
  rdCount: number
  loanCount: number
}

function CustomerReportContent() {
  const router = useRouter()
  const { token } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [report, setReport] = useState<CustomerReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setMounted(true)
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth('/api/reports/customers', { token })
      if (response.ok) {
        const data = await response.json()
        setReport(data.report || [])
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredReport = report.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone.includes(searchTerm)
  )

  const totalExposure = report.reduce((sum, item) => sum + item.totalPrincipal, 0)
  const totalInstruments = report.reduce((sum, item) => sum + item.activeCount, 0)

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Client Exposure Portfolio"
        subtitle="Consolidated financial audit of institutional risk per verified identity"
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
              Export Audit
            </Button>
          </div>
        }
      />

      {/* Analytics Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Consolidated Principal"
          value={formatCurrency(totalExposure)}
          icon={<CurrencyDollarIcon />}
          trend={{ value: "Total Exposure", isPositive: true }}
          className="border-primary"
        />
        <StatCard
          title="Active Instruments"
          value={totalInstruments}
          icon={<BriefcaseIcon />}
          trend={{ value: "Live Protocols", isPositive: true }}
          className="border-blue-500"
        />
        <StatCard
          title="Verified Identities"
          value={report.length}
          icon={<UsersIcon />}
          trend={{ value: "Registry Count", isPositive: true }}
          className="border-indigo-500"
        />
        <StatCard
          title="System Sync"
          value="Healthy"
          icon={<SparklesIcon />}
          trend={{ value: "Real-time updates", isPositive: true }}
          className="border-emerald-500"
        />
      </div>

      {/* Filter Segment */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by client identity or contact string..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl text-xs font-bold transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 h-16 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
            <IdentificationIcon className="h-4 w-4 mr-2 text-primary" />
            Identity Financial Domain
          </CardTitle>
          <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] uppercase">
            {filteredReport.length} ENTRIES RESOLVED
          </Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Registry...</p>
            </div>
          ) : filteredReport.length === 0 ? (
            <div className="text-center py-24">
              <div className="h-16 w-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <UsersIcon className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase">No identity records located</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">Adjust your search parameters to locate specific client portfolios.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest">Client Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Active Instruments</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Class Matrix</TableHead>
                  <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Exposure Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReport.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                    <TableCell className="px-8 py-5">
                      <div className="text-sm font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center text-[10px] font-bold text-slate-400">
                          <EnvelopeIcon className="h-3 w-3 mr-1" /> {item.email}
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-slate-400">
                          <PhoneIcon className="h-3 w-3 mr-1" /> {item.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex h-9 w-9 items-center justify-center bg-white border border-slate-200 rounded-xl font-black text-slate-900 group-hover:scale-110 group-hover:border-primary transition-all shadow-sm">
                        {item.activeCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center">
                          <div className={`h-6 w-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${item.fdCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>{item.fdCount}</div>
                          <span className="text-[8px] font-black text-slate-400 mt-1 uppercase">FD</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`h-6 w-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${item.rdCount > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>{item.rdCount}</div>
                          <span className="text-[8px] font-black text-slate-400 mt-1 uppercase">RD</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`h-6 w-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${item.loanCount > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>{item.loanCount}</div>
                          <span className="text-[8px] font-black text-slate-400 mt-1 uppercase">LOAN</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <div className="text-lg font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                        {formatCurrency(item.totalPrincipal)}
                      </div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center justify-end">
                        <WalletIcon className="h-3 w-3 mr-1 text-primary" /> Total Weight
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

export default function CustomerReportPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Querying Registry...</div>}>
        <CustomerReportContent />
      </Suspense>
    </DashboardLayout>
  )
}
