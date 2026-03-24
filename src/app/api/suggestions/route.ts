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
    
    // Create suggested entry
    const suggestion = await prisma.suggestedEntry.create({
      data: {
        accountId: body.accountId,
        type: body.type,
        amount: parseFloat(body.amount),
        description: body.description || null,
        runDate: body.runDate ? new Date(body.runDate) : new Date(),
        periodStartDate: body.periodStartDate ? new Date(body.periodStartDate) : new Date(),
        periodEndDate: body.periodEndDate ? new Date(body.periodEndDate) : new Date(),
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
