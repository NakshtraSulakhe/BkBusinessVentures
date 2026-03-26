"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  UserGroupIcon, 
  ArrowLeftIcon, 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  PhoneIcon,
  EnvelopeIcon,
  WalletIcon,
  IdentificationIcon,
  SparklesIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CustomerReportItem {
  id: string
  name: string
  email: string
  phone: string
  totalPrincipal: number
  activeCount: number
  fdCount: number
  rdCount: number
  loanCount: number
}

export default function CustomerReportPage() {
  const router = useRouter()
  const [report, setReport] = useState<CustomerReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/customers')
      if (response.ok) {
        const data = await response.json()
        setReport(data.report)
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const filteredReport = report.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone.includes(searchTerm)
  )

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between font-medium">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/reports')}
                className="h-10 w-10 p-0 rounded-full hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-400" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Portfolio Audit
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Consolidated financial exposure per customer
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
               <div className="relative">
                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <Input
                   placeholder="Search registry..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 h-11 w-64 border-slate-200"
                 />
               </div>
               <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg h-11 px-6 font-bold">
                 <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                 Export Registry
               </Button>
            </div>
          </div>

          {/* Snapshot Table */}
          <Card className="bg-white/60 backdrop-blur-sm shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white/40 h-20 flex flex-row items-center justify-between px-8">
              <CardTitle className="text-lg font-bold flex items-center text-slate-900 tracking-tight italic">
                <IdentificationIcon className="h-5 w-5 mr-3 text-blue-500" />
                Customer Financial Footprint
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px] tracking-widest text-blue-600 bg-blue-50/50 border-blue-100 uppercase py-1 px-4">{filteredReport.length} ENTRIES</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-24 text-center">
                   <div className="h-12 w-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
                   <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Querying Portfolio Store...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-none">
                      <TableHead className="px-8 font-black text-slate-900 uppercase text-[10px] tracking-widest h-14">Identity Domain</TableHead>
                      <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-center">Active Instruments</TableHead>
                      <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-center">Class Breakdown</TableHead>
                      <TableHead className="px-8 font-black text-slate-900 uppercase text-[10px] tracking-widest h-14 text-right">Magnitude (Exposure)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReport.map((item) => (
                      <TableRow key={item.id} className="hover:bg-blue-50/20 transition-colors border-b border-slate-50 group">
                        <TableCell className="px-8 py-8">
                           <div className="space-y-1">
                              <p className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors italic">{item.name}</p>
                              <div className="flex items-center space-x-4 text-slate-400 text-xs font-bold font-mono tracking-tighter">
                                 <span className="flex items-center"><EnvelopeIcon className="h-3 w-3 mr-1 text-slate-300" /> {item.email}</span>
                                 <span className="flex items-center"><PhoneIcon className="h-3 w-3 mr-1 text-slate-300" /> {item.phone}</span>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="text-center">
                           <div className="inline-flex h-12 w-12 bg-white rounded-2xl items-center justify-center font-black text-slate-900 shadow-sm border border-slate-100 text-lg group-hover:scale-110 transition-transform">
                              {item.activeCount}
                           </div>
                        </TableCell>
                        <TableCell className="text-center">
                           <div className="flex justify-center items-center space-x-2">
                              {/* Small Chips with icons */}
                              <div className="flex flex-col items-center space-y-1">
                                 <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 font-black text-xs">{item.fdCount}</div>
                                 <span className="text-[9px] font-black text-slate-400">FD</span>
                              </div>
                              <div className="flex flex-col items-center space-y-1">
                                 <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 font-black text-xs">{item.rdCount}</div>
                                 <span className="text-[9px] font-black text-slate-400">RD</span>
                              </div>
                              <div className="flex flex-col items-center space-y-1">
                                 <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 font-black text-xs">{item.loanCount}</div>
                                 <span className="text-[9px] font-black text-slate-400">LOAN</span>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                           <div className="space-y-1">
                              <p className="text-2xl font-black text-slate-900 tabular-nums italic tracking-tighter group-hover:text-blue-600 transition-colors uppercase leading-none">{formatCurrency(item.totalPrincipal)}</p>
                              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center justify-end">
                                 <WalletIcon className="h-3 w-3 mr-1 italic text-blue-400" /> 
                                 Institutional Exposure
                              </p>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
