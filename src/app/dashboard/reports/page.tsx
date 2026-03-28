"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import {
  ChartBarIcon, UserGroupIcon, ArrowTrendingUpIcon, CurrencyDollarIcon,
  DocumentDuplicateIcon, ArrowDownTrayIcon, ClockIcon, CheckBadgeIcon,
  BuildingLibraryIcon, ChartPieIcon, PresentationChartLineIcon, ArrowRightIcon,
} from "@heroicons/react/24/outline"

interface ReportSummary {
  customers: number; activeAccounts: number; totalFDPrincipal: number;
  totalRDPrincipal: number; totalLoanOutstanding: number;
  pendingEMIAmount: number; unprocessedSuggestions: number;
}

function ReportCard({ title, description, href, icon, badge, badgeColor }: {
  title: string; description: string; href: string; icon: React.ReactNode;
  badge?: string; badgeColor?: string;
}) {
  return (
    <div
      className="group bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all finance-hover-lift"
      onClick={() => window.location.href = href}
    >
      <div className="finance-icon-bg h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">{title}</h3>
          {badge && (
            <span className={`badge-type text-[10px] ${badgeColor ?? 'badge-type-fd'}`}>{badge}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-slate-300 group-hover:text-primary flex-shrink-0 transition-colors mt-0.5" />
    </div>
  )
}

export default function ReportsDashboard() {
  const router = useRouter()
  const [summary, setSummary] = useState<ReportSummary>({
    customers: 0, activeAccounts: 0, totalFDPrincipal: 0,
    totalRDPrincipal: 0, totalLoanOutstanding: 0,
    pendingEMIAmount: 0, unprocessedSuggestions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/reports/summary')
        if (res.ok) setSummary(await res.json())
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    fetch_()
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        <PageHeader
          title="Business Intelligence"
          subtitle="Consolidated financial reporting & portfolio health"
          actions={
            <Button variant="outline" className="h-9 px-4 border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          }
        />

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="FD Principal" value={fmt(summary.totalFDPrincipal)} subtitle="Fixed deposit corpus" icon={<BuildingLibraryIcon />} iconVariant="primary" borderVariant="primary" />
          <StatCard title="Loan Exposure" value={fmt(summary.totalLoanOutstanding)} subtitle="Outstanding balance" icon={<CurrencyDollarIcon />} iconVariant="danger" borderVariant="danger" />
          <StatCard title="Pending EMI" value={fmt(summary.pendingEMIAmount)} subtitle="Collection due" icon={<ClockIcon />} iconVariant="warning" borderVariant="warning" />
          <StatCard title="Open Suggestions" value={summary.unprocessedSuggestions ?? 0} subtitle="Awaiting processing" icon={<PresentationChartLineIcon />} iconVariant="teal" borderVariant="teal" />
        </div>

        {/* Report categories */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Audit & Portfolio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <ChartPieIcon className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Audit & Portfolio Architecture</h2>
            </div>
            <div className="space-y-3">
              <ReportCard
                title="Consolidated Customer Ledger"
                description="Complete financial snapshot of every customer with active exposure and payment history."
                href="/dashboard/reports/customers"
                icon={<UserGroupIcon />}
              />
              <ReportCard
                title="FD Maturity Matrix"
                description="Forecast liquidity requirements by analyzing Fixed Deposits maturing in upcoming cycles."
                href="/dashboard/reports/fd"
                icon={<DocumentDuplicateIcon />}
                badge="STRATEGY"
              />
              <ReportCard
                title="Collection Velocity"
                description="Real-time analysis of RD and EMI collection trends against projected targets."
                href="/dashboard/reports/rd"
                icon={<ChartBarIcon />}
              />
            </div>
          </div>

          {/* Compliance & Recovery */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <PresentationChartLineIcon className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Compliance & Recovery Logs</h2>
            </div>
            <div className="space-y-3">
              <ReportCard
                title="Default & Delinquency"
                description="Risk analysis identifying accounts with missed payments or pending penalty accruals."
                href="/dashboard/reports/loans"
                icon={<ClockIcon />}
                badge="RISK"
                badgeColor="badge-type-loan"
              />
              <ReportCard
                title="Accrual Verification"
                description="Audit log of all interest disbursements approved through the suggestions engine."
                href="#"
                icon={<CheckBadgeIcon />}
              />
              <ReportCard
                title="Unified Statement Hub"
                description="Institutional-grade statement generation for audit-ready customer reports."
                href="#"
                icon={<ArrowDownTrayIcon />}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
