// Extended types for business workflow modules

// ============================================
// 1. PROCUREMENT / PURCHASE ORDER
// ============================================
export type POStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'sent' 
  | 'supplier_approved'
  | 'supplier_rejected'
  | 'received' 
  | 'cancelled';

export interface PurchaseOrderItem {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: POStatus;
  notes?: string;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
  supplierApprovedAt?: string;
  supplierApprovedBy?: string;
  supplierRejectedAt?: string;
  supplierRejectionReason?: string;
  expectedDelivery?: string;
  
  // Link to auto-generated invoice
  invoiceId?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 2. INVOICE (Auto-generated from PO)
// ============================================
export type InvoiceStatus = 
  | 'pending' 
  | 'approved' 
  | 'paid' 
  | 'cancelled' 
  | 'overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus;
  
  dueDate: string;
  issuedDate: string;
  
  // Payment tracking
  paidAmount?: number;
  paidAt?: string;
  paidBy?: string; // Finance user who processed
  paymentMethod?: string;
  paymentReference?: string;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 3. NOTIFICATIONS
// ============================================
export type NotificationType = 
  | 'po_created' 
  | 'po_sent_to_supplier' 
  | 'po_approved_by_supplier'
  | 'po_rejected_by_supplier'
  | 'invoice_generated'
  | 'invoice_approved'
  | 'payment_completed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientRole: string; // 'supplier', 'manager', 'finance', 'admin'
  recipientId?: string;
  
  // Related entities
  poId?: string;
  invoiceId?: string;
  
  isRead: boolean;
  readAt?: string;
  
  createdAt: string;
}

// ============================================
// 2. RECEIVING / INVOICING
// ============================================
export type ReceivingStatus = 'pending' | 'partial' | 'completed' | 'discrepancy';

export interface ReceivedItem {
  poItemId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface GoodsReceipt {
  id: string;
  grNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: ReceivedItem[];
  status: ReceivingStatus;
  receivedBy: string;
  receivedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThreeWayMatch {
  purchaseOrderId: string;
  goodsReceiptId?: string;
  invoiceId?: string;
  status: 'matched' | 'discrepancy' | 'pending';
  discrepancies: string[];
  matchedAt?: string;
}

// ============================================
// 3. ENHANCED INVENTORY
// ============================================
export type TransactionType = 'in' | 'out' | 'adjustment' | 'waste' | 'production_use';

export interface InventoryBatch {
  id: string;
  inventoryItemId: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  receivedDate: string;
  supplierId?: string;
  purchaseOrderId?: string;
  status: 'active' | 'expired' | 'depleted';
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  batchId?: string;
  type: TransactionType;
  quantity: number;
  unit: string;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string; // PO, GR, Production, etc.
  referenceType?: string;
  notes?: string;
  performedBy: string;
  createdAt: string;
}

// ============================================
// 4. KITCHEN PRODUCTION
// ============================================
export type ProductionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface ProductionMaterial {
  inventoryItemId: string;
  inventoryItemName: string;
  requiredQuantity: number;
  actualQuantity?: number;
  unit: string;
  batchId?: string;
}

export interface ProductionOutput {
  menuItemId: string;
  menuItemName: string;
  plannedQuantity: number;
  actualQuantity?: number;
}

export interface ProductionPlan {
  id: string;
  planNumber: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'evening';
  outputs: ProductionOutput[];
  materials: ProductionMaterial[];
  status: ProductionStatus;
  plannedBy: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WasteRecord {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unit: string;
  reason: 'expired' | 'damaged' | 'spoiled' | 'overproduction' | 'other';
  batchId?: string;
  productionPlanId?: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

// ============================================
// 5. SUPPLIER PAYMENT
// ============================================
export type PaymentStatus = 'pending' | 'approved' | 'paid' | 'rejected';
export type PaymentMethod = 'cash' | 'transfer' | 'check' | 'other';

export interface PaymentRequest {
  id: string;
  requestNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  requestedBy: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentRequestId?: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  method: PaymentMethod;
  reference?: string; // Check number, transfer ID, etc.
  paidBy: string;
  approvedBy?: string;
  paidAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 6. FINANCIAL FLOW
// ============================================
export type CashflowType = 'inflow' | 'outflow';
export type CashflowCategory = 
  // Inflow categories
  | 'sales_revenue'           // Pendapatan Penjualan
  | 'service_revenue'         // Pendapatan Jasa
  | 'other_income'            // Pendapatan Lain-lain
  | 'investment_income'       // Pendapatan Investasi
  // Outflow categories
  | 'supplier_payment'        // Pembayaran Supplier
  | 'salary_wages'            // Gaji & Upah
  | 'rent'                    // Sewa
  | 'utilities'               // Utilitas (Listrik, Air, dll)
  | 'maintenance'             // Pemeliharaan & Perbaikan
  | 'marketing'               // Pemasaran
  | 'transportation'          // Transportasi
  | 'office_supplies'         // Perlengkapan Kantor
  | 'professional_fees'       // Jasa Profesional
  | 'taxes_fees'              // Pajak & Biaya
  | 'other_expense';          // Biaya Lain-lain

export interface CashflowEntry {
  id: string;
  type: CashflowType;
  category: CashflowCategory;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string; // 'order', 'payment', 'invoice', etc.
  date: string;
  recordedBy: string;
  paymentMethod?: 'cash' | 'transfer' | 'check' | 'card' | 'other';
  notes?: string;
  createdAt: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  pendingPayments: number;
  cashBalance: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

// ============================================
// SUPPLIER MASTER
// ============================================
export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentTerms?: string; // e.g., "Net 30 days"
  taxId?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}