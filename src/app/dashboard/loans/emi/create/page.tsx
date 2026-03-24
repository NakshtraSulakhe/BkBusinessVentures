"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
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
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  InformationCircleIcon,
  SparklesIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface LoanAccount {
  id: string
  accountNumber: string
  customerId: string
  principalAmount: number
  interestRate: number
  tenure: number
  startDate: string
  accountType: string
  customer: {
    name: string
    email: string
  }
  accountRules?: {
    emiAmount: number
    emiDueDay: number
    gracePeriodDays: number
    penaltyRate: number
  }
  _count?: {
    transactions: number
  }
}

interface CustomerBalance {
  totalDeposits: number
  totalLoans: number
  netWorth: number
  fdAccounts: any[]
  rdAccounts: any[]
  loanAccounts: any[]
}

function CreateEMIComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedAccount, setSelectedAccount] = useState<LoanAccount | null>(null)
  const [customerBalance, setCustomerBalance] = useState<CustomerBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    accountId: searchParams.get('accountId') || '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as 'cash' | 'bank' | 'cheque' | 'online',
    referenceNumber: '',
    notes: '',
    penaltyAmount: '0'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const fetchCustomerBalance = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/ledger`)
      if (response.ok) {
        const data = await response.json()
        setCustomerBalance({
          totalDeposits: data.financialSummary.totalDeposits,
          totalLoans: data.financialSummary.totalLoans,
          netWorth: data.financialSummary.netWorth,
          fdAccounts: data.accounts.filter((acc: any) => acc.accountType === 'FD'),
          rdAccounts: data.accounts.filter((acc: any) => acc.accountType === 'RD'),
          loanAccounts: data.accounts.filter((acc: any) => acc.accountType === 'LOAN')
        })
      }
    } catch (error) {
      console.error('Failed to fetch customer balance:', error)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (formData.accountId && customers.length > 0) {
      const customer = customers.find(c => c.id === formData.accountId)
      if (customer) {
        // Create a mock loan account for the customer
        const mockLoanAccount: LoanAccount = {
          id: customer.id,
          accountNumber: `LOAN-${customer.id}`,
          customerId: customer.id,
          principalAmount: 100000,
          interestRate: 12.5,
          tenure: 24,
          startDate: new Date().toISOString(),
          accountType: 'LOAN',
          customer: {
            name: customer.name,
            email: customer.email
          },
          accountRules: {
            emiAmount: 5000,
            emiDueDay: 5,
            gracePeriodDays: 3,
            penaltyRate: 2
          }
        }
        setSelectedAccount(mockLoanAccount)
        
        // Pre-fill EMI amount if available
        if (mockLoanAccount.accountRules?.emiAmount) {
          setFormData(prev => ({ 
            ...prev, 
            amount: mockLoanAccount.accountRules?.emiAmount?.toString() || '' 
          }))
        }
        
        // Fetch customer balance data
        fetchCustomerBalance(customer.id)
      } else {
        setSelectedAccount(null)
        setCustomerBalance(null)
      }
    }
  }, [formData.accountId, customers])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.accountId) newErrors.accountId = 'Loan account is required'
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculatePenalty = () => {
    if (!selectedAccount || !selectedAccount.accountRules) return 0
    
    const dueDay = selectedAccount.accountRules.emiDueDay
    const graceDays = selectedAccount.accountRules.gracePeriodDays
    const penaltyRate = selectedAccount.accountRules.penaltyRate
    
    const paymentDate = new Date(formData.paymentDate)
    const currentMonth = paymentDate.getMonth()
    const currentYear = paymentDate.getFullYear()
    const dueDate = new Date(currentYear, currentMonth, dueDay)
    
    if (paymentDate > dueDate) {
      const daysLate = Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 24))
      const gracePeriodDaysLate = daysLate - graceDays
      
      if (gracePeriodDaysLate > 0) {
        const emiAmount = parseFloat(formData.amount || '0')
        return (emiAmount * penaltyRate / 100) * (gracePeriodDaysLate / 30)
      }
    }
    
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      const penalty = calculatePenalty()
      const totalAmount = parseFloat(formData.amount || '0') + penalty
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: formData.accountId,
          type: 'deposit', // EMI payment is recorded as deposit
          amount: totalAmount,
          description: `EMI payment${penalty > 0 ? ` (includes ₹${penalty.toFixed(2)} penalty)` : ''}`,
          reference: formData.referenceNumber || `EMI-${new Date().toISOString().split('T')[0]}`
        }),
      })

      if (response.ok) {
        showMessage('EMI payment recorded successfully', 'success')
        setTimeout(() => {
          router.push('/dashboard/loans')
        }, 2000)
      } else {
        const errorData = await response.json()
        showMessage(errorData.error || 'Failed to record EMI payment', 'error')
      }
    } catch (error) {
      console.error('Failed to record EMI payment:', error)
      showMessage('Failed to record EMI payment', 'error')
    } finally {
      setLoading(false)
    }
  }

  const penalty = calculatePenalty()
  const totalAmount = parseFloat(formData.amount || '0') + penalty

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Message */}
          {message && (
            <div className={cn(
              "rounded-xl p-4 flex items-start space-x-3 shadow-sm border mb-6",
              message.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800'
            )}>
              <div className={cn(
                "flex-shrink-0",
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              )}>
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
                className={cn(
                  "flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors",
                  "lg:hidden"
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/loans')}
                className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  Record EMI Payment
                </h1>
                <p className="text-gray-600 mt-1 sm:mt-2 flex items-center text-sm sm:text-base">
                  <DocumentTextIcon className="h-4 w-4 mr-2 text-blue-500 hidden sm:inline flex-shrink-0" />
                  <span className="hidden sm:inline">Record EMI payment for loan account</span>
                  <span className="sm:hidden">EMI Payment</span>
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loan Account Selection */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BuildingLibraryIcon className="h-5 w-5 mr-2" />
                    Loan Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Loan Account <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.accountId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: value }))}
                    >
                      <SelectTrigger className={errors.accountId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Choose a loan account..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex flex-col items-start w-full">
                              <span className="font-medium text-gray-900">{customer.name}</span>
                              <span className="text-sm text-gray-500">{customer.email}</span>
                              <div className="text-xs text-gray-400 mt-1">
                                ID: {customer.id}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.accountId && (
                      <p className="text-red-500 text-sm mt-1">{errors.accountId}</p>
                    )}
                  </div>

                  {/* Customer Balance Information */}
                  {customerBalance && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                      <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                        Customer Balance Summary
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-purple-600 text-sm font-medium">Total Deposits</p>
                          <p className="text-2xl font-bold text-purple-900">
                            ₹{customerBalance.totalDeposits.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-600 text-sm font-medium">Total Loans</p>
                          <p className="text-2xl font-bold text-red-600">
                            ₹{customerBalance.totalLoans.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-purple-600 text-sm font-medium">Net Worth</p>
                          <p className={cn(
                            "text-2xl font-bold",
                            customerBalance.netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            ₹{customerBalance.netWorth.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-purple-600 text-sm font-medium">Accounts</p>
                        <div className="flex justify-center space-x-2 text-xs">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {customerBalance.fdAccounts.length}
                          </span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            {customerBalance.rdAccounts.length}
                          </span>
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                            {customerBalance.loanAccounts.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Account Details */}
                  {selectedAccount && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-lg font-semibold text-blue-800 mb-3">Selected Account Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Account Number</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedAccount.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Customer</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedAccount.customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Principal</span>
                          <span className="text-sm font-semibold text-gray-900">₹{selectedAccount.principalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Interest Rate</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedAccount.interestRate}%</span>
                        </div>
                      </div>
                      {selectedAccount.accountRules?.emiAmount && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">EMI Amount</span>
                          <span className="text-sm font-semibold text-blue-600">₹{selectedAccount.accountRules.emiAmount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      EMI Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className={errors.amount ? 'border-red-500' : ''}
                      placeholder="Enter EMI amount"
                    />
                    {errors.amount && (
                      <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                      className={errors.paymentDate ? 'border-red-500' : ''}
                    />
                    {errors.paymentDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, paymentMethod: value as 'cash' | 'bank' | 'cheque' | 'online' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number
                    </label>
                    <Input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                      placeholder="Transaction reference (optional)"
                    />
                  </div>

                  {/* Penalty and Total Amount */}
                  {penalty > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        Late Payment Penalty
                      </p>
                      <p className="text-red-800 font-bold">
                        ₹{penalty.toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm font-medium">
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Total Amount
                    </p>
                    <p className="text-green-800 font-bold">
                      ₹{totalAmount.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <InformationCircleIcon className="h-5 w-5 mr-2" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add any notes about this payment..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/loans')}
                className="w-full sm:w-auto h-12 px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span>Recording Payment...</span>
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Record EMI Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function CreateEMI() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateEMIComponent />
    </Suspense>
  )
}
