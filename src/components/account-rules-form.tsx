"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  CogIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline"

interface AccountRules {
  interestMode: "monthly" | "maturity"
  payoutMode: "reinvest" | "payout"
  loanMethod?: "flat" | "reducing"
  emiAmount?: number
  emiDueDay?: number
  gracePeriodDays: number
  roundingMode: "nearest" | "up" | "down"
  roundingPrecision: number
  numberingTemplateId?: string
  customFields?: Record<string, any>
}

interface AccountRulesFormProps {
  accountType: "fd" | "rd" | "loan"
  initialRules?: Partial<AccountRules>
  onRulesChange: (rules: AccountRules) => void
}

export function AccountRulesForm({ accountType, initialRules, onRulesChange }: AccountRulesFormProps) {
  const [rules, setRules] = useState<AccountRules>({
    interestMode: initialRules?.interestMode || "maturity",
    payoutMode: initialRules?.payoutMode || "reinvest",
    loanMethod: initialRules?.loanMethod,
    emiAmount: initialRules?.emiAmount,
    emiDueDay: initialRules?.emiDueDay,
    gracePeriodDays: initialRules?.gracePeriodDays || 0,
    roundingMode: initialRules?.roundingMode || "nearest",
    roundingPrecision: initialRules?.roundingPrecision || 2,
    numberingTemplateId: initialRules?.numberingTemplateId,
    customFields: initialRules?.customFields || {}
  })

  const updateRule = (key: keyof AccountRules, value: any) => {
    const newRules = { ...rules, [key]: value }
    setRules(newRules)
    onRulesChange(newRules)
  }

  const isLoan = accountType === "loan"
  const isDeposit = accountType === "fd" || accountType === "rd"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CogIcon className="h-5 w-5 mr-2" />
          Account Rules Configuration
          <Badge variant="outline" className="ml-2">
            {accountType.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interest Configuration */}
        {isDeposit && (
          <div className="space-y-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 mr-2 text-blue-500" />
              <h3 className="text-lg font-semibold">Interest Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interestMode">Interest Mode</Label>
                <Select value={rules.interestMode} onValueChange={(value: "monthly" | "maturity") => updateRule("interestMode", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Payout</SelectItem>
                    <SelectItem value="maturity">Maturity Payout</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {rules.interestMode === "monthly" ? "Interest paid monthly" : "Interest paid at maturity"}
                </p>
              </div>

              <div>
                <Label htmlFor="payoutMode">Payout Mode</Label>
                <Select value={rules.payoutMode} onValueChange={(value: "reinvest" | "payout") => updateRule("payoutMode", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reinvest">Reinvest</SelectItem>
                    <SelectItem value="payout">Payout</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {rules.payoutMode === "reinvest" ? "Interest reinvested" : "Interest paid out"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loan Configuration */}
        {isLoan && (
          <div className="space-y-4">
            <div className="flex items-center">
              <CalculatorIcon className="h-4 w-4 mr-2 text-green-500" />
              <h3 className="text-lg font-semibold">Loan Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loanMethod">Loan Method</Label>
                <Select value={rules.loanMethod} onValueChange={(value: "flat" | "reducing") => updateRule("loanMethod", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Rate</SelectItem>
                    <SelectItem value="reducing">Reducing Balance</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {rules.loanMethod === "flat" ? "Interest on entire principal" : "Interest on outstanding balance"}
                </p>
              </div>

              <div>
                <Label htmlFor="emiAmount">EMI Amount (Optional)</Label>
                <Input
                  id="emiAmount"
                  type="number"
                  step="0.01"
                  value={rules.emiAmount || ""}
                  onChange={(e) => updateRule("emiAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Auto-calculated if empty"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for auto-calculation</p>
              </div>

              <div>
                <Label htmlFor="emiDueDay">EMI Due Day</Label>
                <Select value={rules.emiDueDay?.toString()} onValueChange={(value) => updateRule("emiDueDay", value ? parseInt(value) : undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select due day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gracePeriodDays">Grace Period (Days)</Label>
                <Input
                  id="gracePeriodDays"
                  type="number"
                  min="0"
                  value={rules.gracePeriodDays}
                  onChange={(e) => updateRule("gracePeriodDays", parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-gray-500 mt-1">Days allowed for late payment</p>
              </div>
            </div>
          </div>
        )}

        {/* Rounding Configuration */}
        <div className="space-y-4">
          <div className="flex items-center">
            <CalculatorIcon className="h-4 w-4 mr-2 text-purple-500" />
            <h3 className="text-lg font-semibold">Rounding Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roundingMode">Rounding Mode</Label>
              <Select value={rules.roundingMode} onValueChange={(value: "nearest" | "up" | "down") => updateRule("roundingMode", value)}>
                <SelectTrigger>
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
              <Label htmlFor="roundingPrecision">Rounding Precision</Label>
              <Select value={rules.roundingPrecision.toString()} onValueChange={(value) => updateRule("roundingPrecision", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (Whole numbers)</SelectItem>
                  <SelectItem value="1">1 (1 decimal place)</SelectItem>
                  <SelectItem value="2">2 (2 decimal places)</SelectItem>
                  <SelectItem value="3">3 (3 decimal places)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Numbering Template */}
        <div className="space-y-4">
          <div className="flex items-center">
            <InformationCircleIcon className="h-4 w-4 mr-2 text-orange-500" />
            <h3 className="text-lg font-semibold">Numbering Template</h3>
          </div>
          
          <div>
            <Label htmlFor="numberingTemplateId">Account Number Template</Label>
            <Select value={rules.numberingTemplateId} onValueChange={(value) => updateRule("numberingTemplateId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Use default template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Template</SelectItem>
                <SelectItem value="custom-1">Custom Template 1</SelectItem>
                <SelectItem value="custom-2">Custom Template 2</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Template for generating account numbers (e.g., FD-2024-001)
            </p>
          </div>
        </div>

        {/* Rules Summary */}
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <h4 className="font-semibold mb-2">Rules Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {isDeposit && (
                <>
                  <div><strong>Interest:</strong> {rules.interestMode}</div>
                  <div><strong>Payout:</strong> {rules.payoutMode}</div>
                </>
              )}
              {isLoan && rules.loanMethod && (
                <>
                  <div><strong>Loan Method:</strong> {rules.loanMethod}</div>
                  <div><strong>EMI Due:</strong> {rules.emiDueDay ? `${rules.emiDueDay}${rules.emiDueDay === 1 ? 'st' : rules.emiDueDay === 2 ? 'nd' : rules.emiDueDay === 3 ? 'rd' : 'th'}` : 'Not set'}</div>
                  {rules.emiAmount && <div><strong>EMI Amount:</strong> ₹{rules.emiAmount}</div>}
                </>
              )}
              <div><strong>Grace Period:</strong> {rules.gracePeriodDays} days</div>
              <div><strong>Rounding:</strong> {rules.roundingMode} ({rules.roundingPrecision} decimals)</div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
