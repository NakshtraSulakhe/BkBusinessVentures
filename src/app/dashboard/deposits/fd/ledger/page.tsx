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
  CalendarIcon
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

export default function FDLedgerPage() {
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
      // We'll filter transactions that belong to FD accounts
      const response = await fetch('/api/transactions?accountType=FD')
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
    switch (type) {
      case 'PRINCIPAL_PAYMENT':
      case 'deposit': 
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'INTEREST':
      case 'interest':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'MATURITY_PAYOUT':
      case 'withdrawal':
        return 'bg-purple-100 text-purple-700 border-purple-200'
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
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/deposits/fd')}
                className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FD Ledger
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Consolidated transaction history for all Fixed Deposits
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="h-12 border-blue-200 text-blue-700 hover:bg-blue-50">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download Statement
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-white/60 backdrop-blur-sm">
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
                      className="pl-10 h-10 shadow-sm"
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
                      <SelectItem value="deposit">Principal Payment</SelectItem>
                      <SelectItem value="interest">Interest</SelectItem>
                      <SelectItem value="withdrawal">Maturity Payout</SelectItem>
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
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-6">
              <CardTitle className="text-xl font-semibold flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                Transaction History
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
                {filteredTransactions.length} Transactions
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">Fetching transaction ledger...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-900">Date</TableHead>
                      <TableHead className="font-semibold text-gray-900">Account No</TableHead>
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900">Type</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-right">Amount</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-right">Balance</TableHead>
                      <TableHead className="font-semibold text-gray-900">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-100">
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center text-gray-700">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(tx.transactionDate).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium text-blue-700">
                          {tx.account.accountNumber}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {tx.account.customer.name}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[11px] uppercase tracking-wider ${getTransactionTypeColor(tx.type)} shadow-sm`}>
                            {tx.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${
                            tx.type === 'deposit' || tx.type === 'INTEREST' || tx.type === 'PRINCIPAL_PAYMENT' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {formatCurrency(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-900">
                          {formatCurrency(tx.balance || 0)}
                        </TableCell>
                        <TableCell className="text-gray-500 italic text-sm">
                          {tx.description || tx.reference || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-16">
                  <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DocumentTextIcon className="h-10 w-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No transactions found</h3>
                  <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                    {searchTerm || typeFilter !== 'all' 
                      ? 'No transactions match your current filters. Try resetting them.' 
                      : 'This ledger will populate as transactions are posted to FD accounts.'}
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
