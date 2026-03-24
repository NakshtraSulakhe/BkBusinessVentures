"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
  UserIcon
} from "@heroicons/react/24/outline"

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

export default function LedgerPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountFilter, setAccountFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [runningBalance, setRunningBalance] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }
  
  const [newTransaction, setNewTransaction] = useState({
    accountId: '',
    type: 'deposit',
    amount: '',
    description: '',
    reference: ''
  })

  const [accounts, setAccounts] = useState<any[]>([])

  // Handle customer pre-selection from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const customerId = urlParams.get('customerId')
    
    if (customerId) {
      // Fetch accounts first, then set the account filter to the customer's first account
      fetchAccounts().then(() => {
        // This will be handled in the fetchAccounts callback
      })
    }
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        const accountsList = data.accounts || []
        setAccounts(accountsList)
        
        // Check if we have a customerId in URL and pre-select the customer's account
        const urlParams = new URLSearchParams(window.location.search)
        const customerId = urlParams.get('customerId')
        
        if (customerId) {
          const customerAccount = accountsList.find((account: any) => account.customerId === customerId)
          if (customerAccount) {
            setAccountFilter(customerAccount.id)
            // Also open the add transaction modal
            setShowAddTransaction(true)
            setNewTransaction(prev => ({
              ...prev,
              accountId: customerAccount.id
            }))
          }
        }
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
        calculateRunningBalance(data.transactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRunningBalance = (transactions: Transaction[]) => {
    const balance = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'deposit' || transaction.type === 'interest') {
        return acc + transaction.amount
      } else {
        return acc - transaction.amount
      }
    }, 0)
    setRunningBalance(balance)
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
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.accountId || !newTransaction.amount || !newTransaction.type) {
      showMessage('Please fill in all required fields', 'error')
      return
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: newTransaction.accountId,
          type: newTransaction.type,
          amount: parseFloat(newTransaction.amount),
          description: newTransaction.description,
          reference: newTransaction.reference
        })
      })

      if (response.ok) {
        showMessage('Transaction added successfully', 'success')
        setShowAddTransaction(false)
        setNewTransaction({
          accountId: '',
          type: 'deposit',
          amount: '',
          description: '',
          reference: ''
        })
        fetchTransactions()
      } else {
        showMessage('Failed to add transaction', 'error')
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      showMessage('Error adding transaction', 'error')
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-green-100 text-green-700'
      case 'withdrawal': return 'bg-red-100 text-red-700'
      case 'interest': return 'bg-blue-100 text-blue-700'
      case 'disbursement': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '📈'
      case 'withdrawal': return '📉'
      case 'interest': return '📈'
      case 'disbursement': return '💰'
      default: return '🔄'
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.account.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    return matchesSearch
  })

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [searchTerm, accountFilter, typeFilter, dateFilter])

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Message */}
          {message && (
            <div className={`rounded-xl p-4 flex items-start space-x-3 shadow-sm border ${
              message.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800'
            }`}>
              <div className={`flex-shrink-0 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{message.text}</p>
                <p className="text-xs mt-1 opacity-75">
                  {message.type === 'success' ? 'Operation completed successfully' : 'Please try again'}
                </p>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ledger Management
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                Track all financial transactions and account balances
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1.5 bg-white/80 backdrop-blur-sm border-green-200 text-green-700">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                System Active
              </Badge>
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="border-green-200 text-green-700 hover:bg-green-50 h-12 px-6"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => setShowAddTransaction(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg h-12 px-6"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Transactions</p>
                  <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
                  <p className="text-xs text-gray-500 mt-2">All recorded transactions</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm font-medium text-blue-600">+12%</span>
                    <span className="text-xs text-gray-500 ml-1">this month</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <BanknotesIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Credits</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {transactions.filter(t => t.type === 'credit' || t.type === 'deposit' || t.type === 'interest').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Money in transactions</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm font-medium text-green-600">+8%</span>
                    <span className="text-xs text-gray-500 ml-1">this month</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <ArrowTrendingUpIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Debits</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {transactions.filter(t => t.type === 'debit' || t.type === 'withdrawal' || t.type === 'disbursement').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Money out transactions</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm font-medium text-red-600">-3%</span>
                    <span className="text-xs text-gray-500 ml-1">this month</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <ArrowTrendingDownIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Net Balance</p>
                  <p className="text-3xl font-bold text-gray-900">₹{runningBalance.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-2">Current account balance</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm font-medium text-purple-600">+15%</span>
                    <span className="text-xs text-gray-500 ml-1">this month</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <CurrencyDollarIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Transaction Volume Chart */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Transaction Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today</span>
                    <span className="font-semibold">₹12,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Yesterday</span>
                    <span className="font-semibold">₹8,230</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="font-semibold">₹45,680</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Week</span>
                    <span className="font-semibold">₹38,920</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Growth Rate</span>
                    <Badge className="bg-green-100 text-green-700">+17.4%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Types Distribution */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Transaction Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Deposits</span>
                    </div>
                    <span className="font-semibold">{transactions.filter(t => t.type === 'deposit').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Interest</span>
                    </div>
                    <span className="font-semibold">{transactions.filter(t => t.type === 'interest').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Withdrawals</span>
                    </div>
                    <span className="font-semibold">{transactions.filter(t => t.type === 'withdrawal').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Disbursements</span>
                    </div>
                    <span className="font-semibold">{transactions.filter(t => t.type === 'disbursement').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">API Response Time</span>
                      <span className="text-sm font-medium">45ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Data Accuracy</span>
                      <span className="text-sm font-medium">99.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '99.8%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">System Uptime</span>
                      <span className="text-sm font-medium">99.9%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '99.9%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Transactions Table */}
            <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => fetchTransactions()}>
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={accountFilter} onValueChange={setAccountFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="All Accounts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Accounts</SelectItem>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountNumber} - {account.customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full md:w-32">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        <SelectItem value="interest">Interest</SelectItem>
                        <SelectItem value="disbursement">Disbursement</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full md:w-40"
                    />
                    <Button onClick={fetchTransactions}>Apply Filters</Button>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border overflow-hidden mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                              Loading transactions...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-gray-50/50">
                            <TableCell>
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <BanknotesIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <div>
                                  <p className="font-medium">{transaction.account.accountNumber}</p>
                                  <p className="text-sm text-gray-500">{transaction.account.customer.name}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTransactionTypeColor(transaction.type)}>
                                {getTransactionTypeIcon(transaction.type)}
                                <span className="ml-1">{transaction.type}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{transaction.description || 'N/A'}</p>
                                {transaction.reference && (
                                  <p className="text-sm text-gray-500">Ref: {transaction.reference}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${
                              transaction.type === 'deposit' || transaction.type === 'interest' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'deposit' || transaction.type === 'interest' ? '+' : '-'}
                              ₹{transaction.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{transaction.balance?.toLocaleString() || '0'}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12"
                    onClick={() => setShowAddTransaction(true)}
                  >
                    <PlusIcon className="h-5 w-5 mr-3" />
                    Add Transaction
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12"
                    onClick={() => router.push('/dashboard/accounts')}
                  >
                    <BanknotesIcon className="h-5 w-5 mr-3" />
                    Manage Accounts
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12"
                    onClick={() => router.push('/dashboard/customers')}
                  >
                    <UserIcon className="h-5 w-5 mr-3" />
                    View Customers
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12"
                    onClick={exportToCSV}
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-3" />
                    Export Report
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-green-50">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Deposit Received</p>
                      <p className="text-xs text-gray-500">2 mins ago</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">+₹5,000</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-red-50">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Withdrawal</p>
                      <p className="text-xs text-gray-500">15 mins ago</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">-₹2,000</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <BanknotesIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Interest Credit</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">+₹150</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-purple-50">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Loan Disbursement</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">+₹10,000</span>
                  </div>
                </CardContent>
              </Card>

              {/* Account Summary */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Accounts</span>
                    <span className="font-semibold">{accounts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Today</span>
                    <span className="font-semibold text-green-600">{accounts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Review</span>
                    <span className="font-semibold text-orange-600">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Balance</span>
                    <span className="font-semibold">₹4,230</span>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Server</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Backup</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-blue-600">Scheduled</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Sync</span>
                    <span className="text-sm text-gray-500">2 mins ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <Card className="w-full max-w-md bg-white shadow-2xl border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Add Manual Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="account">Account</Label>
                <Select value={newTransaction.accountId} onValueChange={(value) => setNewTransaction({...newTransaction, accountId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountNumber} - {account.customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Transaction Type</Label>
                <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="interest">Interest</SelectItem>
                    <SelectItem value="disbursement">Disbursement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="reference">Reference (Optional)</Label>
                <Input
                  id="reference"
                  placeholder="Enter reference"
                  value={newTransaction.reference}
                  onChange={(e) => setNewTransaction({...newTransaction, reference: e.target.value})}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTransaction}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Add Transaction
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
