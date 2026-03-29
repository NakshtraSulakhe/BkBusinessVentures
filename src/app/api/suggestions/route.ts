import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [suggestions, total] = await Promise.all([
      prisma.suggestedEntry.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.suggestedEntry.count({ where })
    ])

    return NextResponse.json({
      suggestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, type, amount, description, runDate, periodStartDate, periodEndDate } = body
    
    // Validate required fields
    if (!accountId || !type || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: accountId, type, amount' 
      }, { status: 400 })
    }

    // Validate amount
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ 
        error: 'Amount must be a positive number' 
      }, { status: 400 })
    }

    // Validate type
    const validTypes = ['MATURITY', 'INTEREST', 'EMI', 'PENALTY', 'DEPOSIT', 'WITHDRAWAL']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { customer: true }
    })

    if (!account) {
      return NextResponse.json({ 
        error: 'Account not found' 
      }, { status: 404 })
    }

    // Create suggested entry
    const suggestion = await prisma.suggestedEntry.create({
      data: {
        accountId,
        type,
        amount: parsedAmount,
        description: description || null,
        runDate: runDate ? new Date(runDate) : new Date(),
        periodStartDate: periodStartDate ? new Date(periodStartDate) : new Date(),
        periodEndDate: periodEndDate ? new Date(periodEndDate) : new Date(),
        status: 'pending'
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

    return NextResponse.json({ suggestion }, { status: 201 })
  } catch (error) {
    console.error('Failed to create suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to create suggestion' },
      { status: 500 }
    )
  }
}
