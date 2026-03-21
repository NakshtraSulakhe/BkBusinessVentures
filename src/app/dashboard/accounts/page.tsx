"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  CalendarIcon,
  UserIcon,
  ArrowPathIcon,
  EyeIcon
} from "@heroicons/react/24/outline"

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
  createdAt: string
  customer: {
    id: string
    name: string
    email: string
  }
  _count: {
    transactions: number
  }
}

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [accountType, setAccountType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchAccounts = async (page = 1, searchQuery = '', typeFilter = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter && { accountType: typeFilter })
      })

      const response = await fetch(`/api/accounts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
        setCurrentPage(data.pagination.page)
        setTotalPages(data.pagination.pages)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts(currentPage, search, accountType)
  }, [currentPage, search, accountType])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleTypeFilter = (value: string) => {
    setAccountType(value)
    setCurrentPage(1)
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'fd': return 'bg-blue-100 text-blue-700'
      case 'rd': return 'bg-green-100 text-green-700'
      case 'loan': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'fd': return '💰'
      case 'rd': return '🔄'
      case 'loan': return '💳'
      default: return '🏦'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'matured': return 'bg-yellow-100 text-yellow-700'
      case 'closed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Accounts Master
              </h1>
              <p className="text-gray-600 mt-2">
                Manage Fixed Deposits, Recurring Deposits, and Loans
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/accounts/create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg h-12 px-6"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Account
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BanknotesIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Accounts</p>
                    <p className="text-2xl font-bold">{total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Fixed Deposits</p>
                    <p className="text-2xl font-bold">
                      {accounts.filter(a => a.accountType === 'fd').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <span className="text-xl">🔄</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Recurring Deposits</p>
                    <p className="text-2xl font-bold">
                      {accounts.filter(a => a.accountType === 'rd').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <span className="text-xl">💳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Loans</p>
                    <p className="text-2xl font-bold">
                      {accounts.filter(a => a.accountType === 'loan').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white/60 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by account number, customer name..."
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={accountType} onValueChange={handleTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="fd">Fixed Deposit</SelectItem>
                      <SelectItem value="rd">Recurring Deposit</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fetchAccounts(1, '', '')}
                  className="w-full md:w-auto"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-12">
                  <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No accounts found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Get started by creating your first account.
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard/accounts/create')}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create First Account
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Account</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Principal</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Rate</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => (
                        <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium">{account.accountNumber}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(account.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="font-medium">{account.customer.name}</div>
                                <div className="text-sm text-gray-500">{account.customer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getAccountTypeColor(account.accountType)}>
                              <span className="mr-1">{getAccountTypeIcon(account.accountType)}</span>
                              {account.accountType.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium">
                              ₹{account.principalAmount.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium">{account.interestRate}%</div>
                            <div className="text-sm text-gray-500">{account.tenure} months</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(account.state)}>
                              {account.state}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/accounts/${account.id}`)}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} accounts
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
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
