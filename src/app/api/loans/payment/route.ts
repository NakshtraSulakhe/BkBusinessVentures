import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { 
  normalizeTransactionType, 
  isCreditTransaction, 
  calculateNewBalance, 
  validateTransaction,
  TransactionType 
} from "@/lib/accounting-rules"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      accountId, 
      amount, 
      date, 
      paymentMethod, 
      description,
      allocationPreference // 'tenure' or 'emi' for advance payments
    } = body

    if (!accountId || !amount) {
      return NextResponse.json(
        { error: 'Account ID and amount are required' },
        { status: 400 }
      )
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { 
        accountRules: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!account || account.accountType !== 'LOAN') {
      return NextResponse.json({ error: 'Valid loan account required' }, { status: 404 })
    }

    const totalPaid = parseFloat(amount)
    let remaining = totalPaid
    
    // 1. Check for outstanding penalties
    const lastBalance = account.transactions[0]?.balance || 0
    // In this system, penalties are recorded as transactions that increase the "owed" amount if we treat balance as debt.
    // However, the current system seems to treat balance as "Amount in Account".
    // For Loans, balance is usually negative or representing outstanding.
    
    // Let's assume a simpler allocation for now:
    // Penalty -> Interest -> Principal
    
    const allocation = {
      penalty: 0,
      interest: 0,
      principal: 0,
      advance: 0
    }

    // Logic for allocation (Simplified for Sprint 7 demonstration)
    const emiAmount = account.accountRules?.emiAmount || 0
    // This is where we would check actual outstanding values from a 'Dues' table if it existed.
    // For now, we'll allocate based on the provided amount vs EMI.
    
    if (remaining > 0) {
      // Mock Penalty allocation (if any)
      // allocation.penalty = ...
      
      // Mock Interest allocation (if any)
      // allocation.interest = ...
      
      // Principal
      allocation.principal = remaining
    }

    // Create the transaction using accounting rules
    const transactionType = TransactionType.EMI_PAYMENT_RECEIVED
    const newBalance = calculateNewBalance(lastBalance, transactionType, totalPaid)
    
    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        type: transactionType, // Use standardized type
        amount: totalPaid,
        balance: newBalance,
        description: `Loan Payment: ${description || ''} (Allocated: P:${allocation.principal}, I:${allocation.interest}, Pen:${allocation.penalty})`,
        reference: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        transactionDate: date ? new Date(date) : new Date(),
      }
    })

    return NextResponse.json({
      message: 'Payment recorded successfully',
      allocation,
      transaction
    })
  } catch (error) {
    console.error('Loan payment failed:', error)
    return NextResponse.json({ error: 'Failed to process loan payment' }, { status: 500 })
  }
}
