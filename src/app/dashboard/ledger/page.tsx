"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BanknotesIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  UserIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CheckBadgeIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

interface Transaction {
  id: string
  accountId: string
  type: string
  amount: number
  balance?: number
  description?: string
  reference?: string
  createdAt: string
  account: {
    accountNumber: string
    customer: {
      name: string
    }
  }
}

function LedgerContent() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountFilter, setAccountFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [runningBalance, setRunningBalance] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [newTransaction, setNewTransaction] = useState({
    accountId: '',
    type: 'deposit',
    amount: '',
    description: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash'
  })

  const [accounts, setAccounts] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    fetchTransactions()
    fetchAccounts()
  }, [])

  useEffect(() => {
    if (mounted) fetchTransactions()
  }, [searchTerm, accountFilter, typeFilter, dateFilter])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(accountFilter && accountFilter !== 'all' && { accountId: accountFilter }),
        ...(typeFilter && typeFilter !== 'all' && { type: typeFilter }),
        ...(dateFilter && { date: dateFilter })
      })

      const response = await fetch(`/api/transactions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
        const balance = (data.transactions || []).reduce((acc: number, t: Transaction) => {
          return ['deposit', 'interest', 'credit'].includes(t.type) ? acc + t.amount : acc - t.amount
        }, 0)
        setRunningBalance(balance)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Account', 'Customer', 'Type', 'Amount', 'Balance', 'Description', 'Reference'],
      ...transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        t.account.accountNumber,
        t.account.customer.name,
        t.type,
        t.amount.toString(),
        t.balance?.toString() || '',
        t.description || '',
        t.reference || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ledger-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.accountId || !newTransaction.amount) return
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTransaction,
          amount: parseFloat(newTransaction.amount)
        })
      })
      if (response.ok) {
        setMessage({ type: 'success', text: 'Transaction recorded successfully' })
        setShowAddTransaction(false)
        fetchTransactions()
      } else {
        setMessage({ type: 'error', text: 'Failed to record transaction. Please check your inputs.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network connection failure' })
    }
  }

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt)
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Transaction History"
        subtitle="A complete record of all account activities and transactions"
        actions={
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
            <Button
              onClick={() => setShowAddTransaction(true)}
              className="h-9 finance-gradient-primary text-white rounded-xl px-4 font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        }
      />

      {message && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
          {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mt-0.5" /> : <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />}
          <div className="text-sm font-bold">{message.text}</div>
          <button onClick={() => setMessage(null)} className="ml-auto p-1 rounded-lg hover:bg-black/5"><XMarkIcon className="h-4 w-4" /></button>
        </div>
      )}

      {/* Transaction Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Transactions"
          value={transactions.length}
          icon={ArrowPathIcon}
          trend={{ value: "Historical Entries", isPositive: true }}
          className="p-4 sm:p-6 border-primary"
        />
        <StatCard
          title="Total Deposits"
          value={formatCurrency(transactions.filter(t => ['deposit', 'interest', 'credit'].includes(t.type)).reduce((s, t) => s + t.amount, 0))}
          icon={ArrowTrendingUpIcon}
          trend={{ value: "Total Credits", isPositive: true }}
          className="p-4 sm:p-6 border-blue-500"
        />
        <StatCard
          title="Total Withdrawals"
          value={formatCurrency(transactions.filter(t => ['withdrawal', 'disbursement', 'debit'].includes(t.type)).reduce((s, t) => s + t.amount, 0))}
          icon={ArrowTrendingDownIcon}
          trend={{ value: "Total Debits", isPositive: false }}
          className="p-4 sm:p-6 border-rose-500"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(runningBalance)}
          icon={CurrencyDollarIcon}
          trend={{ value: "Current Liquidity", isPositive: runningBalance >= 0 }}
          className="p-4 sm:p-6 border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Records Table */}
        <div className="lg:col-span-9 space-y-6">
          {/* Filter Toolbar */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by description or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl text-xs font-bold transition-all shadow-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Select value={accountFilter} onValueChange={setAccountFilter}>
                  <SelectTrigger className="h-10 w-full sm:w-48 border-slate-200 bg-slate-50/50 rounded-xl font-bold text-xs shadow-none">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.accountNumber} • {acc.customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-10 w-full sm:w-32 border-slate-200 bg-slate-50/50 rounded-xl font-bold text-xs shadow-none">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="interest">Interest</SelectItem>
                    <SelectItem value="disbursement">Disbursement</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 px-2 h-10 shadow-none w-full sm:w-auto">
                  <CalendarIcon className="h-4 w-4 text-slate-400 mr-2" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent border-none text-[10px] font-black text-slate-700 outline-none w-full sm:w-28 uppercase"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Table */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-4 sm:px-8 h-auto py-4 sm:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <BookOpenIcon className="h-4 w-4 mr-2 text-primary" />
                Transaction Records
              </CardTitle>
              <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] uppercase">
                {transactions.length} Transactions Found
              </Badge>
            </CardHeader>
            <div className="overflow-x-auto overflow-y-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-24">
                  <div className="h-16 w-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <DocumentTextIcon className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">No transactions found</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">Adjust your filters or search terms to locate specific transaction logs.</p>
                </div>
              ) : (
                <Table className="responsive-table">
                  <TableHeader className="bg-slate-50/30">
                    <TableRow className="border-b border-slate-100">
                      <TableHead className="px-4 sm:px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest min-w-[120px]">Date & Time</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest min-w-[160px] sm:min-w-[200px]">Account / Customer</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center hide-on-mobile">Type</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right min-w-[100px]">Amount</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right hide-on-tablet">Balance</TableHead>
                      <TableHead className="px-4 sm:px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest hide-on-mobile">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => {
                      const isInflow = ['deposit', 'interest', 'credit'].includes(tx.type)
                      return (
                        <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                          <TableCell className="px-4 sm:px-8 py-3 sm:py-5">
                            <div className="text-xs font-bold text-slate-900 tracking-tight">
                              {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[9px] font-black text-slate-400 tracking-widest mt-0.5 uppercase">
                              {new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-bold text-slate-900">{tx.account.customer.name}</div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5 font-mono">#{tx.account.accountNumber}</div>
                          </TableCell>
                          <TableCell className="text-center hide-on-mobile">
                            <Badge className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none ${isInflow ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`text-xs font-black tracking-tighter ${isInflow ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isInflow ? '+' : '-'}{formatCurrency(tx.amount)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold text-slate-900 tabular-nums hide-on-tablet">
                            {formatCurrency(tx.balance || 0)}
                          </TableCell>
                          <TableCell className="px-4 sm:px-8 max-w-[200px] hide-on-mobile">
                            <div className="text-[11px] text-slate-500 leading-relaxed truncate group-hover:whitespace-normal transition-all">
                              {tx.description || tx.reference || 'System Generated'}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-900 py-6 px-6">
              <CardTitle className="text-sm font-black text-white uppercase tracking-[.2em] flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-2 text-primary" />
                Transaction Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { label: 'Deposits', count: transactions.filter(t => t.type === 'deposit').length, color: 'bg-emerald-500' },
                { label: 'Withdrawals', count: transactions.filter(t => t.type === 'withdrawal').length, color: 'bg-rose-500' },
                { label: 'Interest', count: transactions.filter(t => t.type === 'interest').length, color: 'bg-blue-500' },
                { label: 'Disbursements', count: transactions.filter(t => t.type === 'disbursement').length, color: 'bg-indigo-500' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>{item.label}</span>
                    <span className="text-slate-900">{item.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full transition-all duration-500`} style={{ width: `${(item.count / Math.max(transactions.length, 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="py-4 border-b border-slate-100">
              <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center">
                <ShieldCheckIcon className="h-4 w-4 mr-2 text-emerald-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Health</span>
                <Badge className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-1.5 h-4 border-none">100%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security</span>
                <Badge className="bg-blue-50 text-blue-700 text-[8px] font-black px-1.5 h-4 border-none">SECURE</Badge>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <p className="text-[9px] text-slate-400 font-bold leading-relaxed">System is running normally and all records are secure.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BanknotesIcon className="h-24 w-24" />
            </div>
            <DialogHeader>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">New Transaction</p>
              <DialogTitle className="text-2xl font-black tracking-tight">Add Transaction Entry</DialogTitle>
              <DialogDescription className="text-slate-400 font-bold text-xs">Record a new transaction for an account</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Account</Label>
                <Select value={newTransaction.accountId} onValueChange={v => setNewTransaction(p => ({ ...p, accountId: v }))}>
                  <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold">
                    <SelectValue placeholder="Choose Account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.accountNumber} • {acc.customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transaction Type</Label>
                <Select value={newTransaction.type} onValueChange={v => setNewTransaction(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="interest">Interest</SelectItem>
                    <SelectItem value="disbursement">Disbursement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={e => setNewTransaction(p => ({ ...p, amount: e.target.value }))}
                  className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-black tracking-tight"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</Label>
                <Input
                  placeholder="Enter transaction details..."
                  value={newTransaction.description}
                  onChange={e => setNewTransaction(p => ({ ...p, description: e.target.value }))}
                  className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold"
                />
              </div>
            </div>

            <DialogFooter className="mt-8">
              <Button variant="ghost" onClick={() => setShowAddTransaction(false)} className="h-12 px-6 font-bold text-slate-500 hover:text-slate-900">Cancel</Button>
              <Button onClick={handleAddTransaction} className="h-12 px-8 finance-gradient-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                Save Transaction
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function LedgerPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading History...</div>}>
        <LedgerContent />
      </Suspense>
    </DashboardLayout>
  )
}
