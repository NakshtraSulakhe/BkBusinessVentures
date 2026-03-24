import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json()
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Valid suggestion IDs are required' },
        { status: 400 }
      )
    }

    const results = []

    for (const suggestionId of ids) {
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

        // Calculate new balance
        const lastTransaction = suggestion.account.transactions[0]
        const currentBalance = lastTransaction?.balance || 0
        
        let newBalance = currentBalance
        if (suggestion.type === 'interest' || suggestion.type === 'deposit') {
          newBalance = currentBalance + suggestion.amount
        } else if (suggestion.type === 'emi' || suggestion.type === 'withdrawal') {
          newBalance = currentBalance - suggestion.amount
          
          // Check for insufficient funds
          if (newBalance < 0) {
            results.push({ id: suggestionId, error: 'Insufficient funds' })
            continue
          }
        }

        // Create transaction
        await prisma.transaction.create({
          data: {
            accountId: suggestion.accountId,
            type: suggestion.type,
            amount: suggestion.amount,
            balance: newBalance,
            description: suggestion.description,
            reference: `SUG-${suggestion.id}`
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
