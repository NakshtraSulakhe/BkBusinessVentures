-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklisted_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklisted_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "pan_number" TEXT,
    "aadhaar_number" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "occupation" TEXT,
    "annual_income" DOUBLE PRECISION,
    "account_type" TEXT NOT NULL,
    "purpose" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "principalAmount" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "tenure" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "maturityDate" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_rules" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "interest_mode" TEXT NOT NULL DEFAULT 'maturity',
    "payout_mode" TEXT NOT NULL DEFAULT 'reinvest',
    "loan_method" TEXT,
    "rd_interest_method" TEXT,
    "rd_balance_date_rule" TEXT,
    "rd_balance_day" INTEGER,
    "emi_amount" DOUBLE PRECISION,
    "emi_due_day" INTEGER,
    "grace_period_days" INTEGER DEFAULT 0,
    "penalty_rate" DOUBLE PRECISION DEFAULT 1.0,
    "rounding_mode" TEXT NOT NULL DEFAULT 'nearest',
    "rounding_precision" INTEGER NOT NULL DEFAULT 2,
    "numbering_template_id" TEXT,
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numbering_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "account_type" TEXT NOT NULL,
    "sequence_start" INTEGER NOT NULL DEFAULT 1,
    "current_sequence" INTEGER NOT NULL DEFAULT 0,
    "required_variables" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "numbering_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION,
    "description" TEXT,
    "reference" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggested_entries" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "run_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period_start_date" TIMESTAMP(3) NOT NULL,
    "period_end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggested_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installment_entries" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "installment_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installment_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emi_entries" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "emi_number" INTEGER NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "emi_amount" DOUBLE PRECISION NOT NULL,
    "principal_amount" DOUBLE PRECISION NOT NULL,
    "interest_amount" DOUBLE PRECISION NOT NULL,
    "penalty_amount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'DUE',
    "paid_amount" DOUBLE PRECISION,
    "paid_date" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emi_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_closures" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "closure_type" TEXT NOT NULL,
    "principal_amount" DOUBLE PRECISION NOT NULL,
    "interest_amount" DOUBLE PRECISION NOT NULL,
    "penalty_amount" DOUBLE PRECISION,
    "total_payable" DOUBLE PRECISION NOT NULL,
    "closure_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "closed_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_closures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "blacklisted_tokens_token_hash_key" ON "blacklisted_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_accountNumber_key" ON "accounts"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "account_rules_account_id_key" ON "account_rules"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_closures_account_id_key" ON "account_closures"("account_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_rules" ADD CONSTRAINT "account_rules_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_rules" ADD CONSTRAINT "account_rules_numbering_template_id_fkey" FOREIGN KEY ("numbering_template_id") REFERENCES "numbering_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggested_entries" ADD CONSTRAINT "suggested_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installment_entries" ADD CONSTRAINT "installment_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
