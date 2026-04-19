"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { formatShortDate, formatCurrency } from "@/lib/utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PlusIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"

interface RDAccount {
  id: string
  accountNumber: string
  customerId: string
  accountType: string
  principalAmount: number
  interestRate: number
  tenure: number
  startDate: string
  maturityDate: string
  status: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  accountRules: any
  _count: {
    transactions: number
  }
  transactions?: Array<{
    id: string
    type: string
    amount: number
    date: string
    description: string
  }>
}

function RDAccountDetail() {
  const router = useRouter()
  const params = useParams()
  const { token } = useAuth()
  const [account, setAccount] = useState<RDAccount | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id && token) {
      fetchAccountDetails()
      fetchTransactions()
    }
  }, [params.id, token])

  const fetchAccountDetails = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth(`/api/accounts/${params.id}`, { token })
      if (res.ok) {
        const data = await res.json()
        if (data.account) {
          setAccount(data.account)
        }
      }
    } catch (error) {
      console.error('Error fetching RD account details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetchWithAuth(`/api/transactions?accountId=${params.id}`, { token })
      if (res.ok) {
        const data = await res.json()
        console.log('Transactions data:', data.transactions)
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!account) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">RD account not found</p>
          <Button onClick={() => router.push('/dashboard/deposits/rd')} className="mt-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to RD Accounts
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const STATUS_CLS: Record<string, string> = {
    active: "badge-status badge-status-active",
    maturity_pending: "badge-status badge-status-matured", 
    closing_pending: "badge-status badge-status-matured",
    closed: "badge-status badge-status-closed",
  }

  const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
  const totalPrincipal = monthly * account.tenure
  const r = account.interestRate / 100
  const n = account.tenure
  const rdInterest = monthly * (n * (n + 1) / 2) * (r / 12)
  const maturityAmount = Math.round(totalPrincipal + rdInterest)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="RD Account Details"
          subtitle={`Account #${account.accountNumber}`}
          actions={
            <div className="flex gap-2 no-print">
              <Button onClick={() => window.print()} variant="outline">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => router.push('/dashboard/deposits/rd')} variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to RD Accounts
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard 
            title="Monthly Installment" 
            value={formatCurrency(monthly)} 
            subtitle="Per month" 
            icon={<CurrencyDollarIcon />} 
            iconVariant="primary" 
            borderVariant="primary" 
          />
          <StatCard 
            title="Maturity Amount" 
            value={formatCurrency(maturityAmount)} 
            subtitle="Total with interest" 
            icon={<CheckCircleIcon />} 
            iconVariant="success" 
            borderVariant="success" 
          />
          <StatCard 
            title="Interest Rate" 
            value={`${account.interestRate}%`} 
            subtitle="Annual rate" 
            icon={<ChartBarIcon />} 
            iconVariant="teal" 
            borderVariant="teal" 
          />
        </div>

        {/* Account Details Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg finance-gradient-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {account.customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{account.customer.name}</div>
                  <div className="text-xs text-slate-400 truncate">{account.customer.email}</div>
                  <div className="text-xs text-slate-400">{account.customer.phone}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Account Number</div>
                  <div className="font-mono text-sm font-semibold text-slate-800">{account.accountNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Status</div>
                  <span className={STATUS_CLS[account.status?.toLowerCase()] || "badge-status badge-status-closed"}>
                    {account.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Tenure</div>
                  <div className="text-sm font-semibold text-slate-800">{account.tenure} months</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Interest Rate</div>
                  <div className="text-sm font-semibold text-slate-800">{account.interestRate}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Start Date</div>
                  <div className="text-sm font-semibold text-slate-800">{formatShortDate(account.startDate)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Maturity Date</div>
                  <div className="text-sm font-semibold text-slate-800">{formatShortDate(account.maturityDate)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-5 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-primary" />
              Recent Transactions
            </CardTitle>
            <Button size="sm" onClick={() => router.push(`/dashboard/ledger?accountId=${account.id}`)} className="h-8 px-3 text-xs no-print">
              <EyeIcon className="h-3.5 w-3.5 mr-1.5" />
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50 border-slate-100">
                    <TableHead className="px-5 py-3 text-xs font-semibold text-slate-600 min-w-[100px]">Date</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[80px]">Type</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600">Description</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 text-right min-w-[120px]">Amount</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 text-right min-w-[120px]">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => {
                    // For RD accounts, deposits should always be credit
                    // Only show as debit if explicitly marked as withdrawal
                    const isWithdrawal = transaction.description?.toLowerCase().includes('withdrawal') ||
                                       transaction.description?.toLowerCase().includes('withdraw') ||
                                       transaction.description?.toLowerCase().includes('payout') ||
                                       transaction.description?.toLowerCase().includes('maturity') ||
                                       transaction.type === 'debit'
                    const displayType = isWithdrawal ? 'debit' : 'credit'

                    return (
                      <TableRow key={transaction.id} className="hover:bg-slate-50 border-slate-100 transition-colors">
                        <TableCell className="px-5 py-3.5">
                          <span className="text-xs text-slate-500 tabular-nums">
                            {transaction.date ? formatShortDate(transaction.date) : transaction.createdAt ? formatShortDate(transaction.createdAt) : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className={
                            displayType === 'credit' 
                              ? 'badge-status badge-status-active' 
                              : 'badge-status badge-status-closed'
                          }>
                            {displayType.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="text-sm text-slate-800">{transaction.description}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className={`text-sm font-bold tabular-nums ${
                            displayType === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {displayType === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">
                            {formatCurrency(transaction.balance || 0)}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl finance-icon-bg flex items-center justify-center mx-auto mb-4">
                  <DocumentArrowDownIcon className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">No transactions found</h3>
                <p className="text-xs text-slate-400 mt-1">This account doesn't have any transactions yet</p>
                <Button onClick={() => router.push(`/dashboard/ledger?accountId=${account.id}`)} className="mt-5 finance-gradient-primary text-white h-8 px-4 text-xs rounded-lg no-print">
                  <PlusIcon className="h-3.5 w-3.5 mr-1.5" /> Add Transaction
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Content - Only visible during print */}
        <div id="invoice-content" className="hidden print:block p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            {/* Invoice Header */}
            <div className="border-b-2 border-slate-800 pb-6 mb-6">
              <h1 className="text-2xl font-bold text-slate-800">RD Account Statement</h1>
              <p className="text-sm text-slate-600 mt-1">Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Account Information */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Account Details</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Account Number:</span>
                    <span className="font-semibold">{account.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Customer Name:</span>
                    <span className="font-semibold">{account.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Email:</span>
                    <span className="font-semibold">{account.customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Phone:</span>
                    <span className="font-semibold">{account.customer.phone}</span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">RD Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Principal Amount:</span>
                    <span className="font-semibold">{formatCurrency(account.principalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Interest Rate:</span>
                    <span className="font-semibold">{account.interestRate}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tenure:</span>
                    <span className="font-semibold">{account.tenure} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Installment:</span>
                    <span className="font-semibold">{formatCurrency(monthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Maturity Amount:</span>
                    <span className="font-semibold">{formatCurrency(maturityAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Start Date:</span>
                    <span className="font-semibold">{formatShortDate(account.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Maturity Date:</span>
                    <span className="font-semibold">{formatShortDate(account.maturityDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Table */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Transaction History</h2>
              {transactions.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800">
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-800 uppercase">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-800 uppercase">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-slate-800 uppercase">Description</th>
                      <th className="text-right py-3 px-4 text-xs font-bold text-slate-800 uppercase">Amount</th>
                      <th className="text-right py-3 px-4 text-xs font-bold text-slate-800 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => {
                      const isWithdrawal = transaction.description?.toLowerCase().includes('withdrawal') ||
                                         transaction.description?.toLowerCase().includes('withdraw') ||
                                         transaction.description?.toLowerCase().includes('payout') ||
                                         transaction.description?.toLowerCase().includes('maturity') ||
                                         transaction.type === 'debit'
                      const displayType = isWithdrawal ? 'debit' : 'credit'

                      return (
                        <tr key={transaction.id} className="border-b border-slate-200">
                          <td className="py-3 px-4 text-sm text-slate-700">
                            {transaction.date ? formatShortDate(transaction.date) : transaction.createdAt ? formatShortDate(transaction.createdAt) : '—'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${
                              displayType === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {displayType.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-700">{transaction.description}</td>
                          <td className="py-3 px-4 text-sm text-right font-semibold">
                            <span className={displayType === 'credit' ? 'text-emerald-600' : 'text-rose-600'}>
                              {displayType === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-slate-800">
                            {formatCurrency(transaction.balance || 0)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-slate-600 py-4">No transactions found</p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
              <p>This is a computer-generated statement. For any queries, please contact your branch.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function RDPage() {
  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0.5cm;
            size: A4;
          }
        }
      `}</style>
      <Suspense fallback={<div>Loading...</div>}>
        <RDAccountDetail />
      </Suspense>
    </>
  )
}
