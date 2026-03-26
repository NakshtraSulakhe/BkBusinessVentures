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

    const ids = id.includes(',') ? id.split(',') : [id]

    // Update suggestion as rejected
    const updateResult = await prisma.suggestedEntry.updateMany({
      where: { 
        id: { in: ids },
        status: 'pending'
      },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: `${updateResult.count} suggestions rejected successfully`,
      count: updateResult.count
    })
  } catch (error) {
    console.error('Failed to reject suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to reject suggestion' },
      { status: 500 }
    )
  }
}
