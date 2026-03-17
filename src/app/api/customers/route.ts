import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { accountType: { contains: search, mode: 'insensitive' as const } }
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
    });

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
    console.error('Failed to fetch customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'accountType'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(body.phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Phone must be 10 digits' },
        { status: 400 }
      );
    }

    // Validate PAN format if provided
    if (body.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(body.panNumber.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid PAN format (e.g., ABCDE1234F)' },
        { status: 400 }
      );
    }

    // Validate Aadhaar format if provided
    if (body.aadhaarNumber && !/^[0-9]{12}$/.test(body.aadhaarNumber.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Aadhaar must be 12 digits' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: body.email }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 400 }
      );
    }

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
        accountType: body.accountType,
        purpose: body.purpose || null,
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
