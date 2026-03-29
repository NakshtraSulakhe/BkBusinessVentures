"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { AmountDisplay } from "@/components/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  QueueListIcon,
  UserGroupIcon as UserIcon,
  BuildingLibraryIcon,
  FunnelIcon,
  SparklesIcon,
  WalletIcon,
  BriefcaseIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  BoltIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"

// ─── Premium Visualizations ───────────────────────────────────────────────────

function DashboardChartLine({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map(d => d.value))
  const points = data.map((item, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (item.value / maxValue) * 100
    return `${x},${y}`
  }).join(" ")

  return (
    <div className="space-y-4">
      <div className="h-40 relative group">
        <svg className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="dashboardLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={`${points} 100,100 0,100`} fill="url(#dashboardLineGrad)" />
          <polyline
            points={points}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          {data.map((item, i) => {
            const x = (i / (data.length - 1)) * 100
            const y = 100 - (item.value / maxValue) * 100
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="white"
                stroke="var(--primary)"
                strokeWidth="2.5"
                className="transition-all duration-300 hover:r-6 cursor-pointer"
              />
            )
          })}
        </svg>
      </div>
      <div className="flex flex-wrap justify-between px-1 gap-2">
        {data.map((item, i) => (
          <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{item.label}</span>
        ))}
      </div>
    </div>
  )
}

