"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ArrowLeftIcon,
  BuildingLibraryIcon,
  ChartPieIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"

interface ReportSummary {
  customers: number
  activeAccounts: number
  totalFDPrincipal: number
  totalRDPrincipal: number
  totalLoanOutstanding: number
  pendingEMIAmount: number
  unprocessedSuggestions: number
}

export default function ReportsDashboard() {
  const router = useRouter()
  const [summary, setSummary] = useState<ReportSummary>({
    customers: 0,
    activeAccounts: 0,
    totalFDPrincipal: 0,
    totalRDPrincipal: 0,
    totalLoanOutstanding: 0,
    pendingEMIAmount: 0,
    unprocessedSuggestions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/summary')
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

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
                onClick={() => router.push('/dashboard')}
                className="h-10 w-10 p-0 rounded-full hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Business Intelligence
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Consolidated financial reporting & portfolio health
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="bg-white/60 backdrop-blur-sm border-slate-200 h-11 px-6 shadow-sm font-bold text-slate-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Quarterly Pack
              </Button>
            </div>
          </div>

          {/* Quick Metrics - Gradient Icons consistent with Master */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">FD Principal</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalFDPrincipal || 0)}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <BuildingLibraryIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loan Exposure</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalLoanOutstanding || 0)}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <CurrencyDollarIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending EMI</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(summary.pendingEMIAmount || 0)}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                    <ClockIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Discovery Unit</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{summary.unprocessedSuggestions || 0} Open</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <PresentationChartLineIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Report Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center bg-white/40 p-3 rounded-xl border border-white/50 w-fit italic">
                <ChartPieIcon className="h-5 w-5 mr-3 text-blue-500" />
                Audit & Portfolio Architecture
              </h2>
              
              <div className="grid gap-4">
                <ReportCard 
                  title="Consolidated Customer Ledger" 
                  description="Complete financial snapshot of every customer with active exposure and payment history."
                  href="/dashboard/reports/customers"
                  icon={<UserGroupIcon className="h-7 w-7 text-indigo-500" />}
                />
                <ReportCard 
                  title="FD Maturity Matrix" 
                  description="Forecast liquidity requirements by analyzing Fixed Deposits maturing in upcoming cycles."
                  badge="STRATEGY"
                  href="/dashboard/reports/fd"
                  icon={<DocumentDuplicateIcon className="h-7 w-7 text-blue-500" />}
                />
                <ReportCard 
                  title="Collection Velocity" 
                  description="Real-time analysis of RD and EMI collection trends against projected targets."
                  href="/dashboard/reports/rd"
                  icon={<ChartBarIcon className="h-7 w-7 text-emerald-500" />}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center bg-white/40 p-3 rounded-xl border border-white/50 w-fit italic">
                <PresentationChartLineIcon className="h-5 w-5 mr-3 text-indigo-500" />
                Compliance & Recovery Logs
              </h2>
              
              <div className="grid gap-4">
                <ReportCard 
                  title="Default & Delinquency" 
                  description="Risk analysis identifying accounts with missed payments or pending penalty accruals."
                  badge="RISK"
                  badgeColor="bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                  href="/dashboard/reports/loans"
                  icon={<ClockIcon className="h-7 w-7 text-rose-500" />}
                />
                <ReportCard 
                  title="Accrual Verification" 
                  description="Audit log of all interest disbursements approved through the suggestions engine."
                  href="#"
                  icon={<CheckBadgeIcon className="h-7 w-7 text-emerald-500" />}
                />
                <ReportCard 
                  title="Unified Statement Hub" 
                  description="Institutional-grade statement generation for audit-ready customer reports."
                  href="#"
                  icon={<ArrowDownTrayIcon className="h-7 w-7 text-slate-400" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function ReportCard({ title, description, href, icon, badge, badgeColor }: { title: string, description: string, href: string, icon: React.ReactNode, badge?: string, badgeColor?: string }) {
  return (
    <Card 
      className="group cursor-pointer hover:border-blue-200 hover:shadow-xl transition-all active:scale-[0.99] border-slate-100 bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden"
      onClick={() => window.location.href = href}
    >
      <CardContent className="p-6 flex items-start space-x-5">
        <div className="h-16 w-16 rounded-2xl bg-white shadow-inner flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50 transition-all border border-slate-50">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight italic">{title}</h3>
            {badge && (
              <Badge variant="outline" className={`${badgeColor || 'bg-blue-50 text-blue-700 border-blue-100'} text-[9px] font-black uppercase tracking-widest`}>{badge}</Badge>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
