"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { 
  UserIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon
} from "@heroicons/react/24/outline"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

export default function Dashboard() {

  const { user } = useAuth()
  const router = useRouter()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  if (!user) return <div>Loading...</div>


  const stats = [
    {
      title: "Total Balance",
      value: "₹45,231",
      growth: "+20%",
      icon: BanknotesIcon,
      color: "from-indigo-500 to-blue-600",
      description: "All accounts combined"
    },
    {
      title: "Active Deposits",
      value: "3",
      growth: "+10%",
      icon: CreditCardIcon,
      color: "from-green-500 to-emerald-600",
      description: "FD & RD accounts"
    },
    {
      title: "Active Loans",
      value: "2",
      growth: "-5%",
      icon: ChartBarIcon,
      color: "from-red-500 to-rose-600",
      description: "Personal & business loans"
    },
    {
      title: "Monthly Savings",
      value: "₹1,234",
      growth: "+12%",
      icon: ArrowTrendingUpIcon,
      color: "from-purple-500 to-indigo-600",
      description: "This month's deposits"
    }
  ]


  const transactions = [
    { id: 1, item: "Deposit to RD", amount: "+₹500", type: "credit", date: "2024-03-15" },
    { id: 2, item: "Loan EMI", amount: "-₹250", type: "debit", date: "2024-03-14" },
    { id: 3, item: "FD Interest", amount: "+₹45", type: "credit", date: "2024-03-13" },
    { id: 4, item: "Maintenance Fee", amount: "-₹10", type: "debit", date: "2024-03-12" },
  ]



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
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user.name}
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
                Here's your financial overview today
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1.5 bg-white/80 backdrop-blur-sm border-green-200 text-green-700">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Account Active
              </Badge>
              <Button
                onClick={() => router.push('/dashboard/customers/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg h-12 px-6"
              >
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Quick Deposit
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.title} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.growth.includes("+") ? "text-green-600" : "text-red-600"
                      }`}>
                        {stat.growth}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">this month</span>
                    </div>
                  </div>
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/ledger')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              t.type === "credit" ? "bg-green-100" : "bg-red-100"
                            }`}>
                              {t.type === "credit" ? (
                                <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <span className="font-medium">{t.item}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500">{t.date}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          t.type === "credit" ? "text-green-600" : "text-red-600"
                        }`}>
                          {t.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push('/dashboard/customers')}
                >
                  <UserIcon className="h-5 w-5 mr-3" />
                  View Customers
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push('/dashboard/accounts')}
                >
                  <BuildingLibraryIcon className="h-5 w-5 mr-3" />
                  Manage Accounts
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push('/dashboard/suggestions')}
                >
                  <ChartBarIcon className="h-5 w-5 mr-3" />
                  Review Suggestions
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push('/dashboard/ledger')}
                >
                  <BanknotesIcon className="h-5 w-5 mr-3" />
                  View Ledger
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Deposits</span>
                    <span className="font-semibold">₹42,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Loans</span>
                    <span className="font-semibold text-red-600">₹8,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Net Worth</span>
                    <span className="font-semibold text-green-600">₹34,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Upcoming Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-900">Loan EMI</p>
                      <p className="text-sm text-orange-700">Due in 3 days</p>
                    </div>
                    <span className="font-semibold text-orange-900">₹250</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">RD Deposit</p>
                      <p className="text-sm text-blue-700">Due in 7 days</p>
                    </div>
                    <span className="font-semibold text-blue-900">₹500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>

    </DashboardLayout>

  )

}