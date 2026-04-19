"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { formatShortDate } from "@/lib/utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { TableActions } from "@/components/ui/table-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Building2, DollarSign, CheckCircle2, AlertTriangle, Plus, Eye, Pencil, Search, BarChart3, Calendar, Download, FileText
} from "lucide-react"

interface FDAccount {
  id: string; accountNumber: string; customerId: string; accountType: string;
  principalAmount: number; interestRate: number; tenure: number;
  startDate: string; maturityDate: string; status: string;
  customer: { id: string; name: string; email: string; phone: string };
  accountRules: any; _count: { transactions: number }
}

const STATUS_CLS: Record<string, string> = {
  active:           "badge-status badge-status-active",
  maturity_pending: "badge-status badge-status-matured",
  closing_pending:  "badge-status badge-status-matured",
  closed:           "badge-status badge-status-closed",
}

export default function FDPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [fdAccounts, setFdAccounts] = useState<FDAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchFD = async () => {
      try {
        setLoading(true)
        console.log("🔍 Fetching FD accounts...")
        const res = await fetchWithAuth('/api/accounts?accountType=FD', { token })
        if (res.ok) { 
          const d = await res.json(); 
          console.log("📊 FD accounts response:", d)
          console.log("📋 FD accounts found:", d.accounts?.length || 0)
          setFdAccounts(d.accounts || []) 
        } else {
          console.error("❌ Failed to fetch FD accounts:", res.status)
        }
      } catch (e) { 
        console.error("❌ Error fetching FD accounts:", e) 
      } finally { 
        setLoading(false) 
      }
    }
    fetchFD()
  }, [token])

  const filtered = fdAccounts.filter(a =>
    a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPrincipal = filtered.reduce((s, a) => s + a.principalAmount, 0)
  const avgRate = filtered.length > 0 ? filtered.reduce((s, a) => s + a.interestRate, 0) / filtered.length : 0

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN')
  }

  const calculateCompoundInterest = (principal: number, rate: number, tenure: number, method: string = 'compound') => {
    if (!principal || !rate || !tenure) return 0

    if (method === 'simple') {
      // Simple Interest Formula: SI = P * R * T
      return principal * (rate / 100) * (tenure / 12)
    } else {
      // Compound Interest Formula (Quarterly Compounding)
      // A = P * (1 + r/n)^(n*t)
      const r = rate / 100
      const n = 4 // Quarterly compounding
      const t = tenure / 12 // Convert months to years

      const finalAmount = principal * Math.pow((1 + r / n), n * t)
      const interestEarned = finalAmount - principal

      return interestEarned
    }
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Account Number', 'Customer Name', 'Customer Email', 'Customer Phone', 'Principal Amount', 'Interest Rate (%)', 'Tenure (Months)', 'Start Date', 'Maturity Date', 'Status', 'Maturity Amount', 'Interest Earned', 'Calculation Method']
    const rows = filtered.map(account => {
      const principal = account.principalAmount || 0
      const rate = account.interestRate || 0
      const tenure = account.tenure || 0
      const method = account.accountRules?.calculationMethod
      const calculationMethod = method === 'simple' || method === 'compound' ? method : 'compound'
      const interest = calculateCompoundInterest(principal, rate, tenure, calculationMethod)
      const maturityAmount = principal + interest

      return [
        account.accountNumber,
        account.customer.name,
        account.customer.email,
        account.customer.phone,
        formatNumber(principal),
        rate.toString(),
        tenure.toString(),
        account.startDate ? new Date(account.startDate).toLocaleDateString('en-IN') : '',
        account.maturityDate ? new Date(account.maturityDate).toLocaleDateString('en-IN') : '',
        account.status || 'ACTIVE',
        formatNumber(Math.round(maturityAmount)),
        formatNumber(Math.round(interest)),
        calculationMethod === 'simple' ? 'Simple Interest' : 'Quarterly Compounding'
      ]
    })

    const csvContent = [
      ['Fixed Deposit Accounts Report'],
      [`Total FD Accounts: ${filtered.length}`],
      [`Total Principal: INR ${totalPrincipal.toLocaleString('en-IN')}`],
      [],
      headers,
      ...rows
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `fd_accounts_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const totalMaturity = filtered.reduce((sum, account) => {
      const principal = account.principalAmount || 0
      const rate = account.interestRate || 0
      const tenure = account.tenure || 0
      const method = account.accountRules?.calculationMethod
      const calculationMethod = method === 'simple' || method === 'compound' ? method : 'compound'
      const interest = calculateCompoundInterest(principal, rate, tenure, calculationMethod)
      return sum + principal + interest
    }, 0)

    const totalInterest = filtered.reduce((sum, account) => {
      const principal = account.principalAmount || 0
      const rate = account.interestRate || 0
      const tenure = account.tenure || 0
      const method = account.accountRules?.calculationMethod
      const calculationMethod = method === 'simple' || method === 'compound' ? method : 'compound'
      return sum + calculateCompoundInterest(principal, rate, tenure, calculationMethod)
    }, 0)

    // Invoice header with company info
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 0, 297, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('BK Business Ventures', 14, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Financial Management System', 14, 28)
    
    doc.setFontSize(10)
    doc.text('INVOICE / REPORT', 240, 20)
    doc.setFontSize(8)
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 240, 26)
    doc.text(`Ref: FD-RPT-${Date.now().toString().slice(-8)}`, 240, 32)

    // Invoice title
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Fixed Deposit Accounts Statement', 14, 48)

    // Bill to section
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(14, 52, 283, 52)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(71, 85, 105)
    doc.text('Report Details', 14, 60)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    doc.text(`Total Accounts: ${filtered.length}`, 14, 67)
    doc.text(`Report Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 73)

    // Summary box
    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.5)
    doc.rect(180, 58, 103, 20)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(37, 99, 235)
    doc.text('SUMMARY', 185, 65)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(30, 41, 59)
    doc.text(`Total Principal: INR ${totalPrincipal.toLocaleString('en-IN')}`, 185, 71)
    doc.text(`Total Interest: INR ${Math.round(totalInterest).toLocaleString('en-IN')}`, 185, 76)

    // Prepare table data
    const headers = [['S.No', 'Account No', 'Customer Name', 'Principal', 'Rate', 'Tenure', 'Start Date', 'Maturity Date', 'Status', 'Maturity Amount', 'Interest', 'Method']]
    const rows = filtered.map((account, index) => {
      const principal = account.principalAmount || 0
      const rate = account.interestRate || 0
      const tenure = account.tenure || 0
      const method = account.accountRules?.calculationMethod
      const calculationMethod = method === 'simple' || method === 'compound' ? method : 'compound'
      const interest = calculateCompoundInterest(principal, rate, tenure, calculationMethod)
      const maturityAmount = principal + interest

      return [
        (index + 1).toString(),
        account.accountNumber,
        account.customer.name,
        principal.toLocaleString('en-IN'),
        `${rate}%`,
        `${tenure}m`,
        account.startDate ? new Date(account.startDate).toLocaleDateString('en-IN') : '-',
        account.maturityDate ? new Date(account.maturityDate).toLocaleDateString('en-IN') : '-',
        account.status || 'ACTIVE',
        Math.round(maturityAmount).toLocaleString('en-IN'),
        Math.round(interest).toLocaleString('en-IN'),
        calculationMethod === 'simple' ? 'Simple' : 'Compound'
      ]
    })

    // Add table with invoice styling
    autoTable(doc, {
      startY: 85,
      head: headers,
      body: rows,
      styles: {
        fontSize: 7,
        cellPadding: 3,
        lineColor: [226, 232, 240],
        lineWidth: 0.3,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7,
        cellPadding: 4,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 22, halign: 'center' },
        7: { cellWidth: 22, halign: 'center' },
        8: { cellWidth: 18, halign: 'center' },
        9: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
        10: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
        11: { cellWidth: 20, halign: 'center' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { top: 85, left: 14, right: 14, bottom: 40 },
      didDrawPage: (data) => {
        // Add page number
        const pageSize = doc.internal.pageSize
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Page ${data.pageNumber}`,
          pageSize.width ? pageSize.width / 2 : 148,
          pageHeight - 12,
          { align: 'center' }
        )
      },
    })

    // Footer
    const pageCount = doc.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Footer line
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.5)
      doc.line(14, 185, 283, 185)
      
      // Footer text
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'normal')
      doc.text('This is a computer-generated document. For any queries, please contact support.', 14, 192)
      doc.text('BK Business Ventures - Financial Management System', 14, 198)
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 240, 192, { align: 'right' })
    }

    // Save the PDF
    doc.save(`FD_Statement_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        <PageHeader
          title="Fixed Deposits"
          subtitle="Manage all fixed deposit accounts"
          actions={
            <div className="flex items-center gap-3">
              <Button
                onClick={exportToCSV}
                disabled={filtered.length === 0}
                variant="outline"
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={exportToPDF}
                disabled={filtered.length === 0}
                variant="outline"
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => router.push('/dashboard/deposits/fd/create')} className="finance-gradient-primary text-white h-9 px-4 rounded-xl font-medium shadow-sm">
                <Plus className="h-4 w-4 mr-2" /> Create FD
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard title="Total FD Accounts" value={filtered.length} subtitle="All accounts" icon={<Building2 />} iconVariant="primary" borderVariant="primary" />
          <StatCard title="Active FDs" value={filtered.filter(a => a.status?.toLowerCase() === 'active').length} subtitle="Currently active" icon={<CheckCircle2 />} iconVariant="success" borderVariant="success" />
          <StatCard title="Total Deposits" value={`₹${(totalPrincipal / 100000).toFixed(1)}L`} subtitle="Principal deployed" icon={<DollarSign />} iconVariant="info" borderVariant="info" />
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by account number or customer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">FD Accounts <span className="ml-1 text-xs font-normal text-slate-400">({filtered.length})</span></h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading accounts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl finance-icon-bg flex items-center justify-center mx-auto mb-4"><Building2 className="h-7 w-7" /></div>
              <h3 className="text-sm font-semibold text-slate-800">No FD accounts found</h3>
              <p className="text-xs text-slate-400 mt-1">{search ? 'Try adjusting your search' : 'Get started by creating your first FD'}</p>
              {!search && (
                <Button onClick={() => router.push('/dashboard/deposits/fd/create')} className="mt-5 finance-gradient-primary text-white h-8 px-4 text-xs rounded-lg">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Create FD Account
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50 border-slate-100">
                    <TableHead className="px-5 py-3 text-xs font-semibold text-slate-600 min-w-[150px]">Account</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[180px]">Customer</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[120px] text-right">Principal</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[80px] text-right">Rate</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[80px]">Period</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[110px]">Maturity</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[120px] text-right">Maturity Amt</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[90px]">Status</TableHead>
                    <TableHead className="px-4 py-3 w-14 text-right text-xs font-semibold text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(account => {
                    const statusKey = account.status?.toLowerCase() || 'active'
                    const statusCls = STATUS_CLS[statusKey] ?? "badge-status badge-status-closed"
                    return (
                      <TableRow key={account.id} className="hover:bg-slate-50 border-slate-100 transition-colors">
                        <TableCell className="px-5 py-3.5">
                          <div className="font-mono text-sm font-semibold text-slate-800">{account.accountNumber}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {formatShortDate(account.startDate)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="text-sm font-semibold text-slate-800">{account.customer.name}</div>
                          <div className="text-xs text-slate-400">{account.customer.email}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-900 tabular-nums">₹{account.principalAmount.toLocaleString('en-IN')}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">{account.interestRate}%</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-sm text-slate-600 tabular-nums">{account.tenure}m</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-xs text-slate-500 tabular-nums">
                            {account.maturityDate ? formatShortDate(account.maturityDate) : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          {(() => {
                            const principal = account.principalAmount || 0
                            const rate = account.interestRate || 0
                            const tenure = account.tenure || 0
                            const method = account.accountRules?.calculationMethod
      const calculationMethod = method === 'simple' || method === 'compound' ? method : 'compound'
                            const interest = calculateCompoundInterest(principal, rate, tenure, calculationMethod)
                            const maturityAmount = principal + interest
                            return (
                              <span className="text-sm font-bold text-emerald-700 tabular-nums">₹{Math.round(maturityAmount).toLocaleString('en-IN')}</span>
                            )
                          })()}
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className={statusCls}>{account.status || 'ACTIVE'}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <TableActions actions={[
                            { label: "View Details", icon: <Eye />, onClick: () => router.push(`/dashboard/accounts/${account.id}`) },
                            { label: "Edit", icon: <Pencil />, onClick: () => router.push(`/dashboard/accounts/${account.id}/edit`) },
                          ]} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
