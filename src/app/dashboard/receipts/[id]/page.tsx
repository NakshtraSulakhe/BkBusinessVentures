"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  PrinterIcon, 
  ArrowLeftIcon, 
  CheckBadgeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"

interface TransactionReceipt {
  id: string
  reference: string
  type: string
  amount: number
  balance: number
  description: string
  transactionDate: string
  account: {
    accountNumber: string
    accountType: string
    customer: {
      name: string
      email: string
      phone?: string
      address?: string
    }
  }
}

export default function ReceiptPage() {
  const { id } = useParams()
  const router = useRouter()
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReceipt()
  }, [id])

  const fetchReceipt = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/transactions/${id}`)
      if (response.ok) {
        const data = await response.json()
        setReceipt(data.transaction)
      }
    } catch (error) {
      console.error('Failed to fetch receipt:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    </DashboardLayout>
  )

  if (!receipt) return (
    <DashboardLayout>
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Receipt not found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-slate-100/50 print:bg-white print:p-0">
        <div className="max-w-4xl mx-auto space-y-6 print:space-y-0">
          {/* Actions - Hidden when printing */}
          <div className="flex items-center justify-between print:hidden">
            <Button variant="ghost" onClick={() => router.back()} className="hover:bg-slate-200">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Portal
            </Button>
            <Button onClick={handlePrint} className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg">
              <PrinterIcon className="h-5 w-5 mr-2" />
              Print Receipt
            </Button>
          </div>

          {/* Actual Receipt Content */}
          <Card className="bg-white border-none shadow-2xl print:shadow-none print:ring-1 print:ring-slate-200 relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 print:hidden">
                <CheckBadgeIcon className="h-64 w-64" />
            </div>

            <CardContent className="p-12 space-y-10">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-10">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl uppercase tracking-widest">BK</div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">BK Business Ventures</h1>
                  </div>
                  <div className="text-slate-500 text-sm space-y-1 font-medium">
                    <p className="flex items-center"><MapPinIcon className="h-3.5 w-3.5 mr-1.5" /> 123 Financial Tower, Marine Drive, Mumbai, MH</p>
                    <p className="flex items-center"><PhoneIcon className="h-3.5 w-3.5 mr-1.5" /> +91-9876543210</p>
                    <p className="flex items-center"><EnvelopeIcon className="h-3.5 w-3.5 mr-1.5" /> support@bkventures.com</p>
                    <p className="flex items-center"><GlobeAltIcon className="h-3.5 w-3.5 mr-1.5" /> www.bkventures.com</p>
                  </div>
                </div>
                <div className="text-right space-y-3">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm mb-2">ACK-PAYMENT</div>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">RECEIPT</p>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs font-bold uppercase">Receipt Number</p>
                    <p className="text-xl font-mono font-bold text-slate-800">{receipt.reference || `REC-${receipt.id.slice(0, 8)}`}</p>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-16">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-4 pb-1">Issued To</h4>
                    <div className="space-y-1">
                      <p className="text-2xl font-black text-slate-900">{receipt.account.customer.name}</p>
                      <p className="text-slate-600 font-medium">{receipt.account.customer.email}</p>
                      <p className="text-slate-500 text-sm mt-3 leading-relaxed">Account Reference: <span className="font-mono text-slate-700 font-bold">{receipt.account.accountNumber}</span></p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6 text-right">
                  <div className="flex justify-end gap-12">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2 pb-1">Date</h4>
                        <p className="text-slate-900 font-bold">{new Date(receipt.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2 pb-1">Method</h4>
                        <p className="text-slate-900 font-bold uppercase tracking-tighter">Cheque / Transfer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Box */}
              <div className="bg-slate-50 rounded-3xl p-10 flex items-center justify-between border border-slate-100 shadow-inner">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Received Sum</h4>
                  <p className="text-slate-500 font-medium italic text-lg leading-tight truncate max-w-sm">{receipt.description || `Installment payment for ${receipt.account.accountNumber}`}</p>
                </div>
                <div className="text-right">
                    <p className="text-5xl font-black tracking-tight text-slate-900">{formatCurrency(receipt.amount)}</p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Legally Verified Transaction</p>
                </div>
              </div>

              {/* Details Table */}
              <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Account Breakdown</h4>
                  <div className="w-full">
                      <div className="flex justify-between py-4 border-b border-slate-50 font-semibold group transition-colors">
                          <span className="text-slate-600">Product Line</span>
                          <span className="text-slate-900 uppercase tracking-widest text-sm">{receipt.account.accountType}</span>
                      </div>
                      <div className="flex justify-between py-4 border-b border-slate-50 font-semibold group transition-colors">
                          <span className="text-slate-600">Transaction Category</span>
                          <span className="text-slate-900 uppercase tracking-widest text-sm">{receipt.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between py-6 group transition-colors">
                          <span className="text-xl font-black text-slate-900">Current Balance after Payment</span>
                          <span className="text-2xl font-black text-slate-900 tabular-nums">{formatCurrency(receipt.balance)}</span>
                      </div>
                  </div>
              </div>

              {/* Footer / Signature */}
              <div className="flex justify-between items-end pt-12">
                <div className="max-w-xs space-y-4">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-4">
                    This is a computer-generated confirmation receipt. No physical signature is required for digital verification.
                    Payments are subject to clearing.
                  </p>
                </div>
                <div className="text-center space-y-6">
                    <div className="w-48 h-px bg-slate-200 mx-auto"></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
                        <p className="font-bold text-slate-900 mt-1">BK Business Ventures</p>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional note for digital view */}
          <div className="text-center text-slate-400 text-xs print:hidden space-y-1">
            <p>Generated via BK Financial Portal v1.0 • Secure Audit ID: {receipt.id}</p>
            <p>Use 'Export to PDF' from print dialog for digital archiving.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
