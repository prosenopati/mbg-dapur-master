import {
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
  LedgerEntry,
  TrialBalance,
  TrialBalanceLine,
  BalanceSheet,
  BalanceSheetLine,
  IncomeStatement,
  IncomeStatementLine,
  CashFlowStatement,
  AccountBalance,
  AccountType,
  JournalEntryStatus,
  NormalBalance,
} from '../types/accounting';
import { StorageService } from './storage';

// ============================================
// CHART OF ACCOUNTS SERVICE
// ============================================
class ChartOfAccountsService extends StorageService<ChartOfAccount> {
  constructor() {
    super('mbg_chart_of_accounts');
    this.initializeDefaultAccounts();
  }

  private initializeDefaultAccounts() {
    if (this.getAll().length === 0) {
      const defaultAccounts: Omit<ChartOfAccount, 'id' | 'createdAt' | 'updatedAt' | 'balance'>[] = [
        // ASSETS - 1-xxxx
        {
          code: '1-1001',
          name: 'Kas',
          type: 'asset',
          category: 'current_asset',
          normalBalance: 'debit',
          description: 'Kas tunai di tangan',
          isActive: true,
          isSystem: true,
        },
        {
          code: '1-1002',
          name: 'Bank',
          type: 'asset',
          category: 'current_asset',
          normalBalance: 'debit',
          description: 'Saldo rekening bank',
          isActive: true,
          isSystem: true,
        },
        {
          code: '1-1101',
          name: 'Piutang Usaha',
          type: 'asset',
          category: 'receivable',
          normalBalance: 'debit',
          description: 'Piutang dari pelanggan',
          isActive: true,
          isSystem: true,
        },
        {
          code: '1-1201',
          name: 'Persediaan Bahan Baku',
          type: 'asset',
          category: 'inventory',
          normalBalance: 'debit',
          description: 'Persediaan bahan baku makanan',
          isActive: true,
          isSystem: true,
        },
        {
          code: '1-1202',
          name: 'Persediaan Barang Jadi',
          type: 'asset',
          category: 'inventory',
          normalBalance: 'debit',
          description: 'Persediaan makanan siap jual',
          isActive: true,
          isSystem: true,
        },
        {
          code: '1-2001',
          name: 'Peralatan Dapur',
          type: 'asset',
          category: 'fixed_asset',
          normalBalance: 'debit',
          description: 'Peralatan dan mesin dapur',
          isActive: true,
          isSystem: true,
        },
        {
          code: '1-2002',
          name: 'Kendaraan',
          type: 'asset',
          category: 'fixed_asset',
          normalBalance: 'debit',
          description: 'Kendaraan operasional',
          isActive: true,
          isSystem: true,
        },

        // LIABILITIES - 2-xxxx
        {
          code: '2-1001',
          name: 'Hutang Usaha',
          type: 'liability',
          category: 'payable',
          normalBalance: 'credit',
          description: 'Hutang kepada supplier',
          isActive: true,
          isSystem: true,
        },
        {
          code: '2-1002',
          name: 'Hutang Gaji',
          type: 'liability',
          category: 'current_liability',
          normalBalance: 'credit',
          description: 'Hutang gaji karyawan',
          isActive: true,
          isSystem: true,
        },
        {
          code: '2-2001',
          name: 'Hutang Bank',
          type: 'liability',
          category: 'long_term_liability',
          normalBalance: 'credit',
          description: 'Pinjaman bank jangka panjang',
          isActive: true,
          isSystem: false,
        },

        // EQUITY - 3-xxxx
        {
          code: '3-1001',
          name: 'Modal Pemilik',
          type: 'equity',
          category: 'capital',
          normalBalance: 'credit',
          description: 'Modal awal dari pemilik',
          isActive: true,
          isSystem: true,
        },
        {
          code: '3-2001',
          name: 'Laba Ditahan',
          type: 'equity',
          category: 'retained_earnings',
          normalBalance: 'credit',
          description: 'Akumulasi laba yang ditahan',
          isActive: true,
          isSystem: true,
        },
        {
          code: '3-3001',
          name: 'Prive',
          type: 'equity',
          category: 'drawings',
          normalBalance: 'debit',
          description: 'Penarikan modal oleh pemilik',
          isActive: true,
          isSystem: true,
        },

        // REVENUE - 4-xxxx
        {
          code: '4-1001',
          name: 'Pendapatan Penjualan',
          type: 'revenue',
          category: 'sales_revenue',
          normalBalance: 'credit',
          description: 'Pendapatan dari penjualan makanan',
          isActive: true,
          isSystem: true,
        },
        {
          code: '4-2001',
          name: 'Pendapatan Jasa Catering',
          type: 'revenue',
          category: 'service_revenue',
          normalBalance: 'credit',
          description: 'Pendapatan dari jasa catering',
          isActive: true,
          isSystem: true,
        },
        {
          code: '4-9001',
          name: 'Pendapatan Lain-lain',
          type: 'revenue',
          category: 'other_revenue',
          normalBalance: 'credit',
          description: 'Pendapatan di luar operasional utama',
          isActive: true,
          isSystem: false,
        },

        // COGS - 5-xxxx
        {
          code: '5-1001',
          name: 'Harga Pokok Penjualan',
          type: 'cogs',
          category: 'cost_of_goods_sold',
          normalBalance: 'debit',
          description: 'Biaya produksi makanan yang terjual',
          isActive: true,
          isSystem: true,
        },

        // EXPENSES - 6-xxxx
        {
          code: '6-1001',
          name: 'Beban Gaji',
          type: 'expense',
          category: 'operating_expense',
          normalBalance: 'debit',
          description: 'Beban gaji karyawan',
          isActive: true,
          isSystem: true,
        },
        {
          code: '6-1002',
          name: 'Beban Transportasi',
          type: 'expense',
          category: 'operating_expense',
          normalBalance: 'debit',
          description: 'Beban pengiriman dan transportasi',
          isActive: true,
          isSystem: true,
        },
        {
          code: '6-2001',
          name: 'Beban Sewa',
          type: 'expense',
          category: 'operating_expense',
          normalBalance: 'debit',
          description: 'Beban sewa tempat usaha',
          isActive: true,
          isSystem: false,
        },
        {
          code: '6-2002',
          name: 'Beban Listrik & Air',
          type: 'expense',
          category: 'operating_expense',
          normalBalance: 'debit',
          description: 'Beban utilitas',
          isActive: true,
          isSystem: false,
        },
        {
          code: '6-3001',
          name: 'Beban Pemasaran',
          type: 'expense',
          category: 'marketing_expense',
          normalBalance: 'debit',
          description: 'Beban iklan dan promosi',
          isActive: true,
          isSystem: false,
        },
        {
          code: '6-4001',
          name: 'Beban Administrasi',
          type: 'expense',
          category: 'administrative_expense',
          normalBalance: 'debit',
          description: 'Beban administrasi dan kantor',
          isActive: true,
          isSystem: false,
        },
      ];

      defaultAccounts.forEach((account) => {
        this.createAccount(account);
      });
    }
  }

  createAccount(data: Omit<ChartOfAccount, 'id' | 'createdAt' | 'updatedAt' | 'balance'>): ChartOfAccount {
    const account: ChartOfAccount = {
      ...data,
      id: Date.now().toString(),
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.create(account);
  }

  updateAccount(id: string, updates: Partial<ChartOfAccount>): ChartOfAccount | null {
    return this.update(id, { ...updates, updatedAt: new Date().toISOString() });
  }

  getByCode(code: string): ChartOfAccount | undefined {
    return this.getAll().find((a) => a.code === code);
  }

  getByType(type: AccountType): ChartOfAccount[] {
    return this.getAll().filter((a) => a.type === type && a.isActive);
  }

  getActiveAccounts(): ChartOfAccount[] {
    return this.getAll().filter((a) => a.isActive);
  }

  updateBalance(accountId: string, amount: number): ChartOfAccount | null {
    const account = this.getById(accountId);
    if (!account) return null;

    const newBalance = account.balance + amount;
    return this.update(accountId, { balance: newBalance, updatedAt: new Date().toISOString() });
  }
}

// ============================================
// JOURNAL ENTRY SERVICE
// ============================================
class JournalEntryService extends StorageService<JournalEntry> {
  constructor() {
    super('mbg_journal_entries');
  }

  private generateEntryNumber(): string {
    const count = this.getAll().length + 1;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `JE-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  createEntry(
    data: Omit<JournalEntry, 'id' | 'entryNumber' | 'totalDebit' | 'totalCredit' | 'createdAt' | 'updatedAt'>
  ): JournalEntry {
    // Validate: At least 2 lines
    if (data.lines.length < 2) {
      throw new Error('Journal entry must have at least 2 lines');
    }

    // Calculate totals
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);

    // Validate: Debit must equal Credit
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Journal entry not balanced: Debit ${totalDebit} != Credit ${totalCredit}`);
    }

    const entry: JournalEntry = {
      ...data,
      id: Date.now().toString(),
      entryNumber: this.generateEntryNumber(),
      totalDebit,
      totalCredit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.create(entry);
  }

  postEntry(id: string, postedBy: string): JournalEntry | null {
    const entry = this.getById(id);
    if (!entry) return null;

    if (entry.status !== 'draft') {
      throw new Error('Only draft entries can be posted');
    }

    // Post to ledger
    ledgerService.postJournalEntry(entry);

    // Update account balances
    entry.lines.forEach((line) => {
      const account = chartOfAccountsService.getById(line.accountId);
      if (!account) return;

      let balanceChange = 0;
      if (account.normalBalance === 'debit') {
        balanceChange = line.debit - line.credit;
      } else {
        balanceChange = line.credit - line.debit;
      }

      chartOfAccountsService.updateBalance(line.accountId, balanceChange);
    });

    return this.update(id, {
      status: 'posted',
      postedBy,
      postedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  reverseEntry(id: string, reversedBy: string, notes?: string): JournalEntry | null {
    const entry = this.getById(id);
    if (!entry) return null;

    if (entry.status !== 'posted') {
      throw new Error('Only posted entries can be reversed');
    }

    // Create reversal entry
    const reversalLines: JournalEntryLine[] = entry.lines.map((line) => ({
      ...line,
      id: `${line.id}-REV`,
      debit: line.credit, // Swap debit and credit
      credit: line.debit,
    }));

    const reversalEntry = this.createEntry({
      date: new Date().toISOString(),
      type: 'adjustment',
      status: 'draft',
      description: `Pembalikan: ${entry.description}`,
      lines: reversalLines,
      referenceId: entry.id,
      referenceType: 'reversal',
      referenceNumber: entry.entryNumber,
      createdBy: reversedBy,
      notes: notes || 'Entry reversal',
    });

    // Post reversal entry
    this.postEntry(reversalEntry.id, reversedBy);

    // Mark original as reversed
    return this.update(id, {
      status: 'reversed',
      reversedBy,
      reversedAt: new Date().toISOString(),
      reversalEntryId: reversalEntry.id,
      updatedAt: new Date().toISOString(),
    });
  }

  getByType(type: JournalEntry['type']): JournalEntry[] {
    return this.getAll().filter((e) => e.type === type);
  }

  getByStatus(status: JournalEntryStatus): JournalEntry[] {
    return this.getAll().filter((e) => e.status === status);
  }

  getByDateRange(startDate: string, endDate: string): JournalEntry[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.getAll().filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= start && entryDate <= end;
    });
  }
}

// ============================================
// GENERAL LEDGER SERVICE
// ============================================
class GeneralLedgerService extends StorageService<LedgerEntry> {
  constructor() {
    super('mbg_general_ledger');
  }

  postJournalEntry(journalEntry: JournalEntry): LedgerEntry[] {
    const ledgerEntries: LedgerEntry[] = [];

    journalEntry.lines.forEach((line) => {
      const account = chartOfAccountsService.getById(line.accountId);
      if (!account) return;

      // Get current balance
      const accountLedger = this.getByAccount(line.accountId);
      const lastEntry = accountLedger[accountLedger.length - 1];
      const previousBalance = lastEntry ? lastEntry.balance : 0;

      // Calculate new balance
      let newBalance = previousBalance;
      if (account.normalBalance === 'debit') {
        newBalance += line.debit - line.credit;
      } else {
        newBalance += line.credit - line.debit;
      }

      const ledgerEntry: LedgerEntry = {
        id: `${journalEntry.id}-${line.id}`,
        accountId: line.accountId,
        accountCode: line.accountCode,
        accountName: line.accountName,
        date: journalEntry.date,
        journalEntryId: journalEntry.id,
        journalEntryNumber: journalEntry.entryNumber,
        description: line.description,
        debit: line.debit,
        credit: line.credit,
        balance: newBalance,
        referenceId: journalEntry.referenceId,
        referenceType: journalEntry.referenceType,
        referenceNumber: journalEntry.referenceNumber,
        createdAt: new Date().toISOString(),
      };

      ledgerEntries.push(this.create(ledgerEntry));
    });

    return ledgerEntries;
  }

  getByAccount(accountId: string): LedgerEntry[] {
    return this.getAll()
      .filter((e) => e.accountId === accountId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getByDateRange(accountId: string, startDate: string, endDate: string): LedgerEntry[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.getByAccount(accountId).filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= start && entryDate <= end;
    });
  }

  getAccountBalance(accountId: string, asOfDate?: string): number {
    let entries = this.getByAccount(accountId);
    
    if (asOfDate) {
      const date = new Date(asOfDate);
      entries = entries.filter((e) => new Date(e.date) <= date);
    }

    const lastEntry = entries[entries.length - 1];
    return lastEntry ? lastEntry.balance : 0;
  }
}

// ============================================
// ACCOUNTING REPORTS SERVICE
// ============================================
class AccountingReportsService {
  generateTrialBalance(asOfDate?: string): TrialBalance {
    const accounts = chartOfAccountsService.getActiveAccounts();
    const lines: TrialBalanceLine[] = [];
    let totalDebit = 0;
    let totalCredit = 0;

    accounts.forEach((account) => {
      const balance = ledgerService.getAccountBalance(account.id, asOfDate);
      
      let debit = 0;
      let credit = 0;

      if (account.normalBalance === 'debit') {
        debit = balance;
      } else {
        credit = balance;
      }

      totalDebit += debit;
      totalCredit += credit;

      lines.push({
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        debit,
        credit,
        balance,
      });
    });

    return {
      asOfDate: asOfDate || new Date().toISOString(),
      lines: lines.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      generatedAt: new Date().toISOString(),
    };
  }

  generateBalanceSheet(asOfDate?: string): BalanceSheet {
    const accounts = chartOfAccountsService.getActiveAccounts();
    const date = asOfDate || new Date().toISOString();

    const currentAssets: BalanceSheetLine[] = [];
    const fixedAssets: BalanceSheetLine[] = [];
    const currentLiabilities: BalanceSheetLine[] = [];
    const longTermLiabilities: BalanceSheetLine[] = [];
    const equity: BalanceSheetLine[] = [];

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    accounts.forEach((account) => {
      const balance = ledgerService.getAccountBalance(account.id, date);
      if (balance === 0) return;

      const line: BalanceSheetLine = {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        amount: Math.abs(balance),
        category: account.category,
      };

      if (account.type === 'asset') {
        totalAssets += balance;
        if (account.category === 'fixed_asset') {
          fixedAssets.push(line);
        } else {
          currentAssets.push(line);
        }
      } else if (account.type === 'liability') {
        totalLiabilities += balance;
        if (account.category === 'long_term_liability') {
          longTermLiabilities.push(line);
        } else {
          currentLiabilities.push(line);
        }
      } else if (account.type === 'equity') {
        totalEquity += balance;
        equity.push(line);
      }
    });

    return {
      asOfDate: date,
      currentAssets: currentAssets.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      fixedAssets: fixedAssets.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      totalAssets,
      currentLiabilities: currentLiabilities.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      longTermLiabilities: longTermLiabilities.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      totalLiabilities,
      equity: equity.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      generatedAt: new Date().toISOString(),
    };
  }

  generateIncomeStatement(startDate: string, endDate: string): IncomeStatement {
    const accounts = chartOfAccountsService.getActiveAccounts();
    const revenue: IncomeStatementLine[] = [];
    const cogs: IncomeStatementLine[] = [];
    const operatingExpenses: IncomeStatementLine[] = [];

    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalOperatingExpenses = 0;

    // Get transactions in period
    const journalEntries = journalEntryService.getByDateRange(startDate, endDate);
    const accountTotals = new Map<string, number>();

    journalEntries.forEach((entry) => {
      if (entry.status !== 'posted') return;

      entry.lines.forEach((line) => {
        const account = chartOfAccountsService.getById(line.accountId);
        if (!account) return;

        const current = accountTotals.get(line.accountId) || 0;
        
        if (account.type === 'revenue') {
          // Revenue accounts have credit balance
          accountTotals.set(line.accountId, current + (line.credit - line.debit));
        } else if (account.type === 'cogs' || account.type === 'expense') {
          // Expense accounts have debit balance
          accountTotals.set(line.accountId, current + (line.debit - line.credit));
        }
      });
    });

    accounts.forEach((account) => {
      const amount = accountTotals.get(account.id) || 0;
      if (amount === 0) return;

      const line: IncomeStatementLine = {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        amount: Math.abs(amount),
        category: account.category,
      };

      if (account.type === 'revenue') {
        totalRevenue += amount;
        revenue.push(line);
      } else if (account.type === 'cogs') {
        totalCOGS += amount;
        cogs.push(line);
      } else if (account.type === 'expense') {
        totalOperatingExpenses += amount;
        operatingExpenses.push(line);
      }
    });

    const grossProfit = totalRevenue - totalCOGS;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netIncome = grossProfit - totalOperatingExpenses;
    const netProfitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return {
      periodStart: startDate,
      periodEnd: endDate,
      revenue: revenue.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      totalRevenue,
      cogs: cogs.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      totalCOGS,
      grossProfit,
      grossProfitMargin,
      operatingExpenses: operatingExpenses.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      totalOperatingExpenses,
      netIncome,
      netProfitMargin,
      generatedAt: new Date().toISOString(),
    };
  }
}

// ============================================
// AUTO JOURNAL ENTRY SERVICE
// ============================================
class AutoJournalService {
  // Auto create journal entry from order delivery
  createFromOrder(order: any): JournalEntry {
    const salesAccount = chartOfAccountsService.getByCode('4-1001'); // Pendapatan Penjualan
    const cashAccount = chartOfAccountsService.getByCode('1-1001'); // Kas
    const cogsAccount = chartOfAccountsService.getByCode('5-1001'); // HPP
    const inventoryAccount = chartOfAccountsService.getByCode('1-1201'); // Persediaan

    if (!salesAccount || !cashAccount || !cogsAccount || !inventoryAccount) {
      throw new Error('Required accounts not found');
    }

    const lines: JournalEntryLine[] = [
      {
        id: '1',
        accountId: cashAccount.id,
        accountCode: cashAccount.code,
        accountName: cashAccount.name,
        description: `Penjualan ${order.orderNumber} - ${order.institutionName}`,
        debit: order.totalAmount,
        credit: 0,
        referenceId: order.id,
        referenceType: 'order',
      },
      {
        id: '2',
        accountId: salesAccount.id,
        accountCode: salesAccount.code,
        accountName: salesAccount.name,
        description: `Penjualan ${order.orderNumber} - ${order.institutionName}`,
        debit: 0,
        credit: order.totalAmount,
        referenceId: order.id,
        referenceType: 'order',
      },
    ];

    const entry = journalEntryService.createEntry({
      date: order.completedAt || order.createdAt,
      type: 'sales',
      status: 'draft',
      description: `Penjualan - ${order.orderNumber}`,
      lines,
      referenceId: order.id,
      referenceType: 'order',
      referenceNumber: order.orderNumber,
      createdBy: 'System',
    });

    // Auto post
    journalEntryService.postEntry(entry.id, 'System');

    return entry;
  }

