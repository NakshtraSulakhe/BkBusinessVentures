"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
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
  SparklesIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
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

export default function CreateCustomer() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    panNumber: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    occupation: '',
    annualIncome: '',
    accountType: 'savings' as 'savings' | 'current' | 'fd' | 'rd' | 'loan',
    purpose: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits'
    }

    // PAN validation
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)'
    }

    // Aadhaar validation
    if (formData.aadhaarNumber && !/^[0-9]{12}$/.test(formData.aadhaarNumber.replace(/\D/g, ''))) {
      newErrors.aadhaarNumber = 'Aadhaar must be 12 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          annualIncome: parseFloat(formData.annualIncome) || 0
        }),
      })

      if (response.ok) {
        showMessage(`${formData.name} has been successfully created`, 'success')
        setTimeout(() => {
          router.push('/dashboard/customers')
        }, 2000)
      } else {
        const errorData = await response.json()
        showMessage(errorData.error || 'Failed to create customer', 'error')
      }
    } catch (error) {
      console.error('Failed to create customer:', error)
      showMessage('Failed to create customer', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const accountTypeOptions = [
    { value: 'savings', label: 'Savings Account', description: 'Everyday banking needs' },
    { value: 'current', label: 'Current Account', description: 'Business transactions' },
    { value: 'fd', label: 'Fixed Deposit', description: 'High-interest savings' },
    { value: 'rd', label: 'Recurring Deposit', description: 'Systematic savings' },
    { value: 'loan', label: 'Loan Account', description: 'Credit facilities' }
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Success/Error Message */}
          {message && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 animate-in slide-in-from-right duration-300 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/customers')}
                className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Customer
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Add a new customer to the banking system
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1.5 bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700">
                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                Secure Form
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 bg-white/80 backdrop-blur-sm border-green-200 text-green-700">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                KYC Compliant
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-3 mb-12">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                <div className="h-1 w-16 bg-blue-600"></div>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                <div className="h-1 w-16 bg-blue-600"></div>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                <div className="h-1 w-16 bg-gray-200"></div>
              </div>
              <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-gray-500">Basic customer details and contact information</p>
                </div>
              </div>

              <FieldSet className="space-y-6">
                <FieldGroup className="@container/field-group">
                  <Field data-invalid={!!errors.name}>
                    <FieldLabel htmlFor="name" className="text-base font-medium">Full Name</FieldLabel>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`pl-12 h-12 text-base ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'focus:ring-blue-500/20'}`}
                        placeholder="Enter customer's full name"
                      />
                    </div>
                    {errors.name && <FieldError>{errors.name}</FieldError>}
                    <FieldDescription>Enter the legal name as shown on government ID</FieldDescription>
                  </Field>

                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email" className="text-base font-medium">Email Address</FieldLabel>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-12 h-12 text-base ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'focus:ring-blue-500/20'}`}
                        placeholder="customer@example.com"
                      />
                    </div>
                    {errors.email && <FieldError>{errors.email}</FieldError>}
                    <FieldDescription>We'll use this for account notifications and statements</FieldDescription>
                  </Field>

                  <Field data-invalid={!!errors.phone}>
                    <FieldLabel htmlFor="phone" className="text-base font-medium">Phone Number</FieldLabel>
                    <div className="relative">
                      <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`pl-12 h-12 text-base ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'focus:ring-blue-500/20'}`}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    {errors.phone && <FieldError>{errors.phone}</FieldError>}
                    <FieldDescription>For OTP verification and important updates</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="dateOfBirth" className="text-base font-medium">Date of Birth</FieldLabel>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="pl-12 h-12 text-base focus:ring-blue-500/20"
                      />
                    </div>
                    <FieldDescription>Optional: Helps us verify your identity</FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>

            {/* Address Information Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <MapPinIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Address Information</h2>
                  <p className="text-gray-500">Residential and mailing details</p>
                </div>
              </div>

              <FieldSet className="space-y-6">
                <FieldGroup className="@container/field-group">
                  <Field data-invalid={!!errors.address}>
                    <FieldLabel htmlFor="address" className="text-base font-medium">Street Address</FieldLabel>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`resize-none h-24 text-base ${errors.address ? 'border-red-500 focus:ring-red-500/20' : 'focus:ring-green-500/20'}`}
                      placeholder="Enter complete street address"
                    />
                    {errors.address && <FieldError>{errors.address}</FieldError>}
                    <FieldDescription>Include house number, street name, and any landmarks</FieldDescription>
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field data-invalid={!!errors.city}>
                      <FieldLabel htmlFor="city" className="text-base font-medium">City</FieldLabel>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`h-12 text-base ${errors.city ? 'border-red-500 focus:ring-red-500/20' : 'focus:ring-green-500/20'}`}
                        placeholder="City name"
                      />
                      {errors.city && <FieldError>{errors.city}</FieldError>}
                    </Field>

                    <Field data-invalid={!!errors.zipCode}>
                      <FieldLabel htmlFor="zipCode" className="text-base font-medium">ZIP Code</FieldLabel>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className={`h-12 text-base ${errors.zipCode ? 'border-red-500 focus:ring-red-500/20' : 'focus:ring-green-500/20'}`}
                        placeholder="Postal code"
                      />
                      {errors.zipCode && <FieldError>{errors.zipCode}</FieldError>}
                    </Field>
                  </div>

                  <Field data-invalid={!!errors.state}>
                    <FieldLabel htmlFor="state" className="text-base font-medium">State</FieldLabel>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`h-12 text-base ${errors.state ? 'border-red-500 focus:ring-red-500/20' : 'focus:ring-green-500/20'}`}
                      placeholder="State name"
                    />
                    {errors.state && <FieldError>{errors.state}</FieldError>}
                    <FieldDescription>Required for regulatory compliance</FieldDescription>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </div>

            {/* Professional & Account Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Professional Information */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Professional</h2>
                    <p className="text-gray-500">Work and income details</p>
                  </div>
                </div>

                <FieldSet className="space-y-6">
                  <FieldGroup className="@container/field-group">
                    <Field>
                      <FieldLabel htmlFor="occupation" className="text-base font-medium">Occupation</FieldLabel>
                      <div className="relative">
                        <BuildingOfficeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) => handleInputChange('occupation', e.target.value)}
                          className="pl-12 h-12 text-base focus:ring-purple-500/20"
                          placeholder="Job title or profession"
                        />
                      </div>
                      <FieldDescription>Helps us understand your financial profile</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="annualIncome" className="text-base font-medium">Annual Income</FieldLabel>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="annualIncome"
                          type="number"
                          value={formData.annualIncome}
                          onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                          className="pl-12 h-12 text-base focus:ring-purple-500/20"
                          placeholder="0.00"
                        />
                      </div>
                      <FieldDescription>Optional: Helps determine suitable products</FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </div>

              {/* Account Information */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <IdentificationIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Account Details</h2>
                    <p className="text-gray-500">Banking preferences</p>
                  </div>
                </div>

                <FieldSet className="space-y-6">
                  <FieldGroup className="@container/field-group">
                    <Field>
                      <FieldLabel className="text-base font-medium">Account Type</FieldLabel>
                      <Select
                        value={formData.accountType}
                        onValueChange={(value) => handleInputChange('accountType', value)}
                      >
                        <SelectTrigger className="h-14 text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors bg-white shadow-sm">
                          <SelectValue placeholder="Choose your account type" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-gray-200 shadow-lg bg-white">
                          {accountTypeOptions.map((option) => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              className="py-3 px-4 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
                                  option.value === 'savings' ? 'bg-blue-100 text-blue-600' :
                                  option.value === 'current' ? 'bg-green-100 text-green-600' :
                                  option.value === 'fd' ? 'bg-purple-100 text-purple-600' :
                                  option.value === 'rd' ? 'bg-orange-100 text-orange-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {
                                    option.value === 'savings' ? '💰' :
                                    option.value === 'current' ? '💼' :
                                    option.value === 'fd' ? '📈' :
                                    option.value === 'rd' ? '🔄' :
                                    '💳'
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900">{option.label}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription className="text-sm text-gray-600 mt-2">
                        Select the account type that best suits your banking needs
                      </FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="purpose" className="text-base font-medium">Purpose</FieldLabel>
                      <Textarea
                        id="purpose"
                        value={formData.purpose}
                        onChange={(e) => handleInputChange('purpose', e.target.value)}
                        className="resize-none h-24 text-base focus:ring-indigo-500/20"
                        placeholder="Purpose of account opening"
                      />
                      <FieldDescription>Helps us serve you better</FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </div>
            </div>

            {/* Identity Verification */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Identity Verification</h2>
                  <p className="text-gray-500">Government-issued identification</p>
                </div>
              </div>

              <FieldSet className="space-y-6">
                <FieldGroup className="@container/field-group">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field data-invalid={!!errors.panNumber}>
                      <FieldLabel htmlFor="panNumber" className="text-base font-medium">PAN Number</FieldLabel>
                      <div className="relative">
                        <IdentificationIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="panNumber"
                          value={formData.panNumber}
                          onChange={(e) => handleInputChange('panNumber', e.target.value)}
                          className={`pl-12 h-12 text-base uppercase ${errors.panNumber ? 'border-red-500 focus:ring-red-500/20' : 'focus:ring-orange-500/20'}`}
                          placeholder="ABCDE1234F"
                        />
                      </div>
                      {errors.panNumber && <FieldError>{errors.panNumber}</FieldError>}
                      <FieldDescription>Format: ABCDE1234F</FieldDescription>
                    </Field>

                    <Field data-invalid={!!errors.aadhaarNumber}>
                      <FieldLabel htmlFor="aadhaarNumber" className="text-base font-medium">Aadhaar Number</FieldLabel>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="aadhaarNumber"
                          value={formData.aadhaarNumber}
                          onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                          className={`pl-12 h-12 text-base ${errors.aadhaarNumber ? 'border-red-500 focus:ring-red-500/20' : 'focus:ring-orange-500/20'}`}
                          placeholder="12-digit Aadhaar number"
                          maxLength={12}
                        />
                      </div>
                      {errors.aadhaarNumber && <FieldError>{errors.aadhaarNumber}</FieldError>}
                      <FieldDescription>12-digit unique identification number</FieldDescription>
                    </Field>
                  </div>
                </FieldGroup>
              </FieldSet>
            </div>

            {/* Action Section */}
            <div className="flex items-center justify-between bg-white/40 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="px-4 py-2 bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700">
                  <LockClosedIcon className="h-3 w-3 mr-2" />
                  SSL Encrypted
                </Badge>
                <Badge variant="outline" className="px-4 py-2 bg-white/80 backdrop-blur-sm border-green-200 text-green-700">
                  <ShieldCheckIcon className="h-3 w-3 mr-2" />
                  Data Protected
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/customers')}
                  disabled={loading}
                  className="h-12 px-8 text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-8 text-base font-medium shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating Customer...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      Create Customer
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
