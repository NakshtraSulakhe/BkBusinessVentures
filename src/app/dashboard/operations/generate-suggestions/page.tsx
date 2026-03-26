"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PlayIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CpuChipIcon,
  ArrowRightIcon,
  QueueListIcon,
  ArrowLeftIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { Badge } from "@/components/ui/badge"

export default function GenerateSuggestionsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'monthly' | 'account'>('monthly')
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<{message: string, count: number} | null>(null)

  // Monthly Params
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  // Account Params
  const [accountId, setAccountId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const handleMonthlyRun = async () => {
    try {
      setRunning(true)
      setResults(null)
      const response = await fetch('/api/suggestions/run-monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year })
      })
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
       console.error(error)
    } finally {
      setRunning(false)
    }
  }

  const handleAccountRun = async () => {
    try {
      setRunning(true)
      setResults(null)
      const response = await fetch('/api/suggestions/run-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, startDate, endDate })
      })
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
       console.error(error)
    } finally {
      setRunning(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/operations/suggestions')}
                className="h-10 w-10 p-0 rounded-full hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic">
                   Engine Suite
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Manual trigger suite for automated financial discovery
                </p>
              </div>
            </div>
          </div>

          {/* Selector - Master Styled */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 bg-white/60 backdrop-blur-sm rounded-2xl ring-1 ring-slate-200 shadow-sm">
                <button 
                    onClick={() => setActiveTab('monthly')}
                    className={`py-3 px-10 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
                >
                    Batch Generation
                </button>
                <button 
                    onClick={() => setActiveTab('account')}
                    className={`py-3 px-10 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'account' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}
                >
                    Targeted Audit
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {activeTab === 'monthly' ? (
              <Card className="bg-white/60 backdrop-blur-md border-none shadow-2xl ring-1 ring-slate-100 overflow-hidden rounded-[40px]">
                <CardHeader className="p-12 pb-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                       <QueueListIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                       <Badge className="bg-blue-50 text-blue-600 border-blue-100 uppercase text-[10px] tracking-widest font-black mb-1">Infrastructure Module</Badge>
                       <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter italic">Global Batch Processor</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-slate-500 text-lg font-medium leading-relaxed italic">
                    Scan all active and pending investment instruments across the entire institutional portfolio for the selected period.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-12 pt-4 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Target Month</label>
                        <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                            <SelectTrigger className="h-16 bg-white border-slate-100 text-slate-900 text-2xl font-black rounded-2xl shadow-sm focus:ring-indigo-500">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-100 font-bold">
                                {Array.from({length: 12}, (_, i) => (
                                    <SelectItem key={i+1} value={(i+1).toString()} className="text-lg py-4 font-black italic">{new Date(2000, i).toLocaleString('en-US', { month: 'long' })}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cycle Year</label>
                        <Input 
                            type="number" 
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="h-16 bg-white border-slate-100 text-slate-900 text-2xl font-black rounded-2xl shadow-sm focus:ring-indigo-500"
                        />
                     </div>
                  </div>

                  <Button 
                    disabled={running}
                    onClick={handleMonthlyRun}
                    className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white text-xl font-black shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all rounded-2xl group italic uppercase tracking-tighter"
                  >
                    {running ? (
                      <ArrowPathIcon className="h-8 w-8 animate-spin" />
                    ) : (
                      <>
                         <RocketLaunchIcon className="h-7 w-7 mr-4 group-hover:scale-110 transition-transform text-indigo-400" />
                         Launch Batch Discovery
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
               <Card className="bg-white/60 backdrop-blur-md border-none shadow-2xl ring-1 ring-slate-100 overflow-hidden rounded-[40px]">
                <CardHeader className="p-12 pb-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                       <ChartBarIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                       <Badge className="bg-purple-50 text-purple-600 border-purple-100 uppercase text-[10px] tracking-widest font-black mb-1">Targeted Engine</Badge>
                       <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter italic">Individual Entity Audit</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-slate-500 text-lg font-medium leading-relaxed italic">
                    Execute a high-precision discovery scan on a specific account identification to resolve missing or unique accrual logs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-12 pt-4 space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Account Primary ID</label>
                    <div className="relative group">
                       <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                       <Input 
                            placeholder="Input Valid Account Format (e.g. LN-2026-0001)..."
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="h-16 pl-16 bg-white border-slate-100 text-slate-900 text-2xl font-black rounded-2xl shadow-sm focus:ring-purple-500"
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Discovery Start</label>
                        <Input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-14 bg-white border-slate-100 text-slate-900 text-lg font-black rounded-xl font-mono"
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Discovery End</label>
                        <Input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-14 bg-white border-slate-100 text-slate-900 text-lg font-black rounded-xl font-mono"
                        />
                     </div>
                  </div>

                  <Button 
                    disabled={running}
                    onClick={handleAccountRun}
                    className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white text-xl font-black shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all rounded-2xl group italic uppercase tracking-tighter"
                  >
                    {running ? (
                      <ArrowPathIcon className="h-8 w-8 animate-spin" />
                    ) : (
                      <>
                         <CpuChipIcon className="h-7 w-7 mr-4 group-hover:scale-110 transition-transform text-purple-400" />
                         Execute Precision Discovery
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Run Outcome Dashboard - Master Styled */}
            {results && (
              <Card className="bg-white border-none shadow-2xl ring-1 ring-emerald-100 overflow-hidden p-2 rounded-[40px]">
                 <div className="bg-emerald-50/40 p-12 flex flex-col md:flex-row items-center justify-between rounded-[32px] gap-8">
                    <div className="flex items-center space-x-10 flex-col md:flex-row text-center md:text-left">
                       <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/10 border border-emerald-100 mb-6 md:mb-0">
                          <CheckBadgeIcon className="h-14 w-14 text-emerald-600" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-slate-900 text-3xl font-black italic tracking-tighter group-hover:text-emerald-700 transition-colors">Infrastructure Signal: Success</p>
                          <p className="text-slate-500 text-lg font-bold flex items-center justify-center md:justify-start italic">
                             <QueueListIcon className="h-5 w-5 mr-3 text-emerald-500" />
                             Discovery stream successfully injected <span className="text-slate-900 font-black mx-2 px-3 py-1 bg-white rounded-xl shadow-inner border border-slate-100 tabular-nums">{results.count}</span> records into the verification unit
                          </p>
                       </div>
                    </div>
                    <Button 
                        onClick={() => router.push('/dashboard/operations/suggestions')}
                        className="h-16 bg-white text-slate-900 border-2 border-slate-100 shadow-xl hover:bg-slate-50 px-12 text-md font-black uppercase tracking-widest transition-all rounded-2xl group italic"
                    >
                        Review Results
                        <ArrowRightIcon className="h-5 w-5 ml-4 group-hover:translate-x-2 transition-transform text-emerald-500" />
                    </Button>
                 </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
