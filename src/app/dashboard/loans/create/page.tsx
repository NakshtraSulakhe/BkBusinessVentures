"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  CircleStackIcon,
  UsersIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

function CreateLoanComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  const [formData, setFormData] = useState({
    customerId: searchParams.get('customerId') || '',
    accountNumber: '',
    principalAmount: '',
    interestRate: '',
    tenure: '',
    startDate: new Date().toISOString().split('T')[0],
    loanMethod: 'reducing' as 'flat' | 'reducing',
    emiDueDay: '1',
    gracePeriodDays: '3',
    penaltyRate: '1.0',
    roundingMode: 'nearest' as 'nearest' | 'up' | 'down',
    roundingPrecision: '2'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchCustomers = async () => {
    try {
      const response = await fetchWithAuth('/api/customers?limit=1000', { token })
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
        if (formData.customerId) {
          const found = data.customers.find((c: Customer) => c.id === formData.customerId)
          if (found) setSelectedCustomer(found)
        }
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const calculateEMI = () => {
    const principal = parseFloat(formData.principalAmount) || 0
    const rate = parseFloat(formData.interestRate) || 0
    const tenure = parseInt(formData.tenure) || 0
    if (!principal || !rate || !tenure) return 0
    
    if (formData.loanMethod === 'flat') {
      const totalInterest = principal * (rate / 100) * (tenure / 12)
      return (principal + totalInterest) / tenure
    } else {
      const monthlyRate = rate / 12 / 100
      const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1)
      return isNaN(emi) ? 0 : emi
    }
  }

  const calculateMaturityDate = () => {
    if (!formData.startDate || !formData.tenure) return ''
    const d = new Date(formData.startDate)
    d.setMonth(d.getMonth() + parseInt(formData.tenure))
    return formatDateSafe(d)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customerId || !formData.principalAmount || !formData.accountNumber) {
      setErrors({ 
        customerId: !formData.customerId ? 'Required' : '', 
        accountNumber: !formData.accountNumber ? 'Required' : '',
        amount: 'Required' 
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetchWithAuth('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        token,
        body: JSON.stringify({
          ...formData,
          accountType: 'loan',
          principalAmount: parseFloat(formData.principalAmount),
          interestRate: parseFloat(formData.interestRate),
          tenure: parseInt(formData.tenure),
          emiAmount: calculateEMI(),
          maturityDate: new Date(new Date(formData.startDate).setMonth(new Date(formData.startDate).getMonth() + parseInt(formData.tenure))).toISOString(),
          emiDueDay: parseInt(formData.emiDueDay),
          gracePeriodDays: parseInt(formData.gracePeriodDays),
          penaltyRate: parseFloat(formData.penaltyRate),
          roundingPrecision: parseInt(formData.roundingPrecision)
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Loan instrument provisioned successfully' })
        setTimeout(() => router.push('/dashboard/loans'), 2000)
      } else {
        const err = await response.json()
        setMessage({ type: 'error', text: err.error || 'Failed to initialize account' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Protocol exchange failure' })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt)
  }

  const emi = calculateEMI()
  const totalPayable = emi * (parseInt(formData.tenure) || 0)

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Provision Loan Instrument"
        subtitle="Initialize a debt portfolio for a verified credit-worthy client"
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/loans')}
            className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
          >
            Cancel setup
          </Button>
        }
      />

      {message && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mt-0.5" /> : <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />}
          <div className="text-sm font-bold">{message.text}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Entity Linkage */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <UsersIcon className="h-4 w-4 mr-2 text-primary" />
                1. Select Borrower
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Borrower Name</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-11 justify-between border-slate-200 rounded-lg bg-slate-50/30 hover:bg-white transition-all text-slate-900 font-bold">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-slate-400" />
                          {selectedCustomer ? selectedCustomer.name : "Select borrower..."}
                        </div>
                        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[400px] max-h-[300px] overflow-y-auto">
                      <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-slate-400">Search Results</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {customers.map(c => (
                        <DropdownMenuItem key={c.id} className="py-3 px-4 flex flex-col items-start gap-1 cursor-pointer hover:bg-slate-50" onClick={() => { setSelectedCustomer(c); setFormData(p => ({ ...p, customerId: c.id })) }}>
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">#{c.id.slice(-8).toUpperCase()} • {c.phone}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.customerId && <p className="text-[10px] text-rose-500 font-bold ml-1">Borrower selection is mandatory</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Financial Matrix */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-primary" />
                2. Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Loan Number</label>
                  <div className="relative">
                    <BuildingLibraryIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="text" placeholder="e.g., LN260400001" value={formData.accountNumber} onChange={e => setFormData(p => ({ ...p, accountNumber: e.target.value }))} className="pl-10 h-11 border-slate-200 bg-slate-50/30 font-black tracking-tight" />
                  </div>
                  {errors.accountNumber && <p className="text-[10px] text-rose-500 font-bold ml-1">Account number is mandatory</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Loan Amount</label>
                  <div className="relative">
                    <BanknotesIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="number" placeholder="0.00" value={formData.principalAmount} onChange={e => setFormData(p => ({ ...p, principalAmount: e.target.value }))} className="pl-10 h-11 border-slate-200 bg-slate-50/30 font-black tracking-tight" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Start Date</label>
                  <div className="relative">
                    <CalendarIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="date" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} className="pl-10 h-11 border-slate-200 bg-slate-50/30 font-medium" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Interest Rate (%)</label>
                  <div className="relative">
                    <ReceiptPercentIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="number" placeholder="0.00" value={formData.interestRate} onChange={e => setFormData(p => ({ ...p, interestRate: e.target.value }))} className="pl-10 h-11 border-slate-200 bg-slate-50/30 font-black tracking-tight" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Duration (Months)</label>
                  <div className="relative">
                    <ClockIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input type="number" placeholder="0" value={formData.tenure} onChange={e => setFormData(p => ({ ...p, tenure: e.target.value }))} className="pl-10 h-11 border-slate-200 bg-slate-50/30 font-black tracking-tight" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Operational Rules */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <Cog6ToothIcon className="h-4 w-4 mr-2 text-primary" />
                3. Loan Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Interest Method</label>
                  <Select value={formData.loanMethod} onValueChange={v => setFormData(p => ({ ...p, loanMethod: v as any }))}>
                    <SelectTrigger className="h-11 border-slate-200 bg-slate-50/30 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Interest Rate</SelectItem>
                      <SelectItem value="reducing">Reducing Balance EMI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">EMI Due Date</label>
                  <Select value={formData.emiDueDay} onValueChange={v => setFormData(p => ({ ...p, emiDueDay: v }))}>
                    <SelectTrigger className="h-11 border-slate-200 bg-slate-50/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(28)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Day {i + 1} of Month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Grace Period (Days)</label>
                  <Input type="number" value={formData.gracePeriodDays} onChange={e => setFormData(p => ({ ...p, gracePeriodDays: e.target.value }))} className="h-11 border-slate-200 bg-slate-50/30 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Overdue Penalty (%)</label>
                  <Input type="number" step="0.1" value={formData.penaltyRate} onChange={e => setFormData(p => ({ ...p, penaltyRate: e.target.value }))} className="h-11 border-slate-200 bg-slate-50/30 font-bold" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Projection Intelligence */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CircleStackIcon className="h-24 w-24 text-white" />
            </div>
            <CardHeader className="px-8 pt-8 pb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Repayment Schedule</p>
              <CardTitle className="text-white tracking-tight text-xl mt-1">EMI Preview</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly EMI</p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  {formatCurrency(emi)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">End Date</p>
                  <p className="text-xs font-bold text-slate-300">{calculateMaturityDate() || "TBD"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Total Payable</p>
                  <p className="text-xs font-bold text-slate-300">{formatCurrency(totalPayable)}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Credit Approved</span>
                </div>
                <Button type="submit" disabled={loading} className="w-full finance-gradient-primary text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {loading ? (
                    <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating Loan...
                    </div>
                  ) : "Create Loan"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center">
              <InformationCircleIcon className="h-4 w-4 mr-2 text-primary" />
              Key Points
            </h4>
            <div className="space-y-3">
              {[
                "Loan is disbursed immediately upon creation",
                "Interest is calculated based on selected method",
                "Grace period applies before penalty is charged",
                "EMI due date determines payment reminders"
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

export default function CreateLoan() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading setup...</div>}>
        <CreateLoanComponent />
      </Suspense>
    </DashboardLayout>
  )
}
