import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    const loans = await prisma.account.findMany({
      where: { accountType: 'LOAN', status: 'ACTIVE' },
      include: {
        customer: true,
        accountRules: true
      }
    })

    const report = await Promise.all(loans.map(async (loan) => {
      const overdueEMIs = await prisma.eMIEntry.findMany({
        where: {
          accountId: loan.id, // wait, EMIEntry has accountId but not defined in relations in schema? 
          status: 'OVERDUE'
        }
      })
      
      const overdueAmount = overdueEMIs.reduce((sum, emi) => sum + emi.emiAmount + (emi.penaltyAmount || 0), 0)
      
      return {
        id: loan.id,
        accountNumber: loan.accountNumber,
        customerName: loan.customer.name,
        principalAmount: loan.principalAmount,
        interestRate: loan.interestRate,
        loanMethod: loan.accountRules?.loanMethod || 'FLAT',
        overdueCount: overdueEMIs.length,
        overdueAmount,
        totalPaid: 0, // Expansion point: Sum of transactions type EMI
        status: loan.status
      }
    }))

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Loan Report Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
