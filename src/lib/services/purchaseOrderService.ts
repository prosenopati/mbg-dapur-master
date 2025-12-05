import { PurchaseOrder, POStatus } from '../types/workflow';
import { StorageService } from './storage';
import { notificationService } from './notificationService';
import { invoiceService } from './invoiceService';
import { workflowService } from './workflowService';

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
        kitchenId: 'dapur-mbg-1',
        kitchenName: 'Dapur MBG Pusat',
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
        status: 'sent',
        requestedBy: 'Admin Dapur MBG',
        approvedBy: 'Manager Dapur',
        approvedAt: new Date(Date.now() - 3600000).toISOString(),
        sentAt: new Date(Date.now() - 1800000).toISOString(),
        expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
        workflowProgress: 40,
        currentStep: 'Menunggu Supplier Accept',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.create(samplePO);
      workflowService.initializeWorkflow(samplePO.id);
    }
  }

  createPO(data: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt' | 'updatedAt' | 'workflowProgress' | 'currentStep'>): PurchaseOrder {
    const poNumber = this.generatePONumber();
    const po: PurchaseOrder = {
      ...data,
      id: Date.now().toString(),
      poNumber,
      workflowProgress: 10,
      currentStep: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const created = this.create(po);
    
    // Initialize workflow
    workflowService.initializeWorkflow(created.id);
    
    return created;
  }

  updateStatus(id: string, status: POStatus, metadata?: { approvedBy?: string; sentAt?: string }): PurchaseOrder | null {
    const po = this.getById(id);
    if (!po) return null;

    const updates: Partial<PurchaseOrder> = { status };

    // Update workflow based on status
    if (status === 'pending_approval') {
      updates.workflowProgress = 20;
      updates.currentStep = 'Menunggu Approval';
      workflowService.updateStep(id, 'draft', 'completed');
      workflowService.updateStep(id, 'approval', 'in_progress');
    }

    if (status === 'approved' && metadata?.approvedBy) {
      updates.approvedBy = metadata.approvedBy;
      updates.approvedAt = new Date().toISOString();
      updates.workflowProgress = 30;
      updates.currentStep = 'Approved - Siap Kirim';
      workflowService.updateStep(id, 'approval', 'completed', { completedBy: metadata.approvedBy });
    }

    if (status === 'sent') {
      updates.sentAt = metadata?.sentAt || new Date().toISOString();
      updates.workflowProgress = 40;
      updates.currentStep = 'Menunggu Supplier Accept';
      
      workflowService.updateStep(id, 'sent_to_supplier', 'completed');
      workflowService.updateStep(id, 'supplier_accept', 'in_progress');
      
      // Send notification to supplier
      notificationService.notifyPOSentToSupplier(
        po.id,
        po.poNumber,
        po.supplierName
      );
    }

    if (status === 'supplier_approved') {
      updates.workflowProgress = 50;
      updates.currentStep = 'Proforma Invoice';
      workflowService.updateStep(id, 'supplier_accept', 'completed');
      workflowService.updateStep(id, 'proforma_invoice', 'completed');
    }

    if (status === 'in_transit') {
      updates.workflowProgress = 60;
      updates.currentStep = 'Dalam Pengiriman';
      workflowService.updateStep(id, 'shipment', 'in_progress');
    }

    if (status === 'received') {
      updates.workflowProgress = 70;
      updates.currentStep = 'Barang Diterima - QC';
      workflowService.updateStep(id, 'shipment', 'completed');
      workflowService.updateStep(id, 'receiving', 'completed');
      workflowService.updateStep(id, 'qc', 'in_progress');
    }

    if (status === 'qc_passed') {
      updates.workflowProgress = 80;
      updates.currentStep = 'QC Pass - Invoice Final';
      workflowService.updateStep(id, 'qc', 'completed');
      workflowService.updateStep(id, 'final_invoice', 'in_progress');
    }

    if (status === 'completed') {
      updates.workflowProgress = 100;
      updates.currentStep = 'Completed';
      workflowService.updateStep(id, 'payment', 'completed');
    }

    return this.update(id, updates);
  }

  // Supplier approves PO - triggers proforma invoice generation
  supplierApprovePO(id: string, approvedBy: string): { po: PurchaseOrder; invoice: any } | null {
    const po = this.getById(id);
    if (!po) return null;

    const updates: Partial<PurchaseOrder> = {
      status: 'supplier_approved',
      supplierApprovedAt: new Date().toISOString(),
      supplierApprovedBy: approvedBy,
      workflowProgress: 50,
      currentStep: 'Proforma Invoice Dibuat',
    };

    const updatedPO = this.update(id, updates);
    if (!updatedPO) return null;

    // Update workflow
    workflowService.updateStep(id, 'supplier_accept', 'completed', { completedBy: approvedBy });
    workflowService.updateStep(id, 'proforma_invoice', 'completed');
    workflowService.updateStep(id, 'shipment', 'in_progress');

    // Notify manager/kitchen
    notificationService.notifyPOApprovedBySupplier(
      po.id,
      po.poNumber,
      po.supplierName
    );

    // Auto-generate proforma invoice
    const invoice = invoiceService.generateFromPO(updatedPO, 'proforma');
    
    // Link invoice to PO
    this.update(id, { proformaInvoiceId: invoice.id });

    // Notify finance about new invoice
    notificationService.notifyInvoiceGenerated(
      invoice.id,
      invoice.invoiceNumber,
      po.poNumber,
      invoice.totalAmount
    );

    return { po: updatedPO, invoice };
  }

  // Supplier rejects PO - notification sent back to kitchen/dapur
  supplierRejectPO(id: string, reason: string): PurchaseOrder | null {
    const po = this.getById(id);
    if (!po) return null;

    const updates: Partial<PurchaseOrder> = {
      status: 'supplier_rejected',
      supplierRejectedAt: new Date().toISOString(),
      supplierRejectionReason: reason,
      currentStep: 'Ditolak Supplier - Alasan: ' + reason,
    };

    const updatedPO = this.update(id, updates);
    if (!updatedPO) return null;

    // Update workflow
    workflowService.updateStep(id, 'supplier_accept', 'failed', { notes: reason });

    // Notify kitchen/dapur manager about rejection
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