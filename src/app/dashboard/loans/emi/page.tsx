"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Transaction {
  id: string
  accountId: string
  type: string
  amount: number
  balance: number
  description: string
  reference: string
  createdAt: string
  account: {
    accountNumber: string
    accountType: string
    customer: {
      name: string
      email: string
    }
  }
}

interface PaginatedResponse {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function EMIList() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [dateFilter, setDateFilter] = useState('')
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

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCustomer && { search: selectedCustomer }),
        ...(selectedAccount && { accountId: selectedAccount }),
        ...(dateFilter && { date: dateFilter }),
        type: 'deposit' // EMI payments are recorded as deposits
      })

      const response = await fetch(`/api/transactions?${params}`)
      if (response.ok) {
        const data: PaginatedResponse = await response.json()
        // Filter specifically for EMI transactions if API doesn't do it perfectly
        const emiOnly = (data.transactions || []).filter(t => 
          t.account.accountType === 'LOAN' && 
          (t.description?.toLowerCase().includes('emi') || t.reference?.toLowerCase().includes('emi'))
        )
        setTransactions(emiOnly)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch EMI transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) fetchTransactions()
  }, [mounted, currentPage, searchTerm, selectedCustomer, selectedAccount, dateFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  const uniqueBorrowers = new Set(transactions.map(t => t.account.customer.name)).size

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up pb-20">
        <PageHeader
          title="EMI Portfolio Management"
          subtitle="Systematic tracking of debt repayment instruments and inward flows"
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/loans')}
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Loans
              </Button>
              <Button
                onClick={() => router.push('/dashboard/loans/emi/create')}
                className="h-9 finance-gradient-primary text-white rounded-xl px-4 font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Record EMI Payment
              </Button>
            </div>
          }
        />

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Inward EMI Volume"
            value={formatCurrency(totalAmount)}
            icon={BanknotesIcon}
            trend={{ value: "Total recovered", isPositive: true }}
            className="border-primary"
          />
          <StatCard
            title="Active Collections"
            value={transactions.length}
            icon={DocumentTextIcon}
            trend={{ value: "Verified payments", isPositive: true }}
            className="border-blue-500"
          />
          <StatCard
            title="Borrower Reach"
            value={uniqueBorrowers}
            icon={UserIcon}
            trend={{ value: "Unique beneficiaries", isPositive: true }}
            className="border-indigo-500"
          />
          <StatCard
            title="Sync Status"
            value="Real-time"
            icon={ArrowPathIcon}
            trend={{ value: "Protocol Active", isPositive: true }}
            className="border-emerald-500"
          />
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by instrument ID, borrower name, or narrative..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl text-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Input 
              placeholder="Filter by Account#" 
              value={selectedAccount} 
              onChange={e => setSelectedAccount(e.target.value)}
              className="h-10 w-40 border-slate-200 bg-slate-50/50 rounded-xl text-xs font-bold"
            />
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 px-2 h-10">
              <CalendarIcon className="h-4 w-4 text-slate-400 mr-2" />
              <input 
                type="date" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none w-32"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setSelectedAccount(''); setDateFilter(''); }} className="h-10 px-3 text-slate-500 hover:text-primary transition-colors">
              Reset
            </Button>
          </div>
        </div>

        {/* EMI List Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 h-16 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
              <CreditCardIcon className="h-4 w-4 mr-2 text-primary" />
              Systematic Repayment Logs
            </CardTitle>
            <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] uppercase">
              {pagination.total} Total Transmissions
            </Badge>
          </CardHeader>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying Portfolio...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-20">
                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <DocumentTextIcon className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">No inward EMI flows resolved</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">Adjust your search parameters ortemporal markers to locate specific repayment records.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow>
                    <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest">Temporal Marker</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest">Instrument / Identifier</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest">Borrower Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest text-right">Inward Magnitude</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest text-right">Remaining Balance</TableHead>
                    <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest">Narrative</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                      <TableCell className="px-8 py-4">
                        <div className="text-xs font-bold text-slate-900">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 tracking-tighter mt-0.5 uppercase">
                          Cycle Synced
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <BuildingLibraryIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest font-mono line-clamp-1">{tx.account.accountNumber}</div>
                            <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black uppercase px-1 h-3.5 mt-0.5">LOAN PORTFOLIO</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-bold text-slate-900">{tx.account.customer.name}</div>
                        <div className="text-[10px] font-medium text-slate-500 line-clamp-1">{tx.account.customer.email}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-xs font-black text-emerald-600 tracking-tight">
                          +{formatCurrency(tx.amount)}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verified Inflow</div>
                      </TableCell>
                      <TableCell className="text-right text-xs font-black text-slate-900 tracking-tight">
                        {formatCurrency(tx.balance)}
                      </TableCell>
                      <TableCell className="px-8 max-w-[200px]">
                        <div className="text-[11px] text-slate-600 leading-relaxed truncate group-hover:whitespace-normal">
                          {tx.description || tx.reference || 'Automated Portfolio Recovery'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {((pagination.page - 1) * pagination.limit) + 1}—{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={pagination.page === 1} className="h-8 px-3 rounded-lg border-slate-200 text-slate-600">
                  <ChevronLeftIcon className="h-3 w-3 mr-1" /> Prev
                </Button>
                <div className="px-3 text-[10px] font-black text-slate-900">Page {pagination.page} / {pagination.pages}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={pagination.page === pagination.pages} className="h-8 px-3 rounded-lg border-slate-200 text-slate-600">
                  Next <ChevronRightIcon className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
