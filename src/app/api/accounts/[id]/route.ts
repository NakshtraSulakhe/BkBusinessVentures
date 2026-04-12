import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { principalAmount, interestRate, tenure, startDate, status } = body

    // Calculate new maturity date based on start date and tenure
    const start = new Date(startDate)
    const maturityDate = new Date(start.getFullYear(), start.getMonth() + tenure, start.getDate())

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        principalAmount,
        interestRate,
        tenure,
        startDate: start,
        maturityDate,
        status,
      },
      include: {
        customer: true,
      }
    })

    return NextResponse.json({ account: updatedAccount })
  } catch (error) {
    console.error("Failed to update account:", error)
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        customer: true,
        accountRules: true,
        transactions: {
          orderBy: { transactionDate: "desc" },
          take: 10
        }
      }
    })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error("Failed to fetch account:", error)
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    )
  }
}
