import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        accounts: {
          select: {
            id: true,
            accountType: true,
            principalAmount: true,
            status: true,
            _count: {
              select: { transactions: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const report = customers.map(customer => {
      const activeStats = customer.accounts.reduce((acc, curr) => {
        if (curr.status === 'ACTIVE') {
          acc.totalPrincipal += curr.principalAmount
          acc.activeCount += 1
          if (curr.accountType === 'FD') acc.fdCount += 1
          if (curr.accountType === 'RD') acc.rdCount += 1
          if (curr.accountType === 'LOAN') acc.loanCount += 1
        }
        return acc
      }, { totalPrincipal: 0, activeCount: 0, fdCount: 0, rdCount: 0, loanCount: 0 })

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        ...activeStats
      }
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Failed to generate customer report:', error)
    return NextResponse.json(
      { error: 'Failed to generate customer report' },
      { status: 500 }
    )
  }
}
