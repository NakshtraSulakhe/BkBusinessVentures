/**
 * Standard Accounting Rules for Financial Transactions
 * Follows double-entry bookkeeping principles
 */

export enum TransactionType {
  // Asset Accounts (Debit increases, Credit decreases)
  CASH_DEPOSIT = 'CASH_DEPOSIT',           // Credit - Increases cash
  CASH_WITHDRAWAL = 'CASH_WITHDRAWAL',     // Debit - Decreases cash
  BANK_DEPOSIT = 'BANK_DEPOSIT',           // Credit - Increases bank balance
  BANK_WITHDRAWAL = 'BANK_WITHDRAWAL',     // Debit - Decreases bank balance
  
  // Loan Operations
  LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT', // Debit - Money given out (asset decreases)
  LOAN_RECEIPT = 'LOAN_RECEIPT',           // Credit - Money received (asset increases)
  EMI_PAYMENT_RECEIVED = 'EMI_PAYMENT_RECEIVED', // Credit - EMI received (asset increases)
  
  // Income/Revenue (Credit increases, Debit decreases)
  INTEREST_INCOME = 'INTEREST_INCOME',     // Credit - Interest earned
  FEE_INCOME = 'FEE_INCOME',               // Credit - Fees earned
  OTHER_INCOME = 'OTHER_INCOME',           // Credit - Other income
  
  // Expenses (Debit increases, Credit decreases)
  INTEREST_EXPENSE = 'INTEREST_EXPENSE',   // Debit - Interest paid
  SALARY_EXPENSE = 'SALARY_EXPENSE',       // Debit - Salaries paid
  RENT_EXPENSE = 'RENT_EXPENSE',           // Debit - Rent paid
  UTILITIES_EXPENSE = 'UTILITIES_EXPENSE', // Debit - Utilities paid
  OTHER_EXPENSE = 'OTHER_EXPENSE',         // Debit - Other expenses
  
  // Fixed Deposits
  FD_OPENING = 'FD_OPENING',               // Credit - Customer deposits money (liability increases)
  FD_MATURITY = 'FD_MATURITY',             // Debit - Refund to customer (liability decreases)
  FD_INTEREST_CREDITED = 'FD_INTEREST_CREDITED', // Credit - Interest liability increases
  
  // Recurring Deposits
  RD_INSTALLMENT = 'RD_INSTALLMENT',       // Credit - Customer deposits money (liability increases)
  RD_MATURITY = 'RD_MATURITY',             // Debit - Refund to customer (liability decreases)
  RD_INTEREST_CREDITED = 'RD_INTEREST_CREDITED', // Credit - Interest liability increases
  
  // Customer Operations (Liability Accounts)
  // When customer gives you money = Credit (liability increases)
  // When you refund customer = Debit (liability decreases)
  CUSTOMER_DEPOSIT = 'CUSTOMER_DEPOSIT',   // Credit - Customer deposits money (liability increases)
  CUSTOMER_WITHDRAWAL = 'CUSTOMER_WITHDRAWAL', // Debit - Customer withdraws money (liability decreases)
  
  // Adjustments
  OPENING_BALANCE = 'OPENING_BALANCE',     // Initial balance
  ADJUSTMENT_CREDIT = 'ADJUSTMENT_CREDIT', // Manual credit adjustment
  ADJUSTMENT_DEBIT = 'ADJUSTMENT_DEBIT',   // Manual debit adjustment
}

export interface AccountingRule {
  type: TransactionType;
  category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  normalBalance: 'DEBIT' | 'CREDIT';
  description: string;
  affectsCashFlow: boolean;
}

export const ACCOUNTING_RULES: Record<TransactionType, AccountingRule> = {
  [TransactionType.CASH_DEPOSIT]: {
    type: TransactionType.CASH_DEPOSIT,
    category: 'ASSET',
    normalBalance: 'CREDIT',
    description: 'Cash deposited into account',
    affectsCashFlow: true,
  },
  [TransactionType.CASH_WITHDRAWAL]: {
    type: TransactionType.CASH_WITHDRAWAL,
    category: 'ASSET',
    normalBalance: 'DEBIT',
    description: 'Cash withdrawn from account',
    affectsCashFlow: true,
  },
  [TransactionType.BANK_DEPOSIT]: {
    type: TransactionType.BANK_DEPOSIT,
    category: 'ASSET',
    normalBalance: 'CREDIT',
    description: 'Money deposited to bank',
    affectsCashFlow: true,
  },
  [TransactionType.BANK_WITHDRAWAL]: {
    type: TransactionType.BANK_WITHDRAWAL,
    category: 'ASSET',
    normalBalance: 'DEBIT',
    description: 'Money withdrawn from bank',
    affectsCashFlow: true,
  },
  [TransactionType.LOAN_DISBURSEMENT]: {
    type: TransactionType.LOAN_DISBURSEMENT,
    category: 'ASSET',
    normalBalance: 'DEBIT',
    description: 'Loan given to customer',
    affectsCashFlow: true,
  },
  [TransactionType.LOAN_RECEIPT]: {
    type: TransactionType.LOAN_RECEIPT,
    category: 'ASSET',
    normalBalance: 'CREDIT',
    description: 'Loan amount received from customer',
    affectsCashFlow: true,
  },
  [TransactionType.EMI_PAYMENT_RECEIVED]: {
    type: TransactionType.EMI_PAYMENT_RECEIVED,
    category: 'REVENUE',
    normalBalance: 'CREDIT',
    description: 'EMI payment received from customer',
    affectsCashFlow: true,
  },
  [TransactionType.INTEREST_INCOME]: {
    type: TransactionType.INTEREST_INCOME,
    category: 'REVENUE',
    normalBalance: 'CREDIT',
    description: 'Interest income earned',
    affectsCashFlow: true,
  },
  [TransactionType.FEE_INCOME]: {
    type: TransactionType.FEE_INCOME,
    category: 'REVENUE',
    normalBalance: 'CREDIT',
    description: 'Fee income earned',
    affectsCashFlow: true,
  },
  [TransactionType.OTHER_INCOME]: {
    type: TransactionType.OTHER_INCOME,
    category: 'REVENUE',
    normalBalance: 'CREDIT',
    description: 'Other income received',
    affectsCashFlow: true,
  },
  [TransactionType.INTEREST_EXPENSE]: {
    type: TransactionType.INTEREST_EXPENSE,
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Interest expense paid',
    affectsCashFlow: true,
  },
  [TransactionType.SALARY_EXPENSE]: {
    type: TransactionType.SALARY_EXPENSE,
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Salary expense paid',
    affectsCashFlow: true,
  },
  [TransactionType.RENT_EXPENSE]: {
    type: TransactionType.RENT_EXPENSE,
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Rent expense paid',
    affectsCashFlow: true,
  },
  [TransactionType.UTILITIES_EXPENSE]: {
    type: TransactionType.UTILITIES_EXPENSE,
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Utilities expense paid',
    affectsCashFlow: true,
  },
  [TransactionType.OTHER_EXPENSE]: {
    type: TransactionType.OTHER_EXPENSE,
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Other expense paid',
    affectsCashFlow: true,
  },
  [TransactionType.FD_OPENING]: {
    type: TransactionType.FD_OPENING,
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    description: 'Fixed deposit opened - customer liability increases',
    affectsCashFlow: true,
  },
  [TransactionType.FD_MATURITY]: {
    type: TransactionType.FD_MATURITY,
    category: 'LIABILITY',
    normalBalance: 'DEBIT',
    description: 'Fixed deposit matured - refund to customer (liability decreases)',
    affectsCashFlow: true,
  },
  [TransactionType.FD_INTEREST_CREDITED]: {
    type: TransactionType.FD_INTEREST_CREDITED,
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    description: 'Interest liability credited to fixed deposit',
    affectsCashFlow: false,
  },
  [TransactionType.RD_INSTALLMENT]: {
    type: TransactionType.RD_INSTALLMENT,
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    description: 'Recurring deposit installment - customer liability increases',
    affectsCashFlow: true,
  },
  [TransactionType.RD_MATURITY]: {
    type: TransactionType.RD_MATURITY,
    category: 'LIABILITY',
    normalBalance: 'DEBIT',
    description: 'Recurring deposit matured - refund to customer (liability decreases)',
    affectsCashFlow: true,
  },
  [TransactionType.RD_INTEREST_CREDITED]: {
    type: TransactionType.RD_INTEREST_CREDITED,
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    description: 'Interest liability credited to recurring deposit',
    affectsCashFlow: false,
  },
  [TransactionType.CUSTOMER_DEPOSIT]: {
    type: TransactionType.CUSTOMER_DEPOSIT,
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    description: 'Customer deposited money (liability increases)',
    affectsCashFlow: true,
  },
  [TransactionType.CUSTOMER_WITHDRAWAL]: {
    type: TransactionType.CUSTOMER_WITHDRAWAL,
    category: 'LIABILITY',
    normalBalance: 'DEBIT',
    description: 'Customer withdrew money (liability decreases)',
    affectsCashFlow: true,
  },
  [TransactionType.OPENING_BALANCE]: {
    type: TransactionType.OPENING_BALANCE,
    category: 'ASSET',
    normalBalance: 'CREDIT',
    description: 'Opening balance entry',
    affectsCashFlow: false,
  },
  [TransactionType.ADJUSTMENT_CREDIT]: {
    type: TransactionType.ADJUSTMENT_CREDIT,
    category: 'ASSET',
    normalBalance: 'CREDIT',
    description: 'Manual credit adjustment',
    affectsCashFlow: false,
  },
  [TransactionType.ADJUSTMENT_DEBIT]: {
    type: TransactionType.ADJUSTMENT_DEBIT,
    category: 'ASSET',
    normalBalance: 'DEBIT',
    description: 'Manual debit adjustment',
    affectsCashFlow: false,
  },
}

/**
 * Determines if a transaction type is a credit or debit based on standard accounting rules
 */
export function isCreditTransaction(type: string): boolean {
  const normalizedType = normalizeTransactionType(type);
  const rule = ACCOUNTING_RULES[normalizedType];
  return rule?.normalBalance === 'CREDIT' || false;
}

/**
 * Determines if a transaction type is a debit or credit based on standard accounting rules
 */
export function isDebitTransaction(type: string): boolean {
  const normalizedType = normalizeTransactionType(type);
  const rule = ACCOUNTING_RULES[normalizedType];
  return rule?.normalBalance === 'DEBIT' || false;
}

/**
 * Calculates new balance based on transaction type and amount
 * Following standard accounting: 
 * - For ASSET accounts: Credit increases balance, Debit decreases balance
 * - For LIABILITY accounts: Debit increases balance, Credit decreases balance
 */
export function calculateNewBalance(
  currentBalance: number,
  transactionType: string,
  amount: number
): number {
  const normalizedType = normalizeTransactionType(transactionType);
  const rule = ACCOUNTING_RULES[normalizedType];
  if (!rule) return currentBalance;

  switch (rule.category) {
    case 'ASSET':
      // Asset accounts: Credit increases, Debit decreases
      return rule.normalBalance === 'CREDIT' 
        ? currentBalance + amount 
        : currentBalance - amount;
    
    case 'LIABILITY':
      // Liability accounts (Customer Deposits): Credit increases, Debit decreases
      // When customer deposits money, bank's liability increases
      // When customer withdraws money, bank's liability decreases
      return rule.normalBalance === 'CREDIT'
        ? currentBalance + amount
        : currentBalance - amount;
    
    case 'REVENUE':
      // Revenue accounts: Credit increases, Debit decreases
      return rule.normalBalance === 'CREDIT' 
        ? currentBalance + amount 
        : currentBalance - amount;
    
    case 'EXPENSE':
      // Expense accounts: Debit increases, Credit decreases
      return rule.normalBalance === 'DEBIT' 
        ? currentBalance + amount 
        : currentBalance - amount;
    
    default:
      return currentBalance;
  }
}

/**
 * Validates if a transaction can be processed (sufficient funds, etc.)
 */
export function validateTransaction(
  currentBalance: number,
  transactionType: string,
  amount: number,
  accountType: string
): { valid: boolean; error?: string } {
  // Check if sufficient funds for debit transactions
  if (isDebitTransaction(transactionType)) {
    const newBalance = calculateNewBalance(currentBalance, transactionType, amount);
    
    // Allow negative balance for loan accounts
    if (newBalance < 0 && accountType !== 'LOAN') {
      return {
        valid: false,
        error: 'Insufficient funds for this transaction'
      };
    }
  }
  
  return { valid: true };
}

/**
 * Gets transaction category for reporting purposes
 */
export function getTransactionCategory(type: string): string {
  const normalizedType = normalizeTransactionType(type);
  return ACCOUNTING_RULES[normalizedType]?.category || 'OTHER';
}

/**
 * Gets all transaction types by category
 */
export function getTransactionTypesByCategory(category: string): TransactionType[] {
  return Object.values(TransactionType).filter(type => 
    ACCOUNTING_RULES[type]?.category === category
  );
}

/**
 * Legacy support for old transaction types
 * Maps old types to new standardized types
 */
export const LEGACY_TYPE_MAPPING: Record<string, TransactionType> = {
  'DEPOSIT': TransactionType.CUSTOMER_DEPOSIT,
  'WITHDRAWAL': TransactionType.CUSTOMER_WITHDRAWAL,
  'INTEREST': TransactionType.INTEREST_INCOME,
  'LOAN': TransactionType.LOAN_DISBURSEMENT,
  'EMI': TransactionType.EMI_PAYMENT_RECEIVED,
  'CREDIT': TransactionType.ADJUSTMENT_CREDIT,
  'DEBIT': TransactionType.ADJUSTMENT_DEBIT,
  'INSTALLMENT': TransactionType.EMI_PAYMENT_RECEIVED,
  'PRINCIPAL_PAYMENT': TransactionType.LOAN_RECEIPT,
}

/**
 * Converts legacy transaction types to standardized types
 * Case-insensitive matching for legacy types
 */
export function normalizeTransactionType(type: string): TransactionType {
  if (!type) return type as TransactionType;
  const upperType = type.toUpperCase();
  
  // Try legacy mapping first (for frontend inputs like "deposit", "withdrawal")
  if (LEGACY_TYPE_MAPPING[upperType]) {
    return LEGACY_TYPE_MAPPING[upperType];
  }
  
  // Check if it's already a valid standard type
  if (ACCOUNTING_RULES[upperType as TransactionType]) {
    return upperType as TransactionType;
  }
  
  // Return as-is if no mapping found
  return type as TransactionType;
}
