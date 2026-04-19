"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline"

interface RDAccount {
  id: string
  accountNumber: string
  customerId: string
  accountType: string
  principalAmount: number
  interestRate: number
  tenure: number
  startDate: string
  maturityDate: string
  status: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  accountRules: any
}

function EditRDComponent() {
  const router = useRouter()
  const params = useParams()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<RDAccount['customer'] | null>(null)
  const [rdAccount, setRdAccount] = useState<RDAccount | null>(null)
  
  const [formData, setFormData] = useState({
    principalAmount: '',
    interestRate: '',
    tenure: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active' as string
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchRDDetails = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth(`/api/accounts/${params.id}`, { token })
      if (response.ok) {
        const data = await response.json()
        if (data.account) {
          setRdAccount(data.account)
          setSelectedCustomer(data.account.customer)
          setFormData({
            principalAmount: data.account.principalAmount.toString(),
            interestRate: data.account.interestRate.toString(),
            tenure: data.account.tenure.toString(),
            startDate: data.account.startDate ? data.account.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
            status: data.account.status || 'active'
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch RD details:', error)
      setMessage({ type: 'error', text: 'Failed to load RD details' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRDDetails()
  }, [params.id, token])

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
    
    if (!validateForm()) {
      return
    }

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
          status: formData.status
        })
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'RD account updated successfully' })
        setTimeout(() => router.push(`/dashboard/deposits/rd/${params.id}`), 2000)
      } else {
        const err = await response.json()
        setMessage({ type: 'error', text: err.error || 'Failed to update RD account' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update RD account' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading RD account details...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        <PageHeader
          title="Edit RD Account"
          subtitle="Update recurring deposit account details"
          actions={
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="h-9 px-4 rounded-xl font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information (Read-only) */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Customer Name</Label>
                  <div className="h-11 px-3 flex items-center bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-sm font-semibold text-slate-800">
                      {selectedCustomer?.name || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</Label>
                    <div className="h-11 px-3 flex items-center bg-slate-100 rounded-xl border border-slate-200">
                      <span className="text-sm text-slate-600">{selectedCustomer?.email || '-'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone</Label>
                    <div className="h-11 px-3 flex items-center bg-slate-100 rounded-xl border border-slate-200">
                      <span className="text-sm text-slate-600">{selectedCustomer?.phone || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RD Details */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-primary" />
                RD Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Account Number</Label>
                  <div className="h-11 px-3 flex items-center bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-sm font-mono font-semibold text-slate-800">{rdAccount?.accountNumber}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Principal Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.principalAmount}
                    onChange={(e) => handleInputChange('principalAmount', e.target.value)}
                    className={`h-11 border-slate-200 bg-slate-50/30 font-bold ${errors.principalAmount ? 'border-rose-500' : ''}`}
                  />
                  {errors.principalAmount && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.principalAmount}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Interest Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    className={`h-11 border-slate-200 bg-slate-50/30 font-bold ${errors.interestRate ? 'border-rose-500' : ''}`}
                  />
                  {errors.interestRate && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.interestRate}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tenure (Months)</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={formData.tenure}
                    onChange={(e) => handleInputChange('tenure', e.target.value)}
                    className={`h-11 border-slate-200 bg-slate-50/30 font-bold ${errors.tenure ? 'border-rose-500' : ''}`}
                  />
                  {errors.tenure && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.tenure}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`h-11 border-slate-200 bg-slate-50/30 ${errors.startDate ? 'border-rose-500' : ''}`}
                  />
                  {errors.startDate && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.startDate}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <Cog6ToothIcon className="h-4 w-4 mr-2 text-primary" />
                RD Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="block text-xs font-semibold text-slate-700 mb-2">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="h-10 border-slate-200 bg-slate-50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="matured">Matured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="finance-gradient-primary text-white h-10 px-6 rounded-xl font-medium shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
              className="h-10 px-6 rounded-xl font-medium"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default EditRDComponent
