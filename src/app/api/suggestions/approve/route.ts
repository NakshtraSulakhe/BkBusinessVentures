import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { 
  normalizeTransactionType, 
  isCreditTransaction, 
  calculateNewBalance, 
  validateTransaction 
} from "@/lib/accounting-rules"

export async function POST(request: NextRequest) {
  try {
    const { suggestionIds } = await request.json()
    
    if (!suggestionIds || !Array.isArray(suggestionIds) || suggestionIds.length === 0) {
      return NextResponse.json(
        { error: 'Valid suggestion IDs are required' },
        { status: 400 }
      )
    }

    const results = []

    for (const suggestionId of suggestionIds) {
      try {
        // Get the suggestion with account details
        const suggestion = await prisma.suggestedEntry.findUnique({
          where: { id: suggestionId },
          include: {
            account: {
              include: {
                transactions: {
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            }
          }
        })

        if (!suggestion) {
          results.push({ id: suggestionId, error: 'Suggestion not found' })
          continue
        }

        if (suggestion.status !== 'pending') {
          results.push({ id: suggestionId, error: 'Suggestion already processed' })
          continue
        }

        // Calculate new balance using accounting rules
        const lastTransaction = suggestion.account.transactions[0]
        const currentBalance = lastTransaction?.balance || 0
        
        // Normalize transaction type and apply accounting rules
        const normalizedType = normalizeTransactionType(suggestion.type)
        
        // Validate transaction using accounting rules
        const validation = validateTransaction(currentBalance, normalizedType, suggestion.amount, suggestion.account.accountType)
        if (!validation.valid) {
          results.push({ id: suggestionId, error: validation.error })
          continue
        }
        
        // Calculate new balance using standard accounting rules
        const newBalance = calculateNewBalance(currentBalance, normalizedType, suggestion.amount)

        // Create transaction with normalized type
        await prisma.transaction.create({
          data: {
            accountId: suggestion.accountId,
            type: normalizedType, // Use normalized type for consistency
            amount: suggestion.amount,
            balance: newBalance,
            description: suggestion.description,
            reference: `SUG-${suggestion.id}`,
            transactionDate: suggestion.runDate
          }
        })

        // Mark suggestion as approved
        await prisma.suggestedEntry.update({
          where: { id: suggestionId },
          data: { 
            status: 'approved',
            updatedAt: new Date()
          }
        })

        results.push({ id: suggestionId, success: true })
      } catch (error) {
        console.error(`Failed to process suggestion ${suggestionId}:`, error)
        results.push({ id: suggestionId, error: 'Processing failed' })
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => r.error).length

    return NextResponse.json({
      message: `Processed ${results.length} suggestions: ${successCount} approved, ${errorCount} failed`,
      results
    })
  } catch (error) {
    console.error('Failed to approve suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to approve suggestions' },
      { status: 500 }
    )
  }
}
