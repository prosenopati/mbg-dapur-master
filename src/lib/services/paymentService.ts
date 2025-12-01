import { PaymentRequest, Payment, PaymentStatus } from '../types/workflow';
import { StorageService } from './storage';
import { invoiceService } from './receivingService';

class PaymentRequestService extends StorageService<PaymentRequest> {
  constructor() {
    super('mbg_payment_requests');
  }

  private generateRequestNumber(): string {
    const count = this.getAll().length + 1;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `PAY-REQ-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  createRequest(data: Omit<PaymentRequest, 'id' | 'requestNumber' | 'status' | 'createdAt' | 'updatedAt'>): PaymentRequest {
    const requestNumber = this.generateRequestNumber();
    const request: PaymentRequest = {
      ...data,
      id: Date.now().toString(),
      requestNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.create(request);
  }

  updateStatus(id: string, status: PaymentStatus): PaymentRequest | null {
    return this.update(id, { status });
  }

  approve(id: string): PaymentRequest | null {
    return this.updateStatus(id, 'approved');
  }

  reject(id: string): PaymentRequest | null {
    return this.updateStatus(id, 'rejected');
  }

  markAsPaid(id: string): PaymentRequest | null {
    return this.updateStatus(id, 'paid');
  }

  getByStatus(status: PaymentStatus): PaymentRequest[] {
    return this.getAll().filter(pr => pr.status === status);
  }

  getByInvoice(invoiceId: string): PaymentRequest[] {
    return this.getAll().filter(pr => pr.invoiceId === invoiceId);
  }

  getPending(): PaymentRequest[] {
    return this.getByStatus('pending');
  }

  getApproved(): PaymentRequest[] {
    return this.getByStatus('approved');
  }
}

class PaymentService extends StorageService<Payment> {
  constructor() {
    super('mbg_payments');
  }

  private generatePaymentNumber(): string {
    const count = this.getAll().length + 1;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `PAY-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  recordPayment(data: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt'>): Payment {
    const paymentNumber = this.generatePaymentNumber();
    const payment: Payment = {
      ...data,
      id: Date.now().toString(),
      paymentNumber,
      createdAt: new Date().toISOString(),
    };

    // Update invoice with payment
    invoiceService.recordPayment(data.invoiceId, data.amount);

    // Update payment request if exists
    if (data.paymentRequestId) {
      const prService = paymentRequestService;
      prService.markAsPaid(data.paymentRequestId);
    }

    return this.create(payment);
  }

  getByInvoice(invoiceId: string): Payment[] {
    return this.getAll().filter(p => p.invoiceId === invoiceId);
  }

  getBySupplier(supplierId: string): Payment[] {
    return this.getAll().filter(p => p.supplierId === supplierId);
  }

  getByDateRange(startDate: string, endDate: string): Payment[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.getAll().filter(p => {
      const paymentDate = new Date(p.paidAt);
      return paymentDate >= start && paymentDate <= end;
    });
  }

  getTotalByPeriod(startDate: string, endDate: string): number {
    const payments = this.getByDateRange(startDate, endDate);
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }

  getByMethod(method: Payment['method']): Payment[] {
    return this.getAll().filter(p => p.method === method);
  }
}

export const paymentRequestService = new PaymentRequestService();
export const paymentService = new PaymentService();
