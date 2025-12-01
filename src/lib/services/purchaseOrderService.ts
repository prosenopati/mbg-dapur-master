import { PurchaseOrder, POStatus } from '../types/workflow';
import { StorageService } from './storage';
import { notificationService } from './notificationService';
import { invoiceService } from './invoiceService';

class PurchaseOrderService extends StorageService<PurchaseOrder> {
  constructor() {
    super('mbg_purchase_orders');
    this.initializeSampleData();
  }

  private generatePONumber(): string {
    const count = this.getAll().length + 1;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `PO-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  private initializeSampleData() {
    if (this.getAll().length === 0) {
      const samplePO: PurchaseOrder = {
        id: '1',
        poNumber: this.generatePONumber(),
        supplierId: '1',
        supplierName: 'Toko Sumber Pangan',
        items: [
          {
            inventoryItemId: '1',
            inventoryItemName: 'Beras',
            quantity: 100,
            unit: 'kg',
            unitPrice: 12000,
            totalPrice: 1200000,
          },
          {
            inventoryItemId: '4',
            inventoryItemName: 'Minyak Goreng',
            quantity: 20,
            unit: 'liter',
            unitPrice: 18000,
            totalPrice: 360000,
          },
        ],
        subtotal: 1560000,
        tax: 156000,
        totalAmount: 1716000,
        status: 'approved',
        requestedBy: 'Admin',
        approvedBy: 'Manager',
        approvedAt: new Date().toISOString(),
        expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.create(samplePO);
    }
  }

  createPO(data: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt'>): PurchaseOrder {
    const poNumber = this.generatePONumber();
    const po: PurchaseOrder = {
      ...data,
      id: Date.now().toString(),
      poNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.create(po);
  }

  updateStatus(id: string, status: POStatus, metadata?: { approvedBy?: string; sentAt?: string }): PurchaseOrder | null {
    const po = this.getById(id);
    if (!po) return null;

    const updates: Partial<PurchaseOrder> = { status };

    if (status === 'approved' && metadata?.approvedBy) {
      updates.approvedBy = metadata.approvedBy;
      updates.approvedAt = new Date().toISOString();
    }

    if (status === 'sent') {
      updates.sentAt = metadata?.sentAt || new Date().toISOString();
      
      // Send notification to supplier
      notificationService.notifyPOSentToSupplier(
        po.id,
        po.poNumber,
        po.supplierName
      );
    }

    return this.update(id, updates);
  }

  // Supplier approves PO - triggers invoice generation
  supplierApprovePO(id: string, approvedBy: string): { po: PurchaseOrder; invoice: any } | null {
    const po = this.getById(id);
    if (!po) return null;

    const updates: Partial<PurchaseOrder> = {
      status: 'supplier_approved',
      supplierApprovedAt: new Date().toISOString(),
      supplierApprovedBy: approvedBy,
    };

    const updatedPO = this.update(id, updates);
    if (!updatedPO) return null;

    // Notify manager
    notificationService.notifyPOApprovedBySupplier(
      po.id,
      po.poNumber,
      po.supplierName
    );

    // Auto-generate invoice
    const invoice = invoiceService.generateFromPO(updatedPO);
    
    // Link invoice to PO
    this.update(id, { invoiceId: invoice.id });

    // Notify finance about new invoice
    notificationService.notifyInvoiceGenerated(
      invoice.id,
      invoice.invoiceNumber,
      po.poNumber,
      invoice.totalAmount
    );

    return { po: updatedPO, invoice };
  }

  // Supplier rejects PO
  supplierRejectPO(id: string, reason: string): PurchaseOrder | null {
    const po = this.getById(id);
    if (!po) return null;

    const updates: Partial<PurchaseOrder> = {
      status: 'supplier_rejected',
      supplierRejectedAt: new Date().toISOString(),
      supplierRejectionReason: reason,
    };

    const updatedPO = this.update(id, updates);
    if (!updatedPO) return null;

    // Notify manager
    notificationService.notifyPORejectedBySupplier(
      po.id,
      po.poNumber,
      po.supplierName,
      reason
    );

    return updatedPO;
  }

  getByStatus(status: POStatus): PurchaseOrder[] {
    return this.getAll().filter(po => po.status === status);
  }

  getBySupplier(supplierId: string): PurchaseOrder[] {
    return this.getAll().filter(po => po.supplierId === supplierId);
  }

  getPendingApproval(): PurchaseOrder[] {
    return this.getByStatus('pending_approval');
  }

  getApproved(): PurchaseOrder[] {
    return this.getAll().filter(po => 
      po.status === 'approved' || po.status === 'sent'
    );
  }

  // Get POs waiting for supplier response
  getPendingSupplierResponse(): PurchaseOrder[] {
    return this.getByStatus('sent');
  }
}

export const purchaseOrderService = new PurchaseOrderService();