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
  CurrencyDollarIcon, CheckCircleIcon, PlusIcon, EyeIcon,
  PencilIcon, MagnifyingGlassIcon, ChartBarIcon, CalendarIcon,
  ArrowPathIcon, DocumentArrowDownIcon, DocumentTextIcon,
} from "@heroicons/react/24/outline"

interface RDAccount {
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

export default function RDPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [rdAccounts, setRdAccounts] = useState<RDAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true)
        console.log("🔍 Fetching RD accounts...")
        const res = await fetchWithAuth('/api/accounts?accountType=RD', { token })
        if (res.ok) { 
          const d = await res.json(); 
          console.log("📊 RD accounts response:", d)
          console.log("📋 RD accounts found:", d.accounts?.length || 0)
          setRdAccounts(d.accounts || []) 
        } else {
          console.error("❌ Failed to fetch RD accounts:", res.status)
        }
      } catch (e) { 
        console.error("❌ Error fetching RD accounts:", e) 
      } finally { 
        setLoading(false) 
      }
    }
    fetch_()
  }, [token])

  const filtered = rdAccounts.filter(a =>
    a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalMonthly = filtered.reduce((s, a) => s + (a.principalAmount / a.tenure), 0)
  const avgRate = filtered.length > 0 ? filtered.reduce((s, a) => s + a.interestRate, 0) / filtered.length : 0

  const exportToCSV = () => {
    // Helper to format number for CSV (raw number, no currency symbol)
    const formatNumber = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    // Create CSV content
    const headers = ['Account Number', 'Customer Name', 'Customer Email', 'Customer Phone', 'Monthly Installment', 'Interest Rate (%)', 'Tenure (Months)', 'Start Date', 'Maturity Date', 'Status', 'Maturity Amount']
    const rows = filtered.map(account => {
      const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
      const totalPrincipal = monthly * account.tenure
      const r = account.interestRate / 100
      const n = account.tenure
      const rdInterest = monthly * (n * (n + 1) / 2) * (r / 12)
      const maturityAmount = Math.round(totalPrincipal + rdInterest)

      return [
        account.accountNumber,
        account.customer.name,
        account.customer.email,
        account.customer.phone,
        formatNumber(monthly),
        account.interestRate.toString(),
        account.tenure.toString(),
        account.startDate ? new Date(account.startDate).toLocaleDateString('en-IN') : '',
        account.maturityDate ? new Date(account.maturityDate).toLocaleDateString('en-IN') : '',
        account.status || 'ACTIVE',
        formatNumber(maturityAmount)
      ]
    })

    const csvContent = [
      ['Recurring Deposit Accounts Report'],
      [`Total RD Accounts: ${filtered.length}`],
      [`Total Monthly Installments: INR ${totalMonthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
      [],
      headers,
      ...rows
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `rd_accounts_${new Date().toISOString().split('T')[0]}.csv`)
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
      const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
      const totalPrincipal = monthly * account.tenure
      const r = account.interestRate / 100
      const n = account.tenure
      const rdInterest = monthly * (n * (n + 1) / 2) * (r / 12)
      return sum + (totalPrincipal + rdInterest)
    }, 0)

    const totalInterest = filtered.reduce((sum, account) => {
      const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
      const totalPrincipal = monthly * account.tenure
      const r = account.interestRate / 100
      const n = account.tenure
      const rdInterest = monthly * (n * (n + 1) / 2) * (r / 12)
      return sum + rdInterest
    }, 0)

    const totalPrincipal = filtered.reduce((sum, account) => {
      const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
      return sum + (monthly * account.tenure)
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
    doc.text(`Ref: RD-RPT-${Date.now().toString().slice(-8)}`, 240, 32)

    // Invoice title
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Recurring Deposit Accounts Statement', 14, 48)

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
    const headers = [['S.No', 'Account No', 'Customer Name', 'Monthly', 'Rate', 'Tenure', 'Start Date', 'Maturity Date', 'Status', 'Maturity Amount', 'Interest']]
    const rows = filtered.map((account, index) => {
      const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
      const totalPrincipal = monthly * account.tenure
      const r = account.interestRate / 100
      const n = account.tenure
      const rdInterest = monthly * (n * (n + 1) / 2) * (r / 12)
      const maturityAmount = totalPrincipal + rdInterest

      return [
        (index + 1).toString(),
        account.accountNumber,
        account.customer.name,
        monthly.toLocaleString('en-IN'),
        `${account.interestRate}%`,
        `${account.tenure}m`,
        account.startDate ? new Date(account.startDate).toLocaleDateString('en-IN') : '-',
        account.maturityDate ? new Date(account.maturityDate).toLocaleDateString('en-IN') : '-',
        account.status || 'ACTIVE',
        Math.round(maturityAmount).toLocaleString('en-IN'),
        Math.round(rdInterest).toLocaleString('en-IN')
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
    doc.save(`RD_Statement_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        <PageHeader
          title="Recurring Deposits"
          subtitle="Manage all recurring deposit accounts"
          actions={
            <div className="flex items-center gap-3">
              <Button
                onClick={exportToCSV}
                disabled={filtered.length === 0}
                variant="outline"
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={exportToPDF}
                disabled={filtered.length === 0}
                variant="outline"
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => router.push('/dashboard/deposits/rd/create')} className="finance-gradient-primary text-white h-9 px-4 rounded-xl font-medium shadow-sm">
                <PlusIcon className="h-4 w-4 mr-2" /> Create RD
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Total RD Accounts" value={filtered.length} subtitle="All accounts" icon={<ArrowPathIcon />} iconVariant="primary" borderVariant="primary" />
          <StatCard title="Active RDs" value={filtered.filter(a => a.status?.toLowerCase() === 'active').length} subtitle="Currently active" icon={<CheckCircleIcon />} iconVariant="success" borderVariant="success" />
          <StatCard title="Monthly Installments" value={`₹${totalMonthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} subtitle="Combined monthly" icon={<CurrencyDollarIcon />} iconVariant="teal" borderVariant="teal" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by account number or customer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">RD Accounts <span className="ml-1 text-xs font-normal text-slate-400">({filtered.length})</span></h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading accounts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl finance-icon-bg flex items-center justify-center mx-auto mb-4"><ArrowPathIcon className="h-7 w-7" /></div>
              <h3 className="text-sm font-semibold text-slate-800">No RD accounts found</h3>
              <p className="text-xs text-slate-400 mt-1">{search ? 'Try adjusting your search' : 'Get started by creating your first RD'}</p>
              {!search && (
                <Button onClick={() => router.push('/dashboard/deposits/rd/create')} className="mt-5 finance-gradient-primary text-white h-8 px-4 text-xs rounded-lg">
                  <PlusIcon className="h-3.5 w-3.5 mr-1.5" /> Create RD Account
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
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[130px] text-right">Monthly Install.</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[80px] text-right">Rate</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[80px]">Tenure</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[130px] text-right">Maturity Amt</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[110px]">Maturity</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-600 min-w-[90px]">Status</TableHead>
                    <TableHead className="px-4 py-3 w-14 text-right text-xs font-semibold text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(account => {
                    const sk = account.status?.toLowerCase() || 'active'
                    const statusCls = STATUS_CLS[sk] ?? "badge-status badge-status-closed"
                    const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
                    return (
                      <TableRow key={account.id} className="hover:bg-slate-50 border-slate-100 transition-colors">
                        <TableCell className="px-5 py-3.5">
                          <div className="font-mono text-sm font-semibold text-slate-800">{account.accountNumber}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <CalendarIcon className="h-3 w-3" />
                            {formatShortDate(account.startDate)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="text-sm font-semibold text-slate-800">{account.customer.name}</div>
                          <div className="text-xs text-slate-400">{account.customer.email}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-900 tabular-nums">₹{monthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">{account.interestRate}%</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-sm text-slate-600 tabular-nums">{account.tenure}m</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-bold text-slate-900 tabular-nums">
                            ₹{(() => {
                              const monthly = account.tenure > 0 ? account.principalAmount / account.tenure : 0
                              const totalPrincipal = monthly * account.tenure
                              const r = account.interestRate / 100
                              const n = account.tenure
                              const rdInterest = monthly * (n * (n + 1) / 2) * (r / 12)
                              return Math.round(totalPrincipal + rdInterest).toLocaleString('en-IN')
                            })()}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-xs text-slate-500 tabular-nums">
                            {account.maturityDate ? formatShortDate(account.maturityDate) : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className={statusCls}>{account.status || 'ACTIVE'}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <TableActions actions={[
                            { label: "View Details", icon: <EyeIcon />, onClick: () => router.push(`/dashboard/deposits/rd/${account.id}`) },
                            { label: "Edit", icon: <PencilIcon />, onClick: () => router.push(`/dashboard/deposits/rd/${account.id}/edit`) },
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
