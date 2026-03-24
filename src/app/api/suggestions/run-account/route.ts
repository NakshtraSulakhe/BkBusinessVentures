import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { accountId, startDate, endDate } = await request.json()
    
    // Validate inputs
    if (!accountId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Account ID, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Get account with rules
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        accountRules: true,
        customer: true,
        suggestedEntries: {
          where: {
            runDate: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        }
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    const suggestions = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Generate suggestions based on account type
    if (account.accountType === 'fd' || account.accountType === 'rd') {
      const rules = account.accountRules
      const interestMode = rules?.interestMode || 'maturity'
      
      if (interestMode === 'monthly') {
        // Generate monthly interest suggestions
        const monthlyRate = account.interestRate / 12 / 100
        const monthlyInterest = account.principalAmount * monthlyRate
        
        let currentDate = new Date(start)
        currentDate.setDate(1) // Set to first day of month
        
        while (currentDate <= end) {
          // Skip if already exists
          const existing = account.suggestedEntries.find(s => 
            new Date(s.runDate).getMonth() === currentDate.getMonth() &&
            new Date(s.runDate).getFullYear() === currentDate.getFullYear()
          )
          
          if (!existing) {
            const suggestion = await prisma.suggestedEntry.create({
              data: {
                accountId: account.id,
                type: 'interest',
                amount: monthlyInterest,
                description: `Monthly interest for ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                runDate: new Date(currentDate),
                periodStartDate: new Date(currentDate),
                periodEndDate: new Date(currentDate)
              }
            })
            
            suggestions.push(suggestion)
          }
          
          currentDate.setMonth(currentDate.getMonth() + 1)
        }
      } else {
        // Single maturity interest suggestion
        const totalInterest = account.principalAmount * (account.interestRate / 100) * (account.tenure / 12)
        
        const suggestion = await prisma.suggestedEntry.create({
          data: {
            accountId: account.id,
            type: 'interest',
            amount: totalInterest,
            description: `Maturity interest for ${account.accountNumber}`,
            runDate: account.maturityDate || end,
            periodStartDate: new Date(account.maturityDate || end),
            periodEndDate: new Date(account.maturityDate || end)
          }
        })
        
        suggestions.push(suggestion)
      }
    } else if (account.accountType === 'loan') {
      const rules = account.accountRules
      const emiDueDay = rules?.emiDueDay || 1
      const emiAmount = rules?.emiAmount
      
      if (emiAmount) {
        // Generate EMI suggestions for each month in the range
        let currentDate = new Date(start)
        currentDate.setDate(emiDueDay)
        
        while (currentDate <= end) {
          // Skip if already exists
          const existing = account.suggestedEntries.find(s => 
            new Date(s.runDate).getMonth() === currentDate.getMonth() &&
            new Date(s.runDate).getFullYear() === currentDate.getFullYear()
          )
          
          if (!existing) {
            const suggestion = await prisma.suggestedEntry.create({
              data: {
                accountId: account.id,
                type: 'emi',
                amount: emiAmount,
                description: `EMI payment for ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                runDate: new Date(currentDate),
                periodStartDate: new Date(currentDate),
                periodEndDate: new Date(currentDate)
              }
            })
            
            suggestions.push(suggestion)
          }
          
          currentDate.setMonth(currentDate.getMonth() + 1)
        }
      }
    }

    return NextResponse.json({
      message: `Generated ${suggestions.length} suggestions for account ${account.accountNumber}`,
      suggestions
    })
  } catch (error) {
    console.error('Failed to run account suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to run account suggestions' },
      { status: 500 }
    )
  }
}
