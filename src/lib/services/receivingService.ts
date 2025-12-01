import { GoodsReceipt, SupplierInvoice, ThreeWayMatch, ReceivingStatus } from '../types/workflow';
import { StorageService } from './storage';
import { purchaseOrderService } from './purchaseOrderService';

class GoodsReceiptService extends StorageService<GoodsReceipt> {
  constructor() {
    super('mbg_goods_receipts');
  }

  private generateGRNumber(): string {
    const count = this.getAll().length + 1;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `GR-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  createGR(data: Omit<GoodsReceipt, 'id' | 'grNumber' | 'createdAt' | 'updatedAt'>): GoodsReceipt {
    const grNumber = this.generateGRNumber();
    
    // Determine status based on received quantities
    let status: ReceivingStatus = 'completed';
    let hasDiscrepancy = false;

    for (const item of data.items) {
      if (item.receivedQuantity < item.orderedQuantity) {
        status = 'partial';
      }
      if (item.receivedQuantity !== item.orderedQuantity) {
        hasDiscrepancy = true;
      }
    }

    if (hasDiscrepancy && status === 'completed') {
      status = 'discrepancy';
    }

    const gr: GoodsReceipt = {
      ...data,
      id: Date.now().toString(),
      grNumber,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update PO status to received if completed
    if (status === 'completed') {
      purchaseOrderService.updateStatus(data.purchaseOrderId, 'received');
    }

    return this.create(gr);
  }

  getByPO(purchaseOrderId: string): GoodsReceipt[] {
    return this.getAll().filter(gr => gr.purchaseOrderId === purchaseOrderId);
  }

  getByStatus(status: ReceivingStatus): GoodsReceipt[] {
    return this.getAll().filter(gr => gr.status === status);
  }
}

class InvoiceService extends StorageService<SupplierInvoice> {
  constructor() {
    super('mbg_supplier_invoices');
  }

  createInvoice(data: Omit<SupplierInvoice, 'id' | 'createdAt' | 'updatedAt' | 'paidAmount' | 'remainingAmount' | 'status'>): SupplierInvoice {
    const invoice: SupplierInvoice = {
      ...data,
      id: Date.now().toString(),
      paidAmount: 0,
      remainingAmount: data.totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.create(invoice);
  }

  recordPayment(id: string, amount: number): SupplierInvoice | null {
    const invoice = this.getById(id);
    if (!invoice) return null;

    const paidAmount = invoice.paidAmount + amount;
    const remainingAmount = invoice.totalAmount - paidAmount;
    
    let status: SupplierInvoice['status'] = 'pending';
    if (remainingAmount === 0) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    }

    // Check if overdue
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    if (remainingAmount > 0 && now > dueDate) {
      status = 'overdue';
    }

    return this.update(id, { paidAmount, remainingAmount, status });
  }

  getByPO(purchaseOrderId: string): SupplierInvoice[] {
    return this.getAll().filter(inv => inv.purchaseOrderId === purchaseOrderId);
  }

  getPending(): SupplierInvoice[] {
    return this.getAll().filter(inv => inv.status === 'pending' || inv.status === 'partial');
  }

  getOverdue(): SupplierInvoice[] {
    return this.getAll().filter(inv => {
      if (inv.status === 'paid') return false;
      const dueDate = new Date(inv.dueDate);
      return dueDate < new Date();
    });
  }
}

class ThreeWayMatchService extends StorageService<ThreeWayMatch> {
  constructor() {
    super('mbg_three_way_matches');
  }

  performMatch(purchaseOrderId: string, goodsReceiptId?: string, invoiceId?: string): ThreeWayMatch {
    const po = purchaseOrderService.getById(purchaseOrderId);
    const gr = goodsReceiptId ? goodsReceiptService.getById(goodsReceiptId) : null;
    const invoice = invoiceId ? invoiceService.getById(invoiceId) : null;

    if (!po) {
      throw new Error('Purchase Order not found');
    }

    const discrepancies: string[] = [];

    // Check if goods receipt exists and matches
    if (gr) {
      for (const grItem of gr.items) {
        const poItem = po.items.find(i => i.inventoryItemId === grItem.inventoryItemId);
        if (!poItem) {
          discrepancies.push(`Item ${grItem.inventoryItemName} not found in PO`);
        } else if (grItem.receivedQuantity !== poItem.quantity) {
          discrepancies.push(`${grItem.inventoryItemName}: Ordered ${poItem.quantity}, Received ${grItem.receivedQuantity}`);
        }
      }
    }

    // Check if invoice matches
    if (invoice) {
      if (Math.abs(invoice.totalAmount - po.totalAmount) > 0.01) {
        discrepancies.push(`Invoice amount (${invoice.totalAmount}) differs from PO amount (${po.totalAmount})`);
      }
    }

    const status = discrepancies.length === 0 ? 'matched' : 'discrepancy';

    const match: ThreeWayMatch = {
      purchaseOrderId,
      goodsReceiptId,
      invoiceId,
      status,
      discrepancies,
      matchedAt: status === 'matched' ? new Date().toISOString() : undefined,
    };

    // Store or update the match
    const existing = this.getAll().find(m => m.purchaseOrderId === purchaseOrderId);
    if (existing) {
      this.update(existing.purchaseOrderId, match);
    } else {
      this.create({ ...match, id: purchaseOrderId });
    }

    return match;
  }

  getByPO(purchaseOrderId: string): ThreeWayMatch | undefined {
    return this.getAll().find(m => m.purchaseOrderId === purchaseOrderId);
  }

  getDiscrepancies(): ThreeWayMatch[] {
    return this.getAll().filter(m => m.status === 'discrepancy');
  }
}

export const goodsReceiptService = new GoodsReceiptService();
export const invoiceService = new InvoiceService();
export const threeWayMatchService = new ThreeWayMatchService();
