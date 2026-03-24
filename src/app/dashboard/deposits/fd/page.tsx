"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
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
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface FDAccount {
  id: string
  accountNumber: string
  customerId: string
  accountType: string
  principalAmount: number
  interestRate: number
  tenure: number
  startDate: string
  maturityDate: string
  status: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  accountRules: any
  _count: {
    transactions: number
  }
}

export default function FDPage() {
  const router = useRouter()
  const [fdAccounts, setFdAccounts] = useState<FDAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchFDAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts?accountType=FD')
      if (response.ok) {
        const data = await response.json()
        setFdAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error('Failed to fetch FD accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFDAccounts()
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'maturity_pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'closing_pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const filteredAccounts = fdAccounts.filter(account =>
    account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Message */}
          {message && (
            <div className={`rounded-xl p-4 flex items-start space-x-3 shadow-sm border ${
              message.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800'
            }`}>
              <div className={`flex-shrink-0 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{message.text}</p>
                <p className="text-xs mt-1 opacity-75">
                  {message.type === 'success' ? 'Operation completed successfully' : 'Please try again'}
                </p>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Fixed Deposits
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Manage all fixed deposit accounts
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search FD accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                onClick={() => router.push('/dashboard/deposits/fd/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg h-12 px-6"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create FD
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total FD Accounts</p>
                    <p className="text-3xl font-bold text-gray-900">{filteredAccounts.length}</p>
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <BuildingLibraryIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active FDs</p>
                    <p className="text-3xl font-bold text-green-600">
                      {filteredAccounts.filter(acc => acc.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ₹{filteredAccounts.reduce((sum, acc) => sum + acc.principalAmount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <CurrencyDollarIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Interest Rate</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {filteredAccounts.length > 0 
                        ? (filteredAccounts.reduce((sum, acc) => sum + acc.interestRate, 0) / filteredAccounts.length).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FD Accounts Table */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">FD Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading FD accounts...</p>
                </div>
              ) : filteredAccounts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Maturity Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-medium">{account.accountNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{account.customer.name}</p>
                            <p className="text-sm text-gray-500">{account.customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>₹{account.principalAmount.toLocaleString()}</TableCell>
                        <TableCell>{account.interestRate}%</TableCell>
                        <TableCell>{account.tenure} months</TableCell>
                        <TableCell>
                          {account.maturityDate ? new Date(account.maturityDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getStatusColor(account.status)}`}>
                            {account.status || 'ACTIVE'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/deposits/fd/${account.id}`)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/deposits/fd/${account.id}/edit`)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <BuildingLibraryIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No FD accounts found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first FD account'}
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => router.push('/dashboard/deposits/fd/create')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create FD Account
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
