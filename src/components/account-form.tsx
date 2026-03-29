"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  BanknotesIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"

interface AccountFormProps {
  customerId: string
  customerName: string
  onSuccess?: (account: any) => void
  onCancel?: () => void
}

interface AccountFormData {
  accountType: 'fd' | 'rd' | 'loan'
  principalAmount: string
  interestRate: string
  tenure: string
  startDate: string
  branch: string
  accountRules: {
    interestMode: 'monthly' | 'quarterly' | 'maturity'
    payoutMode: 'reinvest' | 'payout'
    loanMethod?: 'flat' | 'reducing'
    emiAmount?: string
    emiDueDay?: string
    gracePeriodDays?: string
    roundingMode: 'up' | 'down' | 'nearest'
    roundingPrecision: string
  }
}

export default function AccountForm({ customerId, customerName, onSuccess, onCancel }: AccountFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AccountFormData>({
    accountType: 'fd',
    principalAmount: '',
    interestRate: '',
    tenure: '',
    startDate: new Date().toISOString().split('T')[0],
    branch: 'MAIN',
    accountRules: {
      interestMode: 'maturity',
      payoutMode: 'reinvest',
      roundingMode: 'nearest',
      roundingPrecision: '2'
    }
  })

  const accountTypes = [
    { value: 'fd', label: 'Fixed Deposit', icon: '💰', color: 'bg-blue-100 text-blue-700' },
    { value: 'rd', label: 'Recurring Deposit', icon: '🔄', color: 'bg-green-100 text-green-700' },
    { value: 'loan', label: 'Loan', icon: '💳', color: 'bg-red-100 text-red-700' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          ...formData,
          principalAmount: parseFloat(formData.principalAmount),
          interestRate: parseFloat(formData.interestRate),
          tenure: parseInt(formData.tenure),
          accountRules: {
            ...formData.accountRules,
            emiAmount: formData.accountRules.emiAmount ? parseFloat(formData.accountRules.emiAmount) : undefined,
            emiDueDay: formData.accountRules.emiDueDay ? parseInt(formData.accountRules.emiDueDay) : undefined,
            gracePeriodDays: formData.accountRules.gracePeriodDays ? parseInt(formData.accountRules.gracePeriodDays) : undefined,
            roundingPrecision: parseInt(formData.accountRules.roundingPrecision)
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        onSuccess?.(data.account)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create account')
      }
    } catch (error) {
      console.error('Failed to create account:', error)
      alert('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (section: keyof AccountFormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section] as any, [field]: value }
        : value
    }))
  }

  const updateAccountRules = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      accountRules: {
        ...prev.accountRules,
        [field]: value
      }
    }))
  }

  const selectedAccountType = accountTypes.find(t => t.value === formData.accountType)

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create New Account
        </h1>
        <p className="text-gray-600 mt-2 flex items-center text-sm">
          <UserIcon className="h-4 w-4 mr-2" />
          Customer: {customerName}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BanknotesIcon className="h-5 w-5 mr-2" />
              Account Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {accountTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.accountType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateFormData('accountType', '', type.value)}
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{type.icon}</div>
                    <div className="font-medium text-sm sm:text-base">{type.label}</div>
                    <Badge className={`mt-1 sm:mt-2 text-[10px] sm:text-xs ${type.color}`}>
                      {type.value.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Basic Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="principalAmount">Principal Amount (₹)</Label>
                <Input
                  id="principalAmount"
                  type="number"
                  step="0.01"
                  placeholder="100000"
                  value={formData.principalAmount}
                  onChange={(e) => updateFormData('principalAmount', '', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  placeholder="7.5"
                  value={formData.interestRate}
                  onChange={(e) => updateFormData('interestRate', '', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tenure">Tenure (months)</Label>
                <Input
                  id="tenure"
                  type="number"
                  placeholder="12"
                  value={formData.tenure}
                  onChange={(e) => updateFormData('tenure', '', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', '', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                placeholder="MAIN"
                value={formData.branch}
                onChange={(e) => updateFormData('branch', '', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              Account Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Interest Mode</Label>
                <Select
                  value={formData.accountRules.interestMode}
                  onValueChange={(value) => updateAccountRules('interestMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="maturity">At Maturity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payout Mode</Label>
                <Select
                  value={formData.accountRules.payoutMode}
                  onValueChange={(value) => updateAccountRules('payoutMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reinvest">Reinvest</SelectItem>
                    <SelectItem value="payout">Payout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loan-specific fields */}
            {formData.accountType === 'loan' && (
              <>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Loan Method</Label>
                    <Select
                      value={formData.accountRules.loanMethod}
                      onValueChange={(value) => updateAccountRules('loanMethod', value)}
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
                    <Label htmlFor="emiAmount">EMI Amount (₹)</Label>
                    <Input
                      id="emiAmount"
                      type="number"
                      step="0.01"
                      placeholder="5000"
                      value={formData.accountRules.emiAmount || ''}
                      onChange={(e) => updateAccountRules('emiAmount', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emiDueDay">EMI Due Day</Label>
                    <Input
                      id="emiDueDay"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="5"
                      value={formData.accountRules.emiDueDay || ''}
                      onChange={(e) => updateAccountRules('emiDueDay', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gracePeriodDays">Grace Period (days)</Label>
                    <Input
                      id="gracePeriodDays"
                      type="number"
                      min="0"
                      placeholder="3"
                      value={formData.accountRules.gracePeriodDays || ''}
                      onChange={(e) => updateAccountRules('gracePeriodDays', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Rounding Mode</Label>
                <Select
                  value={formData.accountRules.roundingMode}
                  onValueChange={(value) => updateAccountRules('roundingMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Round Up</SelectItem>
                    <SelectItem value="down">Round Down</SelectItem>
                    <SelectItem value="nearest">Round to Nearest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="roundingPrecision">Decimal Precision</Label>
                <Input
                  id="roundingPrecision"
                  type="number"
                  min="0"
                  max="4"
                  placeholder="2"
                  value={formData.accountRules.roundingPrecision}
                  onChange={(e) => updateAccountRules('roundingPrecision', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 w-full sm:w-auto"
          >
            {loading ? 'Creating Account...' : `Create ${selectedAccountType?.label}`}
          </Button>
        </div>
      </form>
    </div>
  )
}
