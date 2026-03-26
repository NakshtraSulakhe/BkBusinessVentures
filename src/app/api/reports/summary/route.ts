import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const [
      customersCount,
      activeAccountsCount,
      fdSummary,
      rdSummary,
      loanSummary,
      pendingEMIs,
      suggestionsCount
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.account.count({ where: { status: 'ACTIVE' } }),
      prisma.account.aggregate({
        where: { accountType: 'FD', status: 'ACTIVE' },
        _sum: { principalAmount: true }
      }),
      prisma.account.aggregate({
        where: { accountType: 'RD', status: 'ACTIVE' },
        _sum: { principalAmount: true }
      }),
      prisma.transaction.aggregate({
        where: { account: { accountType: 'LOAN' } },
        _sum: { amount: true } // Net amount for loans
      }),
      prisma.suggestedEntry.aggregate({
        where: { status: 'pending', type: 'EMI_DUE' },
        _sum: { amount: true }
      }),
      prisma.suggestedEntry.count({
        where: { status: 'pending' }
      })
    ])

    return NextResponse.json({
      customers: customersCount,
      activeAccounts: activeAccountsCount,
      totalFDPrincipal: fdSummary._sum.principalAmount || 0,
      totalRDPrincipal: rdSummary._sum.principalAmount || 0,
      totalLoanOutstanding: loanSummary._sum.amount || 0,
      pendingEMIAmount: pendingEMIs._sum.amount || 0,
      unprocessedSuggestions: suggestionsCount
    })
  } catch (error) {
    console.error('Failed to generate report summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate report summary' },
      { status: 500 }
    )
  }
}
