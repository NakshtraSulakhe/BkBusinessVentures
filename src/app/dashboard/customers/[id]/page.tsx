"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { isCreditTransaction, normalizeTransactionType } from "@/lib/accounting-rules"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
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
  PlusIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BriefcaseIcon,
  HomeIcon,
  FingerPrintIcon
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
  const { token } = useAuth()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerLedger, setCustomerLedger] = useState<any>(null)
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ show: boolean; customerId: string; customerName: string }>({ show: false, customerId: '', customerName: '' })

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [transactionType, setTransactionType] = useState('all')
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
      const response = await fetchWithAuth(`/api/customers/${params.id}/ledger`, { token })
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
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(transactionType !== 'all' && { type: transactionType }),
        ...(dateFilter && { date: dateFilter }),
      })

      // If a specific account is selected, filter by that account
      if (selectedAccountId) {
        queryParams.set('accountId', selectedAccountId)
      } else if (customerLedger?.accounts) {
        // Otherwise, filter by all customer accounts
        const accountIds = customerLedger.accounts.map((acc: any) => acc.id)
        if (accountIds.length > 0) {
          queryParams.set('accountId', accountIds.join(','))
        }
      }

      const response = await fetchWithAuth(`/api/transactions?${queryParams}`, { token })
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
  }, [currentPage, searchTerm, transactionType, dateFilter, customerLedger, selectedAccountId])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth(`/api/customers/${params.id}`, { token })
      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
      } else {
        showMessage('Customer not found', 'error')
      }
    } catch (error) {
      showMessage('Failed to fetch customer details', 'error')
    } finally {
      setLoading(false)
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
      const response = await fetchWithAuth(`/api/customers/${customerId}`, {
        method: 'DELETE',
        token
      })

      if (response.ok) {
        showMessage(`${customerName} deleted successfully`, 'success')
        setTimeout(() => router.push('/dashboard/customers'), 2000)
      } else {
        const errorData = await response.json()
        showMessage(errorData.error || 'Failed to delete customer', 'error')
      }
    } catch (error) {
      showMessage('Failed to delete customer', 'error')
    } finally {
      setLoading(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteDialog({ show: false, customerId: '', customerName: '' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    // Use fixed format to avoid hydration mismatch between server/client locales
    const day = date.getDate().toString().padStart(2, '0')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const getAccountTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'savings': return 'badge-type-savings'
      case 'current': return 'badge-type-current'
      case 'fd': return 'badge-type-fd'
      case 'rd': return 'badge-type-rd'
      case 'loan': return 'badge-type-loan'
      default: return 'badge-type-current'
    }
  }

  if (loading && !customer) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading profile details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!customer && !loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
            <UserIcon className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Customer not found</h2>
          <p className="text-slate-500 mt-2 max-w-xs">The profile may have been deleted or the ID is incorrect.</p>
          <Button onClick={() => router.push('/dashboard/customers')} className="mt-8 finance-gradient-primary">
            Back to Customers
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Page Header */}
        <PageHeader
          title="Customer Profile"
          subtitle="Comprehensive view of client data and activity"
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/customers')}
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 transition-all font-medium"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/customers/${customer?.id}/edit`)}
                className="h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-xl px-4 font-bold transition-all shadow-sm"
              >
                <PencilIcon className="h-3.5 w-3.5 mr-2" />
                Edit Profile
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="h-9 border-rose-100 text-rose-600 hover:bg-rose-50 rounded-xl px-4 font-bold transition-all"
              >
                <TrashIcon className="h-3.5 w-3.5 mr-2" />
                Delete
              </Button>
            </div>
          }
        />

        {/* Global Alert Notification */}
        {message && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mt-0.5" /> : <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />}
            <div className="text-sm font-bold">{message.text}</div>
          </div>
        )}

        {/* Profile Card Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <UserIcon className="h-32 w-32" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-20 w-20 rounded-3xl finance-gradient-primary flex items-center justify-center shadow-md shadow-primary/20 text-white text-3xl font-black">
              {customer?.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{customer?.name}</h1>
                <Badge className={getAccountTypeBadgeClass(customer?.accountType || 'savings')}>
                  {customer?.accountType.toUpperCase()}
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-2 py-0.5 text-[10px] uppercase">KYC Verified</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-6">
                <div className="flex items-center text-slate-500 text-sm">
                  <EnvelopeIcon className="h-4 w-4 mr-2 opacity-60" />
                  {customer?.email}
                </div>
                <div className="flex items-center text-slate-500 text-sm">
                  <PhoneIcon className="h-4 w-4 mr-2 opacity-60" />
                  {customer?.phone}
                </div>
                <div className="flex items-center text-slate-500 text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 opacity-60" />
                  ID: #{customer?.id.slice(-8).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Linked Balance</p>
              <p className="text-2xl font-black text-primary tracking-tight">
                {customerLedger ? formatCurrency(customerLedger.financialSummary.netWorth) : '₹0'}
              </p>
            </div>
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity & Personal */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <FingerPrintIcon className="h-4 w-4 mr-2 text-primary" />
                Identity & Details
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="group">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">PAN Number</p>
                <p className="text-sm font-semibold text-slate-900">{customer?.panNumber || '—'}</p>
              </div>
              <div className="group">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Aadhaar Number</p>
                <p className="text-sm font-semibold text-slate-900">{customer?.aadhaarNumber || '—'}</p>
              </div>
              <div className="group">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Date of Birth</p>
                <p className="text-sm font-semibold text-slate-900">{customer?.dateOfBirth ? formatDate(customer.dateOfBirth) : '—'}</p>
              </div>
              <div className="group pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Registration Date</p>
                <p className="text-sm font-medium text-slate-600 italic">{customer?.createdAt ? formatDate(customer.createdAt) : '—'}</p>
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <HomeIcon className="h-4 w-4 mr-2 text-primary" />
                Address Info
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="group">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Address Line</p>
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">{customer?.address || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">City</p>
                  <p className="text-sm font-semibold text-slate-900">{customer?.city || '—'}</p>
                </div>
                <div className="group">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Postal Code</p>
                  <p className="text-sm font-semibold text-slate-900">{customer?.zipCode || '—'}</p>
                </div>
              </div>
              <div className="group">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">State / Province</p>
                <p className="text-sm font-semibold text-slate-900">{customer?.state || '—'}</p>
              </div>
            </div>
          </div>

          {/* Professional & Purpose */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <BriefcaseIcon className="h-4 w-4 mr-2 text-primary" />
                Occupation & Income
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="group">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Designation</p>
                <p className="text-sm font-semibold text-slate-900">{customer?.occupation || '—'}</p>
              </div>
              <div className="group">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Reporting Income</p>
                <p className="text-sm font-semibold text-slate-900">{customer?.annualIncome ? formatCurrency(customer.annualIncome) + ' / YR' : '—'}</p>
              </div>
              <div className="group">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Engagement Purpose</p>
                <p className="text-sm font-semibold text-slate-900">{customer?.purpose || 'General Banking'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Section - Grouped by Type */}
        {customerLedger?.accounts && customerLedger.accounts.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Accounts</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {selectedAccountId ? 'Showing transactions for selected account' : 'Showing transactions for all accounts'}
                </p>
              </div>
              {selectedAccountId && (
                <Button
                  onClick={() => setSelectedAccountId(null)}
                  variant="outline"
                  size="sm"
                  className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium"
                >
                  Show All Accounts
                </Button>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {(() => {
                const fdAccounts = customerLedger.accounts.filter((acc: any) => acc.accountType?.toUpperCase() === 'FD')
                const rdAccounts = customerLedger.accounts.filter((acc: any) => acc.accountType?.toUpperCase() === 'RD')
                const loanAccounts = customerLedger.accounts.filter((acc: any) => acc.accountType?.toUpperCase() === 'LOAN')

                return (
                  <>
                    {fdAccounts.length > 0 && (
                      <div className="p-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <BuildingLibraryIcon className="h-3 w-3" />
                          Fixed Deposits ({fdAccounts.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {fdAccounts.map((account: any) => (
                            <div
                              key={account.id}
                              onClick={() => setSelectedAccountId(account.id)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                selectedAccountId === account.id
                                  ? 'bg-primary/5 border-primary shadow-sm'
                                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{account.accountNumber}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">FD Account</p>
                                </div>
                                {selectedAccountId === account.id && (
                                  <CheckCircleIcon className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-black text-slate-900">{formatCurrency(account.principalAmount)}</span>
                                <span className="text-[10px] text-slate-500">@ {account.interestRate}%</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">{account.tenure} months</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {rdAccounts.length > 0 && (
                      <div className="p-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CreditCardIcon className="h-3 w-3" />
                          Recurring Deposits ({rdAccounts.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {rdAccounts.map((account: any) => (
                            <div
                              key={account.id}
                              onClick={() => setSelectedAccountId(account.id)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                selectedAccountId === account.id
                                  ? 'bg-primary/5 border-primary shadow-sm'
                                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{account.accountNumber}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">RD Account</p>
                                </div>
                                {selectedAccountId === account.id && (
                                  <CheckCircleIcon className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-black text-slate-900">{formatCurrency(account.principalAmount)}</span>
                                <span className="text-[10px] text-slate-500">@ {account.interestRate}%</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">{account.tenure} months</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {loanAccounts.length > 0 && (
                      <div className="p-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CurrencyDollarIcon className="h-3 w-3" />
                          Loans ({loanAccounts.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {loanAccounts.map((account: any) => (
                            <div
                              key={account.id}
                              onClick={() => setSelectedAccountId(account.id)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                selectedAccountId === account.id
                                  ? 'bg-primary/5 border-primary shadow-sm'
                                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{account.accountNumber}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Loan Account</p>
                                </div>
                                {selectedAccountId === account.id && (
                                  <CheckCircleIcon className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-black text-slate-900">{formatCurrency(account.principalAmount)}</span>
                                <span className="text-[10px] text-slate-500">@ {account.interestRate}%</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">{account.tenure} months</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* Financial Activity - Tabs Style */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {selectedAccountId ? 'Account Transaction Ledger' : 'Comprehensive Transaction Ledger'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {selectedAccountId
                  ? `Showing transactions for selected account only`
                  : 'Monitoring all linked account activities'
                }
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9 h-8 w-48 text-xs bg-slate-50 border-slate-100 rounded-lg"
                  placeholder="Filter by ref ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger className="h-8 w-32 text-xs bg-slate-50 border-slate-100 rounded-lg capitalize">
                  <SelectValue placeholder="All Activity" />
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
          </div>

          <div className="min-h-[300px] overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 px-6 tracking-widest">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">Type</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">Account & Ref</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">Description</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 text-right tracking-widest">Amount</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 text-right pr-6 tracking-widest">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center">
                      <p className="text-xs text-slate-400 italic">No transaction records found for this client.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  (() => {
                    // Sort transactions chronologically (oldest first) for proper running balance
                    const sortedTx = [...allTransactions].sort((a, b) => 
                      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    )
                    // Calculate running balance for each transaction
                    let runningBal = 0
                    const txWithBalance = sortedTx.map(tx => {
                      runningBal += isCreditTransaction(normalizeTransactionType(tx.type)) ? tx.amount : -tx.amount
                      return { ...tx, displayBalance: runningBal }
                    })
                    return txWithBalance.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-900">{formatDate(tx.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${
                            isCreditTransaction(normalizeTransactionType(tx.type)) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {isCreditTransaction(normalizeTransactionType(tx.type)) ? <ArrowDownIcon className="h-3 w-3" /> : <ArrowUpIcon className="h-3 w-3" />}
                          </div>
                          <span className="text-xs font-bold text-slate-700 capitalize">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[10px] font-black text-primary uppercase tracking-tighter mb-0.5">{tx.account?.accountType || 'ACC'}</div>
                        <div className="text-[10px] text-slate-400 font-medium font-mono">{tx.account?.accountNumber || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-600 max-w-[200px] truncate">{tx.description || 'System transaction'}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`text-sm font-black tracking-tight ${
                          isCreditTransaction(normalizeTransactionType(tx.type)) ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isCreditTransaction(normalizeTransactionType(tx.type)) ? '+' : '-'}{formatCurrency(tx.amount)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className={`text-sm font-bold tabular-nums ${
                          tx.displayBalance >= 0 ? 'text-slate-800' : 'text-rose-600'
                        }`}>
                          {formatCurrency(tx.displayBalance)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))})()
                )}
              </TableBody>
            </Table>
          </div>

          {/* Modal Overlay for Delete */}
          {showDeleteDialog.show && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
                  <TrashIcon className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Delete Client Profile?</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  You are about to permanently delete <span className="font-bold text-slate-900">{showDeleteDialog.customerName}</span>. This action will also terminate all linked account visibility. This cannot be undone.
                </p>
                <div className="flex gap-3 mt-8">
                  <Button variant="outline" className="flex-1 rounded-xl h-10 border-slate-200" onClick={cancelDelete}>Cancel</Button>
                  <Button className="flex-1 rounded-xl h-10 bg-rose-600 hover:bg-rose-700 text-white font-bold" onClick={confirmDelete}>Confirm Delete</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
