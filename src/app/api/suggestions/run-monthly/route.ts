import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { month, year } = await request.json()
    
    // Validate month and year
    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      )
    }

    // Get all active FD and RD accounts
    const accounts = await prisma.account.findMany({
      where: {
        accountType: { in: ['fd', 'rd'] },
        startDate: { lte: new Date(year, month - 1, 1) }
      },
      include: {
        accountRules: true,
        customer: true,
        suggestedEntries: {
          where: {
            runDate: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1)
            }
          }
        }
      }
    })

    const suggestions = []

    for (const account of accounts) {
      // Skip if already processed for this month
      if (account.suggestedEntries.length > 0) {
        continue
      }

      // Calculate interest based on account rules
      const rules = account.accountRules
      const interestMode = rules?.interestMode || 'maturity'
      
      if (interestMode === 'monthly') {
        // Calculate monthly interest
        const monthlyRate = account.interestRate / 12 / 100
        const monthlyInterest = account.principalAmount * monthlyRate
        
        // Create suggestion
        const suggestion = await prisma.suggestedEntry.create({
          data: {
            accountId: account.id,
            type: 'interest',
            amount: monthlyInterest,
            description: `Monthly interest for ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
            runDate: new Date(year, month - 1, 1),
            periodStartDate: new Date(year, month - 1, 1),
            periodEndDate: new Date(year, month - 1, 1)
          }
        })
        
        suggestions.push(suggestion)
      }
    }

    // Check for loan EMIs
    const loanAccounts = await prisma.account.findMany({
      where: {
        accountType: 'loan',
        startDate: { lte: new Date(year, month - 1, 1) }
      },
      include: {
        accountRules: true,
        suggestedEntries: {
          where: {
            runDate: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1)
            }
          }
        }
      }
    })

    for (const account of loanAccounts) {
      // Skip if already processed for this month
      if (account.suggestedEntries.length > 0) {
        continue
      }

      const rules = account.accountRules
      const emiDueDay = rules?.emiDueDay || 1
      const emiAmount = rules?.emiAmount

      if (emiAmount) {
        // Create EMI suggestion
        const suggestion = await prisma.suggestedEntry.create({
          data: {
            accountId: account.id,
            type: 'emi',
            amount: emiAmount,
            description: `EMI payment for ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
            runDate: new Date(year, month - 1, emiDueDay),
            periodStartDate: new Date(year, month - 1, emiDueDay),
            periodEndDate: new Date(year, month - 1, emiDueDay)
          }
        })
        
        suggestions.push(suggestion)
      }
    }

    return NextResponse.json({
      message: `Generated ${suggestions.length} suggestions for ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      suggestions
    })
  } catch (error) {
    console.error('Failed to run monthly suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to run monthly suggestions' },
      { status: 500 }
    )
  }
}
