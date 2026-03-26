"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { 
  BuildingLibraryIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  BanknotesIcon, 
  CreditCardIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  RocketLaunchIcon,
  FunnelIcon,
  ArrowPathIcon,
  QueueListIcon,
  UserIcon as UserGroupIcon
} from "@heroicons/react/24/outline"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  
  // Quick Month/Year Selection for Suggestions Run
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!user) router.push("/login")
    else fetchSummary()
  }, [user])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard/summary')
      if (res.ok) {
        const d = await res.json()
        setData(d)
      }
    } catch (error) {
       console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickRun = async () => {
    try {
      setRunning(true)
      const res = await fetch('/api/suggestions/run-monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear })
      })
      if (res.ok) {
        fetchSummary()
        router.push('/dashboard/operations/suggestions')
      }
    } catch (error) {
       console.error(error)
    } finally {
      setRunning(false)
    }
  }

  if (!user || loading) return (
     <DashboardLayout>
        <div className="p-6 min-h-screen bg-slate-50 flex items-center justify-center">
           <div className="text-center">
              <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-slate-400 font-black uppercase tracking-widest text-xs italic">Syncing Financial Core...</p>
           </div>
        </div>
     </DashboardLayout>
  )

  const summary = data?.summary || { totalBalance: 0, loanOutstanding: 0, depositsCount: 0, loanCount: 0, pendingSuggestions: 0, overdueEMI: 0, dueTodayEMI: 0 }

  const stats = [
    {
      title: "Portfolio Deposits",
      value: `₹${summary.totalBalance.toLocaleString()}`,
      count: `${summary.depositsCount} Active Accounts`,
      icon: BanknotesIcon,
      color: "from-blue-600 to-indigo-600",
      description: "FD & RD Combined Exposure"
    },
    {
      title: "Loan Book",
      value: `₹${summary.loanOutstanding.toLocaleString()}`,
      count: `${summary.loanCount} active loans`,
      icon: CurrencyDollarIcon,
      color: "from-purple-600 to-indigo-700",
      description: "Overall System Exposure"
    },
    {
      title: "Overdue Alerts",
      value: `${summary.overdueEMI}`,
      count: "Critical Overdue EMIs",
      icon: ExclamationTriangleIcon,
      color: "from-red-500 to-rose-600",
      description: "Immediate Recovery Req",
      highlight: summary.overdueEMI > 0
    },
    {
      title: "Pending Discovery",
      value: `${summary.pendingSuggestions}`,
      count: "Awaiting Verification",
      icon: ClockIcon,
      color: "from-amber-400 to-orange-500",
      description: "Engine-generated Logs",
      highlight: summary.pendingSuggestions > 0
    }
  ]

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Main Header with Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic tracking-tighter">
                Executive Overview
              </h1>
              <p className="text-gray-500 mt-2 flex items-center font-bold text-sm">
                <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                Logged in as <span className="text-slate-900 mx-1">{user.name}</span> • Portfolio Operational
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
               <div className="flex bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200 shadow-sm items-center">
                  <div className="flex items-center px-4 space-x-2 border-r border-slate-100">
                     <CalendarIcon className="h-4 w-4 text-blue-500" />
                     <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-transparent text-xs font-black uppercase tracking-widest outline-none pr-2"
                     >
                        {Array.from({length: 12}, (_, i) => (
                           <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('en-US', { month: 'short' })}</option>
                        ))}
                     </select>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={running}
                    onClick={handleQuickRun}
                    className="ml-2 h-9 px-4 rounded-xl text-blue-600 font-black text-[10px] tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all italic"
                  >
                     {running ? <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" /> : <RocketLaunchIcon className="h-4 w-4 mr-2" />}
                     Generate SUGGESTIONS
                  </Button>
               </div>
               
               <Button
                onClick={() => router.push('/dashboard/customers/create')}
                className="bg-slate-900 hover:bg-black text-white shadow-xl h-12 px-8 font-black uppercase tracking-widest italic rounded-2xl active:scale-95 transition-all"
               >
                 <PlusIcon className="h-5 w-5 mr-3" />
                 New Account
               </Button>
            </div>
          </div>

          {/* Core Institutional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className={`bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm transition-all hover:shadow-xl ${stat.highlight ? 'ring-2 ring-red-500 ring-offset-2 scale-105' : ''}`}>
                <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.title}</p>
                         <p className="text-3xl font-black text-slate-900 tabular-nums italic tracking-tighter">{stat.value}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center">
                            {stat.count}
                         </p>
                      </div>
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg border-4 border-white`}>
                        <stat.icon className="h-7 w-7 text-white" />
                      </div>
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-50">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center">
                         <ShieldCheckIcon className="h-3 w-3 mr-2" />
                         {stat.description}
                      </p>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Operational Intelligence Grid */}
          <div className="grid lg:grid-cols-3 gap-8 pb-12">
            
            {/* Real-time Ledger Stream */}
            <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm border-slate-200 overflow-hidden rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between h-20 bg-white/40 border-b border-slate-100 px-8">
                <CardTitle className="text-lg font-black italic uppercase tracking-widest text-slate-900 flex items-center">
                   <QueueListIcon className="h-5 w-5 mr-3 text-blue-500" />
                   Recent Ledger Stream
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/reports')} className="text-blue-600 font-bold uppercase tracking-widest text-xs h-9 px-4 rounded-xl hover:bg-blue-50">
                   Master Report <ArrowRightIcon className="h-3 w-3 ml-2" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-none">
                      <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-slate-900 h-14">Identity Domain</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-900 h-14">Type</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-900 h-14 text-right px-8">Magnitude</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.recentTransactions.map((t: any) => (
                      <TableRow key={t.id} className="hover:bg-white/80 transition-colors border-b border-slate-50">
                        <TableCell className="px-8 py-6">
                          <div className="space-y-1">
                             <p className="text-lg font-black text-slate-900 italic tracking-tighter leading-none">{t.customer}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{t.date} • {t.item}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge className={`uppercase font-black text-[9px] tracking-widest px-3 py-1 rounded-sm border ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                              {t.type}
                           </Badge>
                        </TableCell>
                        <TableCell className={`text-right px-8 text-xl font-black italic tabular-nums tracking-tighter ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Strategic Quick-Links & Status Alerts */}
            <div className="space-y-6">
               <Card className="bg-white/60 backdrop-blur-sm border-slate-200 rounded-3xl overflow-hidden">
                 <CardHeader className="bg-white/40 p-6 border-b border-slate-100">
                   <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center italic">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-3 text-red-500" />
                      Critical Alerts
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center justify-between">
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-red-600">Overdue EMIs</p>
                          <p className="text-lg font-black text-slate-900 italic">{summary.overdueEMI} Default Recorded</p>
                       </div>
                       <Button size="sm" className="bg-red-600 text-white font-bold h-10 w-10 p-0 rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/10" onClick={() => router.push('/dashboard/loans')}>
                          <ArrowRightIcon className="h-5 w-5" />
                       </Button>
                    </div>
                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center justify-between">
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-amber-600">Due Today</p>
                          <p className="text-lg font-black text-slate-900 italic">{summary.dueTodayEMI} Collections Open</p>
                       </div>
                       <Button size="sm" className="bg-amber-600 text-white font-bold h-10 w-10 p-0 rounded-xl hover:bg-amber-700 shadow-lg shadow-amber-600/10" onClick={() => router.push('/dashboard/operations/suggestions')}>
                          <ArrowRightIcon className="h-5 w-5" />
                       </Button>
                    </div>
                 </CardContent>
               </Card>

               <Card className="bg-white/60 backdrop-blur-sm border-slate-200 rounded-3xl overflow-hidden">
                 <CardHeader className="bg-white/40 p-6 border-b border-slate-100">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center italic">
                       <FunnelIcon className="h-5 w-5 mr-3 text-indigo-500" />
                       Strategic Routes
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 grid grid-cols-2 gap-3">
                    <QuickActionBtn 
                        title="Registry" 
                        icon={<UserIcon className="h-5 w-5" />} 
                        onClick={() => router.push('/dashboard/customers')} 
                    />
                    <QuickActionBtn 
                        title="Audit" 
                        icon={<ClockIcon className="h-5 w-5" />} 
                        onClick={() => router.push('/dashboard/operations/suggestions')} 
                    />
                    <QuickActionBtn 
                        title="Master" 
                        icon={<BuildingLibraryIcon className="h-5 w-5" />} 
                        onClick={() => router.push('/dashboard/loans')} 
                    />
                    <QuickActionBtn 
                        title="BI Docs" 
                        icon={<ChartBarIcon className="h-5 w-5" />} 
                        onClick={() => router.push('/dashboard/reports')} 
                    />
                 </CardContent>
               </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function QuickActionBtn({ title, icon, onClick }: { title: string, icon: React.ReactNode, onClick: () => void }) {
   return (
      <Button 
         variant="outline" 
         onClick={onClick}
         className="flex flex-col items-center justify-center h-28 border-slate-100 bg-white/40 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all rounded-2xl gap-3 group"
      >
         <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center transition-colors">
            {icon}
         </div>
         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900">{title}</span>
      </Button>
   )
}

function UserIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}