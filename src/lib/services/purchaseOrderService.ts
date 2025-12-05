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
      // PO #1 - Dapur MBG Pusat ke Toko Sumber Pangan
      const samplePO1: PurchaseOrder = {
        id: '1',
        poNumber: 'PO-202412-0001',
        kitchenId: 'dapur-mbg-1',
        kitchenName: 'Dapur MBG Pusat',
        supplierId: '1',
        supplierName: 'Toko Sumber Pangan',
        items: [
          {
            inventoryItemId: '1',
            inventoryItemName: 'Beras Premium',
            quantity: 100,
            unit: 'kg',
            unitPrice: 12000,
            totalPrice: 1200000,
            notes: 'Varietas IR64, beras putih berkualitas tinggi',
          },
          {
            inventoryItemId: '4',
            inventoryItemName: 'Minyak Goreng',
            quantity: 20,
            unit: 'liter',
            unitPrice: 18000,
            totalPrice: 360000,
            notes: 'Minyak goreng kemasan jerigen',
          },
          {
            inventoryItemId: '2',
            inventoryItemName: 'Ayam Potong',
            quantity: 50,
            unit: 'kg',
            unitPrice: 35000,
            totalPrice: 1750000,
            notes: 'Ayam segar, potong standar',
          },
        ],
        subtotal: 3310000,
        tax: 331000,
        totalAmount: 3641000,
        status: 'sent',
        requestedBy: 'Ibu Sari Rahmawati',
        approvedBy: 'Manager Operasional',
        approvedAt: new Date(Date.now() - 7200000).toISOString(),
        sentAt: new Date(Date.now() - 3600000).toISOString(),
        expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
        notes: 'Mohon dikirim sesuai jadwal, untuk kebutuhan produksi minggu ini',
        workflowProgress: 40,
        currentStep: 'Menunggu Supplier Accept',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // PO #2 - Dapur MBG Barat ke Pasar Tradisional
      const samplePO2: PurchaseOrder = {
        id: '2',
        poNumber: 'PO-202412-0002',
        kitchenId: 'dapur-mbg-2',
        kitchenName: 'Dapur MBG Barat',
        supplierId: '2',
        supplierName: 'Pasar Tradisional',
        items: [
          {
            inventoryItemId: '5',
            inventoryItemName: 'Sayur Kangkung',
            quantity: 30,
            unit: 'kg',
            unitPrice: 8000,
            totalPrice: 240000,
            notes: 'Kangkung segar, pagi hari',
          },
          {
            inventoryItemId: '6',
            inventoryItemName: 'Tomat',
            quantity: 25,
            unit: 'kg',
            unitPrice: 12000,
            totalPrice: 300000,
            notes: 'Tomat merah segar',
          },
          {
            inventoryItemId: '7',
            inventoryItemName: 'Bawang Merah',
            quantity: 15,
            unit: 'kg',
            unitPrice: 35000,
            totalPrice: 525000,
            notes: 'Bawang merah kualitas baik',
          },
          {
            inventoryItemId: '8',
            inventoryItemName: 'Cabai Merah',
            quantity: 10,
            unit: 'kg',
            unitPrice: 45000,
            totalPrice: 450000,
            notes: 'Cabai merah keriting',
          },
        ],
        subtotal: 1515000,
        tax: 151500,
        totalAmount: 1666500,
        status: 'sent',
        requestedBy: 'Bapak Rudi Hartono',
        approvedBy: 'Manager Operasional',
        approvedAt: new Date(Date.now() - 5400000).toISOString(),
        sentAt: new Date(Date.now() - 1800000).toISOString(),
        expectedDelivery: new Date(Date.now() + 2 * 86400000).toISOString(),
        notes: 'Permintaan sayur segar untuk produksi menu vegetarian',
        workflowProgress: 40,
        currentStep: 'Menunggu Supplier Accept',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // PO #3 - Dapur MBG Timur ke PT Sayur Segar
      const samplePO3: PurchaseOrder = {
        id: '3',
        poNumber: 'PO-202412-0003',
        kitchenId: 'dapur-mbg-3',
        kitchenName: 'Dapur MBG Timur',
        supplierId: '3',
        supplierName: 'PT Sayur Segar',
        items: [
          {
            inventoryItemId: '1',
            inventoryItemName: 'Beras Premium',
            quantity: 80,
            unit: 'kg',
            unitPrice: 12500,
            totalPrice: 1000000,
            notes: 'Beras premium untuk menu spesial',
          },
          {
            inventoryItemId: '9',
            inventoryItemName: 'Wortel',
            quantity: 20,
            unit: 'kg',
            unitPrice: 10000,
            totalPrice: 200000,
            notes: 'Wortel segar ukuran sedang',
          },
          {
            inventoryItemId: '10',
            inventoryItemName: 'Kentang',
            quantity: 40,
            unit: 'kg',
            unitPrice: 15000,
            totalPrice: 600000,
            notes: 'Kentang granola',
          },
          {
            inventoryItemId: '11',
            inventoryItemName: 'Telur Ayam',
            quantity: 200,
            unit: 'butir',
            unitPrice: 2500,
            totalPrice: 500000,
            notes: 'Telur ayam negeri segar',
          },
        ],
        subtotal: 2300000,
        tax: 230000,
        totalAmount: 2530000,
        status: 'sent',
        requestedBy: 'Ibu Dewi Kusuma',
        approvedBy: 'Manager Operasional',
        approvedAt: new Date(Date.now() - 10800000).toISOString(),
        sentAt: new Date(Date.now() - 7200000).toISOString(),
        expectedDelivery: new Date(Date.now() + 4 * 86400000).toISOString(),
        notes: 'Untuk kebutuhan produksi catering kantor dan sekolah',
        workflowProgress: 40,
        currentStep: 'Menunggu Supplier Accept',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.create(samplePO1);
      this.create(samplePO2);
      this.create(samplePO3);
      
      // Initialize workflows for all POs
      workflowService.initializeWorkflow(samplePO1.id);
      workflowService.initializeWorkflow(samplePO2.id);
      workflowService.initializeWorkflow(samplePO3.id);
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