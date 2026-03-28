"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { TableActions } from "@/components/ui/table-actions"
import { AmountDisplay, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import {
  PlusIcon, MagnifyingGlassIcon, BanknotesIcon, UserIcon, ArrowPathIcon,
  EyeIcon, BuildingLibraryIcon, CurrencyDollarIcon, ChartBarIcon, CalendarIcon,
} from "@heroicons/react/24/outline"

interface Account {
  id: string; accountNumber: string; accountType: string; principalAmount: number;
  interestRate: number; tenure: number; startDate: string; maturityDate?: string;
  state: string; createdAt: string;
  customer: { id: string; name: string; email: string };
  _count: { transactions: number }
}

const TYPE_BADGE: Record<string, string> = {
  fd:   "badge-type badge-type-fd",
  rd:   "badge-type badge-type-rd",
  loan: "badge-type badge-type-loan",
}

const STATUS_BADGE: Record<string, string> = {
  active:  "badge-status badge-status-active",
  matured: "badge-status badge-status-matured",
  closed:  "badge-status badge-status-closed",
  overdue: "badge-status badge-status-overdue",
}

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [accountType, setAccountType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchAccounts = async (page = 1, q = '', type = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: page.toString(), limit: '10', ...(q && { search: q }), ...(type && type !== 'all' && { accountType: type }) })
      const res = await fetch(`/api/accounts?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAccounts(data.accounts); setCurrentPage(data.pagination.page)
        setTotalPages(data.pagination.pages); setTotal(data.pagination.total)
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchAccounts(currentPage, search, accountType) }, [currentPage, search, accountType])

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        <PageHeader
          title="Accounts Management"
          subtitle="Manage Fixed Deposits, Recurring Deposits, and Loans"
          actions={
            <Button onClick={() => router.push('/dashboard/accounts/create')} className="finance-gradient-primary text-white h-9 px-4 rounded-xl font-medium shadow-sm">
              <PlusIcon className="h-4 w-4 mr-2" /> Create Account
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total Accounts" value={total} subtitle="All account types" icon={<BanknotesIcon />} iconVariant="primary" borderVariant="primary" />
          <StatCard title="Fixed Deposits" value={accounts.filter(a => a.accountType === 'fd').length} subtitle="Investment accounts" icon={<BuildingLibraryIcon />} iconVariant="success" borderVariant="success" />
          <StatCard title="Recurring Deposits" value={accounts.filter(a => a.accountType === 'rd').length} subtitle="Monthly savings" icon={<CurrencyDollarIcon />} iconVariant="info" borderVariant="info" />
          <StatCard title="Loans" value={accounts.filter(a => a.accountType === 'loan').length} subtitle="Active loans" icon={<ChartBarIcon />} iconVariant="danger" borderVariant="danger" />
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by account number, customer name..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm" />
            </div>
            <div className="w-full md:w-48">
              <Select value={accountType} onValueChange={v => { setAccountType(v); setCurrentPage(1) }}>
                <SelectTrigger className="h-10 rounded-lg border-slate-200 text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fd">Fixed Deposit</SelectItem>
                  <SelectItem value="rd">Recurring Deposit</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => fetchAccounts(1, '', 'all')} className="h-10 border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              <ArrowPathIcon className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Accounts <span className="ml-1 text-xs font-normal text-slate-400">({total})</span></h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl finance-icon-bg flex items-center justify-center mx-auto mb-4"><BanknotesIcon className="h-7 w-7" /></div>
              <h3 className="text-sm font-semibold text-slate-800">No accounts found</h3>
              <p className="text-xs text-slate-400 mt-1">Get started by creating your first account.</p>
              <Button onClick={() => router.push('/dashboard/accounts/create')} className="mt-5 finance-gradient-primary text-white h-8 px-4 text-xs rounded-lg">
                <PlusIcon className="h-3.5 w-3.5 mr-1.5" /> Create Account
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50 border-slate-100">
                    <TableHead className="px-5 text-xs font-semibold text-slate-600 py-3 min-w-[150px]">Account</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-slate-600 py-3 min-w-[180px]">Customer</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-slate-600 py-3 min-w-[100px]">Type</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-slate-600 py-3 min-w-[120px] text-right">Principal</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-slate-600 py-3 min-w-[80px] text-right">Rate</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-slate-600 py-3 min-w-[90px]">Status</TableHead>
                    <TableHead className="px-4 text-xs font-semibold text-slate-600 py-3 min-w-[110px]">Maturity</TableHead>
                    <TableHead className="px-4 py-3 w-14 text-right text-xs font-semibold text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map(account => {
                    const typeCls = TYPE_BADGE[account.accountType] ?? "badge-type"
                    const statusKey = account.state?.toLowerCase()
                    const statusCls = STATUS_BADGE[statusKey] ?? "badge-status badge-status-closed"
                    return (
                      <TableRow key={account.id} className="hover:bg-slate-50 border-slate-100 transition-colors">
                        <TableCell className="px-5 py-3.5">
                          <div className="font-mono text-sm font-semibold text-slate-800">{account.accountNumber}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(account.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg finance-gradient-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                              {account.customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-800 truncate">{account.customer.name}</div>
                              <div className="text-xs text-slate-400 truncate">{account.customer.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className={typeCls}>{account.accountType.toUpperCase()}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <AmountDisplay amount={account.principalAmount} size="sm" weight="semibold" />
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <div className="text-sm font-semibold text-slate-800 tabular-nums">{account.interestRate}%</div>
                          <div className="text-xs text-slate-400">{account.tenure}m</div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className={statusCls}>{account.state}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-xs text-slate-500 tabular-nums">
                            {account.maturityDate ? new Date(account.maturityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <TableActions actions={[
                            { label: "View Details", icon: <EyeIcon />, onClick: () => router.push(`/dashboard/accounts/${account.id}`) },
                            { label: "View Ledger", icon: <BuildingLibraryIcon />, onClick: () => router.push(`/dashboard/accounts/${account.id}/ledger`) },
                          ]} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 tabular-nums">
                {((currentPage - 1) * 10) + 1}–{Math.min(currentPage * 10, total)} of {total}
              </span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-3 text-xs border-slate-200 rounded-lg">Prev</Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                  <Button key={p} variant={currentPage === p ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(p)} className={`h-8 w-8 p-0 text-xs rounded-lg ${currentPage === p ? 'finance-gradient-primary text-white border-0' : 'border-slate-200'}`}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 px-3 text-xs border-slate-200 rounded-lg">Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
