import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { suggestionIds, reason } = await request.json()
    
    if (!suggestionIds || !Array.isArray(suggestionIds) || suggestionIds.length === 0) {
      return NextResponse.json(
        { error: 'Valid suggestion IDs are required' },
        { status: 400 }
      )
    }

    const results = []

    for (const suggestionId of suggestionIds) {
      try {
        // Get the suggestion
        const suggestion = await prisma.suggestedEntry.findUnique({
          where: { id: suggestionId }
        })

        if (!suggestion) {
          results.push({ id: suggestionId, error: 'Suggestion not found' })
          continue
        }

        if (suggestion.status !== 'pending') {
          results.push({ id: suggestionId, error: 'Suggestion already processed' })
          continue
        }

        // Mark suggestion as rejected
        await prisma.suggestedEntry.update({
          where: { id: suggestionId },
          data: { 
            status: 'rejected',
            rejectionReason: reason || 'Rejected by user',
            updatedAt: new Date()
          }
        })

        results.push({ id: suggestionId, success: true })
      } catch (error) {
        console.error(`Failed to reject suggestion ${suggestionId}:`, error)
        results.push({ id: suggestionId, error: 'Processing failed' })
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => r.error).length

    return NextResponse.json({
      message: `Processed ${results.length} suggestions: ${successCount} rejected, ${errorCount} failed`,
      results
    })
  } catch (error) {
    console.error('Failed to reject suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to reject suggestions' },
      { status: 500 }
    )
  }
}
