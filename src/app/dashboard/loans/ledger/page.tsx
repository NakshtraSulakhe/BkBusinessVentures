"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeftIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShieldExclamationIcon
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

export default function LoanLedgerPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    setMounted(true)
    fetchTransactions()
  }, [typeFilter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions?accountType=LOAN')
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'EMI':
      case 'PRINCIPAL_PAYMENT':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'PENALTY':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'INTEREST':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'EMI_DUE':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
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

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/loans')}
                className="h-10 w-10 p-0 rounded-full hover:bg-indigo-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent underline decoration-indigo-200 underline-offset-8">
                  Loan Ledger
                </h1>
                <p className="text-gray-600 mt-4 flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-2 text-indigo-500" />
                  Audit history for EMI, Principal, and Penalty transactions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="h-12 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Statement (PDF)
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg overflow-hidden relative">
              <CardContent className="p-6">
                <p className="text-indigo-100 text-sm font-medium">Total Recovered</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(transactions.filter(t => ['EMI', 'PRINCIPAL_PAYMENT'].includes(t.type)).reduce((sum, t) => sum + t.amount, 0))}
                </p>
                <CurrencyDollarIcon className="absolute -bottom-2 -right-2 h-20 w-20 text-white/10" />
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-lg">
              <CardContent className="p-6">
                <p className="text-orange-600 text-sm font-medium">Pending Dues</p>
                <p className="text-3xl font-bold mt-1 text-slate-800">
                  {formatCurrency(transactions.filter(t => t.type === 'EMI_DUE').reduce((sum, t) => sum + t.amount, 0))}
                </p>
                <ShieldExclamationIcon className="absolute top-4 right-4 h-6 w-6 text-orange-400" />
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-red-100 shadow-lg">
              <CardContent className="p-6">
                <p className="text-red-600 text-sm font-medium">Penalties Collected</p>
                <p className="text-3xl font-bold mt-1 text-slate-800">
                  {formatCurrency(transactions.filter(t => t.type === 'PENALTY').reduce((sum, t) => sum + t.amount, 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-indigo-50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Acc No, Name, Desc..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 shadow-sm transition-all focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-10 shadow-sm">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="emi">EMI Payment</SelectItem>
                      <SelectItem value="principal_payment">Principal Recovery</SelectItem>
                      <SelectItem value="penalty">Penalty Charge</SelectItem>
                      <SelectItem value="interest">Interest Charge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="h-10 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="h-10 shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Table */}
          <Card className="bg-white shadow-xl border-indigo-50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-slate-50/50 pb-6 px-6">
              <CardTitle className="text-xl font-semibold flex items-center text-slate-800">
                <DocumentTextIcon className="h-5 w-5 mr-3 text-indigo-500" />
                Transaction History
              </CardTitle>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-4 py-1 font-semibold">
                {filteredTransactions.length} Transactions
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-24 bg-white/40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-6 text-slate-600 font-medium">Reconstruction transaction audit...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-b border-slate-200">
                      <TableHead className="font-bold text-slate-900 h-14 px-6">Date</TableHead>
                      <TableHead className="font-bold text-slate-900 h-14">Account</TableHead>
                      <TableHead className="font-bold text-slate-900 h-14">Customer</TableHead>
                      <TableHead className="font-bold text-slate-900 h-14">Category</TableHead>
                      <TableHead className="font-bold text-slate-900 h-14 text-right">Amount</TableHead>
                      <TableHead className="font-bold text-slate-900 h-14 text-right">Outstanding</TableHead>
                      <TableHead className="font-bold text-slate-900 h-14 px-6">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-indigo-50/30 transition-colors border-b border-slate-100">
                        <TableCell className="whitespace-nowrap px-6">
                          <div className="flex items-center text-slate-700 font-medium">
                            <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                            {new Date(tx.transactionDate).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-indigo-700 tracking-tight">
                          {tx.account.accountNumber}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {tx.account.customer.name}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${getTransactionTypeColor(tx.type)}`}>
                            {tx.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold text-lg ${
                            ['EMI', 'PRINCIPAL_PAYMENT'].includes(tx.type.toUpperCase()) 
                              ? 'text-emerald-600' 
                              : 'text-red-600'
                          }`}>
                            {formatCurrency(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(tx.balance || 0)}
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs px-6 max-w-xs truncate">
                          {tx.description || tx.reference || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-32 bg-white/40">
                  <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <DocumentTextIcon className="h-10 w-10 text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No loan records found</h3>
                  <p className="text-slate-500 mt-3 max-w-sm mx-auto">
                    {searchTerm || typeFilter !== 'all' 
                      ? 'No transactions match your search parameters. Try clearing the filters.' 
                      : 'Audit records will appear here as EMIs and Principal payments are processed.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
