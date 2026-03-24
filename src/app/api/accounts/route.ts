import { NextRequest, NextResponse } from "next/server"
import { AccountNumberGenerator } from "@/lib/account-generator"

// Mock data for development when database is not available
const mockAccounts = [
  {
    id: "1",
    accountNumber: "FD001",
    customerId: "1",
    accountType: "fd",
    principalAmount: 5000,
    interestRate: 7.5,
    tenure: 12,
    startDate: new Date("2024-01-15").toISOString(),
    maturityDate: new Date("2025-01-15").toISOString(),
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
    customer: {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001"
    },
    accountRules: null,
    _count: {
      transactions: 2
    }
  },
  {
    id: "2",
    accountNumber: "RD002",
    customerId: "2",
    accountType: "rd",
    principalAmount: 1000,
    interestRate: 6.5,
    tenure: 24,
    startDate: new Date("2024-02-01").toISOString(),
    maturityDate: new Date("2026-02-01").toISOString(),
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString(),
    customer: {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1234567891",
      address: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001"
    },
    accountRules: null,
    _count: {
      transactions: 2
    }
  },
  {
    id: "3",
    accountNumber: "LN003",
    customerId: "3",
    accountType: "loan",
    principalAmount: 10000,
    interestRate: 12.0,
    tenure: 36,
    startDate: new Date("2024-01-01").toISOString(),
    maturityDate: null,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
    customer: {
      id: "3",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      phone: "+1234567892",
      address: "789 Pine Rd",
      city: "Chicago",
      state: "IL",
      zipCode: "60007"
    },
    accountRules: null,
    _count: {
      transactions: 1
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const accountType = searchParams.get('accountType') || '';
    const customerId = searchParams.get('customerId') || '';

    const skip = (page - 1) * limit;

    // Try to get data from database first
    try {
      const { prisma } = await import("@/lib/database");
      
      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { accountNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }

      if (accountType) {
        where.accountType = accountType;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      const [accounts, total] = await Promise.all([
        prisma.account.findMany({
          where,
          include: {
            customer: true,
            accountRules: true,
            _count: {
              select: { transactions: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.account.count({ where })
      ]);

      return NextResponse.json({
        accounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      console.log('Database not available, using mock data:', dbError);
      
      // Filter mock data based on search parameters
      let filteredAccounts = mockAccounts;
      
      if (search) {
        filteredAccounts = filteredAccounts.filter(account => 
          account.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
          account.customer.name.toLowerCase().includes(search.toLowerCase()) ||
          account.customer.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (accountType) {
        filteredAccounts = filteredAccounts.filter(account => account.accountType === accountType);
      }
      
      if (customerId) {
        filteredAccounts = filteredAccounts.filter(account => account.customerId === customerId);
      }

      const total = filteredAccounts.length;
      const paginatedAccounts = filteredAccounts.slice(skip, skip + limit);

      return NextResponse.json({
        accounts: paginatedAccounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received account data:', body);
    console.log('Account type received:', body.accountType);
    
    // Validate required fields
    const requiredFields = ['customerId', 'accountType', 'principalAmount', 'interestRate', 'tenure'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate account type
    const validAccountTypes = ['fd', 'rd', 'loan'];
    console.log('Valid account types:', validAccountTypes);
    console.log('Is account type valid?', validAccountTypes.includes(body.accountType.toLowerCase()));
    
    if (!validAccountTypes.includes(body.accountType.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid account type. Must be fd, rd, or loan. Received: ${body.accountType}` },
        { status: 400 }
      );
    }

    // Check if customer exists
    const { prisma } = await import("@/lib/database");
    
    const customer = await prisma.customer.findUnique({
      where: { id: body.customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Generate account number
    let accountNumber: string;
    const normalizedAccountType = body.accountType.toLowerCase();
    try {
      // Try to create default templates if they don't exist
      await AccountNumberGenerator.createDefaultTemplates();
      
      // Use the template ID only if it's valid, otherwise let AccountNumberGenerator find the default
      const templateId = body.numberingTemplateId && body.numberingTemplateId !== 'default' 
        ? body.numberingTemplateId 
        : undefined;
      
      accountNumber = await AccountNumberGenerator.generateAccountNumber(
        normalizedAccountType as 'fd' | 'rd' | 'loan',
        templateId,
        { branch: body.branch || 'MAIN' }
      );
    } catch (error) {
      console.error('Failed to generate account number:', error);
      // Fallback to simple account number generation
      const prefix = normalizedAccountType.toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      accountNumber = `${prefix}${timestamp}`;
    }

    // Calculate maturity date
    const startDate = new Date(body.startDate || new Date());
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + body.tenure);

    // Create account
    const account = await prisma.account.create({
      data: {
        accountNumber,
        customerId: body.customerId,
        accountType: normalizedAccountType,
        principalAmount: parseFloat(body.principalAmount),
        interestRate: parseFloat(body.interestRate),
        tenure: parseInt(body.tenure),
        startDate,
        maturityDate: normalizedAccountType !== 'loan' ? maturityDate : null
      },
      include: {
        customer: true,
        accountRules: true
      }
    });

    // Create account rules if provided
    const accountRulesData: any = {
      accountId: account.id,
      interestMode: body.interestMode || 'monthly',
      payoutMode: body.payoutMode || 'reinvest',
      loanMethod: body.loanMethod,
      emiAmount: body.emiAmount ? parseFloat(body.emiAmount) : null,
      emiDueDay: body.emiDueDay ? parseInt(body.emiDueDay) : null,
      gracePeriodDays: body.gracePeriodDays ? parseInt(body.gracePeriodDays) : 0,
      roundingMode: body.roundingMode || 'nearest',
      roundingPrecision: body.roundingPrecision ? parseInt(body.roundingPrecision) : 2,
      customFields: body.customFields || {}
    };

    // Only add numberingTemplateId if it's a valid non-empty string
    if (body.numberingTemplateId && body.numberingTemplateId.trim() && body.numberingTemplateId !== 'default') {
      // Verify the template exists before using it
      try {
        const template = await prisma.numberingTemplate.findUnique({
          where: { id: body.numberingTemplateId }
        });
        
        if (template) {
          accountRulesData.numberingTemplateId = body.numberingTemplateId;
        }
      } catch (error) {
        console.log('Template verification failed, proceeding without template:', error);
      }
    }

    await prisma.accountRules.create({
      data: accountRulesData
    });

    // Create initial transaction
    await prisma.transaction.create({
      data: {
        accountId: account.id,
        type: normalizedAccountType === 'loan' ? 'disbursement' : 'deposit',
        amount: parseFloat(body.principalAmount),
        balance: parseFloat(body.principalAmount),
        description: `Initial ${normalizedAccountType.toUpperCase()} account funding`
      }
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error('Failed to create account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
