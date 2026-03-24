// Tab Components for the Create Account Page
"use client"

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
  UserIcon,
  UsersIcon,
  BuildingLibraryIcon,
  CalculatorIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ChartBarIcon,
  CreditCardIcon
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

interface CustomerSelectionTabProps {
  customers: Customer[]
  formData: any
  setFormData: (prev: any) => void
  errors: any
  selectedCustomer: Customer | null
}

export function CustomerSelectionTab({ customers, formData, setFormData, errors, selectedCustomer }: CustomerSelectionTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Select Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, customerId: value }))}
            >
              <SelectTrigger className={errors.customerId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Choose a customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <span className="font-medium">{customer.name}</span>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
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
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, accountType: value }))}
            >
              <SelectTrigger className={errors.accountType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select account type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FD">
                  <div className="flex items-center">
                    <BanknotesIcon className="h-4 w-4 mr-2 text-blue-500" />
                    Fixed Deposit
                  </div>
                </SelectItem>
                <SelectItem value="RD">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-4 w-4 mr-2 text-green-500" />
                    Recurring Deposit
                  </div>
                </SelectItem>
                <SelectItem value="LOAN">
                  <div className="flex items-center">
                    <CreditCardIcon className="h-4 w-4 mr-2 text-purple-500" />
                    Loan
                  </div>
                </SelectItem>
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
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, numberingTemplateId: value === 'default' ? '' : value }))}
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

      {/* Customer Details Preview */}
      {selectedCustomer && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{selectedCustomer.name}</h3>
                <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{selectedCustomer.phone}</span>
              </div>
              {selectedCustomer.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-right">{selectedCustomer.address}</span>
                </div>
              )}
              {selectedCustomer.occupation && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupation:</span>
                  <span className="font-medium">{selectedCustomer.occupation}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface AccountDetailsTabProps {
  formData: any
  setFormData: (prev: any) => void
  errors: any
  accountSummary: any
}

export function AccountDetailsTab({ formData, setFormData, errors, accountSummary }: AccountDetailsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm">
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
                onChange={(e) => setFormData((prev: any) => ({ ...prev, monthlyInstallment: e.target.value }))}
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
                onChange={(e) => setFormData((prev: any) => ({ ...prev, principalAmount: e.target.value }))}
                className={errors.principalAmount ? 'border-red-500' : ''}
                placeholder="Enter principal amount"
              />
              {errors.principalAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.principalAmount}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, interestRate: e.target.value }))}
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
                onChange={(e) => setFormData((prev: any) => ({ ...prev, tenure: e.target.value }))}
                className={errors.tenure ? 'border-red-500' : ''}
                placeholder="Enter tenure in months"
              />
              {errors.tenure && (
                <p className="text-red-500 text-sm mt-1">{errors.tenure}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, startDate: e.target.value }))}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Summary */}
      {accountSummary && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Account Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge className="mb-2 bg-green-100 text-green-800">
                {accountSummary.type.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Principal:</span>
                <span className="font-semibold text-gray-800">
                  ₹{accountSummary.principal.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Interest:</span>
                <span className="font-semibold text-green-600">
                  ₹{accountSummary.interest.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maturity:</span>
                <span className="font-semibold text-blue-600">
                  ₹{accountSummary.maturity.toLocaleString()}
                </span>
              </div>
              
              {accountSummary.emi && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">EMI:</span>
                  <span className="font-semibold text-purple-600">
                    ₹{accountSummary.emi.toLocaleString()}
                  </span>
                </div>
              )}
              
              {accountSummary.totalPayable && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Payable:</span>
                  <span className="font-semibold text-orange-600">
                    ₹{accountSummary.totalPayable.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface AccountRulesTabProps {
  formData: any
  setFormData: any
}

export function AccountRulesTab({ formData, setFormData }: AccountRulesTabProps) {
  return (
    <Card className="bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Cog6ToothIcon className="h-5 w-5 mr-2" />
          Account Rules & Settings
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
                    setFormData((prev: any) => ({ ...prev, interestMode: value }))
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
                    setFormData((prev: any) => ({ ...prev, payoutMode: value }))
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
                    setFormData((prev: any) => ({ ...prev, interestMethod: value }))
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
                    setFormData((prev: any) => ({ ...prev, rdBalanceDateRule: value }))
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
                    onValueChange={(value) => setFormData((prev: any) => ({ ...prev, rdBalanceDay: value }))}
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
                    setFormData((prev: any) => ({ ...prev, loanMethod: value }))
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
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, emiDueDay: value }))}
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
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, gracePeriodDays: value }))}
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
                  onValueChange={(value) => setFormData((prev: any) => ({ ...prev, penaltyRate: value }))}
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
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, roundingPrecision: value }))}
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
  )
}

interface ReviewTabProps {
  formData: any
  selectedCustomer: Customer | null
  accountSummary: any
}

export function ReviewTab({ formData, selectedCustomer, accountSummary }: ReviewTabProps) {
  const maturityDate = formData.startDate && formData.tenure 
    ? new Date(new Date(formData.startDate).setMonth(new Date(formData.startDate).getMonth() + parseInt(formData.tenure)))
    : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customer Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <UserIcon className="h-5 w-5 mr-2" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedCustomer ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right">{selectedCustomer.address}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">No customer selected</p>
          )}
        </CardContent>
      </Card>

      {/* Account Summary */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <BuildingLibraryIcon className="h-5 w-5 mr-2" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800">
              {formData.accountType} Account
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm border-t pt-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Principal:</span>
              <span className="font-semibold">
                ₹{formData.accountType === 'RD' 
                  ? (parseFloat(formData.monthlyInstallment || '0') * parseInt(formData.tenure || '0')).toLocaleString()
                  : parseFloat(formData.principalAmount || '0').toLocaleString()
                }
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Interest Rate:</span>
              <span className="font-medium">{formData.interestRate}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Tenure:</span>
              <span className="font-medium">{formData.tenure} months</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">{new Date(formData.startDate).toLocaleDateString()}</span>
            </div>
            
            {maturityDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Maturity Date:</span>
                <span className="font-medium">{maturityDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calculations */}
      {accountSummary && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Calculations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Earned:</span>
                <span className="font-semibold text-green-600">
                  ₹{accountSummary.interest.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Maturity Amount:</span>
                <span className="font-semibold text-blue-600">
                  ₹{accountSummary.maturity.toLocaleString()}
                </span>
              </div>
              
              {accountSummary.emi && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly EMI:</span>
                  <span className="font-semibold text-purple-600">
                    ₹{accountSummary.emi.toLocaleString()}
                  </span>
                </div>
              )}
              
              {accountSummary.totalPayable && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payable:</span>
                  <span className="font-semibold text-orange-600">
                    ₹{accountSummary.totalPayable.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-center pt-3 border-t">
              <ShieldCheckIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Ready to create account</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
