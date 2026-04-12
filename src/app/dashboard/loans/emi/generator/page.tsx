"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { formatDateSafe } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  ArrowLeftIcon,
  TableCellsIcon,
  CalendarDaysIcon,
  CalculatorIcon,
  DocumentArrowDownIcon
} from "@heroicons/react/24/outline"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { generateEMISchedule, EMIScheduleEntry } from "@/lib/loan-engine"

export default function EMIGeneratorPage() {
  const router = useRouter()
  const [params, setParams] = useState({
    principal: 100000,
    rate: 12,
    tenure: 12,
    startDate: new Date().toISOString().split('T')[0],
    method: 'reducing' as 'flat' | 'reducing'
  })
  
  const [schedule, setSchedule] = useState<EMIScheduleEntry[]>([])

  const handleGenerate = () => {
    const s = generateEMISchedule(
      params.principal,
      params.rate,
      params.tenure,
      new Date(params.startDate),
      params.method
    )
    setSchedule(s)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/loans')}
                className="h-10 w-10 p-0 rounded-full hover:bg-indigo-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  EMI Schedule Generator
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <CalculatorIcon className="h-4 w-4 mr-2 text-indigo-500" />
                  Generate and preview repayment schedules for Flat or Reducing loans
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Card */}
            <Card className="lg:col-span-1 bg-white/60 backdrop-blur-sm border-indigo-100 shadow-lg">
              <CardHeader className="border-b border-indigo-50 pb-6">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <TableCellsIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Loan Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-mono uppercase tracking-tighter">Principal Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                    <Input
                      type="number"
                      value={params.principal}
                      onChange={(e) => setParams({...params, principal: parseFloat(e.target.value)})}
                      className="pl-8 h-12 text-lg font-bold border-indigo-100 transition-all focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-mono uppercase tracking-tighter">Annual Rate (%)</label>
                    <Input
                      type="number"
                      value={params.rate}
                      onChange={(e) => setParams({...params, rate: parseFloat(e.target.value)})}
                      className="h-12 text-lg font-bold border-indigo-100 transition-all focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-mono uppercase tracking-tighter">Tenure (Months)</label>
                    <Input
                      type="number"
                      value={params.tenure}
                      onChange={(e) => setParams({...params, tenure: parseInt(e.target.value)})}
                      className="h-12 text-lg font-bold border-indigo-100 transition-all focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-mono uppercase tracking-tighter">Calculation Method</label>
                  <Select value={params.method} onValueChange={(v: 'flat' | 'reducing') => setParams({...params, method: v})}>
                    <SelectTrigger className="h-12 text-lg font-medium border-indigo-100 focus:ring-2 focus:ring-indigo-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reducing" className="text-md py-3 transition-colors hover:bg-indigo-50">Reducing Balance (Standard)</SelectItem>
                      <SelectItem value="flat" className="text-md py-3 transition-colors hover:bg-slate-50">Flat Rate (Fixed Interest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-mono uppercase tracking-tighter">Start Date</label>
                  <Input
                    type="date"
                    value={params.startDate}
                    onChange={(e) => setParams({...params, startDate: e.target.value})}
                    className="h-12 text-lg font-medium border-indigo-100 transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  className="w-full h-14 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-lg font-bold shadow-xl shadow-indigo-200 transition-transform active:scale-95"
                >
                  <CalculatorIcon className="h-6 w-6 mr-2" />
                  Generate Schedule
                </Button>
              </CardContent>
            </Card>

            {/* Schedule View */}
            <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm border-indigo-100 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-indigo-50 pb-6">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Amortization Table
                </CardTitle>
                {schedule.length > 0 && (
                  <Button variant="outline" className="h-11 border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-50">
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Export CSV
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {schedule.length > 0 ? (
                  <div className="max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                        <TableRow className="border-b border-indigo-100">
                          <TableHead className="w-12 text-center font-bold text-slate-800">#</TableHead>
                          <TableHead className="font-bold text-slate-800">Due Date</TableHead>
                          <TableHead className="text-right font-bold text-slate-800">EMI</TableHead>
                          <TableHead className="text-right font-bold text-slate-800">Principal</TableHead>
                          <TableHead className="text-right font-bold text-slate-800">Interest</TableHead>
                          <TableHead className="text-right font-bold text-slate-800">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedule.map((row) => (
                          <TableRow key={row.period} className="hover:bg-indigo-50/30 transition-colors border-b border-slate-100">
                            <TableCell className="text-center font-mono text-indigo-600">{row.period}</TableCell>
                            <TableCell className="font-medium text-slate-700">
                              {formatDateSafe(row.dueDate)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-indigo-700">{formatCurrency(row.emi)}</TableCell>
                            <TableCell className="text-right text-emerald-600 font-medium">{formatCurrency(row.principal)}</TableCell>
                            <TableCell className="text-right text-amber-600 font-medium">{formatCurrency(row.interest)}</TableCell>
                            <TableCell className="text-right font-semibold text-slate-800">{formatCurrency(row.balance)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CalculatorIcon className="h-12 w-12 text-indigo-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No schedule generated</h3>
                    <p className="text-slate-500 mt-3 max-w-sm mx-auto text-lg leading-relaxed">
                      Adjust your loan parameters on the left and click "Generate Schedule" to compute the amortization plan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
