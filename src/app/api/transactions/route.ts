import { NextRequest, NextResponse } from "next/server"
import { generateFormattedNumber } from "@/lib/numbering"
import { verifyToken } from "@/lib/auth"
import { 
  normalizeTransactionType, 
  isCreditTransaction, 
  calculateNewBalance, 
  validateTransaction,
  TransactionType 
} from "@/lib/accounting-rules"

// Force Node.js runtime to avoid Edge runtime issues
export const runtime = "nodejs"

// Authentication middleware for financial operations
async function authenticateRequest(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  
  if (!token) {
    return { error: "Authorization required for financial operations", status: 401 }
  }

  try {
    const decoded = verifyToken(token)
    const { prisma } = await import("@/lib/database")
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.isActive) {
      return { error: "Invalid or inactive user", status: 403 }
    }

    return { user }
  } catch (error) {
    console.error("Transaction auth error:", error)
    return { error: "Invalid or expired token", status: 401 }
  }
}

export async function POST(request: NextRequest) {
  console.log("🔥 TRANSACTION API CALLED - FINANCIAL OPERATION")
  
  // Authenticate first
  const auth = await authenticateRequest(request)
  if (auth.error) {
    console.log("❌ Transaction auth failed:", auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (!auth.user) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }

  console.log("✅ Transaction authenticated for user:", auth.user.email)

  let body
  try {
    body = await request.json()
    console.log("✅ TRANSACTION BODY RECEIVED:", { 
      accountId: body.accountId, 
      type: body.type, 
      amount: body.amount,
      user: auth.user.email 
    })
  } catch (err) {
    console.error("❌ TRANSACTION JSON parse error:", err)
    return NextResponse.json(
      { error: "Invalid JSON body", details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    )
  }

  const { accountId, type, amount, description, reference: providedReference, date, paymentMethod } = body
  
  // Validate required fields
  if (!accountId || !type || !amount) {
    console.log("❌ Missing transaction fields:", { accountId: !!accountId, type: !!type, amount: !!amount })
    return NextResponse.json(
      { error: 'Account ID, type, and amount are required' },
      { status: 400 }
    )
  }

  // Validate amount
  const parsedAmount = parseFloat(amount)
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.log("❌ Invalid amount:", amount)
    return NextResponse.json(
      { error: 'Amount must be a positive number' },
      { status: 400 }
    )
  }

  // Generate reference
  let reference = providedReference
  if (!reference) {
    try {
      reference = await generateFormattedNumber('RECEIPT')
    } catch (e) {
      reference = `REC-${Date.now().toString().slice(-6)}`
    }
  }

  try {
    const { prisma } = await import("@/lib/database")
    
    // Verify account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { customer: true }
    })

    if (!account) {
      console.log("❌ Account not found:", accountId)
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    console.log("✅ Account found:", account.accountNumber)
    
    // Get the last transaction to calculate the new balance
    const lastTransaction = await prisma.transaction.findFirst({
      where: { accountId },
      orderBy: { createdAt: 'desc' }
    })

    const prevBalance = lastTransaction?.balance || 0
    
    // Normalize transaction type to standard accounting format
    const normalizedType = normalizeTransactionType(type)
    console.log("📋 Normalized transaction type:", type, "→", normalizedType)
    
    // Validate transaction using standard accounting rules
    const validation = validateTransaction(prevBalance, normalizedType, parsedAmount, account.accountType)
    if (!validation.valid) {
      console.log("❌ Transaction validation failed:", validation.error)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    // Calculate new balance using standard accounting rules
    const newBalance = calculateNewBalance(prevBalance, normalizedType, parsedAmount)
    
    console.log("💰 Creating transaction with accounting rules:", { 
      originalType: type, 
      normalizedType, 
      amount: parsedAmount, 
      prevBalance, 
      newBalance,
      isCredit: isCreditTransaction(normalizedType)
    })

    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        type: normalizedType, // Store normalized type for consistency
        amount: parsedAmount,
        balance: newBalance,
        description: paymentMethod ? `${description} [${paymentMethod.toUpperCase()}]` : description,
        reference,
        transactionDate: date ? new Date(date) : new Date(),
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

    console.log("✅ Transaction created successfully:", transaction.id)
    
    return NextResponse.json({ 
      message: 'Transaction created successfully',
      transaction 
    })
  } catch (error) {
    console.error("💥 Transaction creation failed:", error)
    return NextResponse.json(
      { error: "Failed to create transaction", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  console.log("🔥 TRANSACTIONS GET API CALLED")
  
  // Authenticate for read operations
  const auth = await authenticateRequest(request)
  if (auth.error) {
    console.log("❌ Transactions GET auth failed:", auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (!auth.user) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const accountId = searchParams.get('accountId') || ''
    const type = searchParams.get('type') || ''
    const date = searchParams.get('date') || ''
    const accountType = searchParams.get('accountType') || ''

    const skip = (page - 1) * limit

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

    if (accountType) {
      where.account = {
        accountType: accountType.toUpperCase()
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

    console.log("✅ Transactions retrieved:", transactions.length)

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("💥 Failed to fetch transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
