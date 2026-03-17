import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { AccountNumberGenerator } from "@/lib/account-generator";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const accountType = searchParams.get('accountType') || '';
    const customerId = searchParams.get('customerId') || '';

    const skip = (page - 1) * limit;

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
    if (!['fd', 'rd', 'loan'].includes(body.accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type. Must be fd, rd, or loan' },
        { status: 400 }
      );
    }

    // Check if customer exists
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
    const accountNumber = await AccountNumberGenerator.generateAccountNumber(
      body.accountType as 'fd' | 'rd' | 'loan',
      body.numberingTemplateId,
      { branch: body.branch || 'MAIN' }
    );

    // Calculate maturity date
    const startDate = new Date(body.startDate || new Date());
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + body.tenure);

    // Create account
    const account = await prisma.account.create({
      data: {
        accountNumber,
        customerId: body.customerId,
        accountType: body.accountType,
        principalAmount: parseFloat(body.principalAmount),
        interestRate: parseFloat(body.interestRate),
        tenure: parseInt(body.tenure),
        startDate,
        maturityDate: body.accountType !== 'loan' ? maturityDate : null
      },
      include: {
        customer: true,
        accountRules: true
      }
    });

    // Create account rules if provided
    if (body.accountRules) {
      await prisma.accountRules.create({
        data: {
          accountId: account.id,
          interestMode: body.accountRules.interestMode || 'maturity',
          payoutMode: body.accountRules.payoutMode || 'reinvest',
          loanMethod: body.accountRules.loanMethod,
          emiAmount: body.accountRules.emiAmount ? parseFloat(body.accountRules.emiAmount) : null,
          emiDueDay: body.accountRules.emiDueDay ? parseInt(body.accountRules.emiDueDay) : null,
          gracePeriodDays: body.accountRules.gracePeriodDays ? parseInt(body.accountRules.gracePeriodDays) : 0,
          roundingMode: body.accountRules.roundingMode || 'nearest',
          roundingPrecision: body.accountRules.roundingPrecision ? parseInt(body.accountRules.roundingPrecision) : 2,
          numberingTemplateId: body.accountRules.numberingTemplateId,
          customFields: body.accountRules.customFields || {}
        }
      });
    }

    // Create initial transaction
    await prisma.transaction.create({
      data: {
        accountId: account.id,
        type: body.accountType === 'loan' ? 'disbursement' : 'deposit',
        amount: parseFloat(body.principalAmount),
        balance: parseFloat(body.principalAmount),
        description: `Initial ${body.accountType.toUpperCase()} account funding`
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
