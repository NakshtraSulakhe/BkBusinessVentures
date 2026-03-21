"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { DataTable } from "@/components/dashboard/DataTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  ArrowRightIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  if (!user) return <div>Loading...</div>

  const stats = [
    {
      title: "Total Balance",
      value: 45231.89,
      change: { value: 12.5, type: 'increase' as const },
      description: "from last month",
      icon: <BanknotesIcon className="h-4 w-4 text-gray-600" />
    },
    {
      title: "Active Deposits",
      value: 3,
      change: { value: 10.0, type: 'increase' as const },
      description: "from last month",
      icon: <CreditCardIcon className="h-4 w-4 text-gray-600" />
    },
    {
      title: "Active Loans",
      value: 2,
      change: { value: 5.0, type: 'decrease' as const },
      description: "from last month",
      icon: <ChartBarIcon className="h-4 w-4 text-gray-600" />
    },
    {
      title: "Monthly Savings",
      value: 1234.56,
      change: { value: 8.2, type: 'increase' as const },
      description: "from last month",
      icon: <ArrowTrendingUpIcon className="h-4 w-4 text-gray-600" />
    }
  ]

  const transactions = [
    { 
      id: 'TRX001', 
      date: '2024-03-15', 
      description: 'Deposit to RD', 
      amount: 500.00, 
      status: 'completed',
      type: 'credit' 
    },
    { 
      id: 'TRX002', 
      date: '2024-03-14', 
      description: 'Loan EMI', 
      amount: -250.00, 
      status: 'completed',
      type: 'debit' 
    },
    { 
      id: 'TRX003', 
      date: '2024-03-13', 
      description: 'FD Interest', 
      amount: 45.00, 
      status: 'completed',
      type: 'credit' 
    },
    { 
      id: 'TRX004', 
      date: '2024-03-12', 
      description: 'Maintenance Fee', 
      amount: -10.00, 
      status: 'pending',
      type: 'debit' 
    },
  ]

  const transactionColumns = [
    {
      key: 'description' as const,
      title: 'Transaction',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${row.type === "credit"
                ? "bg-emerald-100"
                : "bg-red-100"
              }`}
          >
            {row.type === "credit"
              ? <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
              : <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />}
          </div>
          <span className="font-medium">
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'date' as const,
      title: 'Date',
      sortable: true
    },
    {
      key: 'amount' as const,
      title: 'Amount',
      sortable: true
    },
    {
      key: 'status' as const,
      title: 'Status',
      sortable: true
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name}
            </h1>
            <p className="text-gray-600">
              Here's your financial overview today
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
            <Button variant="outline">
              View All
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <KpiCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Transactions Table */}
          <div className="lg:col-span-2">
            <DataTable
              data={transactions}
              columns={transactionColumns}
              title="Recent Transactions"
              actions={() => (
                <Button variant="outline" size="sm">
                  View All
                </Button>
              )}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => router.push("/dashboard/deposits/new")}
                  className="h-20 flex-col gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Deposit
                </Button>

                <Button
                  onClick={() => router.push("/dashboard/loans/new")}
                  className="h-20 flex-col gap-2"
                >
                  <CreditCardIcon className="h-5 w-5" />
                  Loan
                </Button>

                <Button
                  onClick={() => router.push("/dashboard/transfer")}
                  className="h-20 flex-col gap-2"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                  Transfer
                </Button>

                <Button
                  onClick={() => router.push("/dashboard/statements")}
                  className="h-20 flex-col gap-2"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  Statements
                </Button>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Account
                  </span>
                  <span className="font-medium">
                    ****4582
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <CreditCardIcon className="h-4 w-4" />
                    Type
                  </span>
                  <Badge>Premium</Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Member Since
                  </span>
                  <span>Jan 2024</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    Status
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}