// ============================================
// ACCOUNTING TYPES - Double Entry Bookkeeping System
// ============================================

// Account Types based on Accounting Equation: Assets = Liabilities + Equity
export type AccountType = 
  | 'asset'           // Aset (Kas, Bank, Piutang, Persediaan, dll)
  | 'liability'       // Kewajiban (Hutang, Hutang Gaji, dll)
  | 'equity'          // Modal (Modal Pemilik, Laba Ditahan)
  | 'revenue'         // Pendapatan (Penjualan, Pendapatan Jasa)
  | 'expense'         // Beban (Beban Gaji, Beban Utilitas, dll)
  | 'cogs';           // Harga Pokok Penjualan

// Account Categories for detailed classification
export type AccountCategory =
  // Assets
  | 'current_asset'         // Aset Lancar
  | 'fixed_asset'           // Aset Tetap
  | 'inventory'             // Persediaan
  | 'receivable'            // Piutang
  // Liabilities
  | 'current_liability'     // Hutang Lancar
  | 'long_term_liability'   // Hutang Jangka Panjang
  | 'payable'               // Hutang Usaha
  // Equity
  | 'capital'               // Modal
  | 'retained_earnings'     // Laba Ditahan
  | 'drawings'              // Prive
  // Revenue
  | 'sales_revenue'         // Pendapatan Penjualan
  | 'service_revenue'       // Pendapatan Jasa
  | 'other_revenue'         // Pendapatan Lain-lain
  // Expense
  | 'operating_expense'     // Beban Operasional
  | 'administrative_expense'// Beban Administrasi
  | 'marketing_expense'     // Beban Pemasaran
  // COGS
  | 'cost_of_goods_sold';   // Harga Pokok Penjualan

// Normal Balance for each account type
export type NormalBalance = 'debit' | 'credit';

// Chart of Accounts - Daftar Akun
export interface ChartOfAccount {
  id: string;
  code: string;                    // Account code (e.g., 1-1001, 2-2001)
  name: string;                    // Account name
  type: AccountType;               // Account type
  category: AccountCategory;       // Account category
  normalBalance: NormalBalance;    // Normal balance side
  description?: string;
  parentAccountId?: string;        // For sub-accounts
  isActive: boolean;
  isSystem: boolean;               // System account (cannot be deleted)
  balance: number;                 // Current balance
  createdAt: string;
  updatedAt: string;
}

// Journal Entry Type
export type JournalEntryType = 
  | 'manual'          // Manual entry by user
  | 'sales'           // Auto from sales/orders
  | 'purchase'        // Auto from purchases/PO
  | 'payment'         // Auto from payments
  | 'receipt'         // Auto from cash receipts
  | 'payroll'         // Auto from payroll
  | 'adjustment'      // Adjustment entries
  | 'closing';        // Closing entries

// Journal Entry Status
export type JournalEntryStatus = 
  | 'draft'           // Draft, not posted
  | 'posted'          // Posted to ledger
  | 'reversed'        // Reversed entry
  | 'void';           // Voided entry

// Journal Entry Line (Detail)
export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;                   // Debit amount
  credit: number;                  // Credit amount
  referenceId?: string;            // Reference to source transaction
  referenceType?: string;          // Type of source (order, payment, etc)
}

// Journal Entry (Header)
export interface JournalEntry {
  id: string;
  entryNumber: string;             // JE-YYYYMM-0001
  date: string;                    // Transaction date
  type: JournalEntryType;
  status: JournalEntryStatus;
  description: string;
  lines: JournalEntryLine[];       // Journal entry lines (min 2)
  totalDebit: number;              // Must equal totalCredit
  totalCredit: number;             // Must equal totalDebit
  referenceId?: string;            // Source transaction ID
  referenceType?: string;          // Source transaction type
  referenceNumber?: string;        // Source transaction number
  postedBy?: string;
  postedAt?: string;
  reversedBy?: string;
  reversedAt?: string;
  reversalEntryId?: string;        // ID of reversal entry
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// General Ledger Entry
export interface LedgerEntry {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  date: string;
  journalEntryId: string;
  journalEntryNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;                 // Running balance
  referenceId?: string;
  referenceType?: string;
  referenceNumber?: string;
  createdAt: string;
}

// Trial Balance Line
export interface TrialBalanceLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  balance: number;
}

// Trial Balance Report
export interface TrialBalance {
  asOfDate: string;
  lines: TrialBalanceLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  generatedAt: string;
}

// Balance Sheet Line Item
export interface BalanceSheetLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  category: AccountCategory;
}

// Balance Sheet Report
export interface BalanceSheet {
  asOfDate: string;
  // Assets
  currentAssets: BalanceSheetLine[];
  fixedAssets: BalanceSheetLine[];
  totalAssets: number;
  // Liabilities
  currentLiabilities: BalanceSheetLine[];
  longTermLiabilities: BalanceSheetLine[];
  totalLiabilities: number;
  // Equity
  equity: BalanceSheetLine[];
  totalEquity: number;
  // Validation
  isBalanced: boolean;             // Assets = Liabilities + Equity
  generatedAt: string;
}

// Income Statement Line Item
export interface IncomeStatementLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  category: AccountCategory;
}

// Income Statement Report
export interface IncomeStatement {
  periodStart: string;
  periodEnd: string;
  // Revenue
  revenue: IncomeStatementLine[];
  totalRevenue: number;
  // COGS
  cogs: IncomeStatementLine[];
  totalCOGS: number;
  // Gross Profit
  grossProfit: number;
  grossProfitMargin: number;
  // Operating Expenses
  operatingExpenses: IncomeStatementLine[];
  totalOperatingExpenses: number;
  // Net Income
  netIncome: number;
  netProfitMargin: number;
  generatedAt: string;
}

// Cash Flow Statement Line Item
export interface CashFlowLine {
  description: string;
  amount: number;
  accountIds: string[];
}

// Cash Flow Statement Report
export interface CashFlowStatement {
  periodStart: string;
  periodEnd: string;
  // Operating Activities
  operatingActivities: CashFlowLine[];
  netCashFromOperating: number;
  // Investing Activities
  investingActivities: CashFlowLine[];
  netCashFromInvesting: number;
  // Financing Activities
  financingActivities: CashFlowLine[];
  netCashFromFinancing: number;
  // Net Change in Cash
  netChangeInCash: number;
  cashAtBeginning: number;
  cashAtEnd: number;
  generatedAt: string;
}

// Account Balance Summary
export interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: NormalBalance;
  debit: number;
  credit: number;
  balance: number;
  lastTransactionDate?: string;
}

// Accounting Period
export interface AccountingPeriod {
  id: string;
  periodName: string;              // e.g., "January 2024"
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedBy?: string;
  closedAt?: string;
  createdAt: string;
}

// Audit Log for accounting transactions
export interface AccountingAuditLog {
  id: string;
  entityType: 'journal_entry' | 'account' | 'period';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'post' | 'reverse' | 'close';
  changes?: any;
  performedBy: string;
  performedAt: string;
  ipAddress?: string;
  notes?: string;
}

// Transaction Mapping for auto journal entries
export interface TransactionMapping {
  sourceType: string;              // 'order', 'payment', 'payroll', etc
  debitAccountId: string;
  creditAccountId: string;
  description: string;
}
