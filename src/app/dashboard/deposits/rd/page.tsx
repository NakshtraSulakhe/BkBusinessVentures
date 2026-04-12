"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { formatShortDate } from "@/lib/utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { TableActions } from "@/components/ui/table-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CurrencyDollarIcon, CheckCircleIcon, PlusIcon, EyeIcon,
  PencilIcon, MagnifyingGlassIcon, ChartBarIcon, CalendarIcon,
  ArrowPathIcon, DocumentArrowDownIcon,
} from "@heroicons/react/24/outline"

interface RDAccount {
  id: string; accountNumber: string; customerId: string; accountType: string;
  principalAmount: number; interestRate: number; tenure: number;
  startDate: string; maturityDate: string; status: string;
  customer: { id: string; name: string; email: string; phone: string };
  accountRules: any; _count: { transactions: number }
}

const STATUS_CLS: Record<string, string> = {
  active:           "badge-status badge-status-active",
  maturity_pending: "badge-status badge-status-matured",
  closing_pending:  "badge-status badge-status-matured",
  closed:           "badge-status badge-status-closed",
}

export default function RDPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [rdAccounts, setRdAccounts] = useState<RDAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true)
        console.log("🔍 Fetching RD accounts...")
        const res = await fetchWithAuth('/api/accounts?accountType=RD', { token })
        if (res.ok) { 
          const d = await res.json(); 
          console.log("📊 RD accounts response:", d)
          console.log("📋 RD accounts found:", d.accounts?.length || 0)
          setRdAccounts(d.accounts || []) 
        } else {
          console.error("❌ Failed to fetch RD accounts:", res.status)
        }
      } catch (e) { 
        console.error("❌ Error fetching RD accounts:", e) 
      } finally { 
        setLoading(false) 
      }
    }
    fetch_()
  }, [token])

  const filtered = rdAccounts.filter(a =>
    a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalMonthly = filtered.reduce((s, a) => s + (a.principalAmount / a.tenure), 0)
  const avgRate = filtered.length > 0 ? filtered.reduce((s, a) => s + a.interestRate, 0) / filtered.length : 0

  const exportToCSV = () => {
    // Helper to format number for CSV (raw number, no currency symbol)
    const formatNumber = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    // Create CSV content
    const headers = ['Account Number', 'Customer Name', 'Customer Email', 'Customer Phone', 'Monthly Installment', 'Interest Rate (%)', 'Tenure (Months)', 'Start Date', 'Maturity Date', 'Status', 'Maturity Amount']
    const rows = filtered.map(account => {
      const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
      const totalPrincipal = monthly * account.tenure
      const r = account.interestRate / 100
      const n = account.tenure
      const rdInterest = monthly * (n * (n + 1) / 2) * (r / 12)
      const maturityAmount = Math.round(totalPrincipal + rdInterest)

      return [
        account.accountNumber,
        account.customer.name,
        account.customer.email,
        account.customer.phone,
        formatNumber(monthly),
        account.interestRate.toString(),
        account.tenure.toString(),
        account.startDate ? new Date(account.startDate).toLocaleDateString('en-IN') : '',
        account.maturityDate ? new Date(account.maturityDate).toLocaleDateString('en-IN') : '',
        account.status || 'ACTIVE',
        formatNumber(maturityAmount)
      ]
    })

    const csvContent = [
      ['Recurring Deposit Accounts Report'],
      [`Total RD Accounts: ${filtered.length}`],
      [`Total Monthly Installments: ₹${totalMonthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
      [],
      headers,
      ...rows
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `rd_accounts_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        <PageHeader
          title="Recurring Deposits"
          subtitle="Manage all recurring deposit accounts"
          actions={
            <div className="flex items-center gap-3">
              <Button
                onClick={exportToCSV}
                disabled={filtered.length === 0}
                variant="outline"
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => router.push('/dashboard/deposits/rd/create')} className="finance-gradient-primary text-white h-9 px-4 rounded-xl font-medium shadow-sm">
                <PlusIcon className="h-4 w-4 mr-2" /> Create RD
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Total RD Accounts" value={filtered.length} subtitle="All accounts" icon={<ArrowPathIcon />} iconVariant="primary" borderVariant="primary" />
          <StatCard title="Active RDs" value={filtered.filter(a => a.status?.toLowerCase() === 'active').length} subtitle="Currently active" icon={<CheckCircleIcon />} iconVariant="success" borderVariant="success" />
          <StatCard title="Monthly Installments" value={`₹${totalMonthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} subtitle="Combined monthly" icon={<CurrencyDollarIcon />} iconVariant="teal" borderVariant="teal" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by account number or customer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">RD Accounts <span className="ml-1 text-xs font-normal text-slate-400">({filtered.length})</span></h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading accounts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl finance-icon-bg flex items-center justify-center mx-auto mb-4"><ArrowPathIcon className="h-7 w-7" /></div>
              <h3 className="text-sm font-semibold text-slate-800">No RD accounts found</h3>
              <p className="text-xs text-slate-400 mt-1">{search ? 'Try adjusting your search' : 'Get started by creating your first RD'}</p>
              {!search && (
                <Button onClick={() => router.push('/dashboard/deposits/rd/create')} className="mt-5 finance-gradient-primary text-white h-8 px-4 text-xs rounded-lg">
                  <PlusIcon className="h-3.5 w-3.5 mr-1.5" /> Create RD Account
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50 border-slate-100">
                    <TableHead className="px-5 py-3 text-xs font-semibold text-slate-600 min-w-[150px]">Account</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[180px]">Customer</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[130px] text-right">Monthly Install.</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[80px] text-right">Rate</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[80px]">Tenure</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[130px] text-right">Maturity Amt</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[110px]">Maturity</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[90px]">Status</TableHead>
                    <TableHead className="px-4 py-3 w-14 text-right text-xs font-semibold text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(account => {
                    const sk = account.status?.toLowerCase() || 'active'
                    const statusCls = STATUS_CLS[sk] ?? "badge-status badge-status-closed"
                    const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
                    return (
                      <TableRow key={account.id} className="hover:bg-slate-50 border-slate-100 transition-colors">
                        <TableCell className="px-5 py-3.5">
                          <div className="font-mono text-sm font-semibold text-slate-800">{account.accountNumber}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <CalendarIcon className="h-3 w-3" />
                            {formatShortDate(account.startDate)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="text-sm font-semibold text-slate-800">{account.customer.name}</div>
                          <div className="text-xs text-slate-400">{account.customer.email}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-900 tabular-nums">₹{monthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">{account.interestRate}%</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-sm text-slate-600 tabular-nums">{account.tenure}m</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-900 tabular-nums">
                            ₹{(() => {
                              const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
                              const totalPrincipal = monthly * account.tenure
                              const r = account.interestRate / 100
                              const n = account.tenure
                              const rdInterest = monthly * (n * (n + 1) / 2) * (r / 12)
                              return Math.round(totalPrincipal + rdInterest).toLocaleString('en-IN')
                            })()}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-xs text-slate-500 tabular-nums">
                            {account.maturityDate ? formatShortDate(account.maturityDate) : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className={statusCls}>{account.status || 'ACTIVE'}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <TableActions actions={[
                            { label: "View Details", icon: <EyeIcon />, onClick: () => router.push(`/dashboard/deposits/rd/${account.id}`) },
                            { label: "Edit", icon: <PencilIcon />, onClick: () => router.push(`/dashboard/deposits/rd/${account.id}/edit`) },
                          ]} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
