"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AmountDisplay, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
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

// Simple Bar Chart Component
function SimpleBarChart({ data, title, color }: { data: { label: string, value: number }[], title: string, color: string }) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-16 text-right font-medium">{item.label}</span>
            <div className="flex-1 bg-muted/50 rounded-full h-8 relative overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-700 ease-out shadow-lg ${
                  color === 'success' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 
                  color === 'danger' ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                  color === 'warning' ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 
                  'bg-gradient-to-r from-blue-400 to-blue-600'
                }`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                <div className="h-full bg-white/20 animate-pulse" />
              </div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
                {item.value.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple Pie Chart Component
function SimplePieChart({ data, title }: { data: { label: string, value: number, color: string }[], title: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <div className="flex items-center justify-center">
        <div className="relative w-36 h-36">
          <svg className="w-36 h-36 transform -rotate-90 drop-shadow-lg">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const strokeDasharray = `${percentage} ${100 - percentage}`
              const offset = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 100, 0)
              
              return (
                <circle
                  key={index}
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="18"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={offset}
                  className="transition-all duration-700 ease-out hover:opacity-80"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-xl font-bold text-foreground">{total}</span>
              <span className="text-xs text-muted-foreground block">Total</span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{item.value}%</span>
              <span className="text-muted-foreground">({Math.round((item.value / total) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple Line Chart Component
function SimpleLineChart({ data, title }: { data: { label: string, value: number }[], title: string }) {
  const maxValue = Math.max(...data.map(d => d.value))
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - (item.value / maxValue) * 100
    return `${x},${y}`
  }).join(' ')
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <div className="h-36 relative bg-gradient-to-b from-primary/5 to-transparent rounded-lg p-2">
        <svg className="w-full h-full">
          {/* Grid lines */}
          {[...Array(4)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={`${(i + 1) * 25}%`}
              x2="100%"
              y2={`${(i + 1) * 25}%`}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="2,2"
              className="opacity-30"
            />
          ))}
          
          {/* Area fill */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          <polygon
            points={`${points} 100,100 0,100`}
            fill="url(#areaGradient)"
            className="transition-all duration-700"
          />
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="hsl(217 91% 60%)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-700 drop-shadow-lg"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - (item.value / maxValue) * 100
            return (
              <g key={index}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="6"
                  fill="white"
                  stroke="hsl(217 91% 60%)"
                  strokeWidth="3"
                  className="transition-all duration-700 hover:r-8 cursor-pointer"
                />
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="3"
                  fill="hsl(217 91% 60%)"
                  className="transition-all duration-700"
                />
              </g>
            )
          })}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        {data.map((item, index) => (
          <span key={index} className="px-2 py-1 bg-muted/50 rounded">{item.label}</span>
        ))}
      </div>
    </div>
  )
}

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
      value: summary.totalBalance,
      count: `${summary.depositsCount} Active Accounts`,
      icon: BanknotesIcon,
      description: "FD & RD Combined Exposure",
      color: "success",
      bgColor: "finance-success",
      iconBg: "finance-icon-bg-success"
    },
    {
      title: "Loan Book",
      value: summary.loanOutstanding,
      count: `${summary.loanCount} active loans`,
      icon: CurrencyDollarIcon,
      description: "Overall System Exposure",
      color: "info",
      bgColor: "finance-info",
      iconBg: "finance-icon-bg"
    },
    {
      title: "Overdue Alerts",
      value: summary.overdueEMI,
      count: "Critical Overdue EMIs",
      icon: ExclamationTriangleIcon,
      description: "Immediate Recovery Required",
      color: "danger",
      bgColor: "finance-danger",
      iconBg: "finance-icon-bg-danger",
      highlight: summary.overdueEMI > 0
    },
    {
      title: "Pending Discovery",
      value: summary.pendingSuggestions,
      count: "Awaiting Verification",
      icon: ClockIcon,
      description: "Engine-generated Logs",
      color: "warning",
      bgColor: "finance-warning",
      iconBg: "finance-icon-bg-warning",
      highlight: summary.pendingSuggestions > 0
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold finance-text-gradient">Dashboard Overview</h1>
              <p className="text-muted-foreground mt-1">Manage your banking portfolio and monitor financial performance</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
               <div className="flex bg-card border border-border rounded-lg p-1.5 items-center">
                  <div className="flex items-center px-4 space-x-2 border-r border-border">
                     <CalendarIcon className="h-4 w-4 text-primary" />
                     <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-transparent text-sm font-medium outline-none pr-2"
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
                    className="ml-2 h-10 px-4 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                     {running ? <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" /> : <RocketLaunchIcon className="h-4 w-4 mr-2" />}
                     Generate Suggestions
                  </Button>
               </div>
               
               <Button
                onClick={() => router.push('/dashboard/customers/create')}
                className="finance-gradient-primary text-white hover:shadow-lg transition-all duration-200"
               >
                 <PlusIcon className="h-4 w-4 mr-2" />
                 New Account
               </Button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className={`finance-hover-lift transition-all duration-300 hover:shadow-xl ${stat.highlight ? 'ring-2 ring-destructive ring-offset-2 animate-pulse' : ''}`}>
                <CardContent className={`p-6 ${stat.bgColor} bg-opacity-5 border-l-4`} style={{borderLeftColor: stat.color === 'success' ? 'hsl(160 84% 39%)' : stat.color === 'danger' ? 'hsl(0 72% 51%)' : stat.color === 'warning' ? 'hsl(38 92% 50%)' : 'hsl(217 91% 60%)'}}>
                   <div className="flex items-center justify-between">
                      <div className="space-y-2">
                         <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                         <AmountDisplay amount={stat.value} size="xl" weight="bold" color={stat.color} />
                         <p className={`text-xs font-medium ${
                           stat.color === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 
                           stat.color === 'danger' ? 'text-red-600 dark:text-red-400' : 
                           stat.color === 'warning' ? 'text-amber-600 dark:text-amber-400' : 
                           'text-blue-600 dark:text-blue-400'
                         }`}>
                            {stat.count}
                         </p>
                      </div>
                      <div className={`${stat.iconBg} h-12 w-12 rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                   </div>
                   <div className="mt-4 pt-4 border-t border-border">
                      <p className={`text-xs flex items-center ${
                        stat.color === 'success' ? 'text-emerald-700 dark:text-emerald-300' : 
                        stat.color === 'danger' ? 'text-red-700 dark:text-red-300' : 
                        stat.color === 'warning' ? 'text-amber-700 dark:text-amber-300' : 
                        'text-blue-700 dark:text-blue-300'
                      }`}>
                         <ShieldCheckIcon className={`h-3 w-3 mr-2 ${
                           stat.color === 'success' ? 'text-emerald-500' : 
                           stat.color === 'danger' ? 'text-red-500' : 
                           stat.color === 'warning' ? 'text-amber-500' : 
                           'text-blue-500'
                         }`} />
                         {stat.description}
                      </p>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analytics & Graphs Section */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Monthly Performance Trend */}
            <Card className="finance-hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                   <ChartBarIcon className="h-5 w-5 mr-3 text-primary" />
                   Monthly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleLineChart 
                  data={[
                    { label: 'Jan', value: 45000 },
                    { label: 'Feb', value: 52000 },
                    { label: 'Mar', value: 48000 },
                    { label: 'Apr', value: 61000 },
                    { label: 'May', value: 58000 },
                    { label: 'Jun', value: 67000 }
                  ]}
                  title="Portfolio Growth Trend"
                />
              </CardContent>
            </Card>

            {/* Loan Distribution */}
            <Card className="finance-hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                   <BuildingLibraryIcon className="h-5 w-5 mr-3 text-primary" />
                   Loan Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimplePieChart 
                  data={[
                    { label: 'Personal', value: 45, color: '#10b981' },
                    { label: 'Business', value: 30, color: '#3b82f6' },
                    { label: 'Education', value: 15, color: '#f59e0b' },
                    { label: 'Home', value: 10, color: '#ef4444' }
                  ]}
                  title="Loan Types Distribution"
                />
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="finance-hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                   <ArrowTrendingUpIcon className="h-5 w-5 mr-3 text-primary" />
                   Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={[
                    { label: 'FD A', value: 85000 },
                    { label: 'RD B', value: 72000 },
                    { label: 'FD C', value: 68000 },
                    { label: 'RD D', value: 54000 }
                  ]}
                  title="Highest Deposits"
                  color="success"
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Recent Ledger Stream */}
            <Card className="lg:col-span-2 finance-hover-lift">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-lg font-semibold flex items-center">
                   <QueueListIcon className="h-5 w-5 mr-3 text-primary" />
                   Recent Ledger Stream
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/reports')} className="text-primary hover:bg-primary/10 transition-colors">
                   View All Transactions <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="text-center font-semibold">Type</TableHead>
                      <TableHead className="text-right font-semibold">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.recentTransactions?.map((t: any, index: number) => (
                      <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="space-y-1">
                             <p className="font-medium text-foreground">{t.customer}</p>
                             <p className="text-xs text-muted-foreground flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {t.date} • {t.item}
                             </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-4">
                           <StatusBadge status={t.type === 'credit' ? 'success' : 'destructive'} className="font-medium">
                              {t.type === 'credit' ? (
                                <span className="flex items-center">
                                   <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                                   Credit
                                </span>
                              ) : (
                                <span className="flex items-center">
                                   <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                                   Debit
                                </span>
                              )}
                           </StatusBadge>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <AmountDisplay 
                            amount={t.amount} 
                            color={t.type === 'credit' ? 'success' : 'danger'}
                            size="sm"
                            weight="semibold"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Actions & Alerts */}
            <div className="space-y-6">
               <Card>
                 <CardHeader>
                   <CardTitle className="text-sm font-semibold flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-3 text-destructive" />
                      Critical Alerts
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-destructive">Overdue EMIs</p>
                          <p className="text-lg font-semibold">{summary.overdueEMI} Default Recorded</p>
                       </div>
                       <Button size="sm" onClick={() => router.push('/dashboard/loans')}>
                          <ArrowRightIcon className="h-4 w-4" />
                       </Button>
                    </div>
                    <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg flex items-center justify-between">
                       <div>
                          <p className="text-sm font-medium text-warning">Due Today</p>
                          <p className="text-lg font-semibold">{summary.dueTodayEMI} Collections Open</p>
                       </div>
                       <Button size="sm" onClick={() => router.push('/dashboard/operations/suggestions')}>
                          <ArrowRightIcon className="h-4 w-4" />
                       </Button>
                    </div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center">
                       <FunnelIcon className="h-5 w-5 mr-3 text-primary" />
                       Quick Actions
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="grid grid-cols-2 gap-3">
                    <QuickActionBtn 
                        title="Customers" 
                        icon={<UserIcon className="h-5 w-5" />} 
                        onClick={() => router.push('/dashboard/customers')} 
                    />
                    <QuickActionBtn 
                        title="Suggestions" 
                        icon={<ClockIcon className="h-5 w-5" />} 
                        onClick={() => router.push('/dashboard/operations/suggestions')} 
                    />
                    <QuickActionBtn 
                        title="Loans" 
                        icon={<BuildingLibraryIcon className="h-5 w-5" />} 
                        onClick={() => router.push('/dashboard/loans')} 
                    />
                    <QuickActionBtn 
                        title="Reports" 
                        icon={<ChartBarIcon className="h-5 w-5" />} 
                        onClick={() => router.push('/dashboard/reports')} 
                    />
                 </CardContent>
               </Card>
            </div>
          </div>
      </div>
    </DashboardLayout>
  )
}

function QuickActionBtn({ title, icon, onClick }: { title: string, icon: React.ReactNode, onClick: () => void }) {
   const getButtonColor = (title: string) => {
      switch(title) {
         case "Customers": return "finance-icon-bg hover:finance-icon-bg-success"
         case "Suggestions": return "finance-icon-bg-warning hover:finance-icon-bg"
         case "Loans": return "finance-icon-bg hover:finance-icon-bg-danger"
         case "Reports": return "finance-icon-bg hover:finance-icon-bg"
         default: return "finance-icon-bg"
      }
   }

   return (
      <Button 
         variant="outline" 
         onClick={onClick}
         className="flex flex-col items-center justify-center h-24 gap-2 finance-hover-lift border-2 hover:border-primary/50 transition-all duration-300"
      >
         <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 ${getButtonColor(title)}`}>
            {icon}
         </div>
         <span className="text-xs font-medium">{title}</span>
      </Button>
   )
}

function UserIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
}