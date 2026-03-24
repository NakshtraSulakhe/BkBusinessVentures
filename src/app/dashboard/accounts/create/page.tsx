"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CustomerSelectionTab, AccountDetailsTab, AccountRulesTab, ReviewTab } from "@/components/account-tabs"
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
  CalculatorIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  BanknotesIcon,
  UsersIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  occupation?: string
  annualIncome?: number
}

interface AccountSummary {
  type: string
  principal: number
  interest: number
  maturity: number
  emi?: number
  totalPayable?: number
}

interface FormProgress {
  customer: boolean
  account: boolean
  rules: boolean
  review: boolean
}

export default function CreateAccount() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null)
  const [activeTab, setActiveTab] = useState<'customer' | 'account' | 'rules' | 'review'>('customer')
  const [progress, setProgress] = useState<FormProgress>({
    customer: false,
    account: false,
    rules: false,
    review: false
  })
  const [showCalculator, setShowCalculator] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    customerId: searchParams.get('customerId') || '',
    accountType: 'FD',
    principalAmount: '',
    interestRate: '',
    tenure: '',
    startDate: new Date().toISOString().split('T')[0],
    numberingTemplateId: '', // Add numbering template
    // FD specific fields
    interestMode: 'monthly' as 'monthly' | 'maturity-only',
    payoutMode: 'reinvest' as 'reinvest' | 'paid-out',
    // RD specific fields
    monthlyInstallment: '',
    interestMethod: 'installment_weighted' as 'installment_weighted' | 'monthly_balance',
    rdBalanceDateRule: 'month_end' as 'month_end' | 'fixed_day',
    rdBalanceDay: '10',
    // Loan specific fields
    loanMethod: 'reducing' as 'flat' | 'reducing',
    emiDueDay: '1',
    gracePeriodDays: '0',
    penaltyRate: '1.0',
    // Common fields
    roundingMode: 'nearest' as 'nearest' | 'up' | 'down',
    roundingPrecision: '2'
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

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedCustomer(data.customer)
      }
    } catch (error) {
      console.error('Failed to fetch customer details:', error)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (formData.customerId) {
      fetchCustomerDetails(formData.customerId)
      setProgress(prev => ({ ...prev, customer: true }))
    } else {
      setSelectedCustomer(null)
      setProgress(prev => ({ ...prev, customer: false }))
    }
  }, [formData.customerId])

  useEffect(() => {
    // Update progress based on form data
    const accountComplete = formData.accountType && 
      (formData.principalAmount || formData.monthlyInstallment) && 
      formData.interestRate && 
      formData.tenure && 
      formData.startDate
    
    setProgress(prev => ({ ...prev, account: !!accountComplete }))
    
    // Calculate account summary
    if (accountComplete) {
      calculateAccountSummary()
    }
  }, [formData])

  const calculateAccountSummary = () => {
    if (!formData.accountType) return

    const principal = formData.accountType === 'RD' 
      ? parseFloat(formData.monthlyInstallment || '0') * parseInt(formData.tenure || '0')
      : parseFloat(formData.principalAmount || '0')
    
    const rate = parseFloat(formData.interestRate || '0')
    const tenure = parseInt(formData.tenure || '0')
    
    let summary: AccountSummary = {
      type: formData.accountType,
      principal,
      interest: 0,
      maturity: principal
    }

    if (formData.accountType === 'FD') {
      // Simple interest for FD
      summary.interest = principal * (rate / 100) * (tenure / 12)
      summary.maturity = principal + summary.interest
    } else if (formData.accountType === 'RD') {
      // Compound interest for RD (simplified)
      summary.interest = principal * (rate / 100) * (tenure / 12) * 0.5 // Approximation
      summary.maturity = principal + summary.interest
    } else if (formData.accountType === 'LOAN') {
      // EMI calculation
      const monthlyRate = rate / 12 / 100
      const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1)
      summary.emi = isNaN(emi) ? 0 : emi
      summary.totalPayable = emi * tenure
      summary.interest = summary.totalPayable - principal
    }

    setAccountSummary(summary)
  }

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerId) newErrors.customerId = 'Customer is required'
    if (!formData.accountType) newErrors.accountType = 'Account type is required'

    // Common validations
    if (!formData.principalAmount || parseFloat(formData.principalAmount) <= 0) {
      newErrors.principalAmount = 'Principal amount must be greater than 0'
    }
    if (!formData.interestRate || parseFloat(formData.interestRate) <= 0 || parseFloat(formData.interestRate) > 100) {
      newErrors.interestRate = 'Interest rate must be between 0 and 100'
    }
    if (!formData.tenure || parseInt(formData.tenure) <= 0) {
      newErrors.tenure = 'Tenure must be greater than 0'
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required'

    // Account type specific validations
    if (formData.accountType === 'RD' && (!formData.monthlyInstallment || parseFloat(formData.monthlyInstallment) <= 0)) {
      newErrors.monthlyInstallment = 'Monthly installment must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateMaturityDate = () => {
    if (formData.startDate && formData.tenure) {
      const startDate = new Date(formData.startDate)
      const tenureMonths = parseInt(formData.tenure)
      const maturityDate = new Date(startDate)
      maturityDate.setMonth(maturityDate.getMonth() + tenureMonths)
      return maturityDate.toISOString().split('T')[0]
    }
    return ''
  }

  const calculateEMI = () => {
    if (formData.accountType === 'LOAN' && formData.principalAmount && formData.interestRate && formData.tenure) {
      const principal = parseFloat(formData.principalAmount)
      const rate = parseFloat(formData.interestRate)
      const tenure = parseInt(formData.tenure)
      
      if (formData.loanMethod === 'flat') {
        // Flat rate: simple interest on principal
        const totalInterest = principal * (rate / 100) * (tenure / 12)
        return (principal + totalInterest) / tenure
      } else {
        // Reducing balance: standard EMI formula
        const monthlyRate = rate / 12 / 100
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1)
        return isNaN(emi) ? 0 : emi
      }
    }
    return 0
  }

  const calculateTotalAmount = () => {
    if (formData.accountType === 'RD' && formData.monthlyInstallment && formData.tenure) {
      return parseFloat(formData.monthlyInstallment) * parseInt(formData.tenure)
    }
    return parseFloat(formData.principalAmount) || 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      // Prepare account data based on account type
      const originalAccountType = formData.accountType
      const accountType = originalAccountType.toLowerCase().trim()
      console.log('Original account type:', JSON.stringify(originalAccountType))
      console.log('Converted account type:', JSON.stringify(accountType))
      
      let accountData: any = {
        customerId: formData.customerId,
        accountType: accountType, // Convert to lowercase
        principalAmount: accountType === 'rd' ? calculateTotalAmount() : parseFloat(formData.principalAmount),
        interestRate: parseFloat(formData.interestRate),
        tenure: parseInt(formData.tenure),
        startDate: formData.startDate,
        maturityDate: calculateMaturityDate(),
        roundingPrecision: parseInt(formData.roundingPrecision)
      }

      // Add account type specific fields
      if (accountType === 'fd') {
        accountData.interestMode = formData.interestMode
        accountData.payoutMode = formData.payoutMode
      } else if (accountType === 'rd') {
        accountData.monthlyInstallment = parseFloat(formData.monthlyInstallment)
        accountData.interestMethod = formData.interestMethod
        accountData.rdBalanceDateRule = formData.rdBalanceDateRule
        accountData.rdBalanceDay = parseInt(formData.rdBalanceDay)
      } else if (accountType === 'loan') {
        accountData.emiAmount = calculateEMI()
        accountData.loanMethod = formData.loanMethod
        accountData.emiDueDay = parseInt(formData.emiDueDay)
        accountData.gracePeriodDays = parseInt(formData.gracePeriodDays)
        accountData.penaltyRate = parseFloat(formData.penaltyRate)
      }

      console.log('Final account data being sent:', JSON.stringify(accountData, null, 2))

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      })

      if (response.ok) {
        const result = await response.json()
        showMessage(`Account created successfully! Account ID: ${result.account?.accountNumber || 'N/A'}`, 'success')
        setTimeout(() => {
          router.push('/dashboard/accounts')
        }, 2000)
      } else {
        const errorData = await response.json()
        showMessage(errorData.error || 'Failed to create account', 'error')
      }
    } catch (error) {
      console.error('Failed to create account:', error)
      showMessage('Failed to create account', 'error')
    } finally {
      setLoading(false)
    }
  }

  const maturityDate = calculateMaturityDate()
  const emi = calculateEMI()
  const totalAmount = calculateTotalAmount()
  const totalPayable = emi * parseInt(formData.tenure || '0')

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          {/* Message */}
          {message && (
            <div className={`rounded-xl p-4 flex items-start space-x-3 shadow-sm border mb-6 ${
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
                onClick={() => router.push('/dashboard/accounts')}
                className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create Account
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Open a new account with guided setup
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Selection */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Customer <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                    >
                      <SelectTrigger className={errors.customerId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Choose a customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{customer.name}</span>
                              <span className="text-sm text-gray-500 ml-2">{customer.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.customerId && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.accountType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}
                    >
                      <SelectTrigger className={errors.accountType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select account type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FD">Fixed Deposit</SelectItem>
                        <SelectItem value="RD">Recurring Deposit</SelectItem>
                        <SelectItem value="LOAN">Loan</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.accountType && (
                      <p className="text-red-500 text-sm mt-1">{errors.accountType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numbering Template <span className="text-gray-400">(Optional)</span>
                    </label>
                    <Select
                      value={formData.numberingTemplateId || 'default'}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, numberingTemplateId: value === 'default' ? '' : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Use default template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Use default template</SelectItem>
                        <SelectItem value="1">FD Default</SelectItem>
                        <SelectItem value="2">RD Default</SelectItem>
                        <SelectItem value="3">Loan Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BuildingLibraryIcon className="h-5 w-5 mr-2" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.accountType === 'RD' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Installment (₹) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.monthlyInstallment}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthlyInstallment: e.target.value }))}
                        className={errors.monthlyInstallment ? 'border-red-500' : ''}
                        placeholder="Enter monthly installment amount"
                      />
                      {errors.monthlyInstallment && (
                        <p className="text-red-500 text-sm mt-1">{errors.monthlyInstallment}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Principal Amount (₹) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.principalAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, principalAmount: e.target.value }))}
                        className={errors.principalAmount ? 'border-red-500' : ''}
                        placeholder="Enter principal amount"
                      />
                      {errors.principalAmount && (
                        <p className="text-red-500 text-sm mt-1">{errors.principalAmount}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.interestRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                      className={errors.interestRate ? 'border-red-500' : ''}
                      placeholder="Enter interest rate"
                    />
                    {errors.interestRate && (
                      <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenure (months) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.tenure}
                      onChange={(e) => setFormData(prev => ({ ...prev, tenure: e.target.value }))}
                      className={errors.tenure ? 'border-red-500' : ''}
                      placeholder="Enter tenure in months"
                    />
                    {errors.tenure && (
                      <p className="text-red-500 text-sm mt-1">{errors.tenure}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className={errors.startDate ? 'border-red-500' : ''}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                    )}
                  </div>

                  {/* Calculated Values */}
                  {formData.accountType === 'FD' && formData.principalAmount && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                        Principal: ₹{parseFloat(formData.principalAmount).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {formData.accountType === 'RD' && totalAmount > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                        Total Amount: ₹{totalAmount.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {formData.accountType === 'LOAN' && emi > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        <CreditCardIcon className="h-4 w-4 inline mr-1" />
                        Calculated EMI: ₹{emi.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {totalPayable > 0 && formData.accountType === 'LOAN' && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                        Total Payable: ₹{totalPayable.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {maturityDate && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">
                        <CalendarIcon className="h-4 w-4 inline mr-1" />
                        Maturity Date: {new Date(maturityDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Account Type Specific Rules */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  Account Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {formData.accountType === 'FD' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interest Posting
                        </label>
                        <Select
                          value={formData.interestMode}
                          onValueChange={(value: 'monthly' | 'maturity-only') => 
                            setFormData(prev => ({ ...prev, interestMode: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="maturity-only">Maturity Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payout Mode
                        </label>
                        <Select
                          value={formData.payoutMode}
                          onValueChange={(value: 'reinvest' | 'paid-out') => 
                            setFormData(prev => ({ ...prev, payoutMode: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reinvest">Reinvest</SelectItem>
                            <SelectItem value="paid-out">Paid Out</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {formData.accountType === 'RD' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interest Method
                        </label>
                        <Select
                          value={formData.interestMethod}
                          onValueChange={(value: 'installment_weighted' | 'monthly_balance') => 
                            setFormData(prev => ({ ...prev, interestMethod: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="installment_weighted">Installment Weighted</SelectItem>
                            <SelectItem value="monthly_balance">Monthly Balance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Balance Date Rule
                        </label>
                        <Select
                          value={formData.rdBalanceDateRule}
                          onValueChange={(value: 'month_end' | 'fixed_day') => 
                            setFormData(prev => ({ ...prev, rdBalanceDateRule: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="month_end">Month End</SelectItem>
                            <SelectItem value="fixed_day">Fixed Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.rdBalanceDateRule === 'fixed_day' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Balance Day
                          </label>
                          <Select
                            value={formData.rdBalanceDay}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, rdBalanceDay: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[...Array(28)].map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {formData.accountType === 'LOAN' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loan Method
                        </label>
                        <Select
                          value={formData.loanMethod}
                          onValueChange={(value: 'flat' | 'reducing') => 
                            setFormData(prev => ({ ...prev, loanMethod: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flat">Flat Rate</SelectItem>
                            <SelectItem value="reducing">Reducing Balance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          EMI Due Day
                        </label>
                        <Select
                          value={formData.emiDueDay}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, emiDueDay: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(28)].map((_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grace Period (days)
                        </label>
                        <Select
                          value={formData.gracePeriodDays}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, gracePeriodDays: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 days</SelectItem>
                            <SelectItem value="3">3 days</SelectItem>
                            <SelectItem value="5">5 days</SelectItem>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="10">10 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Penalty Rate (%)
                        </label>
                        <Select
                          value={formData.penaltyRate}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, penaltyRate: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.5">0.5%</SelectItem>
                            <SelectItem value="1.0">1.0%</SelectItem>
                            <SelectItem value="1.5">1.5%</SelectItem>
                            <SelectItem value="2.0">2.0%</SelectItem>
                            <SelectItem value="2.5">2.5%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decimal Places
                    </label>
                    <Select
                      value={formData.roundingPrecision}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, roundingPrecision: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 (Rupees)</SelectItem>
                        <SelectItem value="2">2 (Paise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/accounts')}
                className="h-12 px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg h-12 px-8"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <BuildingLibraryIcon className="h-5 w-5 mr-2" />
                    Create Account
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
