import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

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
