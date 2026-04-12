import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

// Force Node.js runtime to avoid Edge runtime issues
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// Authentication middleware for customer operations (PII data)
async function authenticateRequest(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  
  if (!token) {
    return { error: "Authorization required for customer operations", status: 401 }
  }

  try {
    const decoded = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.isActive) {
      return { error: "Invalid or inactive user", status: 403 }
    }

    return { user }
  } catch (error) {
    console.error("Customer auth error:", error)
    return { error: "Invalid or expired token", status: 401 }
  }
}

export async function GET(request: NextRequest) {
  console.log("🔥 CUSTOMERS GET API CALLED - PII DATA ACCESS")
  
  // Authenticate for PII data access
  const auth = await authenticateRequest(request)
  if (auth.error) {
    console.log("❌ Customers GET auth failed:", auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    console.log("🔍 Customer search:", { search, page, limit, user: auth.user?.email })

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    // Get total count for pagination
    const total = await prisma.customer.count({ where });

    // Apply pagination and search
    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        panNumber: true,
        aadhaarNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            accounts: true
          }
        }
      }
    });

    console.log("✅ Customers retrieved:", customers.length)

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(" Failed to fetch customers:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log(" CUSTOMERS POST API CALLED - CREATING PII DATA")
  
  // Authenticate for PII data creation
  const auth = await authenticateRequest(request)
  if (auth.error) {
    console.log(" Customers POST auth failed:", auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body
  try {
    // Clone request for safer body parsing in production
    const clonedRequest = request.clone()
    body = await clonedRequest.json()
    console.log("✅ CUSTOMERS BODY RECEIVED:", { 
      name: body.name, 
      email: body.email, 
      phone: body.phone,
      user: auth.user?.email 
    })
  } catch (err) {
    console.error("❌ CUSTOMERS JSON parse error:", err)
    // Try reading raw body for debugging
    try {
      const text = await request.text()
      console.error("❌ Raw body text:", text)
    } catch {}
    return NextResponse.json(
      { error: "Invalid request body", details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    )
  }
  
  // Validate required fields (address fields are now optional)
  const requiredFields = ['name', 'email', 'phone'];
  for (const field of requiredFields) {
    if (!body[field]) {
      console.log("❌ Missing required field:", field)
      return NextResponse.json(
        { error: `${field} is required` },
        { status: 400 }
      );
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    console.log("❌ Invalid email format:", body.email)
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    );
  }

  // Validate phone format (10 digits)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(body.phone.replace(/\D/g, ''))) {
    console.log("❌ Invalid phone format:", body.phone)
    return NextResponse.json(
      { error: 'Phone must be 10 digits' },
      { status: 400 }
    );
  }

  // Validate PAN format if provided
  if (body.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(body.panNumber.toUpperCase())) {
    console.log("❌ Invalid PAN format:", body.panNumber)
    return NextResponse.json(
      { error: 'Invalid PAN format (e.g., ABCDE1234F)' },
      { status: 400 }
    );
  }

  // Validate Aadhaar format if provided
  if (body.aadhaarNumber && !/^[0-9]{12}$/.test(body.aadhaarNumber.replace(/\D/g, ''))) {
    console.log("❌ Invalid Aadhaar format:", body.aadhaarNumber)
    return NextResponse.json(
      { error: 'Aadhaar must be 12 digits' },
      { status: 400 }
    );
  }

  try {
    console.log("🔍 Checking for existing customer with email:", body.email)
    
    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: body.email }
    });

    if (existingCustomer) {
      console.log("❌ Customer email already exists:", body.email)
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      );
    }

    console.log("👤 Creating customer in database:", { name: body.name, email: body.email })
    console.log("📦 Full customer data:", JSON.stringify(body, null, 2))

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        panNumber: body.panNumber || null,
        aadhaarNumber: body.aadhaarNumber || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        occupation: body.occupation || null,
        annualIncome: body.annualIncome ? parseFloat(body.annualIncome) : null,
        accountType: body.accountType || 'GENERAL',
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        panNumber: true,
        aadhaarNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log("✅ Customer created successfully:", customer.id)

    return NextResponse.json({ 
      message: "Customer created successfully",
      customer 
    }, { status: 201 });
  } catch (error) {
    console.error("💥 Failed to create customer:", error)
    return NextResponse.json(
      { error: "Failed to create customer", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
