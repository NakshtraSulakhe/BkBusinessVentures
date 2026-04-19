"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { formatDateSafe } from "@/lib/utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
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
  BanknotesIcon,
  ClockIcon,
  ReceiptPercentIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  CircleStackIcon
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
  accountType: string
  principalAmount: number
  interestRate: number
  tenure: number
  startDate: string
  emiDueDay: number
  gracePeriodDays: number
  penaltyRate: number
  roundingMode: string
  roundingPrecision: number
  status: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
}

function EditLoanComponent() {
  const router = useRouter()
  const params = useParams()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loan, setLoan] = useState<LoanAccount | null>(null)
  
  const [formData, setFormData] = useState({
    customerId: '',
    principalAmount: '',
    interestRate: '',
    tenure: '',
    startDate: new Date().toISOString().split('T')[0],
    emiDueDay: '1',
    gracePeriodDays: '3',
    penaltyRate: '1.0',
    roundingMode: 'nearest' as 'nearest' | 'up' | 'down',
    roundingPrecision: '2',
    status: 'active' as string
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchLoanDetails = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth(`/api/accounts/${params.id}`, { token })
      if (response.ok) {
        const data = await response.json()
        if (data.account) {
          setLoan(data.account)
          setSelectedCustomer(data.account.customer)
          setFormData({
            customerId: data.account.customer.id,
            principalAmount: data.account.principalAmount.toString(),
            interestRate: data.account.interestRate.toString(),
            tenure: data.account.tenure.toString(),
            startDate: data.account.startDate ? data.account.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
            emiDueDay: data.account.emiDueDay?.toString() || '1',
            gracePeriodDays: data.account.gracePeriodDays?.toString() || '3',
            penaltyRate: data.account.penaltyRate?.toString() || '1.0',
            roundingMode: (data.account.roundingMode || 'nearest') as 'nearest' | 'up' | 'down',
            roundingPrecision: data.account.roundingPrecision?.toString() || '2',
            status: data.account.status || 'active'
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch loan details:', error)
      setMessage({ type: 'error', text: 'Failed to load loan details' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoanDetails()
  }, [params.id, token])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.principalAmount || parseFloat(formData.principalAmount) <= 0) {
      newErrors.principalAmount = 'Principal amount must be greater than 0'
    }
    if (!formData.interestRate || parseFloat(formData.interestRate) <= 0) {
      newErrors.interestRate = 'Interest rate must be greater than 0'
    }
    if (!formData.tenure || parseInt(formData.tenure) <= 0) {
      newErrors.tenure = 'Tenure must be greater than 0'
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setSaving(true)
      setMessage(null)
      
      const response = await fetchWithAuth(`/api/accounts/${params.id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({
          principalAmount: parseFloat(formData.principalAmount),
          interestRate: parseFloat(formData.interestRate),
          tenure: parseInt(formData.tenure),
          startDate: formData.startDate,
          emiDueDay: parseInt(formData.emiDueDay),
          gracePeriodDays: parseInt(formData.gracePeriodDays),
          penaltyRate: parseFloat(formData.penaltyRate),
          roundingMode: formData.roundingMode,
          roundingPrecision: parseInt(formData.roundingPrecision),
          status: formData.status
        })
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Loan updated successfully!' })
        setTimeout(() => router.push(`/dashboard/loans/${params.id}`), 1500)
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to update loan' })
      }
    } catch (error) {
      console.error('Error updating loan:', error)
      setMessage({ type: 'error', text: 'Failed to update loan' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Edit Loan Account"
          subtitle={`Account #${loan?.accountNumber || ''}`}
          actions={
            <Button onClick={() => router.push(`/dashboard/loans/${params.id}`)} variant="outline">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Loan Details
            </Button>
          }
        />

        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information (Read-only) */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg finance-gradient-primary text-white flex items-center justify-center flex-shrink-0 text-lg font-bold">
                  {selectedCustomer?.name.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">{selectedCustomer?.name || '—'}</div>
                  <div className="text-xs text-slate-500">{selectedCustomer?.email || '—'}</div>
                  <div className="text-xs text-slate-500">{selectedCustomer?.phone || '—'}</div>
                </div>
                <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                  Read-only
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center">
                <BanknotesIcon className="h-4 w-4 mr-2 text-primary" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Principal Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.principalAmount}
                    onChange={(e) => handleInputChange('principalAmount', e.target.value)}
                    placeholder="Enter principal amount"
                    className={`h-10 border-slate-200 bg-slate-50 text-sm ${errors.principalAmount ? 'border-rose-500' : ''}`}
                  />
                  {errors.principalAmount && <p className="text-xs text-rose-600 mt-1">{errors.principalAmount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Interest Rate (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    placeholder="Enter interest rate"
                    className={`h-10 border-slate-200 bg-slate-50 text-sm ${errors.interestRate ? 'border-rose-500' : ''}`}
                  />
                  {errors.interestRate && <p className="text-xs text-rose-600 mt-1">{errors.interestRate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Tenure (Months)</label>
                  <Input
                    type="number"
                    value={formData.tenure}
                    onChange={(e) => handleInputChange('tenure', e.target.value)}
                    placeholder="Enter tenure in months"
                    className={`h-10 border-slate-200 bg-slate-50 text-sm ${errors.tenure ? 'border-rose-500' : ''}`}
                  />
                  {errors.tenure && <p className="text-xs text-rose-600 mt-1">{errors.tenure}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`h-10 border-slate-200 bg-slate-50 text-sm ${errors.startDate ? 'border-rose-500' : ''}`}
                  />
                  {errors.startDate && <p className="text-xs text-rose-600 mt-1">{errors.startDate}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Settings */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center">
                <Cog6ToothIcon className="h-4 w-4 mr-2 text-primary" />
                Loan Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="h-10 border-slate-200 bg-slate-50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="defaulted">Defaulted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">EMI Due Day</label>
                  <Select value={formData.emiDueDay} onValueChange={(value) => handleInputChange('emiDueDay', value)}>
                    <SelectTrigger className="h-10 border-slate-200 bg-slate-50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Day {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Grace Period (Days)</label>
                  <Input
                    type="number"
                    value={formData.gracePeriodDays}
                    onChange={(e) => handleInputChange('gracePeriodDays', e.target.value)}
                    className="h-10 border-slate-200 bg-slate-50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Penalty Rate (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.penaltyRate}
                    onChange={(e) => handleInputChange('penaltyRate', e.target.value)}
                    className="h-10 border-slate-200 bg-slate-50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Rounding Mode</label>
                  <Select value={formData.roundingMode} onValueChange={(value) => handleInputChange('roundingMode', value)}>
                    <SelectTrigger className="h-10 border-slate-200 bg-slate-50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nearest">Nearest</SelectItem>
                      <SelectItem value="up">Round Up</SelectItem>
                      <SelectItem value="down">Round Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Rounding Precision</label>
                  <Select value={formData.roundingPrecision} onValueChange={(value) => handleInputChange('roundingPrecision', value)}>
                    <SelectTrigger className="h-10 border-slate-200 bg-slate-50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 decimal places</SelectItem>
                      <SelectItem value="1">1 decimal place</SelectItem>
                      <SelectItem value="2">2 decimal places</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="finance-gradient-primary text-white h-10 px-6 rounded-lg font-semibold">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button type="button" onClick={() => router.push(`/dashboard/loans/${params.id}`)} variant="outline" className="h-10 px-6 rounded-lg">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default function EditLoanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditLoanComponent />
    </Suspense>
  )
}
