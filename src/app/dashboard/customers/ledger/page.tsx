"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  UserIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  createdAt: string
}

interface CustomerLedgerSummary {
  customer: Customer
  accounts: {
    id: string
    accountNumber: string
    accountType: string
    principalAmount: number
    interestRate: number
    createdAt: string
  }[]
  accountSummary: {
    totalAccounts: number
    activeAccounts: number
    fdAccounts: number
    rdAccounts: number
    loanAccounts: number
  }
  financialSummary: {
    totalDeposits: number
    totalLoans: number
    netWorth: number
  }
  recentTransactions: {
    id: string
    type: string
    amount: number
    balance: number
    description: string
    createdAt: string
    account: {
      accountNumber: string
      accountType: string
    }
  }[]
}

interface PaginatedResponse {
  customers: CustomerLedgerSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function CustomerLedger() {
  const router = useRouter()
  const [customers, setCustomers] = useState<CustomerLedgerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('all')
  const [balanceFilter, setBalanceFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      
      // First fetch all customers
      const customersResponse = await fetch('/api/customers')
      if (!customersResponse.ok) return
      
      const customersData = await customersResponse.json()
      const allCustomers = customersData.customers || []
      
      // Then fetch ledger data for each customer
      const ledgerPromises = allCustomers.map(async (customer: Customer) => {
        try {
          const ledgerResponse = await fetch(`/api/customers/${customer.id}/ledger`)
          if (ledgerResponse.ok) {
            const ledgerData = await ledgerResponse.json()
            return {
              customer,
              ...ledgerData
            }
          }
          return null
        } catch (error) {
          console.error(`Failed to fetch ledger for customer ${customer.id}:`, error)
          return null
        }
      })
      
      const ledgerResults = await Promise.all(ledgerPromises)
      const validLedgers = ledgerResults.filter(result => result !== null)
      
      // Apply filters
      let filteredLedgers = validLedgers
      
      if (searchTerm) {
        filteredLedgers = filteredLedgers.filter(ledger =>
          ledger.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ledger.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ledger.customer.phone.includes(searchTerm)
        )
      }
      
      if (accountTypeFilter !== 'all') {
        filteredLedgers = filteredLedgers.filter(ledger => {
          switch (accountTypeFilter) {
            case 'fd':
              return ledger.accountSummary.fdAccounts > 0
            case 'rd':
              return ledger.accountSummary.rdAccounts > 0
            case 'loan':
              return ledger.accountSummary.loanAccounts > 0
            default:
              return true
          }
        })
      }
      
      if (balanceFilter !== 'all') {
        filteredLedgers = filteredLedgers.filter(ledger => {
          switch (balanceFilter) {
            case 'positive':
              return ledger.financialSummary.netWorth > 0
            case 'negative':
              return ledger.financialSummary.netWorth < 0
            case 'zero':
              return ledger.financialSummary.netWorth === 0
            default:
              return true
          }
        })
      }
      
      // Pagination
      const total = filteredLedgers.length
      const limit = 10
      const pages = Math.ceil(total / limit)
      const page = Math.min(currentPage, pages || 1)
      
      const paginatedLedgers = filteredLedgers.slice((page - 1) * limit, page * limit)
      
      setCustomers(paginatedLedgers)
      setPagination({ page, limit, total, pages })
      
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [currentPage, searchTerm, accountTypeFilter, balanceFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleAccountTypeFilter = (value: string) => {
    setAccountTypeFilter(value)
    setCurrentPage(1)
  }

  const handleBalanceFilter = (value: string) => {
    setBalanceFilter(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setAccountTypeFilter('all')
    setBalanceFilter('all')
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

  const getAccountTypeBadge = (accountType: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      'FD': { color: 'bg-blue-100 text-blue-800', label: 'FD' },
      'RD': { color: 'bg-green-100 text-green-800', label: 'RD' },
      'LOAN': { color: 'bg-red-100 text-red-800', label: 'LOAN' }
    }
    return variants[accountType] || { color: 'bg-gray-100 text-gray-800', label: accountType }
  }

  const getNetWorthColor = (netWorth: number) => {
    if (netWorth > 0) return 'text-green-600'
    if (netWorth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getNetWorthIcon = (netWorth: number) => {
    if (netWorth > 0) return <TrendingUpIcon className="h-4 w-4" />
    if (netWorth < 0) return <TrendingDownIcon className="h-4 w-4" />
    return <CurrencyDollarIcon className="h-4 w-4" />
  }

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
                onClick={() => router.push('/dashboard/customers')}
                className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Customer Ledger
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-blue-500" />
                  View all customer accounts and balances
                </p>
              </div>
            </div>
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
                    Search Customers
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, phone..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    value={accountTypeFilter}
                    onChange={(e) => handleAccountTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="fd">FD Accounts Only</option>
                    <option value="rd">RD Accounts Only</option>
                    <option value="loan">Loan Accounts Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Net Worth
                  </label>
                  <select
                    value={balanceFilter}
                    onChange={(e) => handleBalanceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Balances</option>
                    <option value="positive">Positive Only</option>
                    <option value="negative">Negative Only</option>
                    <option value="zero">Zero Balance</option>
                  </select>
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
                    <p className="text-blue-600 text-sm font-medium">Total Customers</p>
                    <p className="text-2xl font-bold text-blue-900">{pagination.total}</p>
                  </div>
                  <UserIcon className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Deposits</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(customers.reduce((sum, c) => sum + c.financialSummary.totalDeposits, 0))}
                    </p>
                  </div>
                  <TrendingUpIcon className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Total Loans</p>
                    <p className="text-2xl font-bold text-red-900">
                      {formatCurrency(customers.reduce((sum, c) => sum + c.financialSummary.totalLoans, 0))}
                    </p>
                  </div>
                  <TrendingDownIcon className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Total Net Worth</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(customers.reduce((sum, c) => sum + c.financialSummary.netWorth, 0))}
                    </p>
                  </div>
                  <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Ledger List */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <BuildingLibraryIcon className="h-5 w-5 mr-2" />
                  Customer Accounts Summary
                </span>
                <Badge variant="outline">
                  {customers.length} customers
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-12">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customers.map((customerLedger) => (
                    <Card key={customerLedger.customer.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          {/* Customer Info */}
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                {customerLedger.customer.name}
                              </h3>
                              <Badge variant="outline" className="ml-3">
                                {customerLedger.accountSummary.totalAccounts} accounts
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <div className="text-sm">
                                <span className="text-gray-500">Email:</span>
                                <div className="font-medium text-gray-900">{customerLedger.customer.email}</div>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Phone:</span>
                                <div className="font-medium text-gray-900">{customerLedger.customer.phone}</div>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Member Since:</span>
                                <div className="font-medium text-gray-900">
                                  {formatDate(customerLedger.customer.createdAt)}
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Location:</span>
                                <div className="font-medium text-gray-900">
                                  {customerLedger.customer.city || 'N/A'}, {customerLedger.customer.state || 'N/A'}
                                </div>
                              </div>
                            </div>

                            {/* Account Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-blue-600 text-xs font-medium">FD Accounts</div>
                                <div className="text-blue-900 text-lg font-bold">
                                  {customerLedger.accountSummary.fdAccounts}
                                </div>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-green-600 text-xs font-medium">RD Accounts</div>
                                <div className="text-green-900 text-lg font-bold">
                                  {customerLedger.accountSummary.rdAccounts}
                                </div>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg">
                                <div className="text-red-600 text-xs font-medium">Loan Accounts</div>
                                <div className="text-red-900 text-lg font-bold">
                                  {customerLedger.accountSummary.loanAccounts}
                                </div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="text-purple-600 text-xs font-medium">Total Balance</div>
                                <div className={`text-lg font-bold flex items-center ${getNetWorthColor(customerLedger.financialSummary.netWorth)}`}>
                                  {getNetWorthIcon(customerLedger.financialSummary.netWorth)}
                                  <span className="ml-1">{formatCurrency(customerLedger.financialSummary.netWorth)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Recent Accounts */}
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Accounts:</span>
                              {customerLedger.accounts.slice(0, 3).map((account) => (
                                <Badge
                                  key={account.id}
                                  className={getAccountTypeBadge(account.accountType).color}
                                >
                                  {account.accountNumber}
                                </Badge>
                              ))}
                              {customerLedger.accounts.length > 3 && (
                                <Badge variant="outline">
                                  +{customerLedger.accounts.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              onClick={() => router.push(`/dashboard/customers/${customerLedger.customer.id}`)}
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} customers
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
