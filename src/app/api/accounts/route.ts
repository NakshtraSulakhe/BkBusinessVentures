import { NextRequest, NextResponse } from "next/server"
import { AccountNumberGenerator } from "@/lib/account-generator"
import { verifyToken } from "@/lib/auth"

// Force Node.js runtime to avoid Edge runtime issues
export const runtime = "nodejs"

// Authentication middleware for account operations
async function authenticateRequest(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  
  if (!token) {
    return { error: "Authorization required for account operations", status: 401 }
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
    console.error("Account auth error:", error)
    return { error: "Invalid or expired token", status: 401 }
  }
}

export async function GET(request: NextRequest) {
  console.log("🔥 ACCOUNTS GET API CALLED")
  
  // Authenticate for read operations
  const auth = await authenticateRequest(request)
  if (auth.error) {
    console.log("❌ Accounts GET auth failed:", auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (!auth.user) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const accountType = searchParams.get('accountType') || '';
    const customerId = searchParams.get('customerId') || '';

    const skip = (page - 1) * limit;

    const { prisma } = await import("@/lib/database")
    
    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { accountNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (accountType) {
      // Account types in database are stored in lowercase, so convert filter to lowercase
      where.accountType = accountType.toLowerCase()
      console.log(`🔍 Filtering accounts by type: ${accountType} -> ${accountType.toLowerCase()}`)
    }

    if (customerId) {
      where.customerId = customerId
    }

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          _count: {
            select: {
              transactions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.account.count({ where })
    ])

    console.log("✅ Accounts retrieved:", accounts.length)
    console.log("📊 Account types found:", accounts.map((acc: any) => acc.accountType))
    console.log("📋 Account details:", accounts.map((acc: any) => ({ id: acc.id, number: acc.accountNumber, type: acc.accountType, customer: acc.customer.name })))

    return NextResponse.json({
      accounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("💥 Failed to fetch accounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch accounts", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log("🔥 ACCOUNTS POST API CALLED")
  
  // Authenticate for write operations
  const auth = await authenticateRequest(request)
  if (auth.error) {
    console.log("❌ Accounts POST auth failed:", auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  if (!auth.user) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
    console.log("✅ ACCOUNTS BODY RECEIVED:", { 
      customerId: body.customerId, 
      accountType: body.accountType, 
      principalAmount: body.principalAmount 
    })
  } catch (err) {
    console.error("❌ ACCOUNTS JSON parse error:", err)
    return NextResponse.json(
      { error: "Invalid JSON body", details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    )
  }

  const { customerId, accountType, principalAmount, interestRate, tenure } = body

  // Validate required fields
  if (!customerId || !accountType || !principalAmount) {
    console.log("❌ Missing account fields:", { customerId: !!customerId, accountType: !!accountType, principalAmount: !!principalAmount })
    return NextResponse.json(
      { error: "Customer ID, account type, and principal amount are required" },
      { status: 400 }
    )
  }

  // Validate account type
  const validTypes = ['FD', 'RD', 'LOAN']
  if (!validTypes.includes(accountType.toUpperCase())) {
    console.log("❌ Invalid account type:", accountType)
    return NextResponse.json(
      { error: `Account type must be one of: ${validTypes.join(', ')}` },
      { status: 400 }
    )
  }

  // Validate principal amount
  const parsedAmount = parseFloat(principalAmount)
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.log("❌ Invalid principal amount:", principalAmount)
    return NextResponse.json(
      { error: "Principal amount must be a positive number" },
      { status: 400 }
    )
  }

  try {
    const { prisma } = await import("@/lib/database")
    
    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      console.log("❌ Customer not found:", customerId)
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    console.log("✅ Customer found:", customer.name)

    // Generate account number using static method
    const accountNumber = await AccountNumberGenerator.generateAccountNumber(accountType.toUpperCase())

    // Calculate dates
    const startDate = new Date()
    let maturityDate: Date | null = null

    if (accountType.toUpperCase() !== 'LOAN') {
      maturityDate = new Date()
      maturityDate.setMonth(maturityDate.getMonth() + (parseInt(tenure) || 12))
    }

    console.log("💼 Creating account:", { accountNumber, accountType, principalAmount: parsedAmount })

    const account = await prisma.account.create({
      data: {
        accountNumber,
        customerId,
        accountType: accountType.toUpperCase(),
        principalAmount: parsedAmount,
        interestRate: parseFloat(interestRate) || 0,
        tenure: parseInt(tenure) || 12,
        startDate,
        maturityDate,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    console.log("✅ Account created successfully:", account.id)

    return NextResponse.json({
      message: "Account created successfully",
      account
    }, { status: 201 })
  } catch (error) {
    console.error("💥 Failed to create account:", error)
    return NextResponse.json(
      { error: "Failed to create account", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