  // Auto create journal entry from supplier payment
  createFromPayment(payment: any): JournalEntry {
    const payableAccount = chartOfAccountsService.getByCode('2-1001'); // Hutang Usaha
    let cashAccount = chartOfAccountsService.getByCode('1-1001'); // Kas

    // Use bank if transfer
    if (payment.method === 'transfer') {
      cashAccount = chartOfAccountsService.getByCode('1-1002'); // Bank
    }

    if (!payableAccount || !cashAccount) {
      throw new Error('Required accounts not found');
    }

    const lines: JournalEntryLine[] = [
      {
        id: '1',
        accountId: payableAccount.id,
        accountCode: payableAccount.code,
        accountName: payableAccount.name,
        description: `Pembayaran ${payment.paymentNumber} - ${payment.supplierName}`,
        debit: payment.amount,
        credit: 0,
        referenceId: payment.id,
        referenceType: 'payment',
      },
      {
        id: '2',
        accountId: cashAccount.id,
        accountCode: cashAccount.code,
        accountName: cashAccount.name,
        description: `Pembayaran ${payment.paymentNumber} - ${payment.supplierName}`,
        debit: 0,
        credit: payment.amount,
        referenceId: payment.id,
        referenceType: 'payment',
      },
    ];

    const entry = journalEntryService.createEntry({
      date: payment.paidAt,
      type: 'payment',
      status: 'draft',
      description: `Pembayaran Supplier - ${payment.paymentNumber}`,
      lines,
      referenceId: payment.id,
      referenceType: 'payment',
      referenceNumber: payment.paymentNumber,
      createdBy: 'System',
    });

    // Auto post
    journalEntryService.postEntry(entry.id, 'System');

    return entry;
  }

  // Auto create journal entry from purchase order
  createFromPurchaseOrder(po: any): JournalEntry {
    const inventoryAccount = chartOfAccountsService.getByCode('1-1201'); // Persediaan
    const payableAccount = chartOfAccountsService.getByCode('2-1001'); // Hutang Usaha

    if (!inventoryAccount || !payableAccount) {
      throw new Error('Required accounts not found');
    }

    const lines: JournalEntryLine[] = [
      {
        id: '1',
        accountId: inventoryAccount.id,
        accountCode: inventoryAccount.code,
        accountName: inventoryAccount.name,
        description: `Pembelian ${po.poNumber} - ${po.supplierName}`,
        debit: po.totalAmount,
        credit: 0,
        referenceId: po.id,
        referenceType: 'purchase_order',
      },
      {
        id: '2',
        accountId: payableAccount.id,
        accountCode: payableAccount.code,
        accountName: payableAccount.name,
        description: `Pembelian ${po.poNumber} - ${po.supplierName}`,
        debit: 0,
        credit: po.totalAmount,
        referenceId: po.id,
        referenceType: 'purchase_order',
      },
    ];

    const entry = journalEntryService.createEntry({
      date: po.createdAt,
      type: 'purchase',
      status: 'draft',
      description: `Pembelian - ${po.poNumber}`,
      lines,
      referenceId: po.id,
      referenceType: 'purchase_order',
      referenceNumber: po.poNumber,
      createdBy: 'System',
    });

    // Auto post
    journalEntryService.postEntry(entry.id, 'System');

    return entry;
  }

