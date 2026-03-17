import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== API Route: GET /api/customers/[id] ===')
  
  try {
    const { id } = await params
    console.log('Request URL:', request.url)
    console.log('Customer ID:', id)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    console.log('Timestamp:', new Date().toISOString())
    
    console.log('Querying database for customer...')
    const customer = await prisma.customer.findUnique({
      where: { id }
    });
    
    console.log('Database query result:', customer ? 'Customer found' : 'Customer not found')

    if (!customer) {
      console.log('Returning 404 - Customer not found')
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    console.log('Returning 200 - Customer data')
    return NextResponse.json({ customer });
  } catch (error) {
    console.error('=== API Route Error ===')
    console.error('Failed to fetch customer:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json();
    
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it already exists
    if (body.email && body.email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email: body.email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'A customer with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Validate phone format if provided
    if (body.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(body.phone.replace(/\D/g, ''))) {
        return NextResponse.json(
          { error: 'Phone must be 10 digits' },
          { status: 400 }
        );
      }
    }

    // Validate PAN format if provided
    if (body.panNumber) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(body.panNumber.toUpperCase())) {
        return NextResponse.json(
          { error: 'Invalid PAN format (e.g., ABCDE1234F)' },
          { status: 400 }
        );
      }
    }

    // Validate Aadhaar format if provided
    if (body.aadhaarNumber) {
      if (!/^[0-9]{12}$/.test(body.aadhaarNumber.replace(/\D/g, ''))) {
        return NextResponse.json(
          { error: 'Aadhaar must be 12 digits' },
          { status: 400 }
        );
      }
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id },
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

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Failed to update customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Customer deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
