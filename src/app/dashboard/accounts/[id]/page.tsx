"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CheckCircleIcon,
  PresentationChartBarIcon,
  QueueListIcon,
  BanknotesIcon,
  CircleStackIcon,
  ReceiptPercentIcon,
  InformationCircleIcon,
  PencilIcon
} from "@heroicons/react/24/outline"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const accountId = use(params).id
  const router = useRouter()
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccountDetails()
  }, [accountId])

  const fetchAccountDetails = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/accounts/${accountId}`)
      if (res.ok) {
        const d = await res.json()
        setAccount(d.account)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium italic">Loading account details...</p>
      </div>
    </DashboardLayout>
  )

  if (!account) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
          <ExclamationTriangleIcon className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Account Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-xs">We couldn't find this account. Please check the link and try again.</p>
        <Button onClick={() => router.push('/dashboard/accounts')} className="mt-8 finance-gradient-primary">
          Back to Accounts
        </Button>
      </div>
    </DashboardLayout>
  )

  const isLoan = account.accountType === 'LOAN'
  const rules = account.accountRules || {}
  const totalYield = account.principalAmount * (account.interestRate / 100) * (account.tenure / 12)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up pb-20">
        {/* Page Header */}
        <PageHeader
          title="Account Details"
          subtitle={`${account.accountType} account for ${account.customer.name}`}
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/accounts')}
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 transition-all font-medium"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button className="h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-xl px-4 font-bold transition-all shadow-sm">
                <PencilIcon className="h-3.5 w-3.5 mr-2" />
                Modify Settings
              </Button>
            </div>
          }
        />

        {/* Top Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Deposit Amount"
            value={formatCurrency(account.principalAmount)}
            icon={<BanknotesIcon />}
            trend={{ value: "Current Balance", isPositive: true }}
            className="border-blue-500"
          />
          <StatCard
            title="Interest Rate"
            value={`${account.interestRate}%`}
            icon={<ReceiptPercentIcon />}
            trend={{ value: rules.interestMode || "Per Year", isPositive: true }}
            className="border-indigo-500"
          />
          <StatCard
            title="Duration"
            value={`${account.tenure} Months`}
            icon={<ClockIcon />}
            trend={{ value: `Matures: ${formatDate(account.maturityDate)}`, isPositive: true }}
            className="border-slate-800"
          />
          <StatCard
            title="Account Status"
            value="Verified"
            icon={<ShieldCheckIcon />}
            trend={{ value: "KYC Done", isPositive: true }}
            className="border-emerald-500"
          >
            <Badge className="badge-status-active absolute top-4 right-4 text-[9px] px-2 py-0.5">ACTIVE</Badge>
          </StatCard>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Rules & Metadata Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                  <ArrowPathIcon className="h-4 w-4 mr-2 text-primary" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <ParameterEntry label="Interest Payment" value={rules.interestMode || 'MATURITY'} icon={SparklesIcon} color="text-amber-500" />
                <ParameterEntry label="Payout Method" value={rules.payoutMode || 'REINVEST'} icon={CurrencyDollarIcon} color="text-emerald-500" />
                {isLoan && <ParameterEntry label="Loan Method" value={rules.loanMethod || 'FLAT'} icon={ChartBarIcon} color="text-rose-500" />}
                {rules.emiAmount && <ParameterEntry label="Monthly EMI" value={formatCurrency(rules.emiAmount)} icon={CalendarIcon} color="text-indigo-500" />}
                <ParameterEntry label="Rounding" value={rules.roundingMode || 'Standard'} icon={ReceiptPercentIcon} color="text-slate-400" />
                
                <div className="pt-6 border-t border-slate-100 mt-2">
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex gap-3">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <p className="text-[11px] font-medium text-blue-700 leading-relaxed italic">
                      Interest is calculated using the <span className="font-black">{rules.roundingMode}</span> rounding method and is processed at the end of each month.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <CircleStackIcon className="h-24 w-24 text-white" />
              </div>
              <CardContent className="p-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Interest You'll Earn</p>
                <p className="text-3xl font-black text-white tracking-tight italic">
                  {formatCurrency(totalYield)}
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <Badge className="bg-white/10 text-white border-white/20 text-[10px] py-0.5 font-bold">ESTIMATED GROWTH</Badge>
                </div>
                <p className="text-xs text-slate-400 font-medium italic mt-4 leading-relaxed">
                  Estimated interest over {account.tenure} months at {account.interestRate}% per year.
                </p>
                <Button className="w-full mt-8 bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] h-11 rounded-xl hover:bg-slate-100 transition-all shadow-lg active:scale-95">
                  Request Interest Summary
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Activity Logs / Amortization Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* EMI Schedule for Loans */}
            {isLoan && (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 h-16 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-rose-500" />
                    Amortization Schedule
                  </CardTitle>
                  <Badge className="bg-slate-200 text-slate-700 border-none font-bold text-[10px]">{account.emiEntries?.length || 0} CYCLES</Badge>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/30">
                      <TableRow>
                        <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">EMI No.</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">Due Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-right">Principal</TableHead>
                        <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-right">Interest</TableHead>
                        <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account.emiEntries?.map((emi: any) => (
                        <TableRow key={emi.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                          <TableCell className="px-8 py-4">
                            <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[10px] italic transition-all group-hover:bg-rose-500 group-hover:text-white">
                              {emi.emiNumber}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-900">{formatDate(emi.dueDate)}</TableCell>
                          <TableCell className="text-right text-xs font-bold text-slate-700">{formatCurrency(emi.principalAmount)}</TableCell>
                          <TableCell className="text-right text-xs font-bold text-slate-700">{formatCurrency(emi.interestAmount)}</TableCell>
                          <TableCell className="px-8 text-center">
                            <Badge className={`text-[9px] font-black tracking-widest px-2 py-0.5 border-none ${
                                emi.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                              {emi.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* General Log Activity */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 h-16 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                  <QueueListIcon className="h-4 w-4 mr-2 text-primary" />
                  Transaction History
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] uppercase">{account.suggestedEntries?.length || 0} ENTRIES</Badge>
                </div>
              </CardHeader>
              <div className="min-h-[200px] overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/30">
                    <TableRow>
                      <TableHead className="px-8 text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">Description</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-right px-8">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.suggestedEntries?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-20 text-center">
                          <p className="text-xs text-slate-400 italic">No historical engine logs found for this instrument.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      account.suggestedEntries?.map((entry: any) => (
                        <TableRow key={entry.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                          <TableCell className="px-8 py-5">
                            <div className="text-xs font-bold text-slate-900">{formatDate(entry.periodStartDate)}</div>
                            <div className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-0.5">{entry.type}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-slate-600 italic max-w-xs truncate">{entry.description || 'Interest calculated automatically'}</div>
                          </TableCell>
                          <TableCell className="px-8 text-right">
                            <div className="text-sm font-black text-slate-900 italic tracking-tight">{formatCurrency(entry.amount)}</div>
                            <Badge className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0 mt-1 ${
                                entry.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function ParameterEntry({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center transition-all group-hover:bg-white group-hover:shadow-sm`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest transition-colors group-hover:text-slate-900">{label}</p>
      </div>
      <p className="text-xs font-black italic text-slate-900 tabular-nums">{value}</p>
    </div>
  )
}
