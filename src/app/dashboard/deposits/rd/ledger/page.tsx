"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { isCreditTransaction, normalizeTransactionType } from "@/lib/accounting-rules"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  ArrowLeftIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CalendarIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ClockIcon,
  PlusIcon
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
  transactionDate: string
  account: {
    accountNumber: string
    customer: {
      name: string
    }
  }
}

export default function RDLedgerPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [rdAccounts, setRdAccounts] = useState<any[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [newTransaction, setNewTransaction] = useState({
    accountId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: ''
  })

  useEffect(() => {
    setMounted(true)
    fetchTransactions()
  }, [typeFilter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth('/api/transactions?accountType=RD', { token })
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRDAccounts = async () => {
    try {
      const response = await fetchWithAuth('/api/accounts?accountType=RD', { token })
      if (response.ok) {
        const data = await response.json()
        setRdAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error('Failed to fetch RD accounts:', error)
    }
  }

  useEffect(() => {
    if (showAddDialog) {
      fetchRDAccounts()
    }
  }, [showAddDialog])

  const handleAddTransaction = async () => {
    if (!newTransaction.accountId || !newTransaction.amount) {
      setMessage({ type: 'error', text: 'Please select an RD account and enter an amount' })
      return
    }

    try {
      const selectedAccount = rdAccounts.find(acc => acc.id === newTransaction.accountId)
      if (!selectedAccount) {
        setMessage({ type: 'error', text: 'Selected account not found' })
        return
      }

      const monthlyInstallment = selectedAccount.tenure > 0 ? selectedAccount.principalAmount / selectedAccount.tenure : 0

      const response = await fetchWithAuth('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        token,
        body: JSON.stringify({
          accountId: newTransaction.accountId,
          type: 'RD_INSTALLMENT',
          amount: parseFloat(newTransaction.amount),
          description: newTransaction.description || `Monthly RD installment for ${selectedAccount.accountNumber}`,
          reference: newTransaction.reference || `RD-${new Date().toISOString().split('T')[0]}`,
          date: newTransaction.date
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'RD installment recorded successfully' })
        setNewTransaction({
          accountId: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          reference: ''
        })
        setShowAddDialog(false)
        fetchTransactions()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to record transaction' })
      }
    } catch (error) {
      console.error('Failed to record transaction:', error)
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = typeFilter === 'all' || tx.type.toLowerCase() === typeFilter.toLowerCase()
    
    const txDate = new Date(tx.transactionDate)
    const matchesStart = !dateRange.start || txDate >= new Date(dateRange.start)
    const matchesEnd = !dateRange.end || txDate <= new Date(dateRange.end)
    
    return matchesSearch && matchesType && matchesStart && matchesEnd
  })

  const totalVolume = filteredTransactions.reduce((acc, tx) => acc + Math.abs(tx.amount), 0)
  const installmentCount = filteredTransactions.filter(tx => tx.type.toLowerCase().includes('installment')).length

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up pb-20">
        <PageHeader
          title="RD Transaction Ledger"
          subtitle="Systematic history of all recurring installment deposits"
          actions={
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAddDialog(true)}
                className="h-9 finance-gradient-primary text-white rounded-xl px-4 font-bold transition-all shadow-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Record Installment
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/deposits/rd')}
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to List
              </Button>
              <Button className="h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-xl px-4 font-bold transition-all shadow-sm">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Ledger
              </Button>
            </div>
          }
        />

        {message && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            {message.type === 'success' ? (
              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <div className="text-sm font-bold">{message.text}</div>
            <button onClick={() => setMessage(null)} className="ml-auto p-1 rounded-lg hover:bg-black/5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="RD Activity Volume"
            value={formatCurrency(totalVolume)}
            icon={ArrowPathIcon}
            trend={{ value: "Cumulative Flow", isPositive: true }}
            className="border-primary"
          />
          <StatCard
            title="Verified Records"
            value={filteredTransactions.length}
            icon={DocumentTextIcon}
            trend={{ value: `${installmentCount} Installments processed`, isPositive: true }}
            className="border-indigo-500"
          />
          <StatCard
            title="Portfolio Pulse"
            value={filteredTransactions.length > 0 ? new Date(filteredTransactions[0].transactionDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'}
            icon={ClockIcon}
            trend={{ value: "Most recent sync", isPositive: true }}
            className="border-emerald-500"
          />
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by system ID, client legal name, or narrative..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl text-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-10 w-48 border-slate-200 bg-slate-50/50 rounded-xl font-medium">
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="installment">Monthly Installment</SelectItem>
                <SelectItem value="interest">Yield Accrual</SelectItem>
                <SelectItem value="withdrawal">Liquid Outward</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 px-2 h-10">
              <CalendarIcon className="h-4 w-4 text-slate-400 mr-2" />
              <input 
                type="date" 
                value={dateRange.start} 
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none w-28"
              />
              <span className="text-slate-300 mx-2">—</span>
              <input 
                type="date" 
                value={dateRange.end} 
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="bg-transparent border-none text-xs font-bold text-slate-700 outline-none w-28"
              />
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 h-16 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
              <BookOpenIcon className="h-4 w-4 mr-2 text-primary" />
              Historical Entry Logs
            </CardTitle>
            <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px] uppercase">
              {filteredTransactions.length} Verified Entries
            </Badge>
          </CardHeader>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling Records...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-20">
                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <DocumentTextIcon className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase">No records resolved</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">Modify your search parameters or temporal filters to locate specific systematic logs.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow>
                    <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest">Entry Timestamp</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest">Identity / Identifier</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest text-center">Protocol</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest text-right">Magnitude</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest text-right">Balance</TableHead>
                    <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-12 tracking-widest">Narrative</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => {
                    const isCredit = isCreditTransaction(tx.type)
                    return (
                      <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                        <TableCell className="px-8 py-4">
                          <div className="text-xs font-bold text-slate-900">
                            {new Date(tx.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-[10px] font-medium text-slate-400 tracking-tighter mt-0.5">
                            CYCLE MARKER: {new Date(tx.transactionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-bold text-slate-900">{tx.account.customer.name}</div>
                          <div className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5 font-mono">{tx.account.accountNumber}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none ${
                            isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {tx.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-xs font-black tracking-tight ${
                            isCredit ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {isCredit ? '+' : ''}{formatCurrency(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs font-black text-slate-900 tracking-tight">
                          {formatCurrency(tx.balance || 0)}
                        </TableCell>
                        <TableCell className="px-8 max-w-[200px]">
                          <div className="text-[11px] text-slate-600 leading-relaxed truncate">
                            {tx.description || tx.reference || 'Systematic installment cycle'}
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

        {/* Add Transaction Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <BanknotesIcon className="h-24 w-24" />
              </div>
              <DialogHeader>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">New Transaction</p>
                <DialogTitle className="text-2xl font-black tracking-tight">Record RD Installment</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold text-xs">Record a monthly installment for an RD account</DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select RD Account</Label>
                  <Select 
                    value={newTransaction.accountId} 
                    onValueChange={v => {
                      const account = rdAccounts.find(a => a.id === v)
                      const monthlyInstallment = account && account.tenure > 0 ? account.principalAmount / account.tenure : 0
                      setNewTransaction(p => ({ 
                        ...p, 
                        accountId: v,
                        amount: monthlyInstallment > 0 ? monthlyInstallment.toString() : ''
                      }))
                    }}
                  >
                    <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold">
                      <SelectValue placeholder="Choose RD Account...">
                        {newTransaction.accountId && rdAccounts.find(a => a.id === newTransaction.accountId) 
                          ? `${rdAccounts.find(a => a.id === newTransaction.accountId)?.accountNumber} • ${rdAccounts.find(a => a.id === newTransaction.accountId)?.customer?.name || 'Unknown'}`
                          : 'Choose RD Account...'
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {rdAccounts && rdAccounts.length > 0 ? rdAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.accountNumber || 'Unknown'} • {acc.customer?.name || 'Unknown Customer'}
                        </SelectItem>
                      )) : (
                        <SelectItem value="loading" disabled>Loading RD accounts...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Installment Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={e => setNewTransaction(p => ({ ...p, amount: e.target.value }))}
                    disabled={!!newTransaction.accountId}
                    className="h-11 border-slate-200 bg-slate-100 rounded-xl font-black tracking-tight disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                  {newTransaction.accountId && (
                    <p className="text-[10px] text-slate-400">Amount is auto-calculated based on RD account details</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date</Label>
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={e => setNewTransaction(p => ({ ...p, date: e.target.value }))}
                    className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</Label>
                  <Input
                    placeholder="Enter transaction details..."
                    value={newTransaction.description}
                    onChange={e => setNewTransaction(p => ({ ...p, description: e.target.value }))}
                    className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reference Number</Label>
                  <Input
                    placeholder="Transaction reference (optional)"
                    value={newTransaction.reference}
                    onChange={e => setNewTransaction(p => ({ ...p, reference: e.target.value }))}
                    className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold"
                  />
                </div>
              </div>

              <DialogFooter className="mt-8">
                <Button variant="ghost" onClick={() => setShowAddDialog(false)} className="h-12 px-6 font-bold text-slate-500 hover:text-slate-900">Cancel</Button>
                <Button onClick={handleAddTransaction} className="h-12 px-8 finance-gradient-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Record Installment
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
