import { Invoice, InvoiceStatus, PurchaseOrder } from "@/lib/types/workflow";

const STORAGE_KEY = "mbg_invoices";

function getInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveInvoices(invoices: Invoice[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

function generateInvoiceNumber(): string {
  const invoices = getInvoices();
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const count = invoices.filter((inv) =>
    inv.invoiceNumber.startsWith(`INV/${year}.${month}`)
  ).length;
  return `INV/${year}.${month}/${String(count + 1).padStart(4, "0")}`;
}

export const invoiceService = {
  getAll(): Invoice[] {
    return getInvoices().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById(id: string): Invoice | undefined {
    return getInvoices().find((inv) => inv.id === id);
  },

  getByPOId(poId: string): Invoice | undefined {
    return getInvoices().find((inv) => inv.poId === poId);
  },

  getBySupplierId(supplierId: string): Invoice[] {
    return getInvoices().filter((inv) => inv.supplierId === supplierId);
  },

  getByStatus(status: InvoiceStatus): Invoice[] {
    return getInvoices().filter((inv) => inv.status === status);
  },

  getPendingInvoices(): Invoice[] {
    return getInvoices().filter((inv) => inv.status === "pending");
  },

  // Auto-generate invoice from approved PO
  generateFromPO(po: PurchaseOrder): Invoice {
    const now = new Date().toISOString();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Default 30 days payment term

    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber: generateInvoiceNumber(),
      poId: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      items: po.items,
      subtotal: po.subtotal,
      tax: po.tax,
      totalAmount: po.totalAmount,
      status: "pending",
      dueDate: dueDate.toISOString(),
      issuedDate: now,
      notes: `Invoice otomatis dari PO ${po.poNumber}`,
      createdAt: now,
      updatedAt: now,
    };

    const invoices = getInvoices();
    invoices.push(invoice);
    saveInvoices(invoices);

    return invoice;
  },

  updateStatus(
    id: string,
    status: InvoiceStatus,
    updates?: {
      paidAmount?: number;
      paidBy?: string;
      paymentMethod?: string;
      paymentReference?: string;
      notes?: string;
    }
  ): boolean {
    const invoices = getInvoices();
    const index = invoices.findIndex((inv) => inv.id === id);

    if (index === -1) return false;

    invoices[index] = {
      ...invoices[index],
      status,
      updatedAt: new Date().toISOString(),
      ...(updates && {
        ...updates,
        ...(status === "paid" && {
          paidAt: new Date().toISOString(),
          paidAmount: updates.paidAmount || invoices[index].totalAmount,
        }),
      }),
    };

    saveInvoices(invoices);
    return true;
  },

  processPayment(
    id: string,
    paymentData: {
      amount: number;
      method: string;
      reference?: string;
      paidBy: string;
      notes?: string;
    }
  ): boolean {
    return this.updateStatus(id, "paid", {
      paidAmount: paymentData.amount,
      paymentMethod: paymentData.method,
      paymentReference: paymentData.reference,
      paidBy: paymentData.paidBy,
      notes: paymentData.notes,
    });
  },

  delete(id: string): boolean {
    const invoices = getInvoices();
    const filtered = invoices.filter((inv) => inv.id !== id);
    if (filtered.length === invoices.length) return false;
    saveInvoices(filtered);
    return true;
  },

  // Stats
  getTotalPending(): number {
    return getInvoices()
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  },

  getTotalPaid(): number {
    return getInvoices()
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  },

  getOverdueInvoices(): Invoice[] {
    const now = new Date();
    return getInvoices().filter(
      (inv) =>
        inv.status === "pending" &&
        new Date(inv.dueDate) < now
    );
  },
};
