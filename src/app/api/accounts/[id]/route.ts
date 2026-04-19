import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { principalAmount, interestRate, tenure, startDate, status, calculationMethod } = body

    // Calculate new maturity date based on start date and tenure
    const start = new Date(startDate)
    const maturityDate = new Date(start.getFullYear(), start.getMonth() + tenure, start.getDate())

    // Prepare update data
    const updateData: any = {
      principalAmount,
      interestRate,
      tenure,
      startDate: start,
      maturityDate,
      status,
    }

    // If calculationMethod is provided, update accountRules
    if (calculationMethod) {
      // First check if accountRules exists
      const existingAccount = await prisma.account.findUnique({
        where: { id },
        include: { accountRules: true }
      })

      if (existingAccount?.accountRules) {
        // Update existing accountRules
        await prisma.accountRules.update({
          where: { id: existingAccount.accountRules.id },
          data: { calculationMethod }
        })
      } else {
        // Create new accountRules
        await prisma.accountRules.create({
          data: {
            accountId: id,
            calculationMethod
          }
        })
      }
    }

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        accountRules: true,
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
