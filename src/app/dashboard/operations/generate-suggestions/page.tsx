"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import { 
  ArrowLeftIcon, 
  RocketLaunchIcon, 
  CalendarDaysIcon, 
  SparklesIcon, 
  InformationCircleIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ArrowPathIcon,
  BoltIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"

function GenerateSuggestionsContent() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => { setMounted(true) }, [])

  const handleGenerate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/suggestions/run-monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear
        })
      })

      if (response.ok) {
        router.push('/dashboard/operations/suggestions')
      } else {
        const error = await response.json()
        alert(error.error || 'Engine execution failed.')
      }
    } catch (error) {
      console.error(error)
      alert('Internal engine protocol error.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Instrument Lifecycle Engine"
        subtitle="Initialize automated predictive discovery for monthly periodic instruments"
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/operations/suggestions')}
            className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium transition-all"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Queue
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Generator Form */}
        <div className="lg:col-span-7">
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-8 flex items-center justify-between">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                <CpuChipIcon className="h-4 w-4 mr-3 text-primary" />
                Processing Parameters
              </CardTitle>
              <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] uppercase h-5 px-2">Ready for Execution</Badge>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <CalendarDaysIcon className="h-3 w-3" />
                    Target Operational Period
                  </Label>
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger className="h-14 border-slate-200 bg-slate-50/50 rounded-2xl font-black shadow-none px-6">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200">
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold uppercase tracking-tight">
                          {new Date(2000, i).toLocaleString('en-US', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <BoltIcon className="h-3 w-3" />
                    Institutional Year
                  </Label>
                  <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="h-14 border-slate-200 bg-slate-50/50 rounded-2xl font-black shadow-none px-6">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200">
                      {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => (
                        <SelectItem key={y} value={y.toString()} className="font-bold">
                          {y} Operational Cycle
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Required</p>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Initiating the engine will scan all active Recurring Deposits and Loan portfolios for the selected period.
                  </p>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="h-16 w-full max-w-md bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] relative overflow-hidden group"
                >
                  {loading ? (
                    <div className="flex items-center gap-4">
                      <ArrowPathIcon className="h-6 w-6 animate-spin text-primary" />
                      <span>Processing Pulse...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 group-hover:scale-105 transition-transform">
                      <RocketLaunchIcon className="h-6 w-6 text-primary group-hover:animate-bounce" />
                      <span>Launch Discovery Protocol</span>
                    </div>
                  )}
                  {/* Subtle shine effect */}
                  <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-white text-xl font-black tracking-tight flex items-center">
                <SparklesIcon className="h-5 w-5 mr-3 text-primary animate-pulse" />
                Discovery Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <p className="text-xs text-slate-400 font-bold leading-relaxed border-b border-white/10 pb-4">
                The engine utilizes predictive logic to identify maturing installments and overdue liabilities.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-primary flex-shrink-0">
                    <CalendarDaysIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Temporal Analysis</h5>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1 leading-relaxed">Cross-references instrument opening dates with maturity cycles to verify installment accuracy.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <ShieldCheckIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Audit Integrity</h5>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1 leading-relaxed">Generated propositions are staged in a queue for human verification before ledger commitment.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <InformationCircleIcon className="h-4 w-4 text-emerald-400" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Infrastructure Check</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed text-center">Engine health: Optimal. Ready for large-scale periodic discovery.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function GenerateSuggestionsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Querying Engine Matrix...</div>}>
        <GenerateSuggestionsContent />
      </Suspense>
    </DashboardLayout>
  )
}
