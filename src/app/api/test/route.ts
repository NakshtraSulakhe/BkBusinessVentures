import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Count customers
    const customerCount = await prisma.customer.count();
    
    // Get first few customers for testing
    const customers = await prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      customerCount,
      customers: customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
