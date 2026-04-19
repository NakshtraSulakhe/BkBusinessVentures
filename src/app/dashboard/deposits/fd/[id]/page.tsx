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
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"

interface FDAccount {
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

function FDAccountDetail() {
  const router = useRouter()
  const params = useParams()
  const { token } = useAuth()
  const [account, setAccount] = useState<FDAccount | null>(null)
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
      console.error('Error fetching FD account details:', error)
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
          <p className="text-slate-500">FD account not found</p>
          <Button onClick={() => router.push('/dashboard/deposits/fd')} className="mt-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to FD Accounts
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const statusColor = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    maturity_pending: 'bg-amber-50 text-amber-700 border-amber-200',
    closing_pending: 'bg-amber-50 text-amber-700 border-amber-200',
    closed: 'bg-slate-50 text-slate-700 border-slate-200',
  }[account.status] || 'bg-slate-50 text-slate-700 border-slate-200'

  const calculateCompoundInterest = (principal: number, rate: number, tenure: number, method: string = 'compound') => {
    if (!principal || !rate || !tenure) return 0

    if (method === 'simple') {
      // Simple Interest Formula: SI = P * R * T
      return principal * (rate / 100) * (tenure / 12)
    } else {
      // Compound Interest Formula (Quarterly Compounding)
      // A = P * (1 + r/n)^(n*t)
      const r = rate / 100
      const n = 4 // Quarterly compounding
      const t = tenure / 12 // Convert months to years

      const finalAmount = principal * Math.pow((1 + r / n), n * t)
      const interestEarned = finalAmount - principal

      return interestEarned
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="FD Account Details"
          subtitle={`Account #${account.accountNumber}`}
          actions={
            <div className="flex gap-2 no-print">
              <Button onClick={() => window.print()} variant="outline">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => router.push('/dashboard/deposits/fd')} variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to FD Accounts
              </Button>
            </div>
          }
        />

        {/* Account Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{account.customer.name}</div>
                  <div className="text-sm text-slate-500">{account.customer.email}</div>
                  <div className="text-sm text-slate-500">{account.customer.phone}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Account Number</span>
                <span className="font-mono text-sm">{account.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <Badge className={statusColor}>
                  {account.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Interest Rate</span>
                <span className="font-semibold">{account.interestRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Tenure</span>
                <span className="font-semibold">{account.tenure} months</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Principal Amount</span>
                <span className="font-semibold">{formatCurrency(account.principalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Start Date</span>
                <span className="font-semibold">{formatShortDate(account.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Maturity Date</span>
                <span className="font-semibold">{formatShortDate(account.maturityDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Transactions</span>
                <span className="font-semibold">{account._count?.transactions || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <Button size="sm" onClick={() => router.push(`/dashboard/ledger?accountId=${account.id}`)} className="no-print">
              <EyeIcon className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => {
                    // For FD accounts, deposits should always be credit
                    // Only show as debit if explicitly marked as withdrawal
                    const isWithdrawal = transaction.description?.toLowerCase().includes('withdrawal') ||
                                       transaction.description?.toLowerCase().includes('withdraw') ||
                                       transaction.description?.toLowerCase().includes('payout') ||
                                       transaction.description?.toLowerCase().includes('maturity') ||
                                       transaction.type === 'debit'
                    const displayType = isWithdrawal ? 'debit' : 'credit'

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {transaction.date ? formatShortDate(transaction.date) : transaction.createdAt ? formatShortDate(transaction.createdAt) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            displayType === 'credit' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-rose-50 text-rose-700'
                          }>
                            {displayType.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {displayType === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(transaction.balance || 0)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No transactions found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Content - Only visible during print */}
        <div id="invoice-content" className="hidden print:block p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            {/* Invoice Header */}
            <div className="border-b-2 border-slate-800 pb-6 mb-6">
              <h1 className="text-2xl font-bold text-slate-800">FD Account Statement</h1>
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
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">FD Summary</h2>
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
                    <span className="text-slate-600">Maturity Amount:</span>
                    <span className="font-semibold">{formatCurrency(Math.round(account.principalAmount + calculateCompoundInterest(account.principalAmount, account.interestRate, account.tenure, (() => {
                    const method = account.accountRules?.calculationMethod
                    return method === 'simple' || method === 'compound' ? method : 'compound'
                  })())))}</span>
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

export default function FDPage() {
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
        <FDAccountDetail />
      </Suspense>
    </>
  )
}
