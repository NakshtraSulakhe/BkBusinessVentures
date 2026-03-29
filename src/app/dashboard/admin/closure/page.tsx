"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building2,
  ShieldCheck,
  Clock,
  XCircle,
  Search
} from "lucide-react"

interface ClosureRequest {
  id: string
  accountId: string
  accountNumber: string
  accountType: 'FD' | 'RD' | 'LOAN'
  customerName: string
  customerId: string
  principalAmount: number
  closureDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  requestedBy: string
  requestedAt: string
  maturityAmount?: number
  prematurePenalty?: number
}

export default function ClosurePage() {
  const router = useRouter()
  const [closures, setClosures] = useState<ClosureRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for demonstration
  useEffect(() => {
    setClosures([
      {
        id: '1',
        accountId: 'acc-1',
        accountNumber: 'FD-2024-000001',
        accountType: 'FD',
        customerName: 'Rajesh Kumar',
        customerId: 'cust-1',
        principalAmount: 100000,
        closureDate: new Date().toISOString(),
        reason: 'Financial emergency',
        status: 'pending',
        requestedBy: 'Admin User',
        requestedAt: new Date().toISOString(),
        maturityAmount: 110000,
        prematurePenalty: 1000
      },
      {
        id: '2',
        accountId: 'acc-2',
        accountNumber: 'RD-2024-000015',
        accountType: 'RD',
        customerName: 'Priya Sharma',
        customerId: 'cust-2',
        principalAmount: 50000,
        closureDate: new Date().toISOString(),
        reason: 'Maturity reached',
        status: 'approved',
        requestedBy: 'Admin User',
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        maturityAmount: 55000
      }
    ])
  }, [])

  const handleApprove = async (closureId: string) => {
    // In real implementation, this would call an API
    setClosures(prev => prev.map(c => 
      c.id === closureId ? { ...c, status: 'approved' } : c
    ))
  }

  const handleReject = async (closureId: string) => {
    // In real implementation, this would call an API
    setClosures(prev => prev.map(c => 
      c.id === closureId ? { ...c, status: 'rejected' } : c
    ))
  }

  const handleComplete = async (closureId: string) => {
    // In real implementation, this would call an API
    setClosures(prev => prev.map(c => 
      c.id === closureId ? { ...c, status: 'completed' } : c
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200"><Lock className="h-3 w-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case 'FD':
        return <Badge className="bg-blue-100 text-blue-700">FD</Badge>
      case 'RD':
        return <Badge className="bg-green-100 text-green-700">RD</Badge>
      case 'LOAN':
        return <Badge className="bg-red-100 text-red-700">LOAN</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const filteredClosures = closures.filter(closure => {
    const matchesStatus = filterStatus === 'all' || closure.status === filterStatus
    const matchesSearch = 
      closure.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      closure.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up pb-20">
        <PageHeader
          title="Account Closure Management"
          subtitle="Manage premature closures, maturity processing, and account settlements"
          actions={
            <Button
              onClick={() => router.push('/dashboard/accounts')}
              variant="outline"
              className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
            >
              View Accounts
            </Button>
          }
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pending</p>
                  <p className="text-2xl font-black text-slate-900">{closures.filter(c => c.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Approved</p>
                  <p className="text-2xl font-black text-slate-900">{closures.filter(c => c.status === 'approved').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Completed</p>
                  <p className="text-2xl font-black text-slate-900">{closures.filter(c => c.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Value</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatCurrency(closures.reduce((sum, c) => sum + c.principalAmount, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by account number or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-slate-200"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40 h-10 border-slate-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Closure Requests List */}
        <div className="space-y-4">
          {filteredClosures.map((closure) => (
            <Card key={closure.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getAccountTypeBadge(closure.accountType)}
                    <CardTitle className="text-base font-bold text-slate-900">
                      {closure.accountNumber}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(closure.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Customer Information
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{closure.customerName}</p>
                      <p className="text-xs text-slate-500">ID: {closure.customerId}</p>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign className="h-3 w-3" />
                      Financial Details
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Principal:</span>
                        <span className="font-bold text-slate-900">{formatCurrency(closure.principalAmount)}</span>
                      </div>
                      {closure.maturityAmount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Maturity Value:</span>
                          <span className="font-bold text-emerald-600">{formatCurrency(closure.maturityAmount)}</span>
                        </div>
                      )}
                      {closure.prematurePenalty !== undefined && closure.prematurePenalty > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Penalty:</span>
                          <span className="font-bold text-rose-600">{formatCurrency(closure.prematurePenalty)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Request Details
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Requested:</span>
                        <span className="font-medium text-slate-900">{formatDate(closure.requestedAt)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Closure Date:</span>
                        <span className="font-medium text-slate-900">{formatDate(closure.closureDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Reason for Closure</p>
                  <p className="text-sm text-slate-700">{closure.reason}</p>
                </div>

                {/* Action Buttons */}
                {closure.status === 'pending' && (
                  <div className="mt-4 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(closure.id)}
                      className="h-10 px-5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(closure.id)}
                      className="h-10 px-5 rounded-xl finance-gradient-primary"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}

                {closure.status === 'approved' && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => handleComplete(closure.id)}
                      variant="outline"
                      className="h-10 px-5 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Closure
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClosures.length === 0 && (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No closure requests found</h3>
              <p className="mt-2 text-sm text-slate-500">
                There are no account closure requests matching your criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
