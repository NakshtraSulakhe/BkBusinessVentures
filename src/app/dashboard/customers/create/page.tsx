"use client"

import { useState, useEffect } from "react"
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
import { PageHeader } from "@/components/ui/page-header"
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BriefcaseIcon,
  HomeIcon,
  FingerPrintIcon
} from "@heroicons/react/24/outline"

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (type === 'error') return
    setTimeout(() => setMessage(null), 5000)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Invalid email format'
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    const phoneRegex = /^[0-9]{10}$/
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone must be 10 digits'
    
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'

    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Invalid PAN format'
    }

    if (formData.aadhaarNumber && !/^[0-9]{12}$/.test(formData.aadhaarNumber.replace(/\D/g, ''))) {
      newErrors.aadhaarNumber = 'Aadhaar must be 12 digits'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          annualIncome: parseFloat(formData.annualIncome) || 0
        }),
      })

      if (response.ok) {
        showMessage(`Customer ${formData.name} created successfully`, 'success')
        setTimeout(() => router.push('/dashboard/customers'), 2000)
      } else {
        const errorData = await response.json()
        showMessage(errorData.error || 'Failed to create customer', 'error')
      }
    } catch (error) {
      showMessage('Failed to create customer', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up pb-20">
        <PageHeader
          title="Create New Customer"
          subtitle="Add a new customer to the system"
          actions={
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/customers')}
              className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 transition-all font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          }
        />

        {/* Form Global Alerts */}
        {message && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mt-0.5" /> : <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />}
            <div className="text-sm font-bold">{message.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-10">
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            {/* Form Section: Identity */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                  <FingerPrintIcon className="h-4 w-4 mr-2 text-primary" />
                  1. Identity & Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`pl-10 h-11 border-slate-200 rounded-lg focus:ring-1 focus:ring-primary/20 ${errors.name ? 'border-rose-300 bg-rose-50/30' : 'bg-slate-50/30 hover:bg-white focus:bg-white'}`}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <EnvelopeIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="rahul@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 h-11 border-slate-200 rounded-lg focus:ring-1 focus:ring-primary/20 ${errors.email ? 'border-rose-300 bg-rose-50/30' : 'bg-slate-50/30 hover:bg-white focus:bg-white'}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Primary Phone</label>
                    <div className="relative">
                      <PhoneIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="10-digit mobile"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`pl-10 h-11 border-slate-200 rounded-lg focus:ring-1 focus:ring-primary/20 ${errors.phone ? 'border-rose-300 bg-rose-50/30' : 'bg-slate-50/30 hover:bg-white focus:bg-white'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">PAN Card</label>
                    <Input
                      placeholder="ABCDE1234F"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                      className="h-11 border-slate-200 rounded-lg bg-slate-50/30 font-mono uppercase text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Aadhaar (UID)</label>
                    <Input
                      placeholder="1234 5678 9012"
                      value={formData.aadhaarNumber}
                      onChange={(e) => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                      maxLength={12}
                      className="h-11 border-slate-200 rounded-lg bg-slate-50/30 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date of Birth</label>
                    <div className="relative">
                      <CalendarIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="pl-10 h-11 border-slate-200 rounded-lg bg-slate-50/30 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Section: Location */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                  <HomeIcon className="h-4 w-4 mr-2 text-primary" />
                  2. Residential Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Street Address</label>
                  <div className="relative">
                    <MapPinIcon className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <Textarea
                      placeholder="House No, Building, Street Name, Landmark"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`pl-10 h-20 border-slate-200 rounded-lg resize-none ${errors.address ? 'border-rose-300 bg-rose-50/30' : 'bg-slate-50/30 hover:bg-white focus:bg-white'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">City</label>
                    <Input
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`h-11 border-slate-200 rounded-lg text-sm ${errors.city ? 'border-rose-300 bg-rose-50/30' : 'bg-slate-50/30 hover:bg-white focus:bg-white'}`}
                    />
                    {errors.city && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">State</label>
                    <Input
                      placeholder="e.g. Maharashtra"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`h-11 border-slate-200 rounded-lg text-sm ${errors.state ? 'border-rose-300 bg-rose-50/30' : 'bg-slate-50/30 hover:bg-white focus:bg-white'}`}
                    />
                    {errors.state && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.state}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ZIP / Pin Code</label>
                    <Input
                      placeholder="400001"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className={`h-11 border-slate-200 rounded-lg text-sm ${errors.zipCode ? 'border-rose-300 bg-rose-50/30' : 'bg-slate-50/30 hover:bg-white focus:bg-white'}`}
                    />
                    {errors.zipCode && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.zipCode}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Section: Professional */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                  <BriefcaseIcon className="h-4 w-4 mr-2 text-primary" />
                  3. Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Occupation</label>
                    <Input
                      placeholder="e.g. Software Engineer"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="h-11 border-slate-200 rounded-lg bg-slate-50/30 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Annual Income (₹)</label>
                    <div className="relative">
                      <CurrencyDollarIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formData.annualIncome}
                        onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                        className="pl-10 h-11 border-slate-200 rounded-lg bg-slate-50/30 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Purpose of Opening</label>
                  <Textarea
                    placeholder="Briefly describe the relationship goal..."
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    className="h-20 border-slate-200 rounded-lg bg-slate-50/30 text-sm resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            {/* Account Type Selection Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-800 text-white rounded-t-xl px-6 py-4">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center">
                  <BuildingLibraryIcon className="h-4 w-4 mr-2 text-primary-foreground/60" />
                  Select Account Type
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-medium mb-4">Choose the account type for this customer.</p>
                  
                  {[
                    { val: 'savings', label: 'Savings Account', icon: '💰', color: 'bg-blue-50 text-blue-600' },
                    { val: 'current', label: 'Current Account', icon: '💼', color: 'bg-emerald-50 text-emerald-600' },
                    { val: 'fd', label: 'Fixed Deposit', icon: '📈', color: 'bg-indigo-50 text-indigo-600' },
                    { val: 'rd', label: 'Recurring Deposit', icon: '🔄', color: 'bg-amber-50 text-amber-600' },
                    { val: 'loan', label: 'Loan Account', icon: '💳', color: 'bg-rose-50 text-rose-600' },
                  ].map((opt) => (
                    <div
                      key={opt.val}
                      onClick={() => handleInputChange('accountType', opt.val as any)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                        formData.accountType === opt.val 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm ${opt.color}`}>
                        {opt.icon}
                      </div>
                      <span className={`text-sm font-bold ${formData.accountType === opt.val ? 'text-primary' : 'text-slate-700'}`}>
                        {opt.label}
                      </span>
                      {formData.accountType === opt.val && (
                        <CheckCircleIcon className="h-5 w-5 ml-auto text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Info */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.15em] mb-4">Verification Status</h4>
              <ul className="space-y-3">
                {[
                  "ID details matched",
                  "Contact info verified",
                  "Background check pending",
                  "Terms of service accepted"
                ].map((text, idx) => (
                  <li key={idx} className="flex items-center text-[11px] font-bold text-slate-600">
                    <ShieldCheckIcon className="h-3.5 w-3.5 mr-2 text-primary/60" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Final Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 finance-gradient-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 mr-3" />
                  Create Customer
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

