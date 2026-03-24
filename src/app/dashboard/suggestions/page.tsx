"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

interface SuggestedEntry {
  id: string
  accountId: string
  type: string
  amount: number
  description?: string
  runDate: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  account: {
    accountNumber: string
    customer: {
      name: string
    }
  }
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<SuggestedEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showRunModal, setShowRunModal] = useState(false)
  const [runType, setRunType] = useState<'monthly' | 'account'>('monthly')
  const [runParams, setRunParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    accountId: '',
    startDate: '',
    endDate: ''
  })
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState('')

  const [accounts, setAccounts] = useState<any[]>([])

  useEffect(() => {
    fetchSuggestions()
    fetchAccounts()
  }, [statusFilter])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const params = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const response = await fetch(`/api/suggestions${params}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    }
  }

  const runSuggestions = async () => {
    try {
      const endpoint = runType === 'monthly' ? '/api/suggestions/run-monthly' : '/api/suggestions/run-account'
      const payload = runType === 'monthly' 
        ? { month: runParams.month, year: runParams.year }
        : { 
            accountId: runParams.accountId,
            startDate: runParams.startDate,
            endDate: runParams.endDate
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setShowRunModal(false)
        fetchSuggestions()
      }
    } catch (error) {
      console.error('Failed to run suggestions:', error)
    }
  }

  const approveSuggestions = async (ids: string[]) => {
    try {
      const response = await fetch('/api/suggestions/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      })

      if (response.ok) {
        setSelectedSuggestions([])
        fetchSuggestions()
      }
    } catch (error) {
      console.error('Failed to approve suggestions:', error)
    }
  }

  const rejectSuggestion = async (id: string, reason: string) => {
    try {
      const response = await fetch(`/api/suggestions/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        setShowRejectModal(false)
        setRejectReason('')
        fetchSuggestions()
      }
    } catch (error) {
      console.error('Failed to reject suggestion:', error)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuggestions(suggestions.filter(s => s.status === 'pending').map(s => s.id))
    } else {
      setSelectedSuggestions([])
    }
  }

  const handleSelectSuggestion = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSuggestions(prev => [...prev, id])
    } else {
      setSelectedSuggestions(prev => prev.filter(sId => sId !== id))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />
      case 'rejected': return <XCircleIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  const pendingCount = suggestions.filter(s => s.status === 'pending').length
  const approvedCount = suggestions.filter(s => s.status === 'approved').length
  const rejectedCount = suggestions.filter(s => s.status === 'rejected').length

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Suggestions Engine
              </h1>
              <p className="text-gray-600 mt-2">Automated transaction suggestions and approval workflow</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowRunModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Run Suggestions
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Suggestions</p>
                    <p className="text-3xl font-bold text-gray-900">{suggestions.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FunnelIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedSuggestions.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {selectedSuggestions.length} selected
                    </span>
                    <Button
                      onClick={() => approveSuggestions(selectedSuggestions)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve Selected
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSuggestions([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions Table */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Suggested Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="ml-4 text-gray-600">Loading suggestions...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {statusFilter === 'pending' && (
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedSuggestions.length === suggestions.filter(s => s.status === 'pending').length && suggestions.filter(s => s.status === 'pending').length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                        )}
                        <TableHead>Date</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suggestions.map((suggestion) => (
                        <TableRow key={suggestion.id} className="hover:bg-gray-50">
                          {statusFilter === 'pending' && (
                            <TableCell>
                              <Checkbox
                                checked={selectedSuggestions.includes(suggestion.id)}
                                onCheckedChange={(checked) => handleSelectSuggestion(suggestion.id, checked as boolean)}
                                disabled={suggestion.status !== 'pending'}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            {new Date(suggestion.runDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {suggestion.account.accountNumber}
                          </TableCell>
                          <TableCell>{suggestion.account.customer.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {suggestion.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{suggestion.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{suggestion.description || '—'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(suggestion.status)}>
                              <span className="mr-1">{getStatusIcon(suggestion.status)}</span>
                              {suggestion.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {suggestion.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => approveSuggestions([suggestion.id])}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setRejectingId(suggestion.id)
                                      setShowRejectModal(true)
                                    }}
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                  >
                                    <XCircleIcon className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {suggestion.status === 'rejected' && suggestion.rejectionReason && (
                                <div className="text-xs text-gray-500 max-w-xs truncate" title={suggestion.rejectionReason}>
                                  {suggestion.rejectionReason}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Run Suggestions Modal */}
        {showRunModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md m-4">
              <CardHeader>
                <CardTitle>Run Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Run Type</Label>
                  <Select value={runType} onValueChange={(value: 'monthly' | 'account') => setRunType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Run</SelectItem>
                      <SelectItem value="account">Per-Account Run</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {runType === 'monthly' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="month">Month</Label>
                      <Select value={runParams.month.toString()} onValueChange={(value) => setRunParams({...runParams, month: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={runParams.year}
                        onChange={(e) => setRunParams({...runParams, year: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="account">Account</Label>
                      <Select value={runParams.accountId} onValueChange={(value) => setRunParams({...runParams, accountId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.accountNumber} - {account.customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={runParams.startDate}
                          onChange={(e) => setRunParams({...runParams, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={runParams.endDate}
                          onChange={(e) => setRunParams({...runParams, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={runSuggestions} className="flex-1">
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Run
                  </Button>
                  <Button variant="outline" onClick={() => setShowRunModal(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md m-4">
              <CardHeader>
                <CardTitle>Reject Suggestion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rejectReason">Rejection Reason</Label>
                  <Select value={rejectReason} onValueChange={setRejectReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="duplicate">Duplicate Entry</SelectItem>
                      <SelectItem value="incorrect_amount">Incorrect Amount</SelectItem>
                      <SelectItem value="wrong_date">Wrong Date</SelectItem>
                      <SelectItem value="account_closed">Account Closed</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {rejectReason === 'other' && (
                  <div>
                    <Label htmlFor="customReason">Custom Reason</Label>
                    <Input
                      id="customReason"
                      placeholder="Enter custom reason"
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={() => rejectSuggestion(rejectingId, rejectReason)} 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
