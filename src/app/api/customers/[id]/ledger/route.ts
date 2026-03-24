import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get all accounts for this customer with their details
    const accounts = await prisma.account.findMany({
      where: { customerId },
      include: {
        accountRules: true,
        _count: {
          select: {
            transactions: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate totals for each account type
    const accountSummary = {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter(acc => (acc as any).status === 'ACTIVE').length,
      fdAccounts: accounts.filter(acc => acc.accountType === 'FD'),
      rdAccounts: accounts.filter(acc => acc.accountType === 'RD'),
      loanAccounts: accounts.filter(acc => acc.accountType === 'LOAN'),
    };

    // Calculate financial totals
    const financialSummary = {
      totalDeposits: accounts
        .filter(acc => ['FD', 'RD'].includes(acc.accountType))
        .reduce((sum, acc) => sum + acc.principalAmount, 0),
      totalLoans: accounts
        .filter(acc => acc.accountType === 'LOAN')
        .reduce((sum, acc) => sum + acc.principalAmount, 0),
      netWorth: 0, // Will be calculated below
    };

    financialSummary.netWorth = financialSummary.totalDeposits - financialSummary.totalLoans;

    // Get recent transactions for all customer accounts
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        accountId: {
          in: accounts.map(acc => acc.id)
        }
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      customer,
      accounts,
      accountSummary,
      financialSummary,
      recentTransactions,
      pendingSuggestions: [] // Empty for now until we fix the schema
    });

  } catch (error) {
    console.error('Failed to fetch customer ledger:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer ledger' },
      { status: 500 }
    );
  }
}
