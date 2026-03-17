"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

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
      value: "₹45,231",
      growth: "+20%",
      icon: BanknotesIcon,
      color: "from-indigo-500 to-blue-600"
    },
    {
      title: "Active Deposits",
      value: "3",
      growth: "+10%",
      icon: CreditCardIcon,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Active Loans",
      value: "2",
      growth: "-5%",
      icon: ChartBarIcon,
      color: "from-red-500 to-rose-600"
    },
    {
      title: "Monthly Savings",
      value: "₹1,234",
      growth: "+12%",
      icon: ArrowTrendingUpIcon,
      color: "from-purple-500 to-indigo-600"
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

      <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">

        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}
          </h1>

          <p className="text-gray-500">
            Here’s your financial overview today
          </p>
        </div>


        {/* KPI CARDS */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {stats.map((stat) => (

            <Card
              key={stat.title}
              className="shadow-sm border hover:shadow-lg transition"
            >

              <CardContent className="p-6 flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {stat.value}
                  </p>

                  <p
                    className={`text-sm mt-1 ${stat.growth.includes("+")
                        ? "text-green-600"
                        : "text-red-600"
                      }`}
                  >
                    {stat.growth} this month
                  </p>

                </div>

                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                >

                  <stat.icon className="h-6 w-6" />

                </div>

              </CardContent>

            </Card>

          ))}

        </div>


        {/* MAIN GRID */}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Transactions */}

          <Card className="lg:col-span-2">

            <CardHeader className="flex flex-row items-center justify-between">

              <CardTitle>
                Recent Transactions
              </CardTitle>

              <Button variant="outline" size="sm">
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

                    <TableRow key={t.id} className="hover:bg-muted/40">

                      <TableCell>

                        <div className="flex items-center gap-3">

                          <div
                            className={`p-2 rounded-full ${t.type === "credit"
                                ? "bg-green-100"
                                : "bg-red-100"
                              }`}
                          >

                            {t.type === "credit"
                              ? <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                              : <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />}

                          </div>

                          <span className="font-medium">
                            {t.item}
                          </span>

                        </div>

                      </TableCell>

                      <TableCell className="text-gray-500">
                        {t.date}
                      </TableCell>

                      <TableCell
                        className={`text-right font-semibold ${t.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >

                        {t.amount}

                      </TableCell>

                    </TableRow>

                  ))}

                </TableBody>

              </Table>

            </CardContent>

          </Card>



          {/* RIGHT SIDEBAR */}

          <div className="space-y-6">


            {/* QUICK ACTIONS */}

            <Card>

              <CardHeader>
                <CardTitle>
                  Quick Actions
                </CardTitle>
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



            {/* ACCOUNT SUMMARY */}

            <Card>

              <CardHeader>
                <CardTitle>
                  Account Summary
                </CardTitle>
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

                  <Badge className="bg-green-100 text-green-700">
                    Active
                  </Badge>

                </div>

              </CardContent>

            </Card>

          </div>

        </div>

      </div>

    </DashboardLayout>

  )

}