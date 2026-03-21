"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Plus,
  Search,
  RotateCcw,
  Eye,
  Building,
  User,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  CreditCard,
  PiggyBank
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"

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

  const fetchAccounts = async (page = 1, searchQuery = '', typeFilter = 'all') => {
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
      case 'fd': return 'bg-blue-100 text-blue-800'
      case 'rd': return 'bg-emerald-100 text-emerald-800'
      case 'loan': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'fd': return <PiggyBank className="h-4 w-4" />
      case 'rd': return <TrendingUp className="h-4 w-4" />
      case 'loan': return <CreditCard className="h-4 w-4" />
      default: return <Building className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800'
      case 'matured': return 'bg-amber-100 text-amber-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalPrincipal = accounts.reduce((sum, acc) => sum + acc.principalAmount, 0)
  const fdCount = accounts.filter(a => a.accountType === 'fd').length
  const rdCount = accounts.filter(a => a.accountType === 'rd').length
  const loanCount = accounts.filter(a => a.accountType === 'loan').length

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-600">Manage your business accounts and portfolios</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={() => fetchAccounts(1, '', 'all')}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => router.push('/dashboard/accounts/create')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Principal</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPrincipal)}</p>
                </div>
                <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <PiggyBank className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fixed Deposits</p>
                  <p className="text-2xl font-bold text-gray-900">{fdCount}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PiggyBank className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Loans</p>
                  <p className="text-2xl font-bold text-gray-900">{loanCount}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search accounts..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={accountType} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
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
          </div>

          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No accounts found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Get started by creating your first account.
                    </p>
                    <Button
                      onClick={() => router.push('/dashboard/accounts/create')}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getAccountTypeIcon(account.accountType)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{account.accountNumber}</h3>
                              <Badge variant="secondary" className={getAccountTypeColor(account.accountType)}>
                                {account.accountType.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">{account.customer.name}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{account.customer.email}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(account.principalAmount)}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{account.interestRate}%</span>
                            <span>•</span>
                            <span>{account.tenure} months</span>
                          </div>
                          <div className="flex items-center justify-end mt-2 space-x-2">
                            <Badge variant="secondary" className={getStatusColor(account.state)}>
                              {account.state}
                            </Badge>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-4">
                      <p className="text-sm text-gray-600">Analytics dashboard coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="pt-4">
                      <p className="text-sm text-gray-600">Detailed analytics coming soon...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="pt-4">
                    <p className="text-sm text-gray-600">Settings panel coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
