import { Payroll, PayrollItem } from '../types';
import { employeeService } from './employeeService';

class PayrollService {
  private readonly STORAGE_KEY = 'mbg_payrolls';

  private initializePayrolls(): Payroll[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get sample employees
    const employees = employeeService.getActiveEmployees();
    
    const payrolls: Payroll[] = [
      // Monthly Payroll - Previous Month (Paid)
      {
        id: 'pay1',
        payrollNumber: `PAY-${currentYear}-001`,
        title: `Gaji Bulanan ${this.getMonthName(currentMonth - 1)} ${currentYear}`,
        schedule: 'monthly',
        periodStart: new Date(currentYear, currentMonth - 1, 1).toISOString(),
        periodEnd: new Date(currentYear, currentMonth, 0).toISOString(),
        paymentDate: new Date(currentYear, currentMonth, 5).toISOString(),
        status: 'paid',
        items: employees.slice(0, 7).map(emp => ({
          employeeId: emp.id,
          employeeName: emp.fullName,
          employeeNumber: emp.employeeNumber,
          position: emp.position,
          amount: this.calculateMonthlyAmount(emp.position),
          notes: 'Gaji bulan penuh',
        })),
        totalAmount: 0,
        notes: 'Pembayaran gaji rutin bulanan',
        processedBy: 'u4',
        processedAt: new Date(currentYear, currentMonth, 4).toISOString(),
        createdBy: 'u4',
        createdAt: new Date(currentYear, currentMonth - 1, 28).toISOString(),
        updatedAt: new Date(currentYear, currentMonth, 5).toISOString(),
      },
      // Monthly Payroll - Current Month (Processed)
      {
        id: 'pay2',
        payrollNumber: `PAY-${currentYear}-002`,
        title: `Gaji Bulanan ${this.getMonthName(currentMonth)} ${currentYear}`,
        schedule: 'monthly',
        periodStart: new Date(currentYear, currentMonth, 1).toISOString(),
        periodEnd: new Date(currentYear, currentMonth + 1, 0).toISOString(),
        paymentDate: new Date(currentYear, currentMonth + 1, 5).toISOString(),
        status: 'processed',
        items: employees.slice(0, 7).map(emp => ({
          employeeId: emp.id,
          employeeName: emp.fullName,
          employeeNumber: emp.employeeNumber,
          position: emp.position,
          amount: this.calculateMonthlyAmount(emp.position),
        })),
        totalAmount: 0,
        notes: 'Pembayaran gaji rutin bulanan',
        processedBy: 'u4',
        processedAt: new Date(currentYear, currentMonth, 28).toISOString(),
        createdBy: 'u4',
        createdAt: new Date(currentYear, currentMonth, 25).toISOString(),
        updatedAt: new Date(currentYear, currentMonth, 28).toISOString(),
      },
      // Weekly Payroll (Paid)
      {
        id: 'pay3',
        payrollNumber: `PAY-${currentYear}-003`,
        title: `Honor Mingguan Week 4 - ${this.getMonthName(currentMonth)} ${currentYear}`,
        schedule: 'weekly',
        periodStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: now.toISOString(),
        paymentDate: now.toISOString(),
        status: 'paid',
        items: employees.slice(7, 9).map(emp => ({
          employeeId: emp.id,
          employeeName: emp.fullName,
          employeeNumber: emp.employeeNumber,
          position: emp.position,
          amount: 800000,
          notes: 'Honor mingguan',
        })),
        totalAmount: 0,
        notes: 'Pembayaran honor mingguan part-time staff',
        processedBy: 'u4',
        processedAt: now.toISOString(),
        createdBy: 'u4',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      // Daily Payroll (Paid)
      {
        id: 'pay4',
        payrollNumber: `PAY-${currentYear}-004`,
        title: `Honor Harian - ${now.toLocaleDateString('id-ID')}`,
        schedule: 'daily',
        periodStart: new Date(now.setHours(0, 0, 0, 0)).toISOString(),
        periodEnd: new Date(now.setHours(23, 59, 59, 999)).toISOString(),
        paymentDate: now.toISOString(),
        status: 'paid',
        items: [
          {
            employeeId: employees[9].id,
            employeeName: employees[9].fullName,
            employeeNumber: employees[9].employeeNumber,
            position: employees[9].position,
            amount: 150000,
            notes: 'Pengiriman ke sekolah-sekolah',
          },
          {
            employeeId: employees[10].id,
            employeeName: employees[10].fullName,
            employeeNumber: employees[10].employeeNumber,
            position: employees[10].position,
            amount: 150000,
            notes: 'Pengiriman ke sekolah-sekolah',
          },
        ],
        totalAmount: 0,
        notes: 'Honor harian untuk kurir kontrak',
        processedBy: 'u4',
        processedAt: now.toISOString(),
        createdBy: 'u4',
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: now.toISOString(),
      },
      // Custom Amount (Pending)
      {
        id: 'pay5',
        payrollNumber: `PAY-${currentYear}-005`,
        title: 'Bonus Kinerja Tim Dapur',
        schedule: 'custom',
        periodStart: new Date(currentYear, currentMonth, 1).toISOString(),
        periodEnd: now.toISOString(),
        paymentDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        items: [
          {
            employeeId: employees[0].id,
            employeeName: employees[0].fullName,
            employeeNumber: employees[0].employeeNumber,
            position: employees[0].position,
            amount: 2000000,
            notes: 'Bonus pencapaian target produksi',
          },
          {
            employeeId: employees[6].id,
            employeeName: employees[6].fullName,
            employeeNumber: employees[6].employeeNumber,
            position: employees[6].position,
            amount: 1000000,
            notes: 'Bonus kinerja baik',
          },
        ],
        totalAmount: 0,
        notes: 'Bonus kinerja bulanan untuk tim dapur',
        createdBy: 'u2',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    // Calculate total amounts
    payrolls.forEach(payroll => {
      payroll.totalAmount = payroll.items.reduce((sum, item) => sum + item.amount, 0);
    });
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payrolls));
    return payrolls;
  }

  private getMonthName(month: number): string {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month < 0 ? month + 12 : month % 12];
  }

