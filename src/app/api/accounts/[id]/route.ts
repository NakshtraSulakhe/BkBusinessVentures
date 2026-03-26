import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        customer: true,
        accountRules: true,
        suggestedEntries: {
          orderBy: { runDate: 'desc' }
        },
        installmentEntries: {
          orderBy: { installmentDate: 'desc' }
        },
        emiEntries: {
          orderBy: { dueDate: 'asc' }
        },
        _count: {
          select: { transactions: true }
        }
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Failed to fetch account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id }
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Update account
    const account = await prisma.account.update({
      where: { id },
      data: {
        principalAmount: body.principalAmount ? parseFloat(body.principalAmount) : undefined,
        interestRate: body.interestRate ? parseFloat(body.interestRate) : undefined,
        tenure: body.tenure ? parseInt(body.tenure) : undefined,
        maturityDate: body.maturityDate ? new Date(body.maturityDate) : undefined
      },
      include: {
        customer: true,
        accountRules: true
      }
    });

    // Update account rules if provided
    if (body.accountRules) {
      await prisma.accountRules.upsert({
        where: { accountId: id },
        update: {
          interestMode: body.accountRules.interestMode,
          payoutMode: body.accountRules.payoutMode,
          loanMethod: body.accountRules.loanMethod,
          emiAmount: body.accountRules.emiAmount ? parseFloat(body.accountRules.emiAmount) : undefined,
          emiDueDay: body.accountRules.emiDueDay ? parseInt(body.accountRules.emiDueDay) : undefined,
          gracePeriodDays: body.accountRules.gracePeriodDays ? parseInt(body.accountRules.gracePeriodDays) : undefined,
          roundingMode: body.accountRules.roundingMode,
          roundingPrecision: body.accountRules.roundingPrecision ? parseInt(body.accountRules.roundingPrecision) : undefined,
          customFields: body.accountRules.customFields
        },
        create: {
          accountId: id,
          interestMode: body.accountRules.interestMode || 'maturity',
          payoutMode: body.accountRules.payoutMode || 'reinvest',
          loanMethod: body.accountRules.loanMethod,
          emiAmount: body.accountRules.emiAmount ? parseFloat(body.accountRules.emiAmount) : null,
          emiDueDay: body.accountRules.emiDueDay ? parseInt(body.accountRules.emiDueDay) : null,
          gracePeriodDays: body.accountRules.gracePeriodDays ? parseInt(body.accountRules.gracePeriodDays) : 0,
          roundingMode: body.accountRules.roundingMode || 'nearest',
          roundingPrecision: body.accountRules.roundingPrecision ? parseInt(body.accountRules.roundingPrecision) : 2,
          customFields: body.accountRules.customFields || {}
        }
      });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Failed to update account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id }
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Delete account (cascade will delete related records)
    await prisma.account.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
