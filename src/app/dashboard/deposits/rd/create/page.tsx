"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  SparklesIcon
} from "@heroicons/react/24/outline"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

export default function CreateRD() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    customerId: searchParams.get('customerId') || '',
    monthlyInstallment: '',
    interestRate: '',
    tenure: '',
    startDate: new Date().toISOString().split('T')[0],
    interestMethod: 'installment_weighted' as 'installment_weighted' | 'monthly_balance',
    rdBalanceDateRule: 'month_end' as 'month_end' | 'fixed_day',
    rdBalanceDay: '10',
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

  useEffect(() => {
    fetchCustomers()
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerId) newErrors.customerId = 'Customer is required'
    if (!formData.monthlyInstallment || parseFloat(formData.monthlyInstallment) <= 0) {
      newErrors.monthlyInstallment = 'Monthly installment must be greater than 0'
    }
    if (!formData.interestRate || parseFloat(formData.interestRate) <= 0 || parseFloat(formData.interestRate) > 100) {
      newErrors.interestRate = 'Interest rate must be between 0 and 100'
    }
    if (!formData.tenure || parseInt(formData.tenure) <= 0) {
      newErrors.tenure = 'Tenure must be greater than 0'
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required'

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

  const calculateTotalAmount = () => {
    if (formData.monthlyInstallment && formData.tenure) {
      return parseFloat(formData.monthlyInstallment) * parseInt(formData.tenure)
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          accountType: 'RD',
          principalAmount: calculateTotalAmount(),
          interestRate: parseFloat(formData.interestRate),
          tenure: parseInt(formData.tenure),
          maturityDate: calculateMaturityDate(),
          roundingPrecision: parseInt(formData.roundingPrecision)
        }),
      })

      if (response.ok) {
        showMessage('RD account created successfully', 'success')
        setTimeout(() => {
          router.push('/dashboard/deposits/rd')
        }, 2000)
      } else {
        const errorData = await response.json()
        showMessage(errorData.error || 'Failed to create RD account', 'error')
      }
    } catch (error) {
      console.error('Failed to create RD account:', error)
      showMessage('Failed to create RD account', 'error')
    } finally {
      setLoading(false)
    }
  }

  const maturityDate = calculateMaturityDate()
  const totalAmount = calculateTotalAmount()

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-4xl mx-auto">
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
                onClick={() => router.push('/dashboard/deposits/rd')}
                className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create Recurring Deposit
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Open a new recurring deposit account
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
                </CardContent>
              </Card>

              {/* RD Details */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BuildingLibraryIcon className="h-5 w-5 mr-2" />
                    RD Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  {totalAmount > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                        Total Amount: ₹{totalAmount.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {maturityDate && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        <CalendarIcon className="h-4 w-4 inline mr-1" />
                        Maturity Date: {new Date(maturityDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RD Rules */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  RD Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                onClick={() => router.push('/dashboard/deposits/rd')}
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
                    Creating RD...
                  </>
                ) : (
                  <>
                    <BuildingLibraryIcon className="h-5 w-5 mr-2" />
                    Create RD Account
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
