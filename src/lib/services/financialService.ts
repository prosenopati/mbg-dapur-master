import { CashflowEntry, FinancialSummary, CashflowType, CashflowCategory } from '../types/workflow';
import { StorageService } from './storage';
import { orderService } from './orderService';
import { paymentService } from './paymentService';
import { invoiceService } from './receivingService';

// Category labels in Indonesian
export const CATEGORY_LABELS: Record<CashflowCategory, string> = {
  // Inflow
  sales_revenue: 'Pendapatan Penjualan',
  service_revenue: 'Pendapatan Jasa',
  other_income: 'Pendapatan Lain-lain',
  investment_income: 'Pendapatan Investasi',
  // Outflow
  supplier_payment: 'Pembayaran Supplier',
  salary_wages: 'Gaji & Upah',
  rent: 'Sewa',
  utilities: 'Utilitas (Listrik, Air, dll)',
  maintenance: 'Pemeliharaan & Perbaikan',
  marketing: 'Pemasaran',
  transportation: 'Transportasi',
  office_supplies: 'Perlengkapan Kantor',
  professional_fees: 'Jasa Profesional',
  taxes_fees: 'Pajak & Biaya',
  other_expense: 'Biaya Lain-lain',
};

export const INFLOW_CATEGORIES: CashflowCategory[] = [
  'sales_revenue',
  'service_revenue',
  'other_income',
  'investment_income',
];

export const OUTFLOW_CATEGORIES: CashflowCategory[] = [
  'supplier_payment',
  'salary_wages',
  'rent',
  'utilities',
  'maintenance',
  'marketing',
  'transportation',
  'office_supplies',
  'professional_fees',
  'taxes_fees',
  'other_expense',
];

class CashflowService extends StorageService<CashflowEntry> {
  constructor() {
    super('mbg_cashflow');
  }

  recordEntry(data: Omit<CashflowEntry, 'id' | 'createdAt'>): CashflowEntry {
    const entry: CashflowEntry = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    return this.create(entry);
  }

  getByType(type: CashflowType): CashflowEntry[] {
    return this.getAll().filter(e => e.type === type);
  }

  getByCategory(category: CashflowCategory): CashflowEntry[] {
    return this.getAll().filter(e => e.category === category);
  }

  getByDateRange(startDate: string, endDate: string): CashflowEntry[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.getAll().filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= start && entryDate <= end;
    });
  }

  getInflows(startDate?: string, endDate?: string): CashflowEntry[] {
    const entries = startDate && endDate 
      ? this.getByDateRange(startDate, endDate)
      : this.getAll();
    return entries.filter(e => e.type === 'inflow');
  }

  getOutflows(startDate?: string, endDate?: string): CashflowEntry[] {
    const entries = startDate && endDate 
      ? this.getByDateRange(startDate, endDate)
      : this.getAll();
    return entries.filter(e => e.type === 'outflow');
  }

  calculateBalance(startDate?: string, endDate?: string): number {
    const entries = startDate && endDate 
      ? this.getByDateRange(startDate, endDate)
      : this.getAll();

    return entries.reduce((balance, entry) => {
      return entry.type === 'inflow' 
        ? balance + entry.amount 
        : balance - entry.amount;
    }, 0);
  }

  getInflowsByCategory(startDate: string, endDate: string): { category: CashflowCategory; amount: number }[] {
    const entries = this.getInflows(startDate, endDate);
    const categoryMap: { [key in CashflowCategory]?: number } = {};

    entries.forEach(entry => {
      categoryMap[entry.category] = (categoryMap[entry.category] || 0) + entry.amount;
    });

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category: category as CashflowCategory, amount: amount! }))
      .sort((a, b) => b.amount - a.amount);
  }

  getOutflowsByCategory(startDate: string, endDate: string): { category: CashflowCategory; amount: number }[] {
    const entries = this.getOutflows(startDate, endDate);
    const categoryMap: { [key in CashflowCategory]?: number } = {};

    entries.forEach(entry => {
      categoryMap[entry.category] = (categoryMap[entry.category] || 0) + entry.amount;
    });

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category: category as CashflowCategory, amount: amount! }))
      .sort((a, b) => b.amount - a.amount);
  }
}

class FinancialReportService {
  generateSummary(startDate: string, endDate: string): FinancialSummary {
    // Get revenue from completed orders
    const orders = orderService.getAll().filter(o => {
      if (o.status !== 'delivered' || !o.completedAt) return false;
      const completedDate = new Date(o.completedAt);
      return completedDate >= new Date(startDate) && completedDate <= new Date(endDate);
    });
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Get expenses from payments
    const payments = paymentService.getByDateRange(startDate, endDate);
    const totalExpenses = payments.reduce((sum, p) => sum + p.amount, 0);

    // Get pending payments
    const pendingInvoices = invoiceService.getPending();
    const pendingPayments = pendingInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

    // Calculate cash balance
    const cashBalance = cashflowService.calculateBalance(startDate, endDate);

    return {
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      pendingPayments,
      cashBalance,
      period: {
        startDate,
        endDate,
      },
    };
  }

  generateIncomeStatement(startDate: string, endDate: string) {
    const inflows = cashflowService.getInflowsByCategory(startDate, endDate);
    const outflows = cashflowService.getOutflowsByCategory(startDate, endDate);

    const totalIncome = inflows.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = outflows.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    return {
      period: { startDate, endDate },
      income: {
        items: inflows,
        total: totalIncome,
      },
      expenses: {
        items: outflows,
        total: totalExpenses,
      },
      netIncome,
    };
  }

  getRevenueByPeriod(startDate: string, endDate: string): { date: string; amount: number }[] {
    const orders = orderService.getAll().filter(o => {
      if (o.status !== 'delivered' || !o.completedAt) return false;
      const completedDate = new Date(o.completedAt);
      return completedDate >= new Date(startDate) && completedDate <= new Date(endDate);
    });

    const revenueMap: { [date: string]: number } = {};
    orders.forEach(order => {
      const date = order.completedAt!.split('T')[0];
      revenueMap[date] = (revenueMap[date] || 0) + order.totalAmount;
    });

    return Object.entries(revenueMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getExpensesByCategory(startDate: string, endDate: string): { category: string; amount: number }[] {
    const entries = cashflowService.getOutflows(startDate, endDate);
    const categoryMap: { [category: string]: number } = {};

    entries.forEach(entry => {
      categoryMap[entry.category] = (categoryMap[entry.category] || 0) + entry.amount;
    });

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  getCashflowTrend(startDate: string, endDate: string): { date: string; inflow: number; outflow: number; balance: number }[] {
    const entries = cashflowService.getByDateRange(startDate, endDate);
    const dateMap: { [date: string]: { inflow: number; outflow: number } } = {};

    entries.forEach(entry => {
      const date = entry.date.split('T')[0];
      if (!dateMap[date]) {
        dateMap[date] = { inflow: 0, outflow: 0 };
      }
      if (entry.type === 'inflow') {
        dateMap[date].inflow += entry.amount;
      } else {
        dateMap[date].outflow += entry.amount;
      }
    });

    let runningBalance = 0;
    return Object.entries(dateMap)
      .map(([date, { inflow, outflow }]) => {
        runningBalance += inflow - outflow;
        return { date, inflow, outflow, balance: runningBalance };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const cashflowService = new CashflowService();
export const financialReportService = new FinancialReportService();