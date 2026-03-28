"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AmountDisplay, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  CalendarIcon,
  UserIcon,
  ArrowPathIcon,
  EyeIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
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
  const [accountType, setAccountType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const fetchAccounts = async (page = 1, searchQuery = '', typeFilter = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter && typeFilter !== 'all' && { accountType: typeFilter })
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
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold">Accounts Management</h1>
            <p className="text-muted-foreground mt-1">Manage Fixed Deposits, Recurring Deposits, and Loans</p>
          </div>
          <Button onClick={() => router.push('/dashboard/accounts/create')} className="finance-gradient-primary text-white hover:shadow-lg transition-all duration-200">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Account
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="finance-hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Accounts</p>
                  <p className="text-3xl font-bold">{total}</p>
                  <p className="text-xs text-muted-foreground mt-2">All account types</p>
                </div>
                <div className="finance-icon-bg h-12 w-12 rounded-lg flex items-center justify-center">
                  <BanknotesIcon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="finance-hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Fixed Deposits</p>
                  <p className="text-3xl font-bold">
                    {accounts.filter(a => a.accountType === 'fd').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Investment accounts</p>
                </div>
                <div className="finance-icon-bg-success h-12 w-12 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="finance-hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Recurring Deposits</p>
                  <p className="text-3xl font-bold">
                    {accounts.filter(a => a.accountType === 'rd').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Monthly savings</p>
                </div>
                <div className="finance-icon-bg-info h-12 w-12 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="finance-hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Loans</p>
                  <p className="text-3xl font-bold">
                    {accounts.filter(a => a.accountType === 'loan').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Active loans</p>
                </div>
                <div className="finance-icon-bg-danger h-12 w-12 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fd">Fixed Deposit</SelectItem>
                    <SelectItem value="rd">Recurring Deposit</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => fetchAccounts(1, '', 'all')}
                className="w-full md:w-auto"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12">
                <BanknotesIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No accounts found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by creating your first account.
                </p>
                <Button
                  onClick={() => router.push('/dashboard/accounts/create')}
                  className="mt-4"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create First Account
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium font-mono text-sm">{account.accountNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(account.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-muted-foreground mr-2" />
                          <div>
                            <div className="font-medium">{account.customer.name}</div>
                            <div className="text-sm text-muted-foreground">{account.customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={account.accountType === 'fd' ? 'active' : 'pending'}>
                          <span className="mr-1">{getAccountTypeIcon(account.accountType)}</span>
                          {account.accountType.toUpperCase()}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <AmountDisplay amount={account.principalAmount} size="sm" />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{account.interestRate}%</div>
                        <div className="text-sm text-muted-foreground">{account.tenure} months</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={account.state === 'active' ? 'active' : account.state === 'matured' ? 'due_soon' : 'inactive'}>
                          {account.state}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/accounts/${account.id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} accounts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
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
    </DashboardLayout>
  )
}