  private calculateMonthlyAmount(position: string): number {
    const salaryMap: Record<string, number> = {
      'Kepala Dapur': 6000000,
      'HR Manager': 7000000,
      'Finance Manager': 7500000,
      'Asisten Dapur': 4500000,
      'Driver/Kurir': 4000000,
    };
    return salaryMap[position] || 4000000;
  }

  getAll(): Payroll[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return this.initializePayrolls();
    }
    return JSON.parse(stored);
  }

  getById(id: string): Payroll | undefined {
    return this.getAll().find(p => p.id === id);
  }

  getByStatus(status: string): Payroll[] {
    return this.getAll().filter(p => p.status === status);
  }

  getBySchedule(schedule: string): Payroll[] {
    return this.getAll().filter(p => p.schedule === schedule);
  }

  getByDateRange(startDate: string, endDate: string): Payroll[] {
    return this.getAll().filter(p => 
      p.periodStart >= startDate && p.periodEnd <= endDate
    );
  }

  create(payrollData: Omit<Payroll, 'id' | 'payrollNumber' | 'totalAmount' | 'createdAt' | 'updatedAt'>): Payroll {
    const payrolls = this.getAll();
    const year = new Date().getFullYear();
    const yearPayrolls = payrolls.filter(p => 
      p.payrollNumber.startsWith(`PAY-${year}`)
    );
    const nextNumber = yearPayrolls.length + 1;
    
    const totalAmount = payrollData.items.reduce((sum, item) => sum + item.amount, 0);
    
    const newPayroll: Payroll = {
      ...payrollData,
      id: `pay${Date.now()}`,
      payrollNumber: `PAY-${year}-${String(nextNumber).padStart(3, '0')}`,
      totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    payrolls.push(newPayroll);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payrolls));
    return newPayroll;
  }

  update(id: string, updates: Partial<Omit<Payroll, 'id' | 'payrollNumber' | 'createdAt'>>): Payroll | null {
    const payrolls = this.getAll();
    const index = payrolls.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    // Recalculate total if items changed
    let totalAmount = payrolls[index].totalAmount;
    if (updates.items) {
      totalAmount = updates.items.reduce((sum, item) => sum + item.amount, 0);
    }
    
    payrolls[index] = {
      ...payrolls[index],
      ...updates,
      totalAmount,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payrolls));
    return payrolls[index];
  }

  delete(id: string): boolean {
    const payrolls = this.getAll();
    const filtered = payrolls.filter(p => p.id !== id);
    if (filtered.length === payrolls.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  processPayroll(id: string, processedBy: string): Payroll | null {
    return this.update(id, {
      status: 'processed',
      processedBy,
      processedAt: new Date().toISOString(),
    });
  }

  markAsPaid(id: string): Payroll | null {
    return this.update(id, {
      status: 'paid',
    });
  }

  cancelPayroll(id: string): Payroll | null {
    return this.update(id, {
      status: 'cancelled',
    });
  }

  getTotalByStatus(status: string): number {
    const payrolls = this.getByStatus(status);
    return payrolls.reduce((sum, p) => sum + p.totalAmount, 0);
  }

  getTotalByPeriod(startDate: string, endDate: string): number {
    const payrolls = this.getByDateRange(startDate, endDate);
    return payrolls.reduce((sum, p) => sum + p.totalAmount, 0);
  }
}

export const payrollService = new PayrollService();
