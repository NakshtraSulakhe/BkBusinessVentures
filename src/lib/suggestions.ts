import { prisma } from "@/lib/database"

export interface SuggestionParams {
  month: number
  year: number
  accountId?: string
  startDate?: Date
  endDate?: Date
}

export async function runMonthlySuggestions(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // Last day of month
  
  const activeAccounts = await prisma.account.findMany({
    where: { status: 'ACTIVE' },
    include: { accountRules: true }
  })
  
  const suggestions = []
  
  for (const account of activeAccounts) {
    // FD Interest
    if (account.accountType === 'FD' && account.accountRules?.interestMode === 'monthly') {
      const interestAmount = (account.principalAmount * account.interestRate) / (12 * 100)
      const isReinvest = account.accountRules?.payoutMode !== 'paid-out'
      const type = isReinvest ? 'INTEREST' : 'INTEREST_PAYOUT'
      
      const existing = await prisma.suggestedEntry.findFirst({
        where: {
          accountId: account.id,
          type: type,
          periodStartDate: { gte: startDate },
          periodEndDate: { lte: endDate }
        }
      })
      
      if (!existing) {
        suggestions.push({
          accountId: account.id,
          type: type,
          amount: parseFloat(interestAmount.toFixed(2)),
          description: `Monthly interest (${isReinvest ? 'Reinvested' : 'Paid Out'}) for ${startDate.toLocaleString('default', { month: 'long' })} ${year}`,
          runDate: new Date(),
          periodStartDate: startDate,
          periodEndDate: endDate,
          status: 'pending'
        })
      }
    }
    
    // Loan EMI
    // Loan EMI and Penalty
    if (account.accountType === 'LOAN') {
      const emiAmount = account.accountRules?.emiAmount || 0
      if (emiAmount > 0) {
        // Suggest regular EMI
        const existingEMI = await prisma.suggestedEntry.findFirst({
          where: {
            accountId: account.id,
            type: 'EMI_DUE',
            periodStartDate: { gte: startDate },
            periodEndDate: { lte: endDate }
          }
        })
        
        if (!existingEMI) {
          suggestions.push({
            accountId: account.id,
            type: 'EMI_DUE',
            amount: emiAmount,
            description: `EMI for ${startDate.toLocaleString('default', { month: 'long' })} ${year}`,
            runDate: new Date(),
            periodStartDate: startDate,
            periodEndDate: endDate,
            status: 'pending'
          })
        }

        // Check for missed EMI from previous month
        const prevMonthStart = new Date(year, month - 2, 1)
        const prevMonthEnd = new Date(year, month - 1, 0)
        
        const missedEMI = await prisma.suggestedEntry.findFirst({
          where: {
            accountId: account.id,
            type: 'EMI_DUE',
            periodStartDate: { gte: prevMonthStart },
            periodEndDate: { lte: prevMonthEnd },
            status: { not: 'approved' }
          }
        })

        if (missedEMI) {
          const penaltyAmount = (emiAmount * 1) / 100 // 1% Penalty
          const existingPenalty = await prisma.suggestedEntry.findFirst({
            where: {
              accountId: account.id,
              type: 'PENALTY',
              periodStartDate: { gte: startDate },
              periodEndDate: { lte: endDate }
            }
          })

          if (!existingPenalty) {
            suggestions.push({
              accountId: account.id,
              type: 'PENALTY',
              amount: parseFloat(penaltyAmount.toFixed(2)),
              description: `Penalty for missed EMI of ${prevMonthStart.toLocaleString('default', { month: 'long' })}`,
              runDate: new Date(),
              periodStartDate: startDate,
              periodEndDate: endDate,
              status: 'pending'
            })
          }
        }
      }
    }
  }
  
  if (suggestions.length > 0) {
    await prisma.suggestedEntry.createMany({
      data: suggestions
    })
  }
  
  return suggestions.length
}

export async function runAccountSuggestions(accountId: string, startDate: Date, endDate: Date) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { accountRules: true }
  })
  
  if (!account) throw new Error('Account not found')
  
  const suggestions = []
  
  // Normalize dates to month boundaries for periodic suggestions
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const last = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
  
  while (current <= last) {
    const monthStart = new Date(current)
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
    
    // FD Interest
    if (account.accountType === 'FD') {
      const interestMode = account.accountRules?.interestMode || 'maturity'
      
      if (interestMode === 'monthly') {
        const interestAmount = (account.principalAmount * account.interestRate) / (12 * 100)
        const isReinvest = account.accountRules?.payoutMode !== 'paid-out'
        const type = isReinvest ? 'INTEREST' : 'INTEREST_PAYOUT'
        
        const existing = await prisma.suggestedEntry.findFirst({
          where: {
            accountId: account.id,
            type: type,
            periodStartDate: { gte: monthStart },
            periodEndDate: { lte: monthEnd }
          }
        })
        
        if (!existing) {
          suggestions.push({
            accountId: account.id,
            type: type,
            amount: parseFloat(interestAmount.toFixed(2)),
            description: `Monthly interest (${isReinvest ? 'Reinvested' : 'Paid Out'}) for ${monthStart.toLocaleString('default', { month: 'long' })} ${monthStart.getFullYear()}`,
            runDate: new Date(),
            periodStartDate: monthStart,
            periodEndDate: monthEnd,
            status: 'pending'
          })
        }
      }
    }
    
    // Loan EMI
    if (account.accountType === 'LOAN') {
      const emiAmount = account.accountRules?.emiAmount || 0
      if (emiAmount > 0) {
        const existing = await prisma.suggestedEntry.findFirst({
          where: {
            accountId: account.id,
            type: 'EMI_DUE',
            periodStartDate: { gte: monthStart },
            periodEndDate: { lte: monthEnd }
          }
        })
        
        if (!existing) {
          suggestions.push({
            accountId: account.id,
            type: 'EMI_DUE',
            amount: emiAmount,
            description: `EMI for ${monthStart.toLocaleString('default', { month: 'long' })} ${monthStart.getFullYear()}`,
            runDate: new Date(),
            periodStartDate: monthStart,
            periodEndDate: monthEnd,
            status: 'pending'
          })
        }
      }
    }
    
    current.setMonth(current.getMonth() + 1)
  }

  // Final Maturity Payout for FD/RD if maturity date is in range
  if ((account.accountType === 'FD' || account.accountType === 'RD') && account.maturityDate) {
    const maturityDate = new Date(account.maturityDate)
    if (maturityDate >= startDate && maturityDate <= endDate) {
      const existingMaturity = await prisma.suggestedEntry.findFirst({
        where: {
          accountId: account.id,
          type: 'MATURITY_PAYOUT'
        }
      })

      if (!existingMaturity) {
        // Calculate total maturity for maturity-only accounts
        // or just the final principal + last interest for monthly accounts
        const isMaturityOnly = account.accountRules?.interestMode === 'maturity'
        let amount = account.principalAmount
        
        if (isMaturityOnly) {
          const interest = (account.principalAmount * account.interestRate * account.tenure) / (12 * 100)
          amount += interest
        }

        suggestions.push({
          accountId: account.id,
          type: 'MATURITY_PAYOUT',
          amount: parseFloat(amount.toFixed(2)),
          description: `Account Maturity Payout for ${account.accountNumber}`,
          runDate: maturityDate,
          periodStartDate: maturityDate,
          periodEndDate: maturityDate,
          status: 'pending'
        })
      }
    }
  }
  
  if (suggestions.length > 0) {
    await prisma.suggestedEntry.createMany({
      data: suggestions
    })
  }
  
  return suggestions.length
}
