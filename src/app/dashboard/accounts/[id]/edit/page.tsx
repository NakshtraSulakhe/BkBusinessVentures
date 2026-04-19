"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
} from "@heroicons/react/24/outline"

interface Account {
  id: string
  accountNumber: string
  accountType: string
  principalAmount: number
  interestRate: number
  tenure: number
  startDate: string
  status: string
  accountRules?: {
    calculationMethod?: string
  }
  customer: {
    id: string
    name: string
    email: string
  }
}

export default function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const accountId = use(params).id
  const router = useRouter()
  const { token } = useAuth()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    principalAmount: '',
    interestRate: '',
    tenure: '',
    startDate: '',
    status: 'ACTIVE',
    calculationMethod: 'compound' as 'simple' | 'compound',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchAccount()
  }, [accountId])

  const fetchAccount = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth(`/api/accounts/${accountId}`, { token })
      if (response.ok) {
        const data = await response.json()
        setAccount(data.account)
        setFormData({
          principalAmount: data.account.principalAmount?.toString() || '',
          interestRate: data.account.interestRate?.toString() || '',
          tenure: data.account.tenure?.toString() || '',
          startDate: data.account.startDate?.split('T')[0] || '',
          status: data.account.status || 'ACTIVE',
          calculationMethod: (data.account.accountRules?.calculationMethod as string) || 'compound',
        })
      } else {
        setMessage({ type: 'error', text: 'Failed to load account' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading account' })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.principalAmount || parseFloat(formData.principalAmount) <= 0) {
      newErrors.principalAmount = 'Principal amount is required'
    }
    if (!formData.interestRate || parseFloat(formData.interestRate) <= 0) {
      newErrors.interestRate = 'Interest rate is required'
    }
    if (!formData.tenure || parseInt(formData.tenure) <= 0) {
      newErrors.tenure = 'Tenure is required'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      const response = await fetchWithAuth(`/api/accounts/${accountId}`, {
        token,
        method: 'PUT',
        body: JSON.stringify({
          principalAmount: parseFloat(formData.principalAmount),
          interestRate: parseFloat(formData.interestRate),
          tenure: parseInt(formData.tenure),
          startDate: formData.startDate,
          status: formData.status,
          calculationMethod: formData.calculationMethod,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Account updated successfully' })
        setTimeout(() => router.push(`/dashboard/accounts/${accountId}`), 1500)
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to update account' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating account' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!account) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <ExclamationTriangleIcon className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-lg font-semibold text-slate-900">Account not found</h2>
          <Button onClick={() => router.push('/dashboard/accounts')} className="mt-4">
            Back to Accounts
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto">
        <PageHeader
          title="Edit Account"
          subtitle={`Editing ${account.accountType.toUpperCase()} Account #${account.accountNumber}`}
          actions={
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/accounts/${accountId}`)}
              className="h-9 border-slate-200 text-slate-700 rounded-xl px-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />

        {message && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Customer: {account.customer.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-slate-400" />
                    Principal Amount
                  </label>
                  <Input
                    type="number"
                    value={formData.principalAmount}
                    onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                    placeholder="Enter principal amount"
                    className="h-10"
                  />
                  {errors.principalAmount && <p className="text-xs text-rose-500">{errors.principalAmount}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <BuildingLibraryIcon className="h-4 w-4 text-slate-400" />
                    Interest Rate (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="Enter interest rate"
                    className="h-10"
                  />
                  {errors.interestRate && <p className="text-xs text-rose-500">{errors.interestRate}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    Tenure (months)
                  </label>
                  <Input
                    type="number"
                    value={formData.tenure}
                    onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                    placeholder="Enter tenure in months"
                    className="h-10"
                  />
                  {errors.tenure && <p className="text-xs text-rose-500">{errors.tenure}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="h-10"
                  />
                  {errors.startDate && <p className="text-xs text-rose-500">{errors.startDate}</p>}
                </div>

                {account?.accountType?.toLowerCase() === 'fd' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <BuildingLibraryIcon className="h-4 w-4 text-slate-400" />
                      Interest Calculation Method
                    </label>
                    <Select
                      value={formData.calculationMethod}
                      onValueChange={(value) => setFormData({ ...formData, calculationMethod: value as any })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select calculation method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple Interest</SelectItem>
                        <SelectItem value="compound">Quarterly Compounding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="MATURED">Matured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={saving}
                  className="finance-gradient-primary text-white h-10 px-6 rounded-xl"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/accounts/${accountId}`)}
                  className="h-10 px-6 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