function DashboardChartDistribution({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg className="w-28 h-28 -rotate-90">
          {data.map((item, i) => {
            const pct = (item.value / total) * 100
            const offset = data.slice(0, i).reduce((s, p) => s + (p.value / total) * 100, 0)
            return (
              <circle
                key={i}
                cx="56" cy="56" r="44"
                fill="none"
                stroke={item.color}
                strokeWidth="12"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={-offset}
                className="transition-all duration-700"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-900 leading-none">{total}</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
            </div>
            <span className="text-[10px] font-black text-slate-900 tabular-nums">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Quick Actions ───────────────────────────────────────────────────────────

function ActionTile({ title, icon: Icon, onClick, color }: { title: string; icon: any; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all active:scale-[0.98]"
    >
      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${color}`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest transition-colors group-hover:text-primary text-center">{title}</span>
    </button>
  )
}

// ─── Main Interface ──────────────────────────────────────────────────────────

function DashboardContent() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear] = useState(new Date().getFullYear())
  const [running, setRunning] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user) fetchSummary()
  }, [user])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth('/api/dashboard/summary', { token })
      if (res.ok) setData(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickRun = async () => {
    try {
      setRunning(true)
      const res = await fetchWithAuth('/api/suggestions/run-monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        token,
        body: JSON.stringify({ month: selectedMonth, year: selectedYear })
      })
      if (res.ok) {
        fetchSummary()
        router.push('/dashboard/operations/suggestions')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setRunning(false)
    }
  }

  if (!mounted) return null

  const summary = data?.summary || {
    totalBalance: 0, loanOutstanding: 0, depositsCount: 0,
    loanCount: 0, pendingSuggestions: 0, overdueEMI: 0, dueTodayEMI: 0
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Overview"
        subtitle="A quick summary of all your customers, deposits, loans, and payments"
        actions={
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="bg-transparent text-[10px] font-black text-slate-900 uppercase outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                disabled={running}
                onClick={handleQuickRun}
                className="h-7 px-3 text-[10px] font-black uppercase text-primary hover:bg-primary hover:text-white transition-all rounded-lg"
              >
                {running ? <ArrowPathIcon className="h-3 w-3 animate-spin mr-1.5" /> : <RocketLaunchIcon className="h-3 w-3 mr-1.5" />}
                Process Month
              </Button>
            </div>
            <Button
              onClick={() => router.push('/dashboard/customers/create')}
              className="h-9 finance-gradient-primary text-white rounded-xl px-6 font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        }
      />

      {/* Account Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Deposits"
          value={<AmountDisplay amount={summary.totalBalance} size="xl" weight="bold" className="text-xl sm:text-2xl" />}
          icon={<BanknotesIcon />}
          trend={{ value: `${summary.depositsCount} Active Accounts`, isPositive: true }}
          className="p-4 sm:p-6 border-primary"
        />
        <StatCard
          title="Loans Given Out"
          value={<AmountDisplay amount={summary.loanOutstanding} size="xl" weight="bold" className="text-xl sm:text-2xl" />}
          icon={<WalletIcon />}
          trend={{ value: `${summary.loanCount} Active Loans`, isPositive: true }}
          className="p-4 sm:p-6 border-blue-500"
        />
        <StatCard
          title="Overdue EMIs"
          value={<span className="text-xl sm:text-2xl">{summary.overdueEMI}</span>}
          icon={<ExclamationTriangleIcon />}
          trend={{ value: summary.overdueEMI > 0 ? "Action Needed" : "All Clear", isPositive: summary.overdueEMI === 0 }}
          className={`p-4 sm:p-6 ${summary.overdueEMI > 0 ? "border-rose-500 ring-1 ring-rose-500/20" : "border-slate-200"}`}
        />
        <StatCard
          title="Pending Suggestions"
          value={<span className="text-xl sm:text-2xl">{summary.pendingSuggestions}</span>}
          icon={<ClockIcon />}
          trend={{ value: summary.pendingSuggestions === 0 ? "Nothing Pending" : "Needs Review", isPositive: summary.pendingSuggestions === 0 }}
          className="p-4 sm:p-6 border-indigo-500"
        />
      </div>

      {/* Analytics & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Growth Analysis */}
        <Card className="col-span-1 lg:col-span-8 border-slate-200 shadow-sm overflow-hidden rounded-3xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:py-5 sm:px-8">
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
              <ChartBarIcon className="h-4 w-4 mr-3 text-primary" />
              Deposit Growth (This Year)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <DashboardChartLine data={[
              { label: 'Jan', value: 45000 }, { label: 'Feb', value: 52000 },
              { label: 'Mar', value: 48000 }, { label: 'Apr', value: 61000 },
              { label: 'May', value: 58000 }, { label: 'Jun', value: 67000 }
            ]} />
          </CardContent>
        </Card>

        {/* Account Distribution */}
        <Card className="col-span-1 lg:col-span-4 border-slate-200 shadow-sm overflow-hidden rounded-3xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:py-5 sm:px-8">
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
              <BuildingLibraryIcon className="h-4 w-4 mr-3 text-primary" />
              Account Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <DashboardChartDistribution data={[
              { label: 'Fixed Deposits', value: 45, color: 'var(--primary)' },
              { label: 'Recurring', value: 30, color: 'hsl(215 90% 40%)' },
              { label: 'Consumer Loans', value: 15, color: 'hsl(142 70% 45%)' },
              { label: 'Institutional', value: 10, color: 'hsl(30 90% 50%)' },
            ]} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <Card className="col-span-1 lg:col-span-8 border-slate-200 shadow-sm overflow-hidden rounded-3xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:py-5 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
              <QueueListIcon className="h-4 w-4 mr-3 text-primary" />
              Recent Transactions
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/ledger')}
              className="text-[10px] font-black uppercase text-primary hover:bg-primary/5 h-8 px-3 rounded-xl transition-all"
            >
              View All <ArrowUpRightIcon className="h-3 w-3 ml-2" />
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="px-5 sm:px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest h-12 min-w-[160px]">Customer / Account</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest h-12 text-center hide-on-mobile">Type</TableHead>
                  <TableHead className="px-5 sm:px-8 text-[10px] font-black uppercase text-slate-400 tracking-widest h-12 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.recentTransactions?.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                    <TableCell className="px-4 sm:px-8 py-4 sm:py-5">
                      <div className="text-sm font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{t.customer}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{t.item}</span>
                        <span className="text-[8px] text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-slate-400">{t.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center hide-on-mobile">
                      <Badge className={`uppercase font-black text-[9px] tracking-widest px-3 py-1 rounded-sm border ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                        {t.type === 'credit' ? 'Inflow' : 'Outflow'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 sm:px-8 text-right">
                      <div className={`text-base sm:text-lg font-black tracking-tighter tabular-nums ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'credit' ? '+' : '-'}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(t.amount || 0)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-20 bg-white">
                      <QueueListIcon className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Recent Transactions Found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Command Panel */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          {/* Financial Alerts */}
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-rose-500" />
                Alerts & Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div
                className="group p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-rose-100 transition-all active:scale-[0.98]"
                onClick={() => router.push('/dashboard/loans')}
              >
                <div>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Overdue EMIs</p>
                  <p className="text-3xl font-black text-rose-700 tracking-tighter tabular-nums">{summary.overdueEMI}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-sm group-hover:scale-110 transition-transform">
                  <ArrowRightIcon className="h-5 w-5" />
                </div>
              </div>
              <div
                className="group p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-indigo-100 transition-all active:scale-[0.98]"
                onClick={() => router.push('/dashboard/operations/suggestions')}
              >
                <div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Due Today</p>
                  <p className="text-3xl font-black text-indigo-700 tracking-tighter tabular-nums">{summary.dueTodayEMI}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                  <ArrowRightIcon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Matrix */}
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                <BoltIcon className="h-4 w-4 mr-2 text-primary" />
                Quick Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              <ActionTile title="Customers" icon={UserIcon} onClick={() => router.push('/dashboard/customers')} color="text-blue-600" />
              <ActionTile title="Loans" icon={BriefcaseIcon} onClick={() => router.push('/dashboard/loans')} color="text-amber-600" />
              <ActionTile title="Transactions" icon={QueueListIcon} onClick={() => router.push('/dashboard/ledger')} color="text-emerald-600" />
              <ActionTile title="Reports" icon={ChartBarIcon} onClick={() => router.push('/dashboard/reports')} color="text-purple-600" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </DashboardLayout>
  )
}