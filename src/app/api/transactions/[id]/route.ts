import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { account: true }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        account: {
          include: {
            customer: true
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Failed to fetch transaction:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 })
  }
}