  // Auto create journal entry from payroll
  createFromPayroll(payroll: any): JournalEntry {
    const salaryExpenseAccount = chartOfAccountsService.getByCode('6-1001'); // Beban Gaji
    const cashAccount = chartOfAccountsService.getByCode('1-1001'); // Kas

    if (!salaryExpenseAccount || !cashAccount) {
      throw new Error('Required accounts not found');
    }

    const lines: JournalEntryLine[] = [
      {
        id: '1',
        accountId: salaryExpenseAccount.id,
        accountCode: salaryExpenseAccount.code,
        accountName: salaryExpenseAccount.name,
        description: `Gaji ${payroll.period} - ${payroll.employeeName}`,
        debit: payroll.netSalary,
        credit: 0,
        referenceId: payroll.id,
        referenceType: 'payroll',
      },
      {
        id: '2',
        accountId: cashAccount.id,
        accountCode: cashAccount.code,
        accountName: cashAccount.name,
        description: `Gaji ${payroll.period} - ${payroll.employeeName}`,
        debit: 0,
        credit: payroll.netSalary,
        referenceId: payroll.id,
        referenceType: 'payroll',
      },
    ];

    const entry = journalEntryService.createEntry({
      date: payroll.createdAt,
      type: 'payroll',
      status: 'draft',
      description: `Pembayaran Gaji - ${payroll.period}`,
      lines,
      referenceId: payroll.id,
      referenceType: 'payroll',
      createdBy: 'System',
    });

    // Auto post
    journalEntryService.postEntry(entry.id, 'System');

    return entry;
  }

  // Auto create journal entry from cashflow entry
  createFromCashflow(cashflow: any): JournalEntry {
    let primaryAccount: ChartOfAccount | undefined;
    let cashAccount = chartOfAccountsService.getByCode('1-1001'); // Kas

    // Use bank if transfer
    if (cashflow.paymentMethod === 'transfer') {
      cashAccount = chartOfAccountsService.getByCode('1-1002'); // Bank
    }

    // Map cashflow category to account
    const categoryMapping: Record<string, string> = {
      // Inflow
      sales_revenue: '4-1001',
      service_revenue: '4-2001',
      other_income: '4-9001',
      // Outflow
      supplier_payment: '2-1001',
      salary_wages: '6-1001',
      rent: '6-2001',
      utilities: '6-2002',
      marketing: '6-3001',
      transportation: '6-1002',
      office_supplies: '6-4001',
    };

    const accountCode = categoryMapping[cashflow.category];
    if (accountCode) {
      primaryAccount = chartOfAccountsService.getByCode(accountCode);
    }

    if (!primaryAccount || !cashAccount) {
      throw new Error('Required accounts not found');
    }

    const lines: JournalEntryLine[] = [];

    if (cashflow.type === 'inflow') {
      lines.push(
        {
          id: '1',
          accountId: cashAccount.id,
          accountCode: cashAccount.code,
          accountName: cashAccount.name,
          description: cashflow.description,
          debit: cashflow.amount,
          credit: 0,
          referenceId: cashflow.id,
          referenceType: 'cashflow',
        },
        {
          id: '2',
          accountId: primaryAccount.id,
          accountCode: primaryAccount.code,
          accountName: primaryAccount.name,
          description: cashflow.description,
          debit: 0,
          credit: cashflow.amount,
          referenceId: cashflow.id,
          referenceType: 'cashflow',
        }
      );
    } else {
      lines.push(
        {
          id: '1',
          accountId: primaryAccount.id,
          accountCode: primaryAccount.code,
          accountName: primaryAccount.name,
          description: cashflow.description,
          debit: cashflow.amount,
          credit: 0,
          referenceId: cashflow.id,
          referenceType: 'cashflow',
        },
        {
          id: '2',
          accountId: cashAccount.id,
          accountCode: cashAccount.code,
          accountName: cashAccount.name,
          description: cashflow.description,
          debit: 0,
          credit: cashflow.amount,
          referenceId: cashflow.id,
          referenceType: 'cashflow',
        }
      );
    }

    const entry = journalEntryService.createEntry({
      date: cashflow.date,
      type: 'manual',
      status: 'draft',
      description: cashflow.description,
      lines,
      referenceId: cashflow.id,
      referenceType: 'cashflow',
      createdBy: cashflow.recordedBy || 'System',
    });

    // Auto post
    journalEntryService.postEntry(entry.id, 'System');

    return entry;
  }
}

// Export services
export const chartOfAccountsService = new ChartOfAccountsService();
export const journalEntryService = new JournalEntryService();
export const ledgerService = new GeneralLedgerService();
export const accountingReportsService = new AccountingReportsService();
export const autoJournalService = new AutoJournalService();
