"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  ArrowLeftIcon,
  BanknotesIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"

interface Account {
  id: string
  accountNumber: string
  accountType: string
  principalAmount: number
  interestRate: number
  tenure: number
  startDate: string
  maturityDate?: string
  state: string
  createdAt: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  accountRules?: {
    interestMode: string
    payoutMode: string
    loanMethod?: string
    emiAmount?: number
    emiDueDay?: number
    gracePeriodDays?: number
    roundingMode: string
    roundingPrecision: number
  }
  transactions: Array<{
    id: string
    type: string
    amount: number
    balance?: number
    description?: string
    createdAt: string
  }>
  _count: {
    transactions: number
  }
}

export default function AccountView() {
  const router = useRouter()
  const params = useParams()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchAccount = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/accounts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAccount(data.account)
      } else {
        router.push('/dashboard/accounts')
      }
    } catch (error) {
      console.error('Failed to fetch account:', error)
      router.push('/dashboard/accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchAccount()
    }
  }, [params.id])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/accounts/${params.id}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        router.push("/dashboard/accounts")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete account.")
      }
    } catch (error) {
      console.error("Failed to delete account:", error)
      alert("An error occurred while deleting the account.")
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'fd': return 'bg-blue-100 text-blue-700'
      case 'rd': return 'bg-green-100 text-green-700'
      case 'loan': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'fd': return '💰'
      case 'rd': return '🔄'
      case 'loan': return '💳'
      default: return '🏦'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'matured': return 'bg-yellow-100 text-yellow-700'
      case 'closed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'interest':
        return 'text-green-600'
      case 'withdrawal':
      case 'penalty':
        return 'text-red-600'
      case 'payment':
        return 'text-blue-600'
      case 'disbursement':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading && !account) {
    return (
      <DashboardLayout>
        <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading account details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!account && !loading) {
    return (
      <DashboardLayout>
        <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <BanknotesIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Account not found</h3>
            <p className="mt-2 text-sm text-gray-500">
              The account you're looking for doesn't exist or may have been deleted.
            </p>
            <Button
              onClick={() => router.push('/dashboard/accounts')}
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Back to Accounts
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/accounts')}
                className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Account Details
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                  View and manage account information
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(account!.state)}>
                {account!.state}
              </Badge>
              <Button
                onClick={() => router.push(`/dashboard/accounts/${account!.id}/edit`)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg h-12 px-6"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit Account
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg h-12 px-6"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {account && (
            <>
              {/* Account Info Header */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {getAccountTypeIcon(account.accountType)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{account.accountNumber}</h2>
                    <p className="text-gray-600">{account.customer.name}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge className={`text-xs font-semibold px-3 py-1 ${getAccountTypeColor(account.accountType)}`}>
                        <span className="mr-1.5">{getAccountTypeIcon(account.accountType)}</span>
                        {account.accountType.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Created {new Date(account.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Account Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <Card className="bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BanknotesIcon className="h-5 w-5 mr-2" />
                        Account Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Principal Amount</p>
                          <p className="font-semibold text-gray-900">
                            ₹{account.principalAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Interest Rate</p>
                          <p className="font-semibold text-gray-900">{account.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tenure</p>
                          <p className="font-semibold text-gray-900">{account.tenure} months</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(account.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        {account.maturityDate && (
                          <div>
                            <p className="text-sm text-gray-500">Maturity Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(account.maturityDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Information */}
                  <Card className="bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-semibold text-gray-900">{account.customer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900">{account.customer.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-semibold text-gray-900">{account.customer.phone}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Transactions */}
                  <Card className="bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ArrowPathIcon className="h-5 w-5 mr-2" />
                          Recent Transactions
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/accounts/${account.id}/transactions`)}
                        >
                          View All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {account.transactions.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No transactions yet</p>
                      ) : (
                        <div className="space-y-3">
                          {account.transactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{transaction.description}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(transaction.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                                  {transaction.type === 'deposit' || transaction.type === 'interest' ? '+' : '-'}
                                  ₹{transaction.amount.toLocaleString()}
                                </p>
                                {transaction.balance && (
                                  <p className="text-sm text-gray-500">
                                    Balance: ₹{transaction.balance.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Account Rules */}
                <div className="space-y-6">
                  <Card className="bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Account Rules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {account.accountRules ? (
                        <>
                          <div>
                            <p className="text-sm text-gray-500">Interest Mode</p>
                            <p className="font-semibold text-gray-900 capitalize">
                              {account.accountRules.interestMode}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Payout Mode</p>
                            <p className="font-semibold text-gray-900 capitalize">
                              {account.accountRules.payoutMode}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Rounding</p>
                            <p className="font-semibold text-gray-900 capitalize">
                              {account.accountRules.roundingMode} ({account.accountRules.roundingPrecision} decimals)
                            </p>
                          </div>
                          
                          {account.accountType === 'loan' && account.accountRules.loanMethod && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-sm text-gray-500">Loan Method</p>
                                <p className="font-semibold text-gray-900 capitalize">
                                  {account.accountRules.loanMethod}
                                </p>
                              </div>
                              {account.accountRules.emiAmount && (
                                <div>
                                  <p className="text-sm text-gray-500">EMI Amount</p>
                                  <p className="font-semibold text-gray-900">
                                    ₹{account.accountRules.emiAmount.toLocaleString()}
                                  </p>
                                </div>
                              )}
                              {account.accountRules.emiDueDay && (
                                <div>
                                  <p className="text-sm text-gray-500">EMI Due Day</p>
                                  <p className="font-semibold text-gray-900">
                                    {account.accountRules.emiDueDay}{account.accountRules.emiDueDay === 1 ? 'st' : account.accountRules.emiDueDay === 2 ? 'nd' : account.accountRules.emiDueDay === 3 ? 'rd' : 'th'} of month
                                  </p>
                                </div>
                              )}
                              {account.accountRules.gracePeriodDays !== undefined && (
                                <div>
                                  <p className="text-sm text-gray-500">Grace Period</p>
                                  <p className="font-semibold text-gray-900">
                                    {account.accountRules.gracePeriodDays} days
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <p className="text-center text-gray-500 py-4">No rules configured</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Transactions</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {account._count.transactions}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Status</p>
                        <Badge className={getStatusColor(account.state)}>
                          {account.state}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account 
              <span className="font-semibold text-foreground"> {account?.accountNumber}</span> and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
