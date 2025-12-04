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
  Package,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { goodsReceiptService, invoiceService, threeWayMatchService } from "@/lib/services/receivingService";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { inventoryService } from "@/lib/services/inventoryService";
import { inventoryBatchService, stockTransactionService } from "@/lib/services/inventoryBatchService";
import { GoodsReceipt, SupplierInvoice } from "@/lib/types/workflow";
import { toast } from "sonner";

export default function ReceivingPage() {
  const [activeTab, setActiveTab] = useState("goods-receipts");
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [isGRDialogOpen, setIsGRDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [viewingGR, setViewingGR] = useState<GoodsReceipt | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<SupplierInvoice | null>(null);
  const [isViewGRDialogOpen, setIsViewGRDialogOpen] = useState(false);
  const [isViewInvoiceDialogOpen, setIsViewInvoiceDialogOpen] = useState(false);

  const sentPOs = purchaseOrderService.getAll().filter(po => po.status === "sent");

  const [grFormData, setGrFormData] = useState({
    purchaseOrderId: "",
    receivedBy: "Staff Gudang",
    notes: "",
    items: [] as { poItemId: string; inventoryItemId: string; orderedQuantity: number; receivedQuantity: number; batchNumber?: string; expiryDate?: string; notes?: string }[],
  });

  const [invoiceFormData, setInvoiceFormData] = useState({
    purchaseOrderId: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setGoodsReceipts(
      goodsReceiptService.getAll().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
    setInvoices(
      invoiceService.getAll().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  };

  const handlePOSelect = (poId: string) => {
    const po = purchaseOrderService.getById(poId);
    if (!po) return;

    const items = po.items.map(item => ({
      poItemId: item.inventoryItemId,
      inventoryItemId: item.inventoryItemId,
      orderedQuantity: item.quantity,
      receivedQuantity: item.quantity,
      batchNumber: "",
      expiryDate: "",
      notes: "",
    }));

    setGrFormData({
      ...grFormData,
      purchaseOrderId: poId,
      items,
    });
  };

  const handleGRSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const po = purchaseOrderService.getById(grFormData.purchaseOrderId);
    if (!po) return;

    const items = grFormData.items.map(item => {
      const inventoryItem = inventoryService.getById(item.inventoryItemId);
      return {
        poItemId: item.poItemId,
        inventoryItemId: item.inventoryItemId,
        inventoryItemName: inventoryItem?.name || "",
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: item.receivedQuantity,
        unit: inventoryItem?.unit || "",
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        notes: item.notes,
      };
    });

    // Create goods receipt
    const gr = goodsReceiptService.createGR({
      purchaseOrderId: grFormData.purchaseOrderId,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      items,
      receivedBy: grFormData.receivedBy,
      receivedAt: new Date().toISOString(),
      notes: grFormData.notes || undefined,
    });

    // Update inventory and create batches
    items.forEach(item => {
      // Update inventory stock
      const currentItem = inventoryService.getById(item.inventoryItemId);
      if (currentItem) {
        inventoryService.restock(item.inventoryItemId, item.receivedQuantity);
        
        // Create batch record
        inventoryBatchService.createBatch({
          inventoryItemId: item.inventoryItemId,
          batchNumber: item.batchNumber || `BATCH-${Date.now()}`,
          quantity: item.receivedQuantity,
          unit: item.unit,
          expiryDate: item.expiryDate,
          receivedDate: new Date().toISOString(),
          supplierId: po.supplierId,
          purchaseOrderId: grFormData.purchaseOrderId,
        });

        // Record stock transaction
        stockTransactionService.recordTransaction({
          inventoryItemId: item.inventoryItemId,
          inventoryItemName: item.inventoryItemName,
          type: "in",
          quantity: item.receivedQuantity,
          unit: item.unit,
          balanceBefore: currentItem.quantity,
          balanceAfter: currentItem.quantity + item.receivedQuantity,
          referenceId: gr.id,
          referenceType: "goods_receipt",
          performedBy: grFormData.receivedBy,
        });
      }
    });

    // Perform 3-way match
    threeWayMatchService.performMatch(grFormData.purchaseOrderId, gr.id);

    toast.success("Barang berhasil diterima");
    loadData();
    setIsGRDialogOpen(false);
    setGrFormData({
      purchaseOrderId: "",
      receivedBy: "Staff Gudang",
      notes: "",
      items: [],
    });
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const po = purchaseOrderService.getById(invoiceFormData.purchaseOrderId);
    if (!po) return;

    invoiceService.createInvoice({
      invoiceNumber: invoiceFormData.invoiceNumber,
      purchaseOrderId: invoiceFormData.purchaseOrderId,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      invoiceDate: invoiceFormData.invoiceDate,
      dueDate: invoiceFormData.dueDate,
      subtotal: po.subtotal,
      tax: po.tax,
      totalAmount: po.totalAmount,
      notes: invoiceFormData.notes || undefined,
    });

    // Perform 3-way match with invoice
    const gr = goodsReceiptService.getByPO(invoiceFormData.purchaseOrderId)[0];
    const invoice = invoiceService.getByPO(invoiceFormData.purchaseOrderId)[0];
    if (gr && invoice) {
      threeWayMatchService.performMatch(invoiceFormData.purchaseOrderId, gr.id, invoice.id);
    }

    toast.success("Invoice supplier berhasil dicatat");
    loadData();
    setIsInvoiceDialogOpen(false);
    setInvoiceFormData({
      purchaseOrderId: "",
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      notes: "",
    });
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

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string; color: string }> = {
      pending: { variant: "outline", label: "Pending", color: "text-yellow-600" },
      partial: { variant: "secondary", label: "Partial", color: "text-blue-600" },
      completed: { variant: "default", label: "Completed", color: "text-green-600" },
      discrepancy: { variant: "destructive", label: "Discrepancy", color: "text-red-600" },
      paid: { variant: "default", label: "Paid", color: "text-green-600" },
      overdue: { variant: "destructive", label: "Overdue", color: "text-red-600" },
    };

    const { variant, label } = config[status] || config.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receiving & Invoicing</h1>
          <p className="text-muted-foreground">
            Penerimaan barang dan pencatatan invoice supplier
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isGRDialogOpen} onOpenChange={setIsGRDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Package className="mr-2 h-4 w-4" />
                Terima Barang
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Penerimaan Barang</DialogTitle>
                <DialogDescription>
                  Catat barang yang diterima dari supplier
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleGRSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="po">Purchase Order *</Label>
                  <Select
                    value={grFormData.purchaseOrderId}
                    onValueChange={handlePOSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih PO" />
                    </SelectTrigger>
                    <SelectContent>
                      {sentPOs.map((po) => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.poNumber} - {po.supplierName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {grFormData.items.length > 0 && (
                  <div className="space-y-2">
                    <Label>Items Diterima</Label>
                    <div className="space-y-2">
                      {grFormData.items.map((item, index) => {
                        const invItem = inventoryService.getById(item.inventoryItemId);
                        return (
                          <div key={index} className="p-3 border rounded-lg space-y-2">
                            <div className="font-medium">{invItem?.name}</div>
                            <div className="grid gap-2 md:grid-cols-4">
                              <div>
                                <Label className="text-xs">Dipesan</Label>
                                <Input
                                  type="number"
                                  value={item.orderedQuantity}
                                  disabled
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Diterima *</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.receivedQuantity}
                                  onChange={(e) => {
                                    const newItems = [...grFormData.items];
                                    newItems[index].receivedQuantity = parseInt(e.target.value) || 0;
                                    setGrFormData({ ...grFormData, items: newItems });
                                  }}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Batch Number</Label>
                                <Input
                                  value={item.batchNumber || ""}
                                  onChange={(e) => {
                                    const newItems = [...grFormData.items];
                                    newItems[index].batchNumber = e.target.value;
                                    setGrFormData({ ...grFormData, items: newItems });
                                  }}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Expiry Date</Label>
                                <Input
                                  type="date"
                                  value={item.expiryDate || ""}
                                  onChange={(e) => {
                                    const newItems = [...grFormData.items];
                                    newItems[index].expiryDate = e.target.value;
                                    setGrFormData({ ...grFormData, items: newItems });
                                  }}
                                  className="h-8"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={grFormData.notes}
                    onChange={(e) =>
                      setGrFormData({ ...grFormData, notes: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsGRDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit">Simpan Penerimaan</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Catat Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Catat Invoice Supplier</DialogTitle>
                <DialogDescription>
                  Input detail invoice dari supplier
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="po-invoice">Purchase Order *</Label>
                  <Select
                    value={invoiceFormData.purchaseOrderId}
                    onValueChange={(value) =>
                      setInvoiceFormData({ ...invoiceFormData, purchaseOrderId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih PO" />
                    </SelectTrigger>
                    <SelectContent>
                      {sentPOs.map((po) => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.poNumber} - {po.supplierName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">No. Invoice *</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceFormData.invoiceNumber}
                      onChange={(e) =>
                        setInvoiceFormData({ ...invoiceFormData, invoiceNumber: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Tanggal Invoice *</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={invoiceFormData.invoiceDate}
                      onChange={(e) =>
                        setInvoiceFormData({ ...invoiceFormData, invoiceDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Jatuh Tempo *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceFormData.dueDate}
                    onChange={(e) =>
                      setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-notes">Catatan</Label>
                  <Textarea
                    id="invoice-notes"
                    value={invoiceFormData.notes}
                    onChange={(e) =>
                      setInvoiceFormData({ ...invoiceFormData, notes: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInvoiceDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit">Simpan Invoice</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Goods Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goodsReceipts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {invoices.filter(i => i.status === "pending" || i.status === "partial").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {threeWayMatchService.getDiscrepancies().length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Receiving Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="goods-receipts">Goods Receipts</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="matching">3-Way Match</TabsTrigger>
            </TabsList>

            {/* Goods Receipts Tab */}
            <TabsContent value="goods-receipts" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GR Number</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goodsReceipts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">Tidak ada penerimaan barang</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    goodsReceipts.map((gr) => (
                      <TableRow key={gr.id}>
                        <TableCell className="font-medium">{gr.grNumber}</TableCell>
                        <TableCell>{gr.poNumber}</TableCell>
                        <TableCell>{gr.supplierName}</TableCell>
                        <TableCell>{gr.items.length} item(s)</TableCell>
                        <TableCell>{getStatusBadge(gr.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(gr.receivedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setViewingGR(gr);
                              setIsViewGRDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">Tidak ada invoice</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.poNumber}</TableCell>
                        <TableCell>{invoice.supplierName}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(invoice.totalAmount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(invoice.dueDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setViewingInvoice(invoice);
                              setIsViewInvoiceDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* 3-Way Match Tab */}
            <TabsContent value="matching" className="mt-4">
              <div className="space-y-4">
                {threeWayMatchService.getAll().map((match) => {
                  const po = purchaseOrderService.getById(match.purchaseOrderId);
                  if (!po) return null;

                  return (
                    <Card key={match.purchaseOrderId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{po.poNumber}</CardTitle>
                            <p className="text-sm text-muted-foreground">{po.supplierName}</p>
                          </div>
                          {match.status === "matched" ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Matched
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Discrepancy
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      {match.discrepancies.length > 0 && (
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-red-600">Discrepancies:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {match.discrepancies.map((disc, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  {disc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>

    {/* View GR Dialog */}
    <Dialog open={isViewGRDialogOpen} onOpenChange={setIsViewGRDialogOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Goods Receipt Detail</DialogTitle>
          <DialogDescription>{viewingGR?.grNumber}</DialogDescription>
        </DialogHeader>
        {viewingGR && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">PO Number</p>
                <p className="text-sm font-medium">{viewingGR.poNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(viewingGR.status)}</div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Received Items</p>
              <div className="space-y-2">
                {viewingGR.items.map((item, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium">{item.inventoryItemName}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Ordered: </span>
                        <span>{item.orderedQuantity} {item.unit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Received: </span>
                        <span className="font-medium">{item.receivedQuantity} {item.unit}</span>
                      </div>
                      {item.batchNumber && (
                        <div>
                          <span className="text-muted-foreground">Batch: </span>
                          <span>{item.batchNumber}</span>
                        </div>
                      )}
                      {item.expiryDate && (
                        <div>
                          <span className="text-muted-foreground">Expiry: </span>
                          <span>{formatDate(item.expiryDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* View Invoice Dialog */}
    <Dialog open={isViewInvoiceDialogOpen} onOpenChange={setIsViewInvoiceDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Detail</DialogTitle>
          <DialogDescription>{viewingInvoice?.invoiceNumber}</DialogDescription>
        </DialogHeader>
        {viewingInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">PO Number</p>
                <p className="text-sm font-medium">{viewingInvoice.poNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(viewingInvoice.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice Date</p>
                <p className="text-sm">{formatDate(viewingInvoice.invoiceDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p className="text-sm">{formatDate(viewingInvoice.dueDate)}</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(viewingInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span className="font-medium">{formatCurrency(viewingInvoice.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(viewingInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Paid:</span>
                <span>{formatCurrency(viewingInvoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Remaining:</span>
                <span className="text-yellow-600">{formatCurrency(viewingInvoice.remainingAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}