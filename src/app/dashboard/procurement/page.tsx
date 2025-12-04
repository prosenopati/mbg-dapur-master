"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Eye,
  CheckCircle2,
  Send,
  FileText,
  Clock,
  XCircle,
  Trash2,
} from "lucide-react";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { supplierService } from "@/lib/services/supplierService";
import { inventoryService } from "@/lib/services/inventoryService";
import { PurchaseOrder, POStatus } from "@/lib/types/workflow";
import { toast } from "sonner";

export default function ProcurementPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const suppliers = supplierService.getActiveSuppliers();
  const inventoryItems = inventoryService.getAll();

  const [formData, setFormData] = useState({
    supplierId: "",
    expectedDelivery: "",
    notes: "",
    requestedBy: "Admin",
    items: [] as { inventoryItemId: string; quantity: number; unitPrice: number; notes?: string }[],
  });

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = () => {
    setPurchaseOrders(
      purchaseOrderService.getAll().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  };

  const resetForm = () => {
    setFormData({
      supplierId: "",
      expectedDelivery: "",
      notes: "",
      requestedBy: "Admin",
      items: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast.error("Tambahkan minimal satu item ke PO");
      return;
    }

    if (!formData.supplierId) {
      toast.error("Pilih supplier");
      return;
    }

    const supplier = suppliers.find(s => s.id === formData.supplierId);
    if (!supplier) return;

    const items = formData.items.map(item => {
      const inventoryItem = inventoryItems.find(i => i.id === item.inventoryItemId);
      const totalPrice = item.quantity * item.unitPrice;
      return {
        inventoryItemId: item.inventoryItemId,
        inventoryItemName: inventoryItem?.name || "",
        quantity: item.quantity,
        unit: inventoryItem?.unit || "",
        unitPrice: item.unitPrice,
        totalPrice,
        notes: item.notes,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + tax;

    purchaseOrderService.createPO({
      supplierId: formData.supplierId,
      supplierName: supplier.name,
      items,
      subtotal,
      tax,
      totalAmount,
      status: "draft",
      requestedBy: formData.requestedBy,
      expectedDelivery: formData.expectedDelivery || undefined,
      notes: formData.notes || undefined,
    });

    toast.success("Purchase Order berhasil dibuat");
    loadPurchaseOrders();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleStatusChange = (id: string, newStatus: POStatus) => {
    if (newStatus === "approved") {
      purchaseOrderService.updateStatus(id, newStatus, { approvedBy: "Manager" });
      toast.success("PO disetujui");
    } else if (newStatus === "sent") {
      purchaseOrderService.updateStatus(id, newStatus);
      toast.success("PO dikirim ke supplier");
    } else if (newStatus === "cancelled") {
      purchaseOrderService.updateStatus(id, newStatus);
      toast.info("PO dibatalkan");
    } else {
      purchaseOrderService.updateStatus(id, newStatus);
    }
    loadPurchaseOrders();
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { inventoryItemId: "", quantity: 1, unitPrice: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (
    index: number,
    field: "inventoryItemId" | "quantity" | "unitPrice" | "notes",
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const getStatusBadge = (status: POStatus) => {
    const config = {
      draft: { icon: FileText, variant: "outline" as const, label: "Draft", color: "text-gray-600" },
      pending_approval: { icon: Clock, variant: "secondary" as const, label: "Pending", color: "text-yellow-600" },
      approved: { icon: CheckCircle2, variant: "default" as const, label: "Approved", color: "text-green-600" },
      sent: { icon: Send, variant: "default" as const, label: "Sent", color: "text-blue-600" },
      received: { icon: CheckCircle2, variant: "default" as const, label: "Received", color: "text-green-700" },
      cancelled: { icon: XCircle, variant: "destructive" as const, label: "Cancelled", color: "text-red-600" },
    };

    const { icon: Icon, variant, label, color } = config[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className={`h-3 w-3 ${color}`} />
        {label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filterPOsByStatus = (status: string) => {
    if (status === "all") return purchaseOrders;
    return purchaseOrders.filter(po => po.status === status);
  };

  const filteredPOs = filterPOsByStatus(activeTab);

  const stats = {
    all: purchaseOrders.length,
    draft: purchaseOrders.filter(p => p.status === "draft").length,
    pending_approval: purchaseOrders.filter(p => p.status === "pending_approval").length,
    approved: purchaseOrders.filter(p => p.status === "approved").length,
    sent: purchaseOrders.filter(p => p.status === "sent").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement / Purchase Order</h1>
          <p className="text-muted-foreground">
            Kelola pembelian bahan baku dari supplier
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat PO Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Purchase Order Baru</DialogTitle>
              <DialogDescription>
                Tambahkan detail pembelian dari supplier
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, supplierId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDelivery">Estimasi Pengiriman</Label>
                  <Input
                    id="expectedDelivery"
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedDelivery: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Item Pembelian *</Label>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                      <div className="flex-1 grid gap-2 md:grid-cols-4">
                        <Select
                          value={item.inventoryItemId}
                          onValueChange={(value) =>
                            updateItem(index, "inventoryItemId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih item" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.map((inv) => (
                              <SelectItem key={inv.id} value={inv.id}>
                                {inv.name} ({inv.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", parseInt(e.target.value))
                          }
                          placeholder="Qty"
                        />
                        <CurrencyInput
                          value={item.unitPrice}
                          onChange={(value) =>
                            updateItem(index, "unitPrice", value)
                          }
                          placeholder="Harga satuan"
                        />
                        <Input
                          value={item.notes || ""}
                          onChange={(e) =>
                            updateItem(index, "notes", e.target.value)
                          }
                          placeholder="Catatan"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Item
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Catatan tambahan..."
                  rows={2}
                />
              </div>

              {formData.items.length > 0 && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        formData.items.reduce((sum, item) => {
                          return sum + item.quantity * item.unitPrice;
                        }, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pajak (10%):</span>
                    <span className="font-medium">
                      {formatCurrency(
                        formData.items.reduce((sum, item) => {
                          return sum + item.quantity * item.unitPrice;
                        }, 0) * 0.1
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>
                      {formatCurrency(
                        formData.items.reduce((sum, item) => {
                          return sum + item.quantity * item.unitPrice;
                        }, 0) * 1.1
                      )}
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan Draft</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total PO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.all}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_approval}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
          </CardContent>
        </Card>
      </div>

      {/* PO Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({stats.draft})</TabsTrigger>
              <TabsTrigger value="pending_approval">Pending ({stats.pending_approval})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="sent">Sent ({stats.sent})</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">Tidak ada PO</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPOs.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.poNumber}</TableCell>
                        <TableCell>{po.supplierName}</TableCell>
                        <TableCell>{po.items.length} item(s)</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(po.totalAmount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(po.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(po.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setViewingPO(po);
                                setIsViewDialogOpen(true);
                              }}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {po.status === "draft" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(po.id, "pending_approval")}
                              >
                                Submit untuk Approval
                              </Button>
                            )}
                            {po.status === "pending_approval" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(po.id, "approved")}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Setujui
                              </Button>
                            )}
                            {po.status === "approved" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(po.id, "sent")}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Kirim ke Supplier
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View PO Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Purchase Order Detail</DialogTitle>
            <DialogDescription>{viewingPO?.poNumber}</DialogDescription>
          </DialogHeader>
          {viewingPO && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                  <p className="text-sm font-medium">{viewingPO.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingPO.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                  <p className="text-sm">{viewingPO.requestedBy}</p>
                </div>
                {viewingPO.approvedBy && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                    <p className="text-sm">{viewingPO.approvedBy}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {viewingPO.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.inventoryItemName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {viewingPO.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1">{viewingPO.notes}</p>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(viewingPO.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pajak (10%):</span>
                  <span className="font-medium">{formatCurrency(viewingPO.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(viewingPO.totalAmount)}</span>
                </div>
              </div>

              {viewingPO.expectedDelivery && (
                <div className="text-xs text-muted-foreground">
                  Estimasi pengiriman: {formatDate(viewingPO.expectedDelivery)}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}