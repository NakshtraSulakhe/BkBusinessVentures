"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Plus, 
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Filter,
  ArrowUpDown,
  Building2,
  Users,
  CreditCard,
  PiggyBank
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  panNumber: string;
  aadhaarNumber: string;
  dateOfBirth: string;
  occupation: string;
  annualIncome: number;
  accountType: 'savings' | 'current' | 'fd' | 'rd' | 'loan';
  purpose: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Customer>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterAccountType, setFilterAccountType] = useState<string>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ show: boolean; customerId: string; customerName: string }>({ show: false, customerId: '', customerName: '' })

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(filteredAndSortedCustomers.map(customer => customer.id))
    } else {
      setSelectedCustomers([])
    }
  }

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, customerId])
    } else {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId))
    }
  }

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDelete = async (customerId: string, customerName: string) => {
    setShowDeleteDialog({ show: true, customerId, customerName })
  }

  const confirmDelete = async () => {
    const { customerId, customerName } = showDeleteDialog
    setShowDeleteDialog({ show: false, customerId: '', customerName: '' })

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showMessage(`${customerName} has been successfully deleted`, 'success')
        setCustomers(customers.filter(c => c.id !== customerId))
      } else {
        const errorData = await response.json()
        showMessage(errorData.error || 'Failed to delete customer', 'error')
      }
    } catch (error) {
      console.error('Failed to delete customer:', error)
      showMessage('Failed to delete customer', 'error')
    }
  }

  const cancelDelete = () => {
    setShowDeleteDialog({ show: false, customerId: '', customerName: '' })
  }

  const getAccountTypeColor = (accountType: string) => {
    switch (accountType) {
      case 'savings': return 'bg-blue-100 text-blue-800'
      case 'current': return 'bg-emerald-100 text-emerald-800'
      case 'fd': return 'bg-purple-100 text-purple-800'
      case 'rd': return 'bg-amber-100 text-amber-800'
      case 'loan': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'savings': return <PiggyBank className="h-4 w-4" />
      case 'current': return <CreditCard className="h-4 w-4" />
      case 'fd': return <TrendingUp className="h-4 w-4" />
      case 'rd': return <Users className="h-4 w-4" />
      case 'loan': return <CreditCard className="h-4 w-4" />
      default: return <Building2 className="h-4 w-4" />
    }
  }

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.city.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filterAccountType === 'all' || customer.accountType === filterAccountType
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  const totalCustomers = customers.length
  const savingsCount = customers.filter(c => c.accountType === 'savings').length
  const fdCount = customers.filter(c => c.accountType === 'fd').length
  const loanCount = customers.filter(c => c.accountType === 'loan').length

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600">Manage customer information and accounts</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              KYC Compliant
            </Badge>
            <Button
              onClick={() => router.push('/dashboard/customers/create')}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Savings</p>
                  <p className="text-2xl font-bold text-gray-900">{savingsCount}</p>
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
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Loans</p>
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
        <Tabs defaultValue="customers" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={filterAccountType}
                onChange={(e) => setFilterAccountType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="fd">Fixed Deposit</option>
                <option value="rd">Recurring Deposit</option>
                <option value="loan">Loan</option>
              </select>
            </div>
          </div>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Customers ({filteredAndSortedCustomers.length})
                  </h2>
                  {selectedCustomers.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        {selectedCustomers.length} selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomers([])}
                      >
                        Clear selection
                      </Button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                ) : filteredAndSortedCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No customers found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {searchTerm || filterAccountType !== 'all' 
                        ? 'Try adjusting your search or filter criteria' 
                        : 'Get started by creating a new customer'}
                    </p>
                    <Button
                      onClick={() => router.push('/dashboard/customers/create')}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Customer
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gray-200">
                          <TableHead className="w-12 py-3">
                            <Checkbox
                              checked={selectedCustomers.length === filteredAndSortedCustomers.length && filteredAndSortedCustomers.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead className="w-[300px] py-3">
                            <button
                              onClick={() => handleSort('name')}
                              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                              Customer
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </button>
                          </TableHead>
                          <TableHead className="w-[200px] py-3">Contact</TableHead>
                          <TableHead className="w-[150px] py-3">Location</TableHead>
                          <TableHead className="w-[120px] py-3">Account Type</TableHead>
                          <TableHead className="w-[120px] py-3">Income</TableHead>
                          <TableHead className="w-[100px] py-3">Created</TableHead>
                          <TableHead className="w-[80px] text-right py-3">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedCustomers.map((customer) => (
                          <TableRow 
                            key={customer.id} 
                            className={cn(
                              "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                              selectedCustomers.includes(customer.id) && "bg-blue-50"
                            )}
                          >
                            <TableCell className="py-3">
                              <Checkbox
                                checked={selectedCustomers.includes(customer.id)}
                                onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={`/avatars/${customer.id}.png`} />
                                  <AvatarFallback className="bg-blue-600 text-white">
                                    {customer.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-gray-900 truncate">{customer.name}</div>
                                  <div className="text-sm text-gray-500 truncate">
                                    {customer.occupation || 'Not specified'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-900">
                                  <Mail className="h-3 w-3 mr-2 text-gray-400" />
                                  <span className="truncate">{customer.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                  <span>{customer.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center text-sm text-gray-900">
                                <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                                <span className="truncate">{customer.city}, {customer.state}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge className={cn("text-xs", getAccountTypeColor(customer.accountType))}>
                                <span className="mr-1">{getAccountTypeIcon(customer.accountType)}</span>
                                {customer.accountType.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.annualIncome ? formatCurrency(customer.annualIncome) : '—'}
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="text-sm text-gray-500">
                                {new Date(customer.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(customer.id, customer.name)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Distribution</CardTitle>
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
                  <CardTitle>Account Performance</CardTitle>
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

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="pt-4">
                    <p className="text-sm text-gray-600">Reports section coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={cancelDelete}
          />
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Customer
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{showDeleteDialog.customerName}</span>? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
