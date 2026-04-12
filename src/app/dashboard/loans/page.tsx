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
  Building2, DollarSign, CheckCircle2, Plus, Eye, Pencil, Search, BarChart3, Calendar, CreditCard
} from "lucide-react"

interface LoanAccount {
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
  overdue:          "badge-status badge-status-overdue",
}

export default function LoansPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [loans, setLoans] = useState<LoanAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true)
        console.log("🔍 Fetching Loan accounts...")
        const res = await fetchWithAuth('/api/accounts?accountType=LOAN', { token })
        if (res.ok) { 
          const d = await res.json(); 
          console.log("📊 Loan accounts response:", d)
          console.log("📋 Loan accounts found:", d.accounts?.length || 0)
          setLoans(d.accounts || []) 
        } else {
          console.error("❌ Failed to fetch Loan accounts:", res.status)
        }
      } catch (e) { 
        console.error("❌ Error fetching Loan accounts:", e) 
      } finally { 
        setLoading(false) 
      }
    }
    fetch_()
  }, [token])

  const calcEMI = (p: number, r: number, t: number) => {
    const mr = r / 12 / 100
    const emi = p * mr * Math.pow(1 + mr, t) / (Math.pow(1 + mr, t) - 1)
    return isNaN(emi) ? 0 : emi
  }

  const filtered = loans.filter(a =>
    a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPrincipal = filtered.reduce((s, a) => s + a.principalAmount, 0)
  const avgRate = filtered.length > 0 ? filtered.reduce((s, a) => s + a.interestRate, 0) / filtered.length : 0

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        <PageHeader
          title="Loans"
          subtitle="Manage all loan accounts and EMI schedules"
          actions={
            <Button onClick={() => router.push('/dashboard/loans/create')} className="finance-gradient-primary text-white h-9 px-4 rounded-xl font-medium shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Create Loan
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <StatCard title="Total Loans" value={filtered.length} subtitle="All accounts" icon={<CreditCard />} iconVariant="primary" borderVariant="primary" className="p-4 sm:p-6" />
          <StatCard title="Active Loans" value={filtered.filter(a => a.status?.toLowerCase() === 'active').length} subtitle="Currently active" icon={<CheckCircle2 />} iconVariant="success" borderVariant="success" className="p-4 sm:p-6" />
          <StatCard title="Total Principal" value={`₹${(totalPrincipal / 100000).toFixed(1)}L`} subtitle="Outstanding exposure" icon={<DollarSign />} iconVariant="danger" borderVariant="danger" className="p-4 sm:p-6" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by account number or customer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Loan Accounts <span className="ml-1 text-xs font-normal text-slate-400">({filtered.length})</span></h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading accounts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl finance-icon-bg flex items-center justify-center mx-auto mb-4"><CreditCard className="h-7 w-7" /></div>
              <h3 className="text-sm font-semibold text-slate-800">No loan accounts found</h3>
              <p className="text-xs text-slate-400 mt-1">{search ? 'Try adjusting your search' : 'Get started by creating your first loan'}</p>
              {!search && (
                <Button onClick={() => router.push('/dashboard/loans/create')} className="mt-5 finance-gradient-primary text-white h-8 px-4 text-xs rounded-lg">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Loan Account
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden">
              <Table className="responsive-table">
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50 border-slate-100">
                    <TableHead className="px-4 sm:px-5 py-3 text-[10px] font-black uppercase text-slate-400 min-w-[140px] sm:min-w-[150px]">Account</TableHead>
                    <TableHead className="px-3 sm:px-4 py-3 text-[10px] font-black uppercase text-slate-400 min-w-[160px] sm:min-w-[180px]">Customer</TableHead>
                    <TableHead className="px-3 sm:px-4 py-3 text-[10px] font-black uppercase text-slate-400 min-w-[110px] sm:min-w-[120px] text-right">Principal</TableHead>
                    <TableHead className="px-3 sm:px-4 py-3 text-[10px] font-black uppercase text-slate-400 min-w-[70px] sm:min-w-[80px] text-right hide-on-mobile">Rate</TableHead>
                    <TableHead className="px-3 sm:px-4 py-3 text-[10px] font-black uppercase text-slate-400 min-w-[100px] sm:min-w-[110px] text-right">Monthly EMI</TableHead>
                    <TableHead className="px-3 sm:px-4 py-3 text-[10px] font-black uppercase text-slate-400 min-w-[70px] sm:min-w-[80px] hide-on-mobile">Tenure</TableHead>
                    <TableHead className="px-3 sm:px-4 py-3 text-[10px] font-black uppercase text-slate-400 min-w-[80px] sm:min-w-[90px] hide-on-tablet">Status</TableHead>
                    <TableHead className="px-3 sm:px-4 py-3 w-12 sm:w-14 text-right text-[10px] font-black uppercase text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(account => {
                    const emi = calcEMI(account.principalAmount, account.interestRate, account.tenure)
                    const sk = account.status?.toLowerCase() || 'active'
                    const statusCls = STATUS_CLS[sk] ?? "badge-status badge-status-closed"
                    return (
                      <TableRow key={account.id} className="hover:bg-slate-50 border-slate-100 transition-colors">
                        <TableCell className="px-5 py-3.5">
                          <div className="font-mono text-sm font-semibold text-slate-800">{account.accountNumber}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {formatShortDate(account.startDate)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="text-sm font-semibold text-slate-800">{account.customer.name}</div>
                          <div className="text-xs text-slate-400">{account.customer.email}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-900 tabular-nums">₹{account.principalAmount.toLocaleString('en-IN')}</span>
                        </TableCell>
                        <TableCell className="px-3 sm:px-4 py-3.5 text-right hide-on-mobile">
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">{account.interestRate}%</span>
                        </TableCell>
                        <TableCell className="px-3 sm:px-4 py-3.5 text-right">
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">₹{emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </TableCell>
                        <TableCell className="px-3 sm:px-4 py-3.5 hide-on-mobile">
                          <span className="text-sm text-slate-600 tabular-nums">{account.tenure}m</span>
                        </TableCell>
                        <TableCell className="px-3 sm:px-4 py-3.5 hide-on-tablet">
                          <span className={statusCls}>{account.status || 'ACTIVE'}</span>
                        </TableCell>
                        <TableCell className="px-3 sm:px-4 py-3.5 text-right">
                          <TableActions actions={[
                            { label: "View Details", icon: <Eye />, onClick: () => router.push(`/dashboard/loans/${account.id}`) },
                            { label: "Edit", icon: <Pencil />, onClick: () => router.push(`/dashboard/loans/${account.id}/edit`) },
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
