"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AmountDisplay, StatusBadge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline"

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

export default function CustomerMaster() {
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

  const handleAddTransactionForCustomer = (customerId: string) => {
    // Navigate to ledger page with customer pre-selected
    router.push(`/dashboard/ledger?customerId=${customerId}`)
  }

  const cancelDelete = () => {
    setShowDeleteDialog({ show: false, customerId: '', customerName: '' })
  }

  const getAccountTypeColor = (accountType: string) => {
    switch (accountType) {
      case 'savings': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'current': return 'bg-green-100 text-green-700 border-green-200'
      case 'fd': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'rd': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'loan': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'savings': return '💰'
      case 'current': return '💼'
      case 'fd': return '📈'
      case 'rd': return '🔄'
      case 'loan': return '💳'
      default: return '🏦'
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customer Management</h1>
            <p className="text-slate-500 mt-2">Manage customer information and accounts</p>
          </div>
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <Button 
              onClick={() => router.push('/dashboard/customers/create')} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 hover:shadow-lg px-6 py-3 rounded-xl font-medium"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Customer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Total Customers</p>
                  <p className="text-3xl font-bold text-blue-900">{customers.length}</p>
                  <div className="flex items-center mt-3">
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
                    <span className="text-xs text-blue-600 ml-2 font-medium">from last month</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ml-4 shadow-md">
                  <UserIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-700 mb-2 uppercase tracking-wide">Savings</p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {customers.filter(c => c.accountType === 'savings').length}
                  </p>
                  <div className="flex items-center mt-3">
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+8%</span>
                    <span className="text-xs text-emerald-600 ml-2 font-medium">active accounts</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center ml-4 shadow-md">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-700 mb-2 uppercase tracking-wide">Current</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {customers.filter(c => c.accountType === 'current').length}
                  </p>
                  <div className="flex items-center mt-3">
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">+15%</span>
                    <span className="text-xs text-purple-600 ml-2 font-medium">business accounts</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center ml-4 shadow-md">
                  <BuildingOfficeIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-700 mb-2 uppercase tracking-wide">Loans</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {customers.filter(c => c.accountType === 'loan').length}
                  </p>
                  <div className="flex items-center mt-3">
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">+5%</span>
                    <span className="text-xs text-orange-600 ml-2 font-medium">active loans</span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center ml-4 shadow-md">
                  <CurrencyDollarIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white rounded-2xl shadow-md mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search customers by name, email, phone, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 rounded-xl bg-slate-50 transition-all duration-200"
                />
              </div>
              <div className="flex items-center gap-3">
                <FunnelIcon className="h-5 w-5 text-slate-400" />
                <select
                  value={filterAccountType}
                  onChange={(e) => setFilterAccountType(e.target.value)}
                  className="h-12 px-4 rounded-xl border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-200 min-w-[180px]"
                >
                  <option value="all">All Account Types</option>
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                  <option value="fd">Fixed Deposit</option>
                  <option value="rd">Recurring Deposit</option>
                  <option value="loan">Loan Account</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <Card className="bg-white rounded-2xl shadow-md overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-slate-900">Customers ({filteredAndSortedCustomers.length})</CardTitle>
              {selectedCustomers.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">
                    {selectedCustomers.length} selected
                  </span>
                  {selectedCustomers.length === 1 && (
                    <Button
                      onClick={() => handleAddTransactionForCustomer(selectedCustomers[0])}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 rounded-xl"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCustomers([])}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-200"
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-4 text-muted-foreground">Loading customers...</p>
              </div>
            ) : filteredAndSortedCustomers.length === 0 ? (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No customers found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm || filterAccountType !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by creating a new customer'}
                </p>
                <div className="mt-8">
                  <Button
                    onClick={() => router.push('/dashboard/customers/create')}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Customer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-300">
                      <TableHead className="w-12 px-6 py-4">
                        <Checkbox
                          checked={selectedCustomers.length === filteredAndSortedCustomers.length && filteredAndSortedCustomers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="px-6 py-4 min-w-[200px]">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
                        >
                          Customer
                          {sortField === 'name' && (
                            sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4 text-blue-600" /> : <ArrowDownIcon className="ml-2 h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="px-6 py-4 min-w-[180px]">
                        <button
                          onClick={() => handleSort('email')}
                          className="flex items-center text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
                        >
                          Contact
                          {sortField === 'email' && (
                            sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4 text-blue-600" /> : <ArrowDownIcon className="ml-2 h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="px-6 py-4 min-w-[140px]">
                      <button
                        onClick={() => handleSort('accountType')}
                        className="flex items-center text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
                      >
                        Account Type
                        {sortField === 'accountType' && (
                          sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4 text-blue-600" /> : <ArrowDownIcon className="ml-2 h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="px-6 py-4 min-w-[120px]">
                      <button
                        onClick={() => handleSort('annualIncome')}
                        className="flex items-center text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
                      >
                        Income
                        {sortField === 'annualIncome' && (
                          sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4 text-blue-600" /> : <ArrowDownIcon className="ml-2 h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="px-6 py-4 min-w-[120px]">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
                      >
                        Created
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4 text-blue-600" /> : <ArrowDownIcon className="ml-2 h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="px-6 py-4 text-right min-w-[100px]">
                      <span className="text-sm font-bold text-slate-800">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCustomers.map((customer, index) => (
                    <TableRow 
                      key={customer.id} 
                      className={`border-b border-slate-100 transition-colors duration-150 ${
                        selectedCustomers.includes(customer.id) 
                          ? 'bg-blue-50' 
                          : index % 2 === 0 
                            ? 'bg-white hover:bg-slate-50' 
                            : 'bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <TableCell className="px-6 py-4 w-12">
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="px-6 py-4 min-w-[200px] max-w-[250px]">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-900 truncate">{customer.name}</div>
                            <div className="text-sm text-slate-500 truncate">
                              {customer.occupation || 'Not specified'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 min-w-[180px] max-w-[220px]">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-slate-700">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-500">
                            <PhoneIcon className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 min-w-[140px]">
                        {customer.accountType === 'savings' && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 rounded-full text-xs font-medium">
                            SAVINGS
                          </Badge>
                        )}
                        {customer.accountType === 'current' && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                            CURRENT
                          </Badge>
                        )}
                        {customer.accountType === 'fd' && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1 rounded-full text-xs font-medium">
                            FIXED DEPOSIT
                          </Badge>
                        )}
                        {customer.accountType === 'rd' && (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1 rounded-full text-xs font-medium">
                            RECURRING
                          </Badge>
                        )}
                        {customer.accountType === 'loan' && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 px-3 py-1 rounded-full text-xs font-medium">
                            LOAN
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 min-w-[120px]">
                        <div className="text-sm font-semibold text-slate-900">
                          {customer.annualIncome ? `₹${(customer.annualIncome / 1000).toFixed(0)}K` : '—'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 min-w-[120px]">
                        <div className="text-sm text-slate-600">
                          {new Date(customer.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right min-w-[100px]">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(customer.id, customer.name)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                          >
                            <TrashIcon className="h-4 w-4" />
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
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelDelete}
          />
          <div className="relative bg-card rounded-lg shadow-lg max-w-md w-full mx-4 border">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-destructive/10 rounded-full mb-4">
                <TrashIcon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">
                Delete Customer
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">{showDeleteDialog.customerName}</span>? This action cannot be undone and all associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  variant="destructive"
                  className="flex-1"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
