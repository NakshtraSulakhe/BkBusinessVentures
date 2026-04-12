import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    // 1. Basic Counts
    const activeAccounts = await prisma.account.count({
      where: { status: 'ACTIVE' }
    })

    const fdCount = await prisma.account.count({
      where: { accountType: 'FD', status: 'ACTIVE' }
    })

    const rdCount = await prisma.account.count({
      where: { accountType: 'RD', status: 'ACTIVE' }
    })

    const loanCount = await prisma.account.count({
      where: { accountType: 'LOAN', status: 'ACTIVE' }
    })

    // 2. Financial Aggregates
    const fdPrincipal = await prisma.account.aggregate({
      where: { accountType: 'FD', status: 'ACTIVE' },
      _sum: { principalAmount: true }
    })

    const rdPrincipal = await prisma.account.aggregate({
      where: { accountType: 'RD', status: 'ACTIVE' },
      _sum: { principalAmount: true }
    })

    const loanPrincipal = await prisma.account.aggregate({
      where: { accountType: 'LOAN', status: 'ACTIVE' },
      _sum: { principalAmount: true }
    })

    // 3. Suggestions Stats
    const pendingSuggestions = await prisma.suggestedEntry.count({
      where: { status: 'pending' }
    })

    const rejectedSuggestions = await prisma.suggestedEntry.count({
      where: { status: 'rejected' }
    })

    // 4. Loan Specifics (EMI)
    const overdueEMI = await prisma.eMIEntry.count({
      where: { status: 'OVERDUE' }
    })

    const dueTodayEMI = await prisma.eMIEntry.count({
      where: {
        status: 'DUE',
        dueDate: {
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    // 5. Recent Transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { transactionDate: 'desc' },
      include: {
        account: {
           include: { customer: true }
        }
      }
    })

    return NextResponse.json({
      summary: {
        totalBalance: (fdPrincipal._sum.principalAmount || 0) + (rdPrincipal._sum.principalAmount || 0),
        loanOutstanding: loanPrincipal._sum.principalAmount || 0,
        depositsCount: fdCount + rdCount,
        loanCount: loanCount,
        pendingSuggestions,
        rejectedSuggestions,
        overdueEMI,
        dueTodayEMI
      },
      recentTransactions: recentTransactions.map(t => {
        // Determine if transaction is credit (money coming in) or debit (money going out)
        const typeStr = (t.type || '').toUpperCase()
        const descStr = (t.description || '').toUpperCase()
        
        // Credit = money coming IN to the business (deposits, payments received)
        const creditTypes = ['INTEREST', 'INSTALLMENT', 'DEPOSIT', 'EMI', 'PAYMENT', 'LOAN_RECEIPT', 'EMI_PAYMENT', 'REPAYMENT']
        const isCredit = creditTypes.some(ct => typeStr.includes(ct) || descStr.includes(ct))
        
        // Format date consistently to avoid hydration issues
        const d = new Date(t.transactionDate)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const formattedDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
        
        return {
          id: t.id,
          item: t.description || t.type,
          amount: t.amount || 0,
          type: isCredit ? 'credit' : 'debit',
          date: formattedDate,
          customer: t.account?.customer?.name || 'Unknown'
        }
      })
    })
  } catch (error) {
    console.error('Dashboard Stats Error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
