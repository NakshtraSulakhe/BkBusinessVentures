"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { isCreditTransaction, normalizeTransactionType } from "@/lib/accounting-rules"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline"

interface Transaction {
  id: string
  type: string
  amount: number
  balance: number
  description: string
  reference: string
  transactionDate: string
  createdAt: string
  account: {
    accountNumber: string
    accountType: string
    customer: {
      name: string
    }
  }
}

interface Account {
  id: string
  accountNumber: string
  accountType: string
  principalAmount: number
  interestRate: number
  tenure: number
  startDate: string
  maturityDate?: string
  state: string
  customer: {
    id: string
    name: string
    email: string
  }
}

export default function AccountLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const accountId = use(params).id
  const router = useRouter()
  const { token } = useAuth()
  
  const [account, setAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchAccountDetails()
    fetchTransactions()
  }, [accountId])

  const fetchAccountDetails = async () => {
    try {
      const res = await fetchWithAuth(`/api/accounts/${accountId}`, { token })
      if (res.ok) {
        const data = await res.json()
        setAccount(data.account)
      }
    } catch (error) {
      console.error('Failed to fetch account details:', error)
    }
  }

  const fetchTransactions = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: '50',
        accountId: accountId,
        ...(search && { search })
      })
      const res = await fetchWithAuth(`/api/transactions?${params}`, { token })
      
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions)
        setCurrentPage(data.pagination.page)
        setTotalPages(data.pagination.pages)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const isCredit = (type: string) => {
    return isCreditTransaction(type)
  }

  const getTypeBadge = (type: string) => {
    const normalizedType = normalizeTransactionType(type)
    if (isCreditTransaction(normalizedType)) {
      return "badge-transaction badge-credit"
    }
    return "badge-transaction badge-debit"
  }

  const getTransactionDescription = (type: string) => {
    const normalizedType = normalizeTransactionType(type)
    const typeDescriptions: Record<string, string> = {
      'CASH_DEPOSIT': 'Cash Deposit',
      'CASH_WITHDRAWAL': 'Cash Withdrawal',
      'LOAN_DISBURSEMENT': 'Loan Given',
      'LOAN_RECEIPT': 'Loan Received',
      'EMI_PAYMENT_RECEIVED': 'EMI Payment Received',
      'INTEREST_INCOME': 'Interest Income',
      'FD_OPENING': 'FD Opening',
      'FD_MATURITY': 'FD Maturity',
      'CUSTOMER_DEPOSIT': 'Customer Deposit',
      'CUSTOMER_WITHDRAWAL': 'Customer Withdrawal',
      'OPENING_BALANCE': 'Opening Balance',
      'ADJUSTMENT_CREDIT': 'Credit Adjustment',
      'ADJUSTMENT_DEBIT': 'Debit Adjustment'
    }
    return typeDescriptions[normalizedType] || type
  }

  const filteredTransactions = transactions.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentBalance = transactions.length > 0 ? transactions[0].balance : 0
  const totalCredits = transactions.filter(tx => isCredit(tx.type)).reduce((sum, tx) => sum + tx.amount, 0)
  const totalDebits = transactions.filter(tx => !isCredit(tx.type)).reduce((sum, tx) => sum + tx.amount, 0)

  if (loading && !account) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium italic">Loading account ledger...</p>
      </div>
    </DashboardLayout>
  )

  if (!account) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
          <BanknotesIcon className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Account Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-xs">We couldn't find this account. Please check the link and try again.</p>
        <Button onClick={() => router.push('/dashboard/accounts')} className="mt-8 finance-gradient-primary">
          Back to Accounts
        </Button>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Page Header */}
        <PageHeader
          title="Account Ledger"
          subtitle={`${account.accountType} account ${account.accountNumber} - ${account.customer.name}`}
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/accounts')}
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 transition-all font-medium"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/ledger?accountId=${accountId}`)}
                className="finance-gradient-primary text-white h-9 px-4 rounded-xl font-medium shadow-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
          <StatCard 
            title="Current Balance" 
            value={formatCurrency(currentBalance)} 
            subtitle="Available balance" 
            icon={<BanknotesIcon />} 
            iconVariant="primary" 
            borderVariant="primary" 
            className="p-4 sm:p-6" 
          />
          <StatCard 
            title="Total Credits" 
            value={formatCurrency(totalCredits)} 
            subtitle="Money in" 
            icon={<ArrowTrendingUpIcon />} 
            iconVariant="success" 
            borderVariant="success" 
            className="p-4 sm:p-6" 
          />
          <StatCard 
            title="Total Debits" 
            value={formatCurrency(totalDebits)} 
            subtitle="Money out" 
            icon={<ArrowTrendingDownIcon />} 
            iconVariant="danger" 
            borderVariant="danger" 
            className="p-4 sm:p-6" 
          />
          <StatCard 
            title="Transactions" 
            value={total} 
            subtitle="Total entries" 
            icon={<BuildingLibraryIcon />} 
            iconVariant="info" 
            borderVariant="info" 
            className="p-4 sm:p-6" 
          />
        </div>

        {/* Account Info Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
              <BanknotesIcon className="h-4 w-4 mr-2 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Number</p>
                <p className="text-sm font-black text-slate-900 font-mono">{account.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Type</p>
                <Badge className="badge-type badge-type-fd">{account.accountType}</Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg finance-gradient-primary text-white flex items-center justify-center text-xs font-bold">
                    {account.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{account.customer.name}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search transactions by description, reference, or type..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm" 
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => fetchTransactions(1, '')} 
              className="h-10 border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <BuildingLibraryIcon className="h-4 w-4 mr-2 text-primary" />
                Transaction Ledger
              </CardTitle>
              <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] uppercase">
                {filteredTransactions.length} ENTRIES
              </Badge>
            </div>
          </CardHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl finance-icon-bg flex items-center justify-center mx-auto mb-4">
                <BanknotesIcon className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No transactions found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm ? 'Try adjusting your search' : 'No transactions have been recorded for this account yet'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => router.push(`/dashboard/ledger?accountId=${accountId}`)} 
                  className="mt-5 finance-gradient-primary text-white h-8 px-4 text-xs rounded-lg"
                >
                  <PlusIcon className="h-3.5 w-3.5 mr-1.5" /> Add First Transaction
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="responsive-table">
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50 border-slate-100">
                    <TableHead className="px-4 sm:px-5 text-[10px] font-black uppercase text-slate-400 py-3 min-w-[100px]">Date</TableHead>
                    <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase text-slate-400 py-3 min-w-[120px]">Reference</TableHead>
                    <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase text-slate-400 py-3 min-w-[200px]">Description</TableHead>
                    <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase text-slate-400 py-3 min-w-[80px]">Type</TableHead>
                    <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase text-slate-400 py-3 min-w-[100px] text-right">Debit</TableHead>
                    <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase text-slate-400 py-3 min-w-[100px] text-right">Credit</TableHead>
                    <TableHead className="px-3 sm:px-4 text-[10px] font-black uppercase text-slate-400 py-3 min-w-[120px] text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id} className="hover:bg-slate-50 border-slate-100 transition-colors">
                      <TableCell className="px-5 py-3.5">
                        <div className="text-sm font-semibold text-slate-800">
                          {formatDate(transaction.transactionDate)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(transaction.createdAt).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <div className="font-mono text-sm font-semibold text-slate-800">
                          {transaction.reference}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <div className="text-sm text-slate-600 max-w-xs truncate">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {getTransactionDescription(transaction.type)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <span className={getTypeBadge(transaction.type)}>
                          {normalizeTransactionType(transaction.type).replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right">
                        {!isCredit(transaction.type) ? (
                          <div className="text-sm font-semibold text-red-600">
                            {formatCurrency(transaction.amount)}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400">—</div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right">
                        {isCredit(transaction.type) ? (
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(transaction.amount)}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400">—</div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right">
                        <div className={`text-sm font-bold tabular-nums ${
                          transaction.balance >= 0 ? 'text-slate-800' : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.balance)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-slate-100 gap-4">
              <span className="text-xs text-slate-400 tabular-nums">
                {((currentPage - 1) * 50) + 1}–{Math.min(currentPage * 50, total)} of {total}
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full pb-2 sm:pb-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1)
                    setCurrentPage(newPage)
                    fetchTransactions(newPage, searchTerm)
                  }} 
                  disabled={currentPage === 1} 
                  className="h-8 px-2 sm:px-3 text-[10px] sm:text-xs border-slate-200 rounded-lg flex-shrink-0"
                >
                  Prev
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                  <Button 
                    key={p} 
                    variant={currentPage === p ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => {
                      setCurrentPage(p)
                      fetchTransactions(p, searchTerm)
                    }} 
                    className={`h-8 w-8 p-0 text-[10px] sm:text-xs rounded-lg flex-shrink-0 ${
                      currentPage === p ? 'finance-gradient-primary text-white border-0' : 'border-slate-200'
                    }`}
                  >
                    {p}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1)
                    setCurrentPage(newPage)
                    fetchTransactions(newPage, searchTerm)
                  }} 
                  disabled={currentPage === totalPages} 
                  className="h-8 px-2 sm:px-3 text-[10px] sm:text-xs border-slate-200 rounded-lg flex-shrink-0"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
