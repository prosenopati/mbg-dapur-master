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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  CheckCircle2,
  Send,
  FileText,
  Clock,
  XCircle,
  Trash2,
  X,
  Truck,
  PackageCheck,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { supplierService } from "@/lib/services/supplierService";
import { inventoryService } from "@/lib/services/inventoryService";
import { workflowService } from "@/lib/services/workflowService";
import { PurchaseOrder, POStatus } from "@/lib/types/workflow";
import { toast } from "sonner";
import { POWorkflowTracker } from "@/components/workflow/POWorkflowTracker";
import { getUserRole, type UserRole } from "@/lib/rbac";

export default function ProcurementPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedPOId, setExpandedPOId] = useState<string | null>(null);
  const [isSupplierActionDialogOpen, setIsSupplierActionDialogOpen] = useState(false);
  const [supplierActionType, setSupplierActionType] = useState<'accept' | 'reject'>('accept');
  const [selectedPOForAction, setSelectedPOForAction] = useState<PurchaseOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState("all");
  const [userRole, setUserRole] = useState<UserRole>("Admin");
  
  const suppliers = supplierService.getActiveSuppliers();
  const inventoryItems = inventoryService.getAll();

  const [formData, setFormData] = useState({
    supplierIds: [] as string[],
    expectedDelivery: "",
    notes: "",
    requestedBy: "Admin",
    items: [] as { inventoryItemId: string; quantity: number; unitPrice: number; notes?: string }[],
  });

  useEffect(() => {
    loadPurchaseOrders();
    setUserRole(getUserRole());
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
      supplierIds: [],
      expectedDelivery: "",
      notes: "",
      requestedBy: "Admin",
      items: [],
    });
  };

  const toggleSupplier = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      supplierIds: prev.supplierIds.includes(supplierId)
        ? prev.supplierIds.filter(id => id !== supplierId)
        : [...prev.supplierIds, supplierId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast.error("Tambahkan minimal satu item ke PO");
      return;
    }

    if (formData.supplierIds.length === 0) {
      toast.error("Pilih minimal satu supplier");
      return;
    }

    formData.supplierIds.forEach(supplierId => {
      const supplier = suppliers.find(s => s.id === supplierId);
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
      const tax = subtotal * 0.1;
      const totalAmount = subtotal + tax;

      purchaseOrderService.createPO({
        supplierId: supplierId,
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
    });

    toast.success(`${formData.supplierIds.length} Purchase Order berhasil dibuat`);
    loadPurchaseOrders();
    setIsFormOpen(false);
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

  const handleSupplierAction = () => {
    if (!selectedPOForAction) return;

    if (supplierActionType === 'accept') {
      purchaseOrderService.supplierApprovePO(selectedPOForAction.id, 'Supplier Staff');
      toast.success("PO diterima! Proforma invoice otomatis dibuat.");
    } else {
      if (!rejectionReason.trim()) {
        toast.error("Masukkan alasan penolakan");
        return;
      }
      purchaseOrderService.supplierRejectPO(selectedPOForAction.id, rejectionReason);
      toast.info("PO ditolak");
    }

    setIsSupplierActionDialogOpen(false);
    setRejectionReason('');
    setSelectedPOForAction(null);
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
      pending_approval: { icon: Clock, variant: "secondary" as const, label: "Menunggu Persetujuan", color: "text-yellow-600" },
      approved: { icon: CheckCircle2, variant: "default" as const, label: "Disetujui", color: "text-green-600" },
      sent: { icon: Send, variant: "default" as const, label: "Terkirim", color: "text-blue-600" },
      supplier_approved: { icon: CheckCircle2, variant: "default" as const, label: "Disetujui Supplier", color: "text-green-700" },
      supplier_rejected: { icon: XCircle, variant: "destructive" as const, label: "Ditolak Supplier", color: "text-red-600" },
      in_transit: { icon: Truck, variant: "secondary" as const, label: "Dalam Pengiriman", color: "text-blue-600" },
      received: { icon: PackageCheck, variant: "default" as const, label: "Diterima", color: "text-green-600" },
      qc_passed: { icon: ClipboardCheck, variant: "default" as const, label: "Lolos QC", color: "text-green-700" },
      qc_failed: { icon: XCircle, variant: "destructive" as const, label: "Gagal QC", color: "text-red-600" },
      completed: { icon: CheckCircle2, variant: "default" as const, label: "Selesai", color: "text-green-800" },
      cancelled: { icon: XCircle, variant: "destructive" as const, label: "Dibatalkan", color: "text-red-600" },
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
    in_transit: purchaseOrders.filter(p => p.status === "in_transit").length,
    completed: purchaseOrders.filter(p => p.status === "completed").length,
  };

  const canCreatePO = ["Admin", "Manager", "Dapur"].includes(userRole);
  const isSupplier = userRole === "Supplier";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengadaan / Purchase Order</h1>
          <p className="text-muted-foreground">
            {isSupplier 
              ? "Terima atau Tolak Purchase Order dari Dapur - Alur Kerja: PO → Supplier Terima/Tolak → Proforma Invoice → Pengiriman"
              : "Alur Kerja Lengkap: PO → Persetujuan Supplier → Proforma Invoice → Pengiriman → Penerimaan → QC → Invoice Akhir → Pembayaran"
            }
          </p>
        </div>
        {canCreatePO && (
          <Button onClick={() => setIsFormOpen(!isFormOpen)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat PO Baru
          </Button>
        )}
      </div>

      {/* Supplier Info Card */}
      {isSupplier && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="font-bold text-purple-900 dark:text-purple-100">
                  Panduan Supplier
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Sebagai Supplier, Anda <strong>tidak dapat membuat</strong> Purchase Order. 
                  PO dibuat oleh tim <strong>Pengelola Dapur</strong>. Anda hanya dapat:
                </p>
                <ul className="text-sm text-purple-700 dark:text-purple-300 list-disc list-inside ml-2 space-y-1">
                  <li><strong>Menerima PO</strong> - Konfirmasi ketersediaan barang dan buat Proforma Invoice</li>
                  <li><strong>Menolak PO</strong> - Berikan alasan penolakan jika tidak dapat memenuhi order</li>
                  <li><strong>Melacak Status</strong> - Pantau progres PO dari pengiriman hingga pembayaran</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inline Form */}
      {isFormOpen && canCreatePO && (
        <Card className="border-primary shadow-lg animate-in slide-in-from-top-2">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle>Buat Purchase Order Baru</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tambahkan detail pembelian dari supplier
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Supplier * (Multi-Pilih)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {formData.supplierIds.length === 0
                          ? "Pilih supplier..."
                          : `${formData.supplierIds.length} supplier dipilih`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-4" align="start">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Pilih Supplier</p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {suppliers.map((supplier) => (
                            <div
                              key={supplier.id}
                              className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                              onClick={() => toggleSupplier(supplier.id)}
                            >
                              <Checkbox
                                id={supplier.id}
                                checked={formData.supplierIds.includes(supplier.id)}
                                onCheckedChange={() => toggleSupplier(supplier.id)}
                              />
                              <label
                                htmlFor={supplier.id}
                                className="flex-1 text-sm cursor-pointer"
                              >
                                {supplier.name} <span className="text-muted-foreground">({supplier.code})</span>
                              </label>
                            </div>
                          ))}
                        </div>
                        {formData.supplierIds.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              {formData.supplierIds.length} supplier dipilih. PO akan dibuat untuk setiap supplier.
                            </p>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {formData.supplierIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.supplierIds.map(id => {
                        const supplier = suppliers.find(s => s.id === id);
                        return supplier ? (
                          <Badge key={id} variant="secondary" className="gap-1">
                            {supplier.name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => toggleSupplier(id)}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
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
                    <span>Total per Supplier:</span>
                    <span>
                      {formatCurrency(
                        formData.items.reduce((sum, item) => {
                          return sum + item.quantity * item.unitPrice;
                        }, 0) * 1.1
                      )}
                    </span>
                  </div>
                  {formData.supplierIds.length > 1 && (
                    <p className="text-xs text-muted-foreground text-center pt-2 border-t">
                      Total {formData.supplierIds.length} PO akan dibuat dengan nilai masing-masing {formatCurrency(
                        formData.items.reduce((sum, item) => {
                          return sum + item.quantity * item.unitPrice;
                        }, 0) * 1.1
                      )}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan Draft</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card className="py-3">
          <CardHeader className="pb-1 px-4">
            <CardTitle className="text-xs font-medium text-center">Total PO</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-1">
            <div className="text-xl font-bold text-center">{stats.all}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="pb-1 px-4">
            <CardTitle className="text-xs font-medium text-center">Draft</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-1">
            <div className="text-xl font-bold text-gray-600 text-center">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="pb-1 px-4">
            <CardTitle className="text-xs font-medium text-center">Menunggu</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-1">
            <div className="text-xl font-bold text-yellow-600 text-center">{stats.pending_approval}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="pb-1 px-4">
            <CardTitle className="text-xs font-medium text-center">Disetujui</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-1">
            <div className="text-xl font-bold text-green-600 text-center">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="pb-1 px-4">
            <CardTitle className="text-xs font-medium text-center">Terkirim</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-1">
            <div className="text-xl font-bold text-blue-600 text-center">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="pb-1 px-4">
            <CardTitle className="text-xs font-medium text-center">Dalam Transit</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-1">
            <div className="text-xl font-bold text-blue-700 text-center">{stats.in_transit}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="pb-1 px-4">
            <CardTitle className="text-xs font-medium text-center">Selesai</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-1">
            <div className="text-xl font-bold text-green-800 text-center">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* PO Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Purchase Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="all">Semua ({stats.all})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({stats.draft})</TabsTrigger>
              <TabsTrigger value="pending_approval">Menunggu ({stats.pending_approval})</TabsTrigger>
              <TabsTrigger value="approved">Disetujui ({stats.approved})</TabsTrigger>
              <TabsTrigger value="sent">Terkirim ({stats.sent})</TabsTrigger>
              <TabsTrigger value="in_transit">Transit ({stats.in_transit})</TabsTrigger>
              <TabsTrigger value="received">Diterima</TabsTrigger>
              <TabsTrigger value="completed">Selesai ({stats.completed})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nomor PO</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progres</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-muted-foreground">Tidak ada PO</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPOs.map((po) => (
                      <>
                        <TableRow 
                          key={po.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedPOId(expandedPOId === po.id ? null : po.id)}
                        >
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              {expandedPOId === po.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{po.poNumber}</TableCell>
                          <TableCell>{po.supplierName}</TableCell>
                          <TableCell>{po.items.length} item</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(po.totalAmount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(po.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${po.workflowProgress || 0}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-xs font-medium text-muted-foreground w-10">
                                {po.workflowProgress || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(po.createdAt)}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              {!isSupplier && (
                                <>
                                  {po.status === "draft" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleStatusChange(po.id, "pending_approval")}
                                    >
                                      Ajukan Persetujuan
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
                                </>
                              )}
                              {isSupplier && po.status === 'sent' && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => {
                                      setSelectedPOForAction(po);
                                      setSupplierActionType('accept');
                                      setIsSupplierActionDialogOpen(true);
                                    }}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Terima
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedPOForAction(po);
                                      setSupplierActionType('reject');
                                      setIsSupplierActionDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Tolak
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Expandable Detail Panel */}
                        {expandedPOId === po.id && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/30 p-6">
                              <div className="space-y-6">
                                {/* Informasi Dasar PO */}
                                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                                    <p className="text-sm font-medium mt-1">{po.supplierName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <div className="mt-1">{getStatusBadge(po.status)}</div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Diminta Oleh</p>
                                    <p className="text-sm mt-1">{po.requestedBy}</p>
                                  </div>
                                  {po.approvedBy && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Disetujui Oleh</p>
                                      <p className="text-sm mt-1">{po.approvedBy}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Workflow Tracker */}
                                {workflowService.getByPO(po.id) && (
                                  <div className="pb-4 border-b">
                                    <POWorkflowTracker workflow={workflowService.getByPO(po.id)!} />
                                  </div>
                                )}

                                {/* Action Buttons untuk Supplier */}
                                {isSupplier && po.status === 'sent' && (
                                  <div className="flex gap-2 pb-4 border-b">
                                    <Button
                                      onClick={() => {
                                        setSelectedPOForAction(po);
                                        setSupplierActionType('accept');
                                        setIsSupplierActionDialogOpen(true);
                                      }}
                                      className="flex-1"
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Terima PO
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        setSelectedPOForAction(po);
                                        setSupplierActionType('reject');
                                        setIsSupplierActionDialogOpen(true);
                                      }}
                                      className="flex-1"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Tolak PO
                                    </Button>
                                  </div>
                                )}

                                {/* Daftar Item - Nested Table */}
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-3">Daftar Item</p>
                                  <div className="rounded-lg border">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead>Nama Item</TableHead>
                                          <TableHead>Kuantitas</TableHead>
                                          <TableHead>Harga Satuan</TableHead>
                                          <TableHead>Total</TableHead>
                                          <TableHead>Catatan</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {po.items.map((item, index) => (
                                          <TableRow key={index}>
                                            <TableCell className="font-medium">{item.inventoryItemName}</TableCell>
                                            <TableCell>
                                              {item.quantity} {item.unit}
                                            </TableCell>
                                            <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                            <TableCell className="font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                              {item.notes || "-"}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>

                                {/* Catatan */}
                                {po.notes && (
                                  <div className="pb-4 border-b">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Catatan</p>
                                    <p className="text-sm">{po.notes}</p>
                                  </div>
                                )}

                                {/* Total */}
                                <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                                  <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(po.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Pajak (10%):</span>
                                    <span className="font-medium">{formatCurrency(po.tax)}</span>
                                  </div>
                                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total:</span>
                                    <span>{formatCurrency(po.totalAmount)}</span>
                                  </div>
                                </div>

                                {/* Estimasi Pengiriman */}
                                {po.expectedDelivery && (
                                  <div className="text-xs text-muted-foreground">
                                    Estimasi pengiriman: {formatDate(po.expectedDelivery)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Supplier Action Dialog */}
      <Dialog open={isSupplierActionDialogOpen} onOpenChange={setIsSupplierActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {supplierActionType === 'accept' ? 'Terima Purchase Order' : 'Tolak Purchase Order'}
            </DialogTitle>
            <DialogDescription>
              {supplierActionType === 'accept' 
                ? 'Dengan menerima PO ini, proforma invoice akan otomatis dibuat.' 
                : 'Masukkan alasan penolakan PO ini.'}
            </DialogDescription>
          </DialogHeader>
          {supplierActionType === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Alasan Penolakan *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Harga tidak sesuai, stok tidak tersedia, dll..."
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSupplierActionDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleSupplierAction}
              variant={supplierActionType === 'accept' ? 'default' : 'destructive'}
            >
              {supplierActionType === 'accept' ? 'Terima PO' : 'Tolak PO'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}