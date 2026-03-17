"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import AccountForm from "@/components/account-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

export default function CreateAccountPage() {
  const router = useRouter()
  const params = useParams()
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (params.customerId) {
      fetchCustomer(params.customerId as string)
    }
  }, [params.customerId])

  const fetchCustomer = async (customerId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/customers/${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
      } else {
        router.push('/dashboard/customers')
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      router.push('/dashboard/customers')
    } finally {
      setLoading(false)
    }
  }

  const handleAccountCreated = (account: any) => {
    router.push(`/dashboard/accounts/${account.id}`)
  }

  const handleCancel = () => {
    router.push('/dashboard/accounts')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer information...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <Card className="p-6 max-w-md">
            <CardContent className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer not found</h3>
              <Button onClick={() => router.push('/dashboard/customers')}>
                Select Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/customers')}
              className="h-10 w-10 p-0 rounded-full hover:bg-blue-50 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Account Form */}
          <AccountForm
            customerId={customer.id}
            customerName={customer.name}
            onSuccess={handleAccountCreated}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
