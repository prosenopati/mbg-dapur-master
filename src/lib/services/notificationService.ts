import { Notification, NotificationType } from "@/lib/types/workflow";

const STORAGE_KEY = "mbg_notifications";

function getNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export const notificationService = {
  getAll(): Notification[] {
    return getNotifications().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getByRole(role: string): Notification[] {
    return getNotifications()
      .filter((notif) => notif.recipientRole === role)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnreadByRole(role: string): Notification[] {
    return getNotifications().filter(
      (notif) => notif.recipientRole === role && !notif.isRead
    );
  },

  getUnreadCount(role: string): number {
    return getNotifications().filter(
      (notif) => notif.recipientRole === role && !notif.isRead
    ).length;
  },

  create(data: {
    type: NotificationType;
    title: string;
    message: string;
    recipientRole: string;
    recipientId?: string;
    poId?: string;
    invoiceId?: string;
  }): Notification {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: data.type,
      title: data.title,
      message: data.message,
      recipientRole: data.recipientRole,
      recipientId: data.recipientId,
      poId: data.poId,
      invoiceId: data.invoiceId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const notifications = getNotifications();
    notifications.push(notification);
    saveNotifications(notifications);

    return notification;
  },

  markAsRead(id: string): boolean {
    const notifications = getNotifications();
    const index = notifications.findIndex((n) => n.id === id);

    if (index === -1) return false;

    notifications[index] = {
      ...notifications[index],
      isRead: true,
      readAt: new Date().toISOString(),
    };

    saveNotifications(notifications);
    return true;
  },

  markAllAsRead(role: string): void {
    const notifications = getNotifications();
    const updated = notifications.map((n) =>
      n.recipientRole === role && !n.isRead
        ? { ...n, isRead: true, readAt: new Date().toISOString() }
        : n
    );
    saveNotifications(updated);
  },

  delete(id: string): boolean {
    const notifications = getNotifications();
    const filtered = notifications.filter((n) => n.id !== id);
    if (filtered.length === notifications.length) return false;
    saveNotifications(filtered);
    return true;
  },

  deleteAll(role: string): void {
    const notifications = getNotifications();
    const filtered = notifications.filter((n) => n.recipientRole !== role);
    saveNotifications(filtered);
  },

  // Notification Templates
  notifyPOSentToSupplier(poId: string, poNumber: string, supplierName: string): void {
    this.create({
      type: "po_sent_to_supplier",
      title: "Purchase Order Baru",
      message: `PO ${poNumber} telah dikirim dari Manager. Silakan review dan konfirmasi.`,
      recipientRole: "supplier",
      poId,
    });

    // Also notify manager
    this.create({
      type: "po_sent_to_supplier",
      title: "PO Terkirim ke Supplier",
      message: `PO ${poNumber} berhasil dikirim ke ${supplierName}.`,
      recipientRole: "manager",
      poId,
    });
  },

  notifyPOApprovedBySupplier(poId: string, poNumber: string, supplierName: string): void {
    this.create({
      type: "po_approved_by_supplier",
      title: "Supplier Menyetujui PO",
      message: `${supplierName} telah menyetujui PO ${poNumber}.`,
      recipientRole: "manager",
      poId,
    });
  },

  notifyPORejectedBySupplier(
    poId: string,
    poNumber: string,
    supplierName: string,
    reason?: string
  ): void {
    this.create({
      type: "po_rejected_by_supplier",
      title: "Supplier Menolak PO",
      message: `${supplierName} menolak PO ${poNumber}. ${reason ? `Alasan: ${reason}` : ""}`,
      recipientRole: "manager",
      poId,
    });
  },

  notifyInvoiceGenerated(
    invoiceId: string,
    invoiceNumber: string,
    poNumber: string,
    amount: number
  ): void {
    this.create({
      type: "invoice_generated",
      title: "Invoice Baru Dibuat",
      message: `Invoice ${invoiceNumber} otomatis dibuat dari PO ${poNumber}. Total: Rp ${amount.toLocaleString("id-ID")}. Silakan review untuk pembayaran.`,
      recipientRole: "finance",
      invoiceId,
    });

    // Also notify manager
    this.create({
      type: "invoice_generated",
      title: "Invoice Generated",
      message: `Invoice ${invoiceNumber} telah dibuat untuk PO ${poNumber}.`,
      recipientRole: "manager",
      invoiceId,
    });
  },

  notifyPaymentCompleted(
    invoiceId: string,
    invoiceNumber: string,
    amount: number,
    supplierName: string
  ): void {
    this.create({
      type: "payment_completed",
      title: "Pembayaran Selesai",
      message: `Pembayaran Rp ${amount.toLocaleString("id-ID")} untuk invoice ${invoiceNumber} (${supplierName}) telah diproses.`,
      recipientRole: "manager",
      invoiceId,
    });

    // Notify supplier
    this.create({
      type: "payment_completed",
      title: "Pembayaran Diterima",
      message: `Pembayaran untuk invoice ${invoiceNumber} sebesar Rp ${amount.toLocaleString("id-ID")} telah diproses.`,
      recipientRole: "supplier",
      invoiceId,
    });
  },
};
