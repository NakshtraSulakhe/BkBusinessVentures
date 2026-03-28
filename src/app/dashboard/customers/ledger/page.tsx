"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UserIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  createdAt: string
}

interface CustomerLedgerSummary {
  customer: Customer
  accounts: {
    id: string
    accountNumber: string
    accountType: string
    principalAmount: number
    interestRate: number
    createdAt: string
  }[]
  accountSummary: {
    totalAccounts: number
    activeAccounts: number
    fdAccounts: number
    rdAccounts: number
    loanAccounts: number
  }
  financialSummary: {
    totalDeposits: number
    totalLoans: number
    netWorth: number
  }
  recentTransactions: {
    id: string
    type: string
    amount: number
    balance: number
    description: string
    createdAt: string
    account: {
      accountNumber: string
      accountType: string
    }
  }[]
}

export default function CustomerLedger() {
  const router = useRouter()
  const [customers, setCustomers] = useState<CustomerLedgerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('all')
  const [balanceFilter, setBalanceFilter] = useState('all')
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      
      const customersResponse = await fetch('/api/customers')
      if (!customersResponse.ok) return
      
      const customersData = await customersResponse.json()
      const allCustomers = customersData.customers || []
      
      const ledgerPromises = allCustomers.map(async (customer: Customer) => {
        try {
          const ledgerResponse = await fetch(`/api/customers/${customer.id}/ledger`)
          if (ledgerResponse.ok) {
            const ledgerData = await ledgerResponse.json()
            return {
              customer,
              ...ledgerData
            }
          }
          return null
        } catch (error) {
          console.error(`Failed to fetch ledger for customer ${customer.id}:`, error)
          return null
        }
      })
      
      const ledgerResults = await Promise.all(ledgerPromises)
      const validLedgers = ledgerResults.filter(result => result !== null) as CustomerLedgerSummary[]
      
      let filteredLedgers = validLedgers
      
      if (searchTerm) {
        filteredLedgers = filteredLedgers.filter(ledger =>
          ledger.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ledger.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ledger.customer.phone.includes(searchTerm)
        )
      }
      
      if (accountTypeFilter !== 'all') {
        filteredLedgers = filteredLedgers.filter(ledger => {
          switch (accountTypeFilter) {
            case 'fd':
              return ledger.accountSummary.fdAccounts > 0
            case 'rd':
              return ledger.accountSummary.rdAccounts > 0
            case 'loan':
              return ledger.accountSummary.loanAccounts > 0
            default:
              return true
          }
        })
      }
      
      if (balanceFilter !== 'all') {
        filteredLedgers = filteredLedgers.filter(ledger => {
          switch (balanceFilter) {
            case 'positive':
              return ledger.financialSummary.netWorth > 0
            case 'negative':
              return ledger.financialSummary.netWorth < 0
            case 'zero':
              return ledger.financialSummary.netWorth === 0
            default:
              return true
          }
        })
      }
      
      const total = filteredLedgers.length
      const limit = 10
      const pages = Math.ceil(total / limit)
      const page = Math.min(currentPage, pages || 1)
      
      const paginatedLedgers = filteredLedgers.slice((page - 1) * limit, page * limit)
      
      setCustomers(paginatedLedgers)
      setPagination({ page, limit, total, pages })
      
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [currentPage, searchTerm, accountTypeFilter, balanceFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getAccountTypeBadge = (accountType: string) => {
    switch (accountType.toUpperCase()) {
      case 'FD': return 'badge-type-fd'
      case 'RD': return 'badge-type-rd'
      case 'LOAN': return 'badge-type-loan'
      case 'SAVINGS': return 'badge-type-savings'
      default: return 'badge-type-current'
    }
  }

  const getNetWorthColor = (netWorth: number) => {
    if (netWorth > 0) return 'text-emerald-600'
    if (netWorth < 0) return 'text-rose-600'
    return 'text-slate-600'
  }

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        <PageHeader
          title="Customer Ledger"
          subtitle="Unified view of all client accounts and net worth"
          actions={
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/customers')}
              className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 transition-all font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Master
            </Button>
          }
        />

        {/* Unified Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Customers"
            value={pagination.total}
            subtitle="Registered in system"
            icon={<UserIcon />}
            iconVariant="primary"
            borderVariant="primary"
          />
          <StatCard
            title="Total Deposits"
            value={formatCurrency(customers.reduce((sum, c) => sum + c.financialSummary.totalDeposits, 0))}
            subtitle="Total customer assets"
            icon={<ArrowTrendingUpIcon />}
            iconVariant="success"
            borderVariant="success"
          />
          <StatCard
            title="Total Loans"
            value={formatCurrency(customers.reduce((sum, c) => sum + c.financialSummary.totalLoans, 0))}
            subtitle="Total exposure"
            icon={<ArrowTrendingDownIcon />}
            iconVariant="danger"
            borderVariant="danger"
          />
          <StatCard
            title="Portfolio Net Worth"
            value={formatCurrency(customers.reduce((sum, c) => sum + c.financialSummary.netWorth, 0))}
            subtitle="Adjusted total wealth"
            icon={<CurrencyDollarIcon />}
            iconVariant="teal"
            borderVariant="teal"
          />
        </div>

        {/* Advanced Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 h-10 border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-lg text-sm transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={accountTypeFilter}
                onChange={(e) => { setAccountTypeFilter(e.target.value); setCurrentPage(1); }}
                className="h-10 px-3 border border-slate-200 bg-slate-50/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Account Types</option>
                <option value="fd">Active FD</option>
                <option value="rd">Active RD</option>
                <option value="loan">Active Loans</option>
              </select>
              <select
                value={balanceFilter}
                onChange={(e) => { setBalanceFilter(e.target.value); setCurrentPage(1); }}
                className="h-10 px-3 border border-slate-200 bg-slate-50/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Net Worths</option>
                <option value="positive">Positive Assets</option>
                <option value="negative">Debt Exposure</option>
                <option value="zero">Closed / Zero</option>
              </select>
              <Button
                variant="ghost"
                onClick={() => { setSearchTerm(''); setAccountTypeFilter('all'); setBalanceFilter('all'); setCurrentPage(1); }}
                className="h-10 px-3 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-lg text-xs"
              >
                <XMarkIcon className="h-4 w-4 mr-1.5" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Ledger List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              Customer Portfolio Summary <span className="ml-1 text-xs font-normal text-slate-400">({pagination.total})</span>
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50/30">
                <ArrowPathIcon className="h-8 w-8 text-primary/40 animate-spin mb-3" />
                <p className="text-xs text-slate-400 font-medium">Aggregating customer ledgers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/30">
                <div className="h-14 w-14 rounded-2xl finance-icon-bg flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">No customers found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">Try refining your search or filter parameters to find customers.</p>
              </div>
            ) : (
              customers.map((ledger) => (
                <div key={ledger.customer.id} className="p-5 hover:bg-slate-50/80 transition-all group">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Customer Identity */}
                    <div className="lg:w-1/4">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="h-9 w-9 rounded-xl finance-icon-bg flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/customers/${ledger.customer.id}`)}>
                            {ledger.customer.name}
                          </h3>
                          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            Since {formatDate(ledger.customer.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="pl-12 space-y-0.5">
                        <div className="text-xs text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">{ledger.customer.email}</div>
                        <div className="text-xs text-slate-500">{ledger.customer.phone}</div>
                      </div>
                    </div>

                    {/* Account counts */}
                    <div className="lg:w-1/4 grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">FD</div>
                        <div className="text-sm font-black text-slate-800">{ledger.accountSummary.fdAccounts}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">RD</div>
                        <div className="text-sm font-black text-slate-800">{ledger.accountSummary.rdAccounts}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Loan</div>
                        <div className="text-sm font-black text-slate-800">{ledger.accountSummary.loanAccounts}</div>
                      </div>
                    </div>

                    {/* Financial Snapshot */}
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 group-hover:border-primary/10 transition-colors">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          Assets Value
                          <ArrowTrendingUpIcon className="h-3 w-3 text-emerald-500" />
                        </div>
                        <div className="text-base font-black text-slate-900">{formatCurrency(ledger.financialSummary.totalDeposits)}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 group-hover:border-primary/10 transition-colors">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-rose-400">
                          Liabilities
                          <ArrowTrendingDownIcon className="h-3 w-3 text-rose-500" />
                        </div>
                        <div className="text-base font-black text-rose-700">{formatCurrency(ledger.financialSummary.totalLoans)}</div>
                      </div>
                    </div>

                    {/* Net Worth & Actions */}
                    <div className="lg:w-1/5 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4">
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Net Worth</div>
                        <div className={`text-lg font-black tracking-tight ${getNetWorthColor(ledger.financialSummary.netWorth)}`}>
                          {formatCurrency(ledger.financialSummary.netWorth)}
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`/dashboard/customers/${ledger.customer.id}`)}
                        size="sm"
                        className="finance-gradient-primary text-white h-8 px-4 rounded-lg text-xs font-bold shadow-md shadow-primary/10"
                      >
                        <EyeIcon className="h-3.5 w-3.5 mr-1.5" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <div className="text-xs font-medium text-slate-400">
                Page <span className="text-slate-900 font-bold">{pagination.page}</span> of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="h-8 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1.5" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="h-8 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  Next <ChevronRightIcon className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function ArrowPathIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}
