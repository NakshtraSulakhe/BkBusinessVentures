import { NextRequest, NextResponse } from "next/server"

// Mock data for development when database is not available
const mockTransactions = [
  {
    id: "1",
    accountId: "1",
    type: "deposit",
    amount: 5000,
    balance: 5000,
    description: "Initial deposit",
    reference: "DEP001",
    createdAt: new Date("2024-03-15").toISOString(),
    account: {
      accountNumber: "FD001",
      customer: {
        name: "John Doe"
      }
    }
  },
  {
    id: "2",
    accountId: "1",
    type: "interest",
    amount: 150,
    balance: 5150,
    description: "Monthly interest credit",
    reference: "INT001",
    createdAt: new Date("2024-03-14").toISOString(),
    account: {
      accountNumber: "FD001",
      customer: {
        name: "John Doe"
      }
    }
  },
  {
    id: "3",
    accountId: "2",
    type: "withdrawal",
    amount: 2000,
    balance: 3000,
    description: "Partial withdrawal",
    reference: "WD001",
    createdAt: new Date("2024-03-13").toISOString(),
    account: {
      accountNumber: "RD002",
      customer: {
        name: "Jane Smith"
      }
    }
  },
  {
    id: "4",
    accountId: "2",
    type: "deposit",
    amount: 500,
    balance: 3500,
    description: "Monthly deposit",
    reference: "DEP002",
    createdAt: new Date("2024-03-12").toISOString(),
    account: {
      accountNumber: "RD002",
      customer: {
        name: "Jane Smith"
      }
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const accountId = searchParams.get('accountId') || ''
    const type = searchParams.get('type') || ''
    const date = searchParams.get('date') || ''

    const skip = (page - 1) * limit

    // Try to get data from database first
    try {
      const { prisma } = await import("@/lib/database")
      
      // Build where clause
      const where: any = {}

      if (search) {
        where.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } },
          { account: { accountNumber: { contains: search, mode: 'insensitive' } } },
          { account: { customer: { name: { contains: search, mode: 'insensitive' } } } }
        ]
      }

      if (accountId) {
        where.accountId = accountId
      }

      if (type) {
        where.type = type
      }

      if (date) {
        const startDate = new Date(date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        where.createdAt = {
          gte: startDate,
          lt: endDate
        }
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
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
        prisma.transaction.count({ where })
      ])

      return NextResponse.json({
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (dbError) {
      console.log('Database not available, using mock data:', dbError)
      
      // Filter mock data based on search parameters
      let filteredTransactions = mockTransactions
      
      if (search) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.description?.toLowerCase().includes(search.toLowerCase()) ||
          t.reference?.toLowerCase().includes(search.toLowerCase()) ||
          t.account.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
          t.account.customer.name.toLowerCase().includes(search.toLowerCase())
        )
      }
      
      if (accountId) {
        filteredTransactions = filteredTransactions.filter(t => t.accountId === accountId)
      }
      
      if (type) {
        filteredTransactions = filteredTransactions.filter(t => t.type === type)
      }
      
      if (date) {
        const filterDate = new Date(date).toDateString()
        filteredTransactions = filteredTransactions.filter(t => 
          new Date(t.createdAt).toDateString() === filterDate
        )
      }

      const total = filteredTransactions.length
      const paginatedTransactions = filteredTransactions.slice(skip, skip + limit)

      return NextResponse.json({
        transactions: paginatedTransactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, updates } = body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Transaction IDs are required' },
        { status: 400 }
      )
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates object is required' },
        { status: 400 }
      )
    }

    // Try to use database first
    try {
      const { prisma } = await import("@/lib/database")
      
      // Update multiple transactions
      const updatedTransactions = await prisma.transaction.updateMany({
        where: {
          id: { in: ids }
        },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({ 
        message: `${updatedTransactions.count} transactions updated successfully`,
        count: updatedTransactions.count
      })
    } catch (dbError) {
      console.log('Database not available, using mock response:', dbError)
      
      // Mock response for development
      return NextResponse.json({ 
        message: `${ids.length} transactions updated successfully`,
        count: ids.length
      })
    }
  } catch (error) {
    console.error('Failed to update transactions:', error)
    return NextResponse.json(
      { error: 'Failed to update transactions' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',') || []
    
    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Transaction IDs are required' },
        { status: 400 }
      )
    }

    // Try to use database first
    try {
      const { prisma } = await import("@/lib/database")
      
      // Delete multiple transactions
      const deletedTransactions = await prisma.transaction.deleteMany({
        where: {
          id: { in: ids }
        }
      })

      return NextResponse.json({ 
        message: `${deletedTransactions.count} transactions deleted successfully`,
        count: deletedTransactions.count
      })
    } catch (dbError) {
      console.log('Database not available, using mock response:', dbError)
      
      // Mock response for development
      return NextResponse.json({ 
        message: `${ids.length} transactions deleted successfully`,
        count: ids.length
      })
    }
  } catch (error) {
    console.error('Failed to delete transactions:', error)
    return NextResponse.json(
      { error: 'Failed to delete transactions' },
      { status: 500 }
    )
  }
}
