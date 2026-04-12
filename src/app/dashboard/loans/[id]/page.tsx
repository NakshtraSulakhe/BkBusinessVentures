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
  DocumentArrowDownIcon
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
  const exportToCSV = () => {
    if (!loan || !loan.transactions) return

    const transactions = getTransactionsWithBalance()
    
    // Helper to format number for CSV (raw number, no currency symbol)
    const formatNumber = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }
    
    // Create CSV content
    const headers = ['Date', 'Transaction Type', 'Description', 'Reference', 'Debit', 'Credit', 'Balance (Owed)']
    const rows = transactions.map(tx => [
      formatDate(tx.transactionDate),
      tx.type,
      tx.description || '',
      tx.reference || '',
      !isCredit(tx.type) ? formatNumber(tx.amount) : '',
      isCredit(tx.type) ? formatNumber(tx.amount) : '',
      formatNumber(Math.abs(tx.displayBalance))
    ])

    // Add loan disbursement as first row
    const disbursementRow = [
      formatDate(loan.startDate),
      'LOAN_DISBURSEMENT',
      'Loan disbursed to customer (Principal + Interest)',
      loan.accountNumber,
      formatNumber(totalPayable),
      '',
      formatNumber(totalPayable)
    ]

    const csvContent = [
      ['Customer Transaction Report'],
      [`Customer Name: ${loan.customer.name}`],
      [`Email: ${loan.customer.email}`],
      [`Phone: ${loan.customer.phone}`],
      [`Loan Account: ${loan.accountNumber}`],
      [`Principal Amount: ${formatNumber(loan.principalAmount)}`],
      [`Interest Rate: ${loan.interestRate}%`],
      [`Tenure: ${loan.tenure} months`],
      [`Total Payable: ${formatNumber(totalPayable)}`],
      [],
      headers,
      disbursementRow,
      ...rows
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `loan_transactions_${loan.accountNumber}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate EMI
  const calcEMI = (p: number, r: number, t: number) => {
    const mr = r / 12 / 100
    const emi = p * mr * Math.pow(1 + mr, t) / (Math.pow(1 + mr, t) - 1)
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
    const creditTypes = ['LOAN_RECEIPT', 'EMI_PAYMENT_RECEIVED', 'REPAYMENT', 'EMI', 'DEPOSIT', 'PAYMENT']
    return creditTypes.some(t => type?.toUpperCase().includes(t))
  }

  // Calculate running balance for transactions
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
      // - Additional debits (penalty, etc.): Balance increases
      const isCreditTx = isCredit(tx.type)
      
      if (isCreditTx) {
        // Payment received - reduce balance
        balance -= tx.amount
      } else if (!tx.type?.toUpperCase().includes('DISBURSEMENT')) {
        // Other debits (penalty, etc.) - increase balance
        balance += tx.amount
      }
      // For disbursement, we don't change balance as it's the starting point
      
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
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/loans')}
                className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 transition-all font-medium"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={() => router.push(`/dashboard/loans/${loanId}/edit`)}
                className="h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-xl px-4 font-bold transition-all shadow-sm"
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
                {transactionsWithBalance.length} Transactions
              </Badge>
              <Button
                onClick={exportToCSV}
                disabled={!loan?.transactions || loan.transactions.length === 0}
                variant="outline"
                className="h-8 border-slate-200 text-slate-700 rounded-lg px-3 hover:bg-slate-50 font-medium text-xs gap-2"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                Export CSV
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

                {/* Transaction Entries */}
                {transactionsWithBalance.map((tx) => (
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

                {transactionsWithBalance.length === 0 && (
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
    </DashboardLayout>
  )
}
