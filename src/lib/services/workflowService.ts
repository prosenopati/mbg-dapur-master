import { POWorkflow, WorkflowStep, ShipmentTracking, ShipmentEvent, QCReport, QCItem, ShipmentStatus, QCStatus } from '../types/workflow';
import { StorageService } from './storage';
import { purchaseOrderService } from './purchaseOrderService';

// ============================================
// WORKFLOW MANAGEMENT SERVICE
// ============================================
class WorkflowService extends StorageService<POWorkflow> {
  constructor() {
    super('mbg_po_workflows');
  }

  initializeWorkflow(purchaseOrderId: string): POWorkflow {
    const steps: WorkflowStep[] = [
      {
        id: 'draft',
        name: 'Draft PO',
        description: 'PO dibuat dan dalam status draft',
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
      {
        id: 'approval',
        name: 'Approval',
        description: 'Menunggu persetujuan Manager',
        status: 'pending',
      },
      {
        id: 'sent_to_supplier',
        name: 'Kirim ke Supplier',
        description: 'PO dikirim ke supplier untuk review',
        status: 'pending',
      },
      {
        id: 'supplier_accept',
        name: 'Supplier Accept',
        description: 'Supplier menerima dan mengkonfirmasi PO',
        status: 'pending',
      },
      {
        id: 'proforma_invoice',
        name: 'Proforma Invoice',
        description: 'Proforma invoice otomatis dibuat',
        status: 'pending',
      },
      {
        id: 'shipment',
        name: 'Pengiriman Barang',
        description: 'Supplier mengirim barang',
        status: 'pending',
      },
      {
        id: 'receiving',
        name: 'Receiving',
        description: 'Penerimaan barang di gudang',
        status: 'pending',
      },
      {
        id: 'qc',
        name: 'Quality Control',
        description: 'Pemeriksaan kualitas barang',
        status: 'pending',
      },
      {
        id: 'final_invoice',
        name: 'Invoice Final',
        description: 'Invoice final dibuat setelah QC',
        status: 'pending',
      },
      {
        id: 'payment',
        name: 'Payment',
        description: 'Pembayaran ke supplier',
        status: 'pending',
      },
    ];

    const workflow: POWorkflow = {
      purchaseOrderId,
      steps,
      currentStepIndex: 0,
      overallProgress: 10,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.create({ ...workflow, id: purchaseOrderId });
  }

  updateStep(
    purchaseOrderId: string,
    stepId: string,
    status: WorkflowStep['status'],
    metadata?: { completedBy?: string; notes?: string }
  ): POWorkflow | null {
    const workflow = this.getById(purchaseOrderId);
    if (!workflow) return null;

    const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return null;

    const updatedSteps = [...workflow.steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      status,
      ...(status === 'completed' && {
        completedAt: new Date().toISOString(),
        completedBy: metadata?.completedBy,
      }),
      notes: metadata?.notes,
    };

    // Calculate progress
    const completedCount = updatedSteps.filter(s => s.status === 'completed').length;
    const overallProgress = Math.round((completedCount / updatedSteps.length) * 100);

    // Find current step
    const currentStepIndex = updatedSteps.findIndex(s => s.status === 'in_progress' || s.status === 'pending');

    return this.update(purchaseOrderId, {
      steps: updatedSteps,
      currentStepIndex: currentStepIndex !== -1 ? currentStepIndex : updatedSteps.length - 1,
      overallProgress,
      updatedAt: new Date().toISOString(),
      ...(overallProgress === 100 && { completedAt: new Date().toISOString() }),
    });
  }

  getByPO(purchaseOrderId: string): POWorkflow | undefined {
    return this.getById(purchaseOrderId);
  }
}

// ============================================
// SHIPMENT TRACKING SERVICE
// ============================================
class ShipmentService extends StorageService<ShipmentTracking> {
  constructor() {
    super('mbg_shipments');
  }

  private generateShipmentNumber(): string {
    const count = this.getAll().length + 1;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `SHIP-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  createShipment(data: Omit<ShipmentTracking, 'id' | 'shipmentNumber' | 'events' | 'createdAt' | 'updatedAt'>): ShipmentTracking {
    const shipmentNumber = this.generateShipmentNumber();
    
    const initialEvent: ShipmentEvent = {
      timestamp: new Date().toISOString(),
      status: 'pending',
      description: 'Shipment created',
    };

    const shipment: ShipmentTracking = {
      ...data,
      id: Date.now().toString(),
      shipmentNumber,
      events: [initialEvent],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.create(shipment);
  }

  addEvent(id: string, event: Omit<ShipmentEvent, 'timestamp'>): ShipmentTracking | null {
    const shipment = this.getById(id);
    if (!shipment) return null;

    const newEvent: ShipmentEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    return this.update(id, {
      events: [...shipment.events, newEvent],
      status: event.status as ShipmentStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  updateStatus(id: string, status: ShipmentStatus, description: string): ShipmentTracking | null {
    return this.addEvent(id, { status, description });
  }

  getByPO(purchaseOrderId: string): ShipmentTracking | undefined {
    return this.getAll().find(s => s.purchaseOrderId === purchaseOrderId);
  }
}

// ============================================
// QUALITY CONTROL SERVICE
// ============================================
class QCService extends StorageService<QCReport> {
  constructor() {
    super('mbg_qc_reports');
  }

  private generateQCNumber(): string {
    const count = this.getAll().length + 1;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `QC-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  createQCReport(data: Omit<QCReport, 'id' | 'qcNumber' | 'createdAt' | 'updatedAt'>): QCReport {
    const qcNumber = this.generateQCNumber();
    
    const report: QCReport = {
      ...data,
      id: Date.now().toString(),
      qcNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.create(report);
  }

  getByPO(purchaseOrderId: string): QCReport | undefined {
    return this.getAll().find(qc => qc.purchaseOrderId === purchaseOrderId);
  }

  getByGR(goodsReceiptId: string): QCReport | undefined {
    return this.getAll().find(qc => qc.goodsReceiptId === goodsReceiptId);
  }
}

export const workflowService = new WorkflowService();
export const shipmentService = new ShipmentService();
export const qcService = new QCService();
