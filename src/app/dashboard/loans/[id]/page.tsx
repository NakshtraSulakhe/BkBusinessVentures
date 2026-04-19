"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { formatDateSafe, formatTimeSafe } from "@/lib/utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ClockIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"

interface LoanAccount {
  id: string
  accountNumber: string
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
    address?: string
  }
  accountRules?: {
    loanMethod?: string
    emiAmount?: number
    gracePeriodDays?: number
  }
  emiEntries?: {
    id: string
    emiNumber: number
    dueDate: string
    principalAmount: number
    interestAmount: number
    status: string
  }[]
  transactions?: {
    id: string
    type: string
    amount: number
    description: string
    reference: string
    transactionDate: string
    createdAt: string
  }[]
}

export default function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const loanId = use(params).id
  const router = useRouter()
  const { token } = useAuth()
  const [loan, setLoan] = useState<LoanAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingTx, setDeletingTx] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchLoanDetails()
  }, [loanId])

  const fetchLoanDetails = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth(`/api/accounts/${loanId}`, { token })
      if (res.ok) {
        const data = await res.json()
        setLoan(data.account)
      }
    } catch (error) {
      console.error('Failed to fetch loan details:', error)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteDialog = (transactionId: string) => {
    setTxToDelete(transactionId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTransaction = async () => {
    if (!txToDelete) return
    
    try {
      setDeletingTx(txToDelete)
      const res = await fetchWithAuth(`/api/transactions/${txToDelete}`, {
        token,
        method: 'DELETE'
      })
      
      if (res.ok) {
        // Refresh loan details to update the transaction list
        await fetchLoanDetails()
        setDeleteDialogOpen(false)
        setTxToDelete(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete transaction')
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      alert('Error deleting transaction')
    } finally {
      setDeletingTx(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return formatDateSafe(dateString)
  }
  const exportToPDF = () => {
    if (!loan || !loan.transactions) return

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const transactions = getTransactionsWithBalance()
    const totalPayable = loan.principalAmount + (loan.principalAmount * (loan.interestRate / 100) * (loan.tenure / 12))
    const totalPaid = transactions.filter(tx => isCredit(tx.type)).reduce((sum, tx) => sum + tx.amount, 0)
    const balanceOwed = totalPayable - totalPaid

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
    doc.text(`Ref: LOAN-${loan.accountNumber}`, 240, 32)

    // Invoice title
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Loan Transaction Statement', 14, 48)

    // Bill to section
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(14, 52, 283, 52)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(71, 85, 105)
    doc.text('Customer Details', 14, 60)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    doc.text(`Customer: ${loan.customer.name}`, 14, 67)
    doc.text(`Email: ${loan.customer.email}`, 14, 73)

    // Loan details box
    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.5)
    doc.rect(140, 58, 143, 20)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(37, 99, 235)
    doc.text('LOAN SUMMARY', 145, 65)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(30, 41, 59)
    doc.text(`Principal: INR ${loan.principalAmount.toLocaleString('en-IN')}`, 145, 71)
    doc.text(`Rate: ${loan.interestRate}% | Tenure: ${loan.tenure}m`, 145, 76)

    // Prepare table data - filter out penalties
    const nonPenaltyTransactions = transactions.filter(tx => 
      !tx.description?.toLowerCase().includes('penalty') && !tx.type?.toLowerCase().includes('penalty')
    )
    
    const headers = [['Date', 'Type', 'Description', 'Reference', 'Debit', 'Credit', 'Balance']]
    const rows = nonPenaltyTransactions.map(tx => [
      formatDate(tx.transactionDate),
      tx.type,
      tx.description || '',
      tx.reference || '',
      !isCredit(tx.type) ? tx.amount.toLocaleString('en-IN') : '',
      isCredit(tx.type) ? tx.amount.toLocaleString('en-IN') : '',
      Math.abs(tx.displayBalance).toLocaleString('en-IN')
    ])

    // Add disbursement row at the beginning
    const disbursementRow = [
      formatDate(loan.startDate),
      'DISBURSEMENT',
      'Loan disbursed to customer',
      loan.accountNumber,
      totalPayable.toLocaleString('en-IN'),
      '',
      totalPayable.toLocaleString('en-IN')
    ]

    const allRows = [disbursementRow, ...rows]

    // Add table with invoice styling
    autoTable(doc, {
      startY: 85,
      head: headers,
      body: allRows,
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
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 55 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
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

    // Add penalty section if there are penalties
    const penaltyTransactions = transactions.filter(tx => 
      tx.description?.toLowerCase().includes('penalty') || tx.type?.toLowerCase().includes('penalty')
    )

    if (penaltyTransactions.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 140
      const totalPenaltyAmount = penaltyTransactions.reduce((sum, tx) => sum + tx.amount, 0)
      
      // Penalty section header
      doc.setDrawColor(244, 63, 94)
      doc.setLineWidth(0.5)
      doc.line(14, finalY + 5, 283, finalY + 5)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(244, 63, 94)
      doc.text('Penalty History', 14, finalY + 12)
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text(`Total Penalties: ${penaltyTransactions.length} | Total Amount: INR ${totalPenaltyAmount.toLocaleString('en-IN')}`, 14, finalY + 18)

      // Penalty table
      const penaltyHeaders = [['Date', 'Description', 'Reference', 'Penalty Rate', 'Amount']]
      const penaltyRows = penaltyTransactions.map(tx => {
        const penaltyRateMatch = tx.description?.match(/(\d+(?:\.\d+)?)\s*%/)
        const penaltyRate = penaltyRateMatch ? penaltyRateMatch[1] : 'N/A'
        
        return [
          formatDate(tx.transactionDate),
          tx.description || '',
          tx.reference || '',
          `${penaltyRate}%`,
          tx.amount.toLocaleString('en-IN')
        ]
      })

      autoTable(doc, {
        startY: finalY + 22,
        head: penaltyHeaders,
        body: penaltyRows,
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [254, 226, 226],
          lineWidth: 0.3,
          overflow: 'linebreak',
          font: 'helvetica',
        },
        headStyles: {
          fillColor: [244, 63, 94],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 7,
          cellPadding: 3,
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 22, halign: 'center' },
          1: { cellWidth: 80 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        },
        alternateRowStyles: {
          fillColor: [255, 241, 242],
        },
        margin: { top: finalY + 22, left: 14, right: 14, bottom: 40 },
        didDrawPage: (data) => {
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
    }

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
    doc.save(`Loan_Statement_${loan.accountNumber}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Calculate EMI (Flat Rate Method)
  const calcEMI = (p: number, r: number, t: number) => {
    if (!p || !r || !t) return 0
    // Flat rate calculation
    const totalInterest = p * (r / 100) * (t / 12)
    const emi = (p + totalInterest) / t
    return isNaN(emi) ? 0 : emi
  }

  // Get transaction type badge
  const getTransactionBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; color: string }> = {
      'LOAN_DISBURSEMENT': { label: 'Loan Given', color: 'bg-amber-100 text-amber-700' },
      'LOAN_RECEIPT': { label: 'Loan Receipt', color: 'bg-emerald-100 text-emerald-700' },
      'EMI_PAYMENT_RECEIVED': { label: 'EMI Payment', color: 'bg-blue-100 text-blue-700' },
      'INTEREST': { label: 'Interest', color: 'bg-indigo-100 text-indigo-700' },
      'PENALTY': { label: 'Penalty', color: 'bg-rose-100 text-rose-700' },
    }
    const normalized = type?.toUpperCase() || ''
    const config = typeConfig[normalized] || { label: type?.replace(/_/g, ' ') || 'Transaction', color: 'bg-slate-100 text-slate-600' }
    return (
      <Badge className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none ${config.color}`}>
        {config.label}
      </Badge>
    )
  }

  // Check if transaction is credit (money coming in reduces loan)
  const isCredit = (type: string) => {
    const creditTypes = ['LOAN_RECEIPT', 'EMI_PAYMENT_RECEIVED', 'REPAYMENT', 'EMI', 'DEPOSIT', 'PAYMENT', 'ADJUSTMENT_CREDIT']
    return creditTypes.some(t => type?.toUpperCase().includes(t))
  }

  // Calculate running balance for transactions (excluding penalties)
  const getTransactionsWithBalance = () => {
    if (!loan?.transactions) return []

    // Sort by date (oldest first)
    const sorted = [...loan.transactions].sort((a, b) =>
      new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    )

    // Start with total payable (principal + interest) - this is what customer owes
    let balance = totalPayable

    return sorted.map(tx => {
      // For loans:
      // - Initial balance is totalPayable (principal + interest)
      // - EMI payment (credit): Balance reduces
      // - Penalties: Do NOT affect balance (recorded separately)
      // - Other debits: Balance increases
      const isCreditTx = isCredit(tx.type)
      const isPenalty = tx.description?.toLowerCase().includes('penalty') || tx.type?.toLowerCase().includes('penalty')

      if (isCreditTx) {
        // Payment received - reduce balance
        balance -= tx.amount
      } else if (!tx.type?.toUpperCase().includes('DISBURSEMENT') && !isPenalty) {
        // Other debits (excluding penalties) - increase balance
        balance += tx.amount
      }
      // For disbursement and penalties, we don't change balance
      
      return { ...tx, displayBalance: balance }
    })
  }

  const totalInterest = loan ? loan.principalAmount * (loan.interestRate / 100) * (loan.tenure / 12) : 0
  const totalPayable = loan ? loan.principalAmount + totalInterest : 0
  const emiAmount = loan ? calcEMI(loan.principalAmount, loan.interestRate, loan.tenure) : 0

  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium italic">Loading loan details...</p>
      </div>
    </DashboardLayout>
  )

  if (!loan) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
          <ExclamationTriangleIcon className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Loan Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-xs">We couldn't find this loan account.</p>
        <Button onClick={() => router.push('/dashboard/loans')} className="mt-8 finance-gradient-primary">
          Back to Loans
        </Button>
      </div>
    </DashboardLayout>
  )

  const transactionsWithBalance = getTransactionsWithBalance()

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up pb-20">
        {/* Page Header */}
        <PageHeader
          title="Loan Details"
          subtitle={`${loan.accountNumber} - ${loan.customer.name}`}
          actions={
            <div className="flex items-center gap-3 no-print">
              {/* <Button
                variant="outline"
                onClick={() => window.print()}
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 transition-all font-medium"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export PDF
              </Button> */}
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/loans')}
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 transition-all font-medium no-print"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/loans/${loanId}/edit`)}
                className="h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-xl px-4 font-bold transition-all shadow-sm no-print"
              >
                Edit Loan
              </Button>
            </div>
          }
        />

        {/* Customer Details Card */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
              <UserIcon className="h-4 w-4 mr-2 text-primary" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</p>
                  <p className="text-sm font-bold text-slate-900">{loan.customer.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-slate-900">{loan.customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-bold text-slate-900">{loan.customer.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Principal Amount"
            value={formatCurrency(loan.principalAmount)}
            icon={<BanknotesIcon />}
            trend={{ value: "Loan Given", isPositive: true }}
            className="border-amber-500"
          />
          <StatCard
            title="Interest Rate"
            value={`${loan.interestRate}%`}
            icon={<ReceiptPercentIcon />}
            trend={{ value: "Per Annum", isPositive: true }}
            className="border-indigo-500"
          />
          <StatCard
            title="Monthly EMI"
            value={formatCurrency(emiAmount)}
            icon={<CurrencyDollarIcon />}
            trend={{ value: `${loan.tenure} Months`, isPositive: true }}
            className="border-emerald-500"
          />
          <StatCard
            title="Total Payable"
            value={formatCurrency(totalPayable)}
            icon={<ClockIcon />}
            trend={{ value: "Principal + Interest", isPositive: true }}
            className="border-slate-800"
          />
        </div>

        {/* Transaction History */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
              <BuildingLibraryIcon className="h-4 w-4 mr-2 text-primary" />
              Loan Transaction History
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px]">
                {transactionsWithBalance.filter(tx => !tx.description?.toLowerCase().includes('penalty')).length} Transactions
              </Badge>
              <Button
                onClick={exportToPDF}
                disabled={!loan?.transactions || loan.transactions.length === 0}
                variant="outline"
                className="h-8 border-slate-200 text-slate-700 rounded-lg px-3 hover:bg-slate-50 font-medium text-xs gap-2 no-print"
              >
                <DocumentTextIcon className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="px-6 text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">Transaction Type</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-right">Debit</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-right">Credit</TableHead>
                  <TableHead className="px-6 text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-right">Balance (Owed)</TableHead>
                  <TableHead className="px-6 text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Initial Loan Disbursement Entry */}
                <TableRow className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 bg-amber-50/30">
                  <TableCell className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-900">{formatDate(loan.startDate)}</div>
                    <div className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-0.5">Loan Start</div>
                  </TableCell>
                  <TableCell>
                    {getTransactionBadge('LOAN_DISBURSEMENT')}
                    <div className="text-xs text-slate-500 mt-1">Loan disbursed to customer (Principal + Interest)</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm font-black text-amber-700">{formatCurrency(totalPayable)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm text-slate-400">—</div>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <div className="text-sm font-black text-slate-900">{formatCurrency(totalPayable)}</div>
                  </TableCell>
                </TableRow>

                {/* Transaction Entries (excluding penalties) */}
                {transactionsWithBalance
                  .filter(tx => !tx.description?.toLowerCase().includes('penalty'))
                  .map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                    <TableCell className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-900">{formatDate(tx.transactionDate)}</div>
                      <div className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-0.5">
                        {formatTimeSafe(tx.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTransactionBadge(tx.type)}
                      <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">{tx.description || tx.reference}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isCredit(tx.type) ? (
                        <div className="text-sm font-black text-rose-600">{formatCurrency(tx.amount)}</div>
                      ) : (
                        <div className="text-sm text-slate-400">—</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isCredit(tx.type) ? (
                        <div className="text-sm font-black text-emerald-600">{formatCurrency(tx.amount)}</div>
                      ) : (
                        <div className="text-sm text-slate-400">—</div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <div className={`text-sm font-bold ${tx.displayBalance <= 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {formatCurrency(Math.abs(tx.displayBalance))}
                        {tx.displayBalance <= 0 && <span className="text-[10px] ml-1 text-emerald-600">(Paid)</span>}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 text-center">
                      <button
                        onClick={() => openDeleteDialog(tx.id)}
                        disabled={deletingTx === tx.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete transaction"
                      >
                        {deletingTx === tx.id ? (
                          <div className="h-4 w-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}

                {transactionsWithBalance.filter(tx => !tx.description?.toLowerCase().includes('penalty')).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                          <BuildingLibraryIcon className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">No transactions yet</p>
                        <p className="text-xs text-slate-400 mt-1">EMI payments will appear here once recorded</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Penalty History */}
        {loan.transactions && loan.transactions.filter(tx => tx.description?.toLowerCase().includes('penalty')).length > 0 && (
          <Card className="border-rose-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-rose-50/50 border-b border-rose-100 px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-rose-800 uppercase tracking-widest flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-rose-600" />
                Penalty History
              </CardTitle>
              <Badge className="bg-rose-50 text-rose-700 border-none font-bold text-[10px]">
                {loan.transactions.filter(tx => tx.description?.toLowerCase().includes('penalty')).length} Penalties
              </Badge>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-rose-50/30">
                  <TableRow>
                    <TableHead className="px-6 text-[10px] font-black uppercase text-rose-400 h-10 tracking-widest">Month</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-rose-400 h-10 tracking-widest">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-rose-400 h-10 tracking-widest text-right">Penalty Rate</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-rose-400 h-10 tracking-widest text-right">Penalty Amount</TableHead>
                    <TableHead className="px-6 text-[10px] font-black uppercase text-rose-400 h-10 tracking-widest">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loan.transactions
                    .filter(tx => tx.description?.toLowerCase().includes('penalty'))
                    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
                    .map((tx) => {
                      const txDate = new Date(tx.transactionDate)
                      const monthName = txDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                      const penaltyRateMatch = tx.description.match(/(\d+(?:\.\d+)?)\s*%/)
                      const penaltyRate = penaltyRateMatch ? penaltyRateMatch[1] : 'N/A'

                      return (
                        <TableRow key={tx.id} className="hover:bg-rose-50/50 transition-colors border-b border-rose-50">
                          <TableCell className="px-6 py-4">
                            <div className="font-bold text-rose-900">{monthName}</div>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-900">{formatDate(tx.transactionDate)}</TableCell>
                          <TableCell className="text-right text-xs font-bold text-rose-700">{penaltyRate}%</TableCell>
                          <TableCell className="text-right text-sm font-black text-rose-900">{formatCurrency(tx.amount)}</TableCell>
                          <TableCell className="px-6">
                            <Badge className="bg-rose-50 text-rose-700 border-none font-bold text-[9px]">
                              {tx.reference}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* EMI Schedule */}
        {loan.emiEntries && loan.emiEntries.length > 0 && (
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                EMI Schedule
              </CardTitle>
              <Badge className="bg-indigo-50 text-indigo-700 border-none font-bold text-[10px]">
                {loan.emiEntries.length} EMIs
              </Badge>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow>
                    <TableHead className="px-6 text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">EMI No.</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest">Due Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-right">Principal</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-right">Interest</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-right">Total EMI</TableHead>
                    <TableHead className="px-6 text-[10px] font-black uppercase text-slate-400 h-10 tracking-widest text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loan.emiEntries.map((emi) => (
                    <TableRow key={emi.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                      <TableCell className="px-6 py-4">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black text-[10px]">
                          {emi.emiNumber}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">{formatDate(emi.dueDate)}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-slate-700">{formatCurrency(emi.principalAmount)}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-slate-700">{formatCurrency(emi.interestAmount)}</TableCell>
                      <TableCell className="text-right text-sm font-black text-slate-900">{formatCurrency(emi.principalAmount + emi.interestAmount)}</TableCell>
                      <TableCell className="px-6 text-center">
                        <Badge className={`text-[9px] font-black tracking-widest px-2 py-0.5 border-none ${
                          emi.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {emi.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTxToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              disabled={deletingTx !== null}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deletingTx ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice Content - Only visible during print */}
      <div id="invoice-content" className="hidden print:block p-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Invoice Header */}
          <div className="border-b-2 border-slate-800 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Loan Account Statement</h1>
            <p className="text-sm text-slate-600 mt-1">Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Account Information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Account Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Account Number:</span>
                  <span className="font-semibold">{loan.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Customer Name:</span>
                  <span className="font-semibold">{loan.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-semibold">{loan.customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Phone:</span>
                  <span className="font-semibold">{loan.customer.phone}</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Loan Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Principal Amount:</span>
                  <span className="font-semibold">{formatCurrency(loan.principalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Interest Rate:</span>
                  <span className="font-semibold">{loan.interestRate}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">EMI Amount:</span>
                  <span className="font-semibold">{formatCurrency(loan.accountRules?.emiAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tenure:</span>
                  <span className="font-semibold">{loan.tenure} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Start Date:</span>
                  <span className="font-semibold">{formatDate(loan.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className="font-semibold">{loan.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Transaction History</h2>
            {transactionsWithBalance.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-800 uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-800 uppercase">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-800 uppercase">Description</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-800 uppercase">Credit</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-800 uppercase">Debit</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-800 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsWithBalance.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-200">
                      <td className="py-3 px-4 text-sm text-slate-700">
                        {formatDate(tx.transactionDate)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${
                          tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700">{tx.description}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-emerald-600">
                        {tx.type === 'CREDIT' ? formatCurrency(tx.amount) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-rose-600">
                        {tx.type === 'DEBIT' ? formatCurrency(tx.amount) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-slate-800">
                        {formatCurrency(tx.displayBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-600 py-4">No transactions found</p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
            <p>This is a computer-generated statement. For any queries, please contact your branch.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Add print styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @media print {
      body * {
        visibility: hidden;
      }
      #invoice-content, #invoice-content * {
        visibility: visible;
      }
      #invoice-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white !important;
      }
      .no-print {
        display: none !important;
      }
      @page {
        margin: 0.5cm;
        size: A4;
      }
    }
  `
  document.head.appendChild(style)
}
