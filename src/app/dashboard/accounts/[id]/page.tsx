"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
   BanknotesIcon
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
         style: 'currency', currency: 'INR'
      }).format(amount)
   }

   if (loading) return (
      <DashboardLayout>
         <div className="p-6 min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
               <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
               <p className="mt-4 text-slate-400 font-black uppercase tracking-widest text-xs italic tracking-[0.2em]">Syncing Account DNA...</p>
            </div>
         </div>
      </DashboardLayout>
   )

   if (!account) return (
      <DashboardLayout>
         <div className="p-6 min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center text-red-500 font-bold italic uppercase tracking-widest">ERROR: Account Domain Not Resolved</div>
         </div>
      </DashboardLayout>
   )

   const isLoan = account.accountType === 'LOAN'
   const rules = account.accountRules || {}

   return (
      <DashboardLayout>
         <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
            <div className="max-w-7xl mx-auto space-y-6">

               {/* Header */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="h-10 w-10 p-0 rounded-full hover:bg-white transition-colors"
                     >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
                     </Button>
                     <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic tracking-tighter">
                           Instrument Intelligence
                        </h1>
                        <p className="text-gray-500 mt-2 flex items-center font-bold text-sm">
                           <Badge variant="outline" className="mr-3 font-mono text-[10px] tracking-widest border-blue-100 bg-blue-50/50 text-blue-600 italic">ID: {account.accountNumber}</Badge>
                           {account.customer.name} • Active Exposure
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center space-x-3">
                     <Button variant="outline" className="h-11 px-6 font-bold border-slate-200 bg-white/60 hover:bg-white shadow-sm italic text-xs rounded-xl">
                        <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                        Clone Rules
                     </Button>
                     <Button className="bg-slate-900 text-white h-11 px-8 font-black uppercase tracking-widest italic rounded-xl shadow-xl active:scale-95 transition-all">
                        Edit Parameter Suite
                     </Button>
                  </div>
               </div>

               {/* Core DNA Stats */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                     <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Yield Configuration</p>
                              <p className="text-3xl font-black text-slate-900 tabular-nums italic tracking-tighter">{account.interestRate}%</p>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest italic flex items-center">
                                 APY Guaranteed
                              </p>
                           </div>
                           <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-white">
                              <PresentationChartBarIcon className="h-7 w-7 text-white" />
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                     <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Principal Depth</p>
                              <p className="text-2xl font-black text-slate-900 tabular-nums italic tracking-tighter">{formatCurrency(account.principalAmount)}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic flex items-center">
                                 Contracted Capital
                              </p>
                           </div>
                           <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg border-2 border-white">
                              <BanknotesIcon className="h-7 w-7 text-white" />
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                     <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Lifecycle Duration</p>
                              <p className="text-2xl font-black text-slate-900 mt-1">{account.tenure} Months</p>
                              <p className="text-[10px) font-bold text-gray-500 uppercase tracking-widest italic flex items-center">
                                 {new Date(account.maturityDate).toLocaleDateString()} Final
                              </p>
                           </div>
                           <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg border-2 border-white">
                              <ClockIcon className="h-7 w-7 text-white" />
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                     <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Compliance State</p>
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black italic rounded-sm text-[10px] tracking-widest uppercase mt-2">Verified ACTIVE</Badge>
                              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest italic flex items-center mt-2">
                                 <ShieldCheckIcon className="h-3 w-3 mr-1" /> Tier 1 Risk OK
                              </p>
                           </div>
                           <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg border-2 border-white">
                              <ShieldCheckIcon className="h-7 w-7 text-white" />
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               </div>

               <div className="grid lg:grid-cols-3 gap-8">

                  {/* Left: Rules & Parameters */}
                  <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                     <Card className="bg-white/60 backdrop-blur-sm border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <CardHeader className="bg-white/40 border-b border-slate-100 px-8 h-20 flex flex-row items-center">
                           <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 italic flex items-center">
                              <ArrowPathIcon className="h-5 w-5 mr-3 text-blue-600" />
                              Operational Parameters
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                           <RuleEntry label="Interest Protocol" value={rules.interestMode || 'MATURITY'} icon={<SparklesIcon className="h-4 w-4 text-blue-500" />} />
                           <RuleEntry label="Payout Strategy" value={rules.payoutMode || 'REINVEST'} icon={<ClockIcon className="h-4 w-4 text-indigo-500" />} />
                           {isLoan && <RuleEntry label="Amortization" value={rules.loanMethod || 'FLAT'} icon={<ChartBarIcon className="h-4 w-4 text-rose-500" />} />}
                           {rules.emiAmount && <RuleEntry label="Periodic Due" value={formatCurrency(rules.emiAmount)} icon={<CalendarIcon className="h-4 w-4 text-emerald-500" />} />}
                           <RuleEntry label="Rounding" value={`${rules.roundingMode} (${rules.roundingPrecision}px)`} icon={<SparklesIcon className="h-4 w-4 text-slate-400" />} />
                           <div className="pt-6 border-t border-slate-50">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic mb-2">Internal Meta</p>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium italic">All interest calculations are finalized at month-end based on the established {rules.roundingMode} rounding protocol at 2 decimal points of precision.</p>
                           </div>
                        </CardContent>
                     </Card>

                     <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-8">
                           <div className="flex items-center space-x-4 mb-6">
                              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                 <QueueListIcon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Lifecycle Yield</p>
                                 <p className="text-2xl font-black text-white italic">₹{(account.principalAmount * (account.interestRate / 100) * (account.tenure / 12)).toLocaleString()}</p>
                              </div>
                           </div>
                           <p className="text-xs text-slate-400 font-medium italic mb-6">Projected growth based on contractual APY and {account.tenure}-month period.</p>
                           <Button className="w-full bg-white text-slate-900 font-black uppercase tracking-widest italic h-12 rounded-xl hover:bg-slate-100 transition-all">
                              Forecasting Suite
                           </Button>
                        </CardContent>
                     </Card>
                  </div>

                  {/* Right: Dynamic Intelligence Tables (Schedule / Suggestions) */}
                  <div className="lg:col-span-2 space-y-8 pb-20">

                     {/* Schedule Table (ONLY FOR LOANS) */}
                     {isLoan && (
                        <Card className="bg-white/60 backdrop-blur-sm border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                           <CardHeader className="bg-white/40 border-b border-slate-100 px-8 h-20 flex flex-row items-center justify-between">
                              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 italic flex items-center">
                                 <CalendarIcon className="h-5 w-5 mr-3 text-rose-500" />
                                 EMI Amortization Schedule
                              </CardTitle>
                              <Badge variant="outline" className="font-mono text-[9px] tracking-widest uppercase py-1 px-3 italic">{account.emiEntries?.length || 0} PERIODS</Badge>
                           </CardHeader>
                           <CardContent className="p-0">
                              <Table>
                                 <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-none">
                                       <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-slate-900 h-14">Period #</TableHead>
                                       <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-900 h-14">Target Date</TableHead>
                                       <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-900 h-14 text-right">Principal</TableHead>
                                       <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-900 h-14 text-right">Yield</TableHead>
                                       <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-slate-900 h-14 text-center">Status</TableHead>
                                    </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                    {account.emiEntries?.map((emi: any) => (
                                       <TableRow key={emi.id} className="hover:bg-rose-50/10 transition-colors border-b border-slate-50 group">
                                          <TableCell className="px-8 py-5">
                                             <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs italic group-hover:bg-rose-600 group-hover:text-white transition-all">
                                                {emi.emiNumber}
                                             </div>
                                          </TableCell>
                                          <TableCell className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                                             {new Date(emi.dueDate).toLocaleDateString()}
                                          </TableCell>
                                          <TableCell className="text-right text-sm font-black italic">{formatCurrency(emi.principalAmount)}</TableCell>
                                          <TableCell className="text-right text-sm font-black italic">{formatCurrency(emi.interestAmount)}</TableCell>
                                          <TableCell className="px-8 text-center text-xs">
                                             <Badge className={`uppercase font-black text-[9px] tracking-widest px-3 py-1 rounded-sm border ${emi.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                {emi.status}
                                             </Badge>
                                          </TableCell>
                                       </TableRow>
                                    ))}
                                 </TableBody>
                              </Table>
                           </CardContent>
                        </Card>
                     )}

                     {/* Suggestions History */}
                     <Card className="bg-white/60 backdrop-blur-sm border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <CardHeader className="bg-white/40 border-b border-slate-100 px-8 h-20 flex flex-row items-center justify-between">
                           <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900 italic flex items-center">
                              <SparklesIcon className="h-5 w-5 mr-3 text-blue-500" />
                              Engine Intelligence Logs
                           </CardTitle>
                           <Badge variant="outline" className="font-mono text-[9px] tracking-widest uppercase py-1 px-3 italic">{account.suggestedEntries?.length || 0} LOGS</Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                           <Table>
                              <TableHeader className="bg-slate-50/50">
                                 <TableRow className="border-none">
                                    <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-slate-900 h-14">Cycle</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-900 h-14">Log Entry</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-900 h-14 text-right px-8 font-black">Magnitude</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {account.suggestedEntries?.length === 0 ? (
                                    <TableRow>
                                       <TableCell colSpan={3} className="py-20 text-center">
                                          <SparklesIcon className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                                          <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">No Engine Records Found For This Instrument</p>
                                       </TableCell>
                                    </TableRow>
                                 ) : (
                                    account.suggestedEntries?.map((entry: any) => (
                                       <TableRow key={entry.id} className="hover:bg-blue-50/10 transition-colors border-b border-slate-50 group">
                                          <TableCell className="px-8 py-6">
                                             <div className="space-y-1">
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">
                                                   {new Date(entry.periodStartDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs font-bold text-slate-400 italic">{entry.type}</p>
                                             </div>
                                          </TableCell>
                                          <TableCell className="max-w-xs overflow-hidden">
                                             <span className="text-xs font-medium text-slate-600 italic leading-none">{entry.description || 'System-generated entry'}</span>
                                          </TableCell>
                                          <TableCell className="px-8 text-right">
                                             <div className="space-y-1">
                                                <p className="text-lg font-black italic tracking-tighter text-slate-900">{formatCurrency(entry.amount)}</p>
                                                <Badge className={`uppercase font-black text-[9px] tracking-[0.15em] px-2 py-0 border ${entry.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                   {entry.status}
                                                </Badge>
                                             </div>
                                          </TableCell>
                                       </TableRow>
                                    ))
                                 )}
                              </TableBody>
                           </Table>
                        </CardContent>
                     </Card>
                  </div>

               </div>
            </div>
         </div>
      </DashboardLayout>
   )
}

function RuleEntry({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
   return (
      <div className="flex items-center justify-between group">
         <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center mr-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
               {icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">{label}</p>
         </div>
         <p className="text-sm font-black italic text-slate-900">{value}</p>
      </div>
   )
}
