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
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline"

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
        setTransactions(data.transactions || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch EMI transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, searchTerm, selectedCustomer, selectedAccount, dateFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCustomerFilter = (value: string) => {
    setSelectedCustomer(value)
    setCurrentPage(1)
  }

  const handleAccountFilter = (value: string) => {
    setSelectedAccount(value)
    setCurrentPage(1)
  }

  const handleDateFilter = (value: string) => {
    setDateFilter(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCustomer('')
    setSelectedAccount('')
    setDateFilter('')
    setCurrentPage(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const isEMITransaction = (transaction: Transaction) => {
    return transaction.type === 'deposit' && 
           transaction.account.accountType === 'LOAN' &&
           (transaction.description.toLowerCase().includes('emi') || 
            transaction.reference.toLowerCase().includes('emi'))
  }

  const filteredTransactions = transactions.filter(isEMITransaction)

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/loans')}
                className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EMI Payments
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2 text-blue-500" />
                  View and manage all EMI payments
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/dashboard/loans/emi/create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Record EMI
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-white/60 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search EMI payments..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer
                  </label>
                  <Input
                    placeholder="Customer name..."
                    value={selectedCustomer}
                    onChange={(e) => handleCustomerFilter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account
                  </label>
                  <Input
                    placeholder="Account number..."
                    value={selectedAccount}
                    onChange={(e) => handleAccountFilter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => handleDateFilter(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total EMI Payments</p>
                    <p className="text-2xl font-bold text-blue-900">{filteredTransactions.length}</p>
                  </div>
                  <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Amount</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}
                    </p>
                  </div>
                  <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">This Month</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {filteredTransactions.filter(t => {
                        const transactionDate = new Date(t.createdAt)
                        const now = new Date()
                        return transactionDate.getMonth() === now.getMonth() && 
                               transactionDate.getFullYear() === now.getFullYear()
                      }).length}
                    </p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Unique Customers</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {new Set(filteredTransactions.map(t => t.account.customer.name)).size}
                    </p>
                  </div>
                  <UserIcon className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* EMI List */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  EMI Payment History
                </span>
                <Badge variant="outline">
                  {filteredTransactions.length} payments
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No EMI payments found</h3>
                  <p className="text-gray-500 mb-4">Get started by recording your first EMI payment</p>
                  <Button
                    onClick={() => router.push('/dashboard/loans/emi/create')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Record EMI Payment
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Account</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Balance</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Reference</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {formatDate(transaction.createdAt)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <BuildingLibraryIcon className="h-4 w-4 mr-2 text-blue-500" />
                              <div>
                                <div className="font-medium text-gray-900">{transaction.account.accountNumber}</div>
                                <Badge variant="outline" className="text-xs mt-1">LOAN</Badge>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">{transaction.account.customer.name}</div>
                                <div className="text-sm text-gray-500">{transaction.account.customer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-4 w-4 mr-2 text-green-500" />
                              <span className="font-semibold text-green-600">
                                {formatCurrency(transaction.amount)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">
                              {formatCurrency(transaction.balance)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              {transaction.reference || 'N/A'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-xs truncate" title={transaction.description}>
                              {transaction.description}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
