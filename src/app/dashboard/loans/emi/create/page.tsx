"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { cn } from "@/lib/utils"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  User,
  Info,
  CreditCard,
  BarChart3,
  Banknote,
  Clock,
  ChevronDown,
  Receipt,
  FileText,
  TrendingUp,
  ShieldCheck
} from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

interface LoanAccount {
  id: string
  accountNumber: string
  customerId: string
  principalAmount: number
  interestRate: number
  tenure: number
  startDate: string
  accountType: string
  customer: {
    name: string
    email: string
  }
  accountRules?: {
    emiAmount: number
    emiDueDay: number
    gracePeriodDays: number
    penaltyRate: number
  }
  _count?: {
    transactions: number
  }
}

interface CustomerBalance {
  totalDeposits: number
  totalLoans: number
  netWorth: number
  fdAccounts: any[]
  rdAccounts: any[]
  loanAccounts: any[]
}

function CreateEMIComponent() {
  const router = useRouter()
  const { token } = useAuth()
  const searchParams = useSearchParams()
  const [loanAccounts, setLoanAccounts] = useState<LoanAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<LoanAccount | null>(null)
  const [customerBalance, setCustomerBalance] = useState<CustomerBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    accountId: searchParams.get('accountId') || '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as 'cash' | 'bank' | 'cheque' | 'online',
    referenceNumber: '',
    notes: '',
    penaltyAmount: '0'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchLoanAccounts = async () => {
    try {
      const response = await fetchWithAuth('/api/accounts?accountType=LOAN', { token })
      if (response.ok) {
        const data = await response.json()
        setLoanAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error('Failed to fetch loan accounts:', error)
    }
  }

  const fetchCustomerBalance = async (customerId: string) => {
    try {
      const response = await fetchWithAuth(`/api/customers/${customerId}/ledger`, { token })
      if (response.ok) {
        const data = await response.json()
        setCustomerBalance({
          totalDeposits: data.financialSummary.totalDeposits,
          totalLoans: data.financialSummary.totalLoans,
          netWorth: data.financialSummary.netWorth,
          fdAccounts: data.accounts.filter((acc: any) => acc.accountType === 'FD'),
          rdAccounts: data.accounts.filter((acc: any) => acc.accountType === 'RD'),
          loanAccounts: data.accounts.filter((acc: any) => acc.accountType === 'LOAN')
        })
      }
    } catch (error) {
      console.error('Failed to fetch customer balance:', error)
    }
  }

  useEffect(() => {
    fetchLoanAccounts()
  }, [])

  useEffect(() => {
    if (formData.accountId && loanAccounts.length > 0) {
      const account = loanAccounts.find(a => a.id === formData.accountId)
      if (account) {
        setSelectedAccount(account)
        
        // Pre-fill EMI amount if available
        if (account.accountRules?.emiAmount) {
          setFormData(prev => ({ 
            ...prev, 
            amount: account.accountRules?.emiAmount?.toString() || '' 
          }))
        }
        
        // Fetch customer balance data
        fetchCustomerBalance(account.customerId)
      } else {
        setSelectedAccount(null)
        setCustomerBalance(null)
      }
    }
  }, [formData.accountId, loanAccounts])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.accountId) newErrors.accountId = 'Loan account is required'
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculatePenalty = () => {
    if (!selectedAccount || !selectedAccount.accountRules) return 0
    
    const dueDay = selectedAccount.accountRules.emiDueDay
    const graceDays = selectedAccount.accountRules.gracePeriodDays
    const penaltyRate = selectedAccount.accountRules.penaltyRate
    
    const paymentDate = new Date(formData.paymentDate)
    const currentMonth = paymentDate.getMonth()
    const currentYear = paymentDate.getFullYear()
    const dueDate = new Date(currentYear, currentMonth, dueDay)
    
    if (paymentDate > dueDate) {
      const daysLate = Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 24))
      const gracePeriodDaysLate = daysLate - graceDays
      
      if (gracePeriodDaysLate > 0) {
        const emiAmount = parseFloat(formData.amount || '0')
        return (emiAmount * penaltyRate / 100) * (gracePeriodDaysLate / 30)
      }
    }
    
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      const penalty = calculatePenalty()
      const totalAmount = parseFloat(formData.amount || '0') + penalty
      
      const response = await fetchWithAuth('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        token,
        body: JSON.stringify({
          accountId: formData.accountId,
          type: 'deposit', // EMI payment is recorded as deposit
          amount: totalAmount,
          description: `EMI payment${penalty > 0 ? ` (includes ₹${penalty.toFixed(2)} penalty)` : ''}`,
          reference: formData.referenceNumber || `EMI-${new Date().toISOString().split('T')[0]}`
        }),
      })

      if (response.ok) {
        showMessage('EMI payment recorded successfully', 'success')
        setTimeout(() => {
          router.push('/dashboard/loans')
        }, 2000)
      } else {
        const errorData = await response.json()
        showMessage(errorData.error || 'Failed to record EMI payment', 'error')
      }
    } catch (error) {
      console.error('Failed to record EMI payment:', error)
      showMessage('Failed to record EMI payment', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt)
  }

  const penalty = calculatePenalty()
  const totalAmount = parseFloat(formData.amount || '0') + penalty

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Record EMI Payment"
        subtitle="Process installment payment for active loan account"
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/loans')}
            className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
          >
            Cancel
          </Button>
        }
      />

      {message && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5" /> : <AlertTriangle className="h-5 w-5 mt-0.5" />}
          <div className="text-sm font-bold">{message.text}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Account Selection */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-primary" />
                1. Account Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Loan Account</label>
                  <Select value={formData.accountId} onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: value }))}>
                    <SelectTrigger className={`h-11 border-slate-200 bg-slate-50/30 ${errors.accountId ? 'border-rose-500' : ''}`}>
                      <SelectValue placeholder="Select loan account..." />
                    </SelectTrigger>
                    <SelectContent>
                      {loanAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex flex-col items-start">
                            <span className="font-bold text-slate-900">{account.accountNumber}</span>
                            <span className="text-xs text-slate-500">{account.customer.name} — ₹{(account.principalAmount / 100000).toFixed(1)}L</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.accountId && <p className="text-[10px] text-rose-500 font-bold ml-1">Account selection is mandatory</p>}
                </div>

                {/* Customer Balance Information */}
                {customerBalance && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-xl">
                    <h4 className="text-xs font-black text-violet-800 uppercase tracking-widest mb-4 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Customer Portfolio Summary
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white/60 rounded-lg">
                        <p className="text-[10px] font-black text-violet-500 uppercase tracking-wider">Total Deposits</p>
                        <p className="text-lg font-black text-violet-900">{formatCurrency(customerBalance.totalDeposits)}</p>
                      </div>
                      <div className="text-center p-3 bg-white/60 rounded-lg">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider">Total Loans</p>
                        <p className="text-lg font-black text-rose-600">{formatCurrency(customerBalance.totalLoans)}</p>
                      </div>
                      <div className="text-center p-3 bg-white/60 rounded-lg">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Net Position</p>
                        <p className={`text-lg font-black ${customerBalance.netWorth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(customerBalance.netWorth)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Account Details */}
                {selectedAccount && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      Account Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Account Number</span>
                        <p className="font-bold text-slate-900">{selectedAccount.accountNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Principal Amount</span>
                        <p className="font-bold text-slate-900">{formatCurrency(selectedAccount.principalAmount)}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Interest Rate</span>
                        <p className="font-bold text-slate-900">{selectedAccount.interestRate}%</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Tenure</span>
                        <p className="font-bold text-slate-900">{selectedAccount.tenure} months</p>
                      </div>
                    </div>
                    {selectedAccount.accountRules?.emiAmount && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Scheduled EMI Amount</span>
                          <p className="font-black text-primary text-lg">{formatCurrency(selectedAccount.accountRules.emiAmount)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Payment Details */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-primary" />
                2. Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">EMI Amount (Rs.)</label>
                  <div className="relative">
                    <Banknote className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      value={formData.amount} 
                      onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} 
                      className={`pl-10 h-11 border-slate-200 bg-slate-50/30 font-black tracking-tight ${errors.amount ? 'border-rose-500' : ''}`} 
                    />
                  </div>
                  {errors.amount && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.amount}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Payment Date</label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                      type="date" 
                      value={formData.paymentDate} 
                      onChange={e => setFormData(p => ({ ...p, paymentDate: e.target.value }))} 
                      className={`pl-10 h-11 border-slate-200 bg-slate-50/30 font-medium ${errors.paymentDate ? 'border-rose-500' : ''}`} 
                    />
                  </div>
                  {errors.paymentDate && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.paymentDate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Payment Method</label>
                  <Select value={formData.paymentMethod} onValueChange={v => setFormData(p => ({ ...p, paymentMethod: v as any }))}>
                    <SelectTrigger className="h-11 border-slate-200 bg-slate-50/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Reference Number</label>
                  <Input 
                    type="text" 
                    value={formData.referenceNumber} 
                    onChange={e => setFormData(p => ({ ...p, referenceNumber: e.target.value }))} 
                    placeholder="Transaction reference (optional)"
                    className="h-11 border-slate-200 bg-slate-50/30" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Additional Information */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <Info className="h-4 w-4 mr-2 text-primary" />
                3. Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  placeholder="Add any notes about this payment..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Payment Summary */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Receipt className="h-24 w-24 text-white" />
            </div>
            <CardHeader className="px-8 pt-8 pb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment Summary</p>
              <CardTitle className="text-white tracking-tight text-xl mt-1">Transaction Preview</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">EMI Amount</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(parseFloat(formData.amount) || 0)}</p>
                </div>
                
                {penalty > 0 && (
                  <div className="flex justify-between items-center p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <p className="text-[10px] font-bold text-rose-400 uppercase">Late Penalty</p>
                    </div>
                    <p className="text-sm font-bold text-rose-400">{formatCurrency(penalty)}</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Total Payable</p>
                    <p className="text-2xl font-black text-white tracking-tighter">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              </div>

              {selectedAccount && (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Due Day</p>
                    <p className="text-xs font-bold text-slate-300">{selectedAccount.accountRules?.emiDueDay || 'N/A'} of each month</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Grace Period</p>
                    <p className="text-xs font-bold text-slate-300">{selectedAccount.accountRules?.gracePeriodDays || 'N/A'} days</p>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Payment Verification Ready</span>
                </div>
                <Button type="submit" disabled={loading} className="w-full finance-gradient-primary text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : "Record EMI Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              EMI Guidelines
            </h4>
            <div className="space-y-3">
              {[
                "Payments must be recorded on or before the due date",
                "Late payments incur penalty after grace period expires",
                "Reference number is required for online transfers",
                "Cash payments are capped at Rs.49,999 per transaction"
              ].map((text, idx) => (
                <div key={idx} className="flex gap-2 text-[10px] font-bold text-slate-500 leading-tight">
                  <div className="h-1 w-1 bg-slate-300 rounded-full mt-1.5 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default function CreateEMI() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <CreateEMIComponent />
      </Suspense>
    </DashboardLayout>
  )
}
