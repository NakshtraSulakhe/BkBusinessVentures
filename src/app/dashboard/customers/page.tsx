"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  SparklesIcon
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
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          {/* Success/Error Message */}
          {message && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center space-x-3 animate-in slide-in-from-right duration-300 max-w-md ${
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Customer Master
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                Manage customer information and accounts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1.5 bg-white/80 backdrop-blur-sm border-green-200 text-green-700">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                KYC Compliant
              </Badge>
              <Button
                onClick={() => router.push('/dashboard/customers/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg h-12 px-6"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Customer
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
                  <p className="text-xs text-gray-500 mt-2">All registered users</p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <UserIcon className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Savings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {customers.filter(c => c.accountType === 'savings').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Active accounts</p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Fixed Deposits</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {customers.filter(c => c.accountType === 'fd').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Investment accounts</p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Loans</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {customers.filter(c => c.accountType === 'loan').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Active loans</p>
                </div>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💳</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search customers by name, email, phone, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base bg-white/80 backdrop-blur-sm border border-gray-200/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <div className="flex items-center space-x-3">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filterAccountType}
                  onChange={(e) => setFilterAccountType(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200/50 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 h-12 text-base"
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
          </div>

          {/* Customer Table */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
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
                      className="border border-gray-200/50 bg-white/80 hover:bg-white hover:shadow-sm transition-all h-10 px-4"
                    >
                      Clear selection
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 pb-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="ml-4 text-gray-600 text-base">Loading customers...</p>
                </div>
              ) : filteredAndSortedCustomers.length === 0 ? (
                <div className="text-center py-16">
                  <UserIcon className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No customers found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchTerm || filterAccountType !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Get started by creating a new customer'}
                  </p>
                  <div className="mt-8">
                    <Button
                      onClick={() => router.push('/dashboard/customers/create')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-6 shadow-lg"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      New Customer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200/50">
                        <TableHead className="w-12 py-4">
                          <Checkbox
                            checked={selectedCustomers.length === filteredAndSortedCustomers.length && filteredAndSortedCustomers.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-[300px] py-4">
                          <button
                            onClick={() => handleSort('name')}
                            className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                          >
                            Customer
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[200px] py-4">
                          <button
                            onClick={() => handleSort('email')}
                            className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                          >
                            Contact
                            {sortField === 'email' && (
                              sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[150px] py-4">
                          <button
                            onClick={() => handleSort('city')}
                            className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                          >
                            Location
                            {sortField === 'city' && (
                              sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[120px] py-4">
                          <button
                            onClick={() => handleSort('accountType')}
                            className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                          >
                            Account Type
                            {sortField === 'accountType' && (
                              sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[120px] py-4">
                          <button
                            onClick={() => handleSort('annualIncome')}
                            className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                          >
                            Income
                            {sortField === 'annualIncome' && (
                              sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[100px] py-4">
                          <button
                            onClick={() => handleSort('createdAt')}
                            className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                          >
                            Created
                            {sortField === 'createdAt' && (
                              sortDirection === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[80px] text-right py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedCustomers.map((customer, index) => (
                        <TableRow 
                          key={customer.id} 
                          className={`border-b border-gray-200/30 hover:bg-blue-50/30 transition-colors ${
                            selectedCustomers.includes(customer.id) ? 'bg-blue-50/50' : ''
                          } ${index === 0 ? 'border-t-0' : ''}`}
                        >
                          <TableCell className="py-4">
                            <Checkbox
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="text-white font-semibold text-sm">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 truncate">{customer.name}</div>
                                <div className="text-sm text-gray-500 truncate">
                                  {customer.occupation || 'Not specified'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-900">
                                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                <span>{customer.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center text-sm text-gray-900">
                              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{customer.city}, {customer.state}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge className={`text-xs font-semibold px-3 py-1 ${getAccountTypeColor(customer.accountType)}`}>
                              <span className="mr-1.5">{getAccountTypeIcon(customer.accountType)}</span>
                              {customer.accountType.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {customer.annualIncome ? `₹${(customer.annualIncome / 1000).toFixed(0)}K` : '—'}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-500">
                              {new Date(customer.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                                className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
                                className="h-9 w-9 p-0 hover:bg-green-50 hover:text-green-600 transition-colors rounded-lg"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(customer.id, customer.name)}
                                className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg"
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
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={cancelDelete}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Customer
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{showDeleteDialog.customerName}</span>? This action cannot be undone and all associated data will be permanently removed.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="flex-1 h-11 border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 h-11 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg"
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
