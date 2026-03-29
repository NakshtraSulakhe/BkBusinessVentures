import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { reason } = await request.json()
    
    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Check if suggestion exists and is pending
    const suggestion = await prisma.suggestedEntry.findUnique({
      where: { id }
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: 'Suggestion not found' },
        { status: 404 }
      )
    }

    if (suggestion.status !== 'pending') {
      return NextResponse.json(
        { error: 'Suggestion already processed' },
        { status: 400 }
      )
    }

    // Update suggestion as rejected
    const updatedSuggestion = await prisma.suggestedEntry.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date()
      },
      include: {
        account: {
          include: {
            customer: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Suggestion rejected successfully',
      suggestion: updatedSuggestion
    })
  } catch (error) {
    console.error('Failed to reject suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to reject suggestion' },
      { status: 500 }
    )
  }
}
