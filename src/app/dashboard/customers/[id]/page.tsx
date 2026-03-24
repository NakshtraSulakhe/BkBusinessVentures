"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  PlusIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownIcon,
  ArrowUpIcon
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

export default function CustomerView() {
  const router = useRouter()
  const params = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerLedger, setCustomerLedger] = useState<any>(null)
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ show: boolean; customerId: string; customerName: string }>({ show: false, customerId: '', customerName: '' })
  
  // Ledger filtering states
  const [searchTerm, setSearchTerm] = useState('')
  const [transactionType, setTransactionType] = useState('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const fetchCustomerLedger = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}/ledger`)
      if (response.ok) {
        const data = await response.json()
        setCustomerLedger(data)
        setAllTransactions(data.recentTransactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch customer ledger:', error)
    }
  }

  const fetchAllTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(transactionType !== 'all' && { type: transactionType }),
        ...(dateFilter && { date: dateFilter }),
      })

      // Get all account IDs for this customer
      if (customerLedger?.accounts) {
        const accountIds = customerLedger.accounts.map((acc: any) => acc.id)
        if (accountIds.length > 0) {
          params.set('accountId', accountIds.join(','))
        }
      }

      const response = await fetch(`/api/transactions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAllTransactions(data.transactions || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (customerLedger) {
      fetchAllTransactions()
    }
  }, [currentPage, searchTerm, transactionType, accountFilter, dateFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleTransactionTypeFilter = (value: string) => {
    setTransactionType(value)
    setCurrentPage(1)
  }

  const handleAccountFilter = (value: string) => {
    setAccountFilter(value)
    setCurrentPage(1)
  }

  const handleDateFilter = (value: string) => {
    setDateFilter(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setTransactionType('all')
    setAccountFilter('all')
    setDateFilter('')
    setCurrentPage(1)
  }

  const getFilteredTransactions = () => {
    let filtered = allTransactions

    if (accountFilter !== 'all' && customerLedger?.accounts) {
      const filteredAccounts = customerLedger.accounts.filter((acc: any) => acc.accountType === accountFilter.toUpperCase())
      const filteredAccountIds = filteredAccounts.map((acc: any) => acc.id)
      filtered = filtered.filter(tx => filteredAccountIds.includes(tx.accountId))
    }

    return filtered
  }

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      console.log('=== API Request Started ===')
      console.log('Fetching customer with ID:', params.id)
      console.log('Request URL:', `/api/customers/${params.id}`)
      console.log('Timestamp:', new Date().toISOString())
      
      const response = await fetch(`/api/customers/${params.id}`)
      console.log('=== API Response Received ===')
      console.log('API Response status:', response.status)
      console.log('API Response statusText:', response.statusText)
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()))
      console.log('API Response type:', response.type)
      console.log('API Response url:', response.url)
      console.log('API Response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Customer data received:', data)
        setCustomer(data.customer)
      } else {
        console.log('=== API Error Response ===')
        const errorText = await response.text()
        console.error('API Response text:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || 'Customer not found' }
        }
        console.error('API Error:', errorData)
        showMessage(errorData.error || 'Customer not found', 'error')
        // Don't automatically redirect, let user decide
      }
    } catch (error) {
      console.log('=== Network Error ===')
      console.error('Failed to fetch customer:', error)
      console.error('Error type:', error instanceof Error ? error.constructor.name : 'Unknown')
      console.error('Error message:', error instanceof Error ? error.message : String(error))
      showMessage('Failed to fetch customer details. Please check your connection.', 'error')
      // Don't automatically redirect on network errors
    } finally {
      setLoading(false)
      console.log('=== API Request Completed ===')
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchCustomer()
      fetchCustomerLedger()
    }
  }, [params.id])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDelete = async () => {
    if (!customer) return
    setShowDeleteDialog({ show: true, customerId: customer.id, customerName: customer.name })
  }

  const confirmDelete = async () => {
    const { customerId, customerName } = showDeleteDialog
    setShowDeleteDialog({ show: false, customerId: '', customerName: '' })

    try {
      setLoading(true)
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showMessage(`${customerName} has been successfully deleted`, 'success')
        setTimeout(() => {
          router.push('/dashboard/customers')
        }, 2000)
      } else {
        const errorData = await response.json()
        showMessage(errorData.error || 'Failed to delete customer', 'error')
      }
    } catch (error) {
      console.error('Failed to delete customer:', error)
      showMessage('Failed to delete customer', 'error')
    } finally {
      setLoading(false)
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

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-green-100 text-green-700'
      case 'withdrawal': return 'bg-red-100 text-red-700'
      case 'interest': return 'bg-blue-100 text-blue-700'
      case 'disbursement': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownIcon className="h-4 w-4" />
      case 'withdrawal': return <ArrowUpIcon className="h-4 w-4" />
      case 'interest': return <CurrencyDollarIcon className="h-4 w-4" />
      case 'disbursement': return <CreditCardIcon className="h-4 w-4" />
      default: return <BookOpenIcon className="h-4 w-4" />
    }
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

  const filteredTransactions = getFilteredTransactions()

  if (loading && !customer) {
    return (
      <DashboardLayout>
        <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!customer && !loading) {
    return (
      <DashboardLayout>
        <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center max-w-md">
            <UserIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Customer not found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The customer you're looking for doesn't exist or may have been deleted.
            </p>
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}
            <div className="mt-6 space-y-3">
              <Button
                onClick={() => router.push('/dashboard/customers')}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Back to Customers
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="ml-3"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Customer Details</h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  View and manage customer information
                </p>
              </div>
            </div>
            {customer && (
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="px-3 py-1.5 bg-white/80 backdrop-blur-sm border-green-200 text-green-700">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  KYC Compliant
                </Badge>
                <Button
                  onClick={() => router.push(`/dashboard/accounts/create?customerId=${customer.id}`)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg h-12 px-6"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Account
                </Button>
                <Button
                  onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg h-12 px-6"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit Customer
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg h-12 px-6"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            )}
          </div>

          {customer && (
            <>
              {/* Customer Info Header */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                    <p className="text-gray-600">{customer.occupation || 'Not specified'}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge className={`text-xs font-semibold px-3 py-1 ${getAccountTypeColor(customer.accountType)}`}>
                        <span className="mr-1.5">{getAccountTypeIcon(customer.accountType)}</span>
                        {customer.accountType.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Customer since {new Date(customer.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                      <p className="text-gray-500">Basic customer details and contact information</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-semibold text-gray-900 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {customer.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-semibold text-gray-900 flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {customer.phone}
                      </p>
                    </div>
                    {customer.dateOfBirth && (
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-semibold text-gray-900 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(customer.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                      <MapPinIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Address Information</h3>
                      <p className="text-gray-500">Residential and mailing details</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Street Address</p>
                      <p className="font-semibold text-gray-900">{customer.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-semibold text-gray-900">{customer.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-semibold text-gray-900">{customer.state}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ZIP Code</p>
                      <p className="font-semibold text-gray-900">{customer.zipCode}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <BuildingOfficeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Professional Details</h3>
                      <p className="text-gray-500">Work and income information</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Occupation</p>
                      <p className="font-semibold text-gray-900">{customer.occupation || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Annual Income</p>
                      <p className="font-semibold text-gray-900 flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {customer.annualIncome > 0 
                          ? `₹${customer.annualIncome.toLocaleString()}` 
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Type</p>
                      <Badge className={`text-xs font-semibold px-3 py-1 ${getAccountTypeColor(customer.accountType)}`}>
                        <span className="mr-1.5">{getAccountTypeIcon(customer.accountType)}</span>
                        {customer.accountType.toUpperCase()}
                      </Badge>
                    </div>
                    {customer.purpose && (
                      <div>
                        <p className="text-sm text-gray-500">Purpose</p>
                        <p className="font-semibold text-gray-900">{customer.purpose}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Identity Verification */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mt-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Identity Verification</h3>
                    <p className="text-gray-500">Government-issued identification</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="font-semibold text-gray-900 flex items-center">
                      <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {customer.panNumber || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Aadhaar Number</p>
                    <p className="font-semibold text-gray-900 flex items-center">
                      <ShieldCheckIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {customer.aadhaarNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comprehensive Ledger Section */}
              {customerLedger && (
                <div className="space-y-6 mt-6">
                  {/* Ledger Filters */}
                  <Card className="bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        Transaction Filters
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
                              placeholder="Search transactions..."
                              value={searchTerm}
                              onChange={(e) => handleSearch(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Transaction Type
                          </label>
                          <Select value={transactionType} onValueChange={handleTransactionTypeFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="deposit">Deposits</SelectItem>
                              <SelectItem value="withdrawal">Withdrawals</SelectItem>
                              <SelectItem value="interest">Interest</SelectItem>
                              <SelectItem value="disbursement">Disbursements</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Type
                          </label>
                          <Select value={accountFilter} onValueChange={handleAccountFilter}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Accounts</SelectItem>
                              <SelectItem value="fd">FD Accounts</SelectItem>
                              <SelectItem value="rd">RD Accounts</SelectItem>
                              <SelectItem value="loan">Loan Accounts</SelectItem>
                            </SelectContent>
                          </Select>
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

                  {/* Transaction Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 text-sm font-medium">Total Credits</p>
                            <p className="text-2xl font-bold text-green-900">
                              {formatCurrency(
                                filteredTransactions
                                  .filter(tx => ['deposit', 'interest'].includes(tx.type))
                                  .reduce((sum, tx) => sum + tx.amount, 0)
                              )}
                            </p>
                          </div>
                          <ArrowDownIcon className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-red-600 text-sm font-medium">Total Debits</p>
                            <p className="text-2xl font-bold text-red-900">
                              {formatCurrency(
                                filteredTransactions
                                  .filter(tx => ['withdrawal', 'disbursement'].includes(tx.type))
                                  .reduce((sum, tx) => sum + tx.amount, 0)
                              )}
                            </p>
                          </div>
                          <ArrowUpIcon className="h-8 w-8 text-red-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">Net Balance</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {formatCurrency(
                                filteredTransactions.reduce((sum, tx) => {
                                  if (['deposit', 'interest'].includes(tx.type)) return sum + tx.amount
                                  if (['withdrawal', 'disbursement'].includes(tx.type)) return sum - tx.amount
                                  return sum
                                }, 0)
                              )}
                            </p>
                          </div>
                          <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 text-sm font-medium">Transactions</p>
                            <p className="text-2xl font-bold text-purple-900">{filteredTransactions.length}</p>
                          </div>
                          <BookOpenIcon className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Ledger Table */}
                  <Card className="bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold flex items-center">
                          <BookOpenIcon className="h-5 w-5 mr-2" />
                          Transaction Ledger
                        </CardTitle>
                        <Badge variant="outline">
                          {filteredTransactions.length} transactions
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-12">
                          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
                          <div className="mt-6">
                            <Button
                              onClick={clearFilters}
                              variant="outline"
                            >
                              Clear Filters
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredTransactions.map((transaction: any) => (
                                <TableRow key={transaction.id} className="hover:bg-gray-50/50">
                                  <TableCell>
                                    <div className="flex items-center">
                                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                      {formatDate(transaction.createdAt)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <span className="mr-2">{getAccountTypeIcon(transaction.account.accountType)}</span>
                                      <div>
                                        <div className="font-medium text-gray-900">{transaction.account.accountNumber}</div>
                                        <Badge className={`text-xs mt-1 ${getAccountTypeColor(transaction.account.accountType)}`}>
                                          {transaction.account.accountType}
                                        </Badge>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-xs ${getTransactionTypeColor(transaction.type)}`}>
                                      <span className="mr-1">{getTransactionIcon(transaction.type)}</span>
                                      {transaction.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="max-w-xs truncate" title={transaction.description}>
                                      {transaction.description || '-'}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                      {transaction.reference || 'N/A'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {['deposit', 'interest'].includes(transaction.type) && (
                                      <span className="font-semibold text-green-600">
                                        +{formatCurrency(transaction.amount)}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {['withdrawal', 'disbursement'].includes(transaction.type) && (
                                      <span className="font-semibold text-red-600">
                                        -{formatCurrency(transaction.amount)}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-gray-900">
                                    {formatCurrency(transaction.balance)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Pagination */}
                      {pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                          <div className="text-sm text-gray-700">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                            {pagination.total} transactions
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
              )}
            </>
          )}

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
        </div>
      </div>
    </DashboardLayout>
  )
}
