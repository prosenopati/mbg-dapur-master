"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
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
  Clock,
  DollarSign,
  XCircle,
} from "lucide-react";
import { paymentRequestService, paymentService } from "@/lib/services/paymentService";
import { invoiceService } from "@/lib/services/receivingService";
import { PaymentRequest, Payment } from "@/lib/types/workflow";
import { toast } from "sonner";

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("requests");
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const pendingInvoices = invoiceService.getPending();

  const [requestFormData, setRequestFormData] = useState({
    invoiceId: "",
    requestedBy: "Staff Keuangan",
    notes: "",
  });

  const [paymentFormData, setPaymentFormData] = useState({
    invoiceId: "",
    paymentRequestId: "",
    amount: 0,
    method: "transfer" as Payment["method"],
    reference: "",
    paidBy: "Manajer Keuangan",
    approvedBy: "Direktur",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPaymentRequests(
      paymentRequestService.getAll().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
    setPayments(
      paymentService.getAll().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const invoice = invoiceService.getById(requestFormData.invoiceId);
    if (!invoice) {
      toast.error("Invoice tidak ditemukan");
      return;
    }

    paymentRequestService.createRequest({
      invoiceId: requestFormData.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      supplierId: invoice.supplierId,
      supplierName: invoice.supplierName,
      amount: invoice.remainingAmount,
      requestedBy: requestFormData.requestedBy,
      notes: requestFormData.notes || undefined,
    });

    toast.success("Permintaan pembayaran berhasil dibuat");
    loadData();
    setIsRequestDialogOpen(false);
    resetRequestForm();
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const invoice = invoiceService.getById(paymentFormData.invoiceId);
    if (!invoice) {
      toast.error("Invoice tidak ditemukan");
      return;
    }

    if (paymentFormData.amount <= 0) {
      toast.error("Jumlah pembayaran harus lebih dari 0");
      return;
    }

    if (paymentFormData.amount > invoice.remainingAmount) {
      toast.error("Jumlah pembayaran melebihi sisa tagihan");
      return;
    }

    paymentService.recordPayment({
      invoiceId: paymentFormData.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      paymentRequestId: paymentFormData.paymentRequestId || undefined,
      supplierId: invoice.supplierId,
      supplierName: invoice.supplierName,
      amount: paymentFormData.amount,
      method: paymentFormData.method,
      reference: paymentFormData.reference || undefined,
      paidBy: paymentFormData.paidBy,
      approvedBy: paymentFormData.approvedBy,
      paidAt: new Date().toISOString(),
      notes: paymentFormData.notes || undefined,
    });

    toast.success("Pembayaran berhasil dicatat");
    loadData();
    setIsPaymentDialogOpen(false);
    resetPaymentForm();
  };

  const handleApproveRequest = (id: string) => {
    paymentRequestService.approve(id);
    toast.success("Permintaan pembayaran disetujui");
    loadData();
  };

  const handleRejectRequest = (id: string) => {
    paymentRequestService.reject(id);
    toast.info("Permintaan pembayaran ditolak");
    loadData();
  };

  const resetRequestForm = () => {
    setRequestFormData({
      invoiceId: "",
      requestedBy: "Staff Keuangan",
      notes: "",
    });
  };

  const resetPaymentForm = () => {
    setPaymentFormData({
      invoiceId: "",
      paymentRequestId: "",
      amount: 0,
      method: "transfer",
      reference: "",
      paidBy: "Manajer Keuangan",
      approvedBy: "Direktur",
      notes: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: "outline", label: "Menunggu", icon: Clock },
      approved: { variant: "secondary", label: "Disetujui", icon: CheckCircle2 },
      paid: { variant: "default", label: "Dibayar", icon: CheckCircle2 },
      rejected: { variant: "destructive", label: "Ditolak", icon: XCircle },
    };

    const { variant, label, icon: Icon } = config[status] || config.pending;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
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

  const stats = {
    totalRequests: paymentRequests.length,
    pending: paymentRequests.filter(r => r.status === "pending").length,
    approved: paymentRequests.filter(r => r.status === "approved").length,
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Pembayaran Supplier
            </h1>
            <p className="text-muted-foreground mt-2">
              Kelola pembayaran ke supplier
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajukan Pembayaran
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Buat Permintaan Pembayaran</DialogTitle>
                  <DialogDescription>
                    Ajukan permintaan pembayaran ke supplier
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="request-invoice">Invoice *</Label>
                    <Select
                      value={requestFormData.invoiceId}
                      onValueChange={(value) => {
                        setRequestFormData({ ...requestFormData, invoiceId: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingInvoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} - {invoice.supplierName} ({formatCurrency(invoice.remainingAmount)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="request-notes">Catatan</Label>
                    <Textarea
                      id="request-notes"
                      value={requestFormData.notes}
                      onChange={(e) =>
                        setRequestFormData({ ...requestFormData, notes: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsRequestDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit">Ajukan</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Catat Pembayaran
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Catat Pembayaran</DialogTitle>
                  <DialogDescription>
                    Catat pembayaran yang telah dilakukan
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-invoice">Invoice *</Label>
                    <Select
                      value={paymentFormData.invoiceId}
                      onValueChange={(value) => {
                        const invoice = pendingInvoices.find(i => i.id === value);
                        setPaymentFormData({ 
                          ...paymentFormData, 
                          invoiceId: value,
                          amount: invoice?.remainingAmount || 0,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingInvoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} - {invoice.supplierName} ({formatCurrency(invoice.remainingAmount)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-amount">Jumlah Pembayaran *</Label>
                    <CurrencyInput
                      id="payment-amount"
                      value={paymentFormData.amount}
                      onChange={(value) =>
                        setPaymentFormData({ ...paymentFormData, amount: value })
                      }
                      placeholder="0"
                      required
                    />
                    {paymentFormData.invoiceId && (
                      <p className="text-xs text-muted-foreground">
                        Sisa tagihan: {formatCurrency(
                          pendingInvoices.find(i => i.id === paymentFormData.invoiceId)?.remainingAmount || 0
                        )}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Metode Pembayaran *</Label>
                    <Select
                      value={paymentFormData.method}
                      onValueChange={(value: any) =>
                        setPaymentFormData({ ...paymentFormData, method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Tunai</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="check">Cek</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-reference">Referensi (No. Transfer/Cek)</Label>
                    <Input
                      id="payment-reference"
                      value={paymentFormData.reference}
                      onChange={(e) =>
                        setPaymentFormData({ ...paymentFormData, reference: e.target.value })
                      }
                      placeholder="Opsional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-notes">Catatan</Label>
                    <Textarea
                      id="payment-notes"
                      value={paymentFormData.notes}
                      onChange={(e) =>
                        setPaymentFormData({ ...paymentFormData, notes: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPaymentDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit">Catat Pembayaran</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Permintaan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Jumlah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(stats.totalAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
            <CardTitle>Manajemen Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="requests">Permintaan Pembayaran</TabsTrigger>
                <TabsTrigger value="payments">Riwayat Pembayaran</TabsTrigger>
              </TabsList>

              {/* Payment Requests Tab */}
              <TabsContent value="requests" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Permintaan</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-muted-foreground">Tidak ada permintaan pembayaran</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paymentRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{request.requestNumber}</TableCell>
                          <TableCell>{request.invoiceNumber}</TableCell>
                          <TableCell>{request.supplierName}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(request.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(request.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {request.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApproveRequest(request.id)}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Setujui
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectRequest(request.id)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Tolak
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Payment History Tab */}
              <TabsContent value="payments" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Pembayaran</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Tanggal Bayar</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-muted-foreground">Tidak ada riwayat pembayaran</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                          <TableCell>{payment.invoiceNumber}</TableCell>
                          <TableCell>{payment.supplierName}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="capitalize">
                            {payment.method === 'cash' ? 'Tunai' : 
                             payment.method === 'transfer' ? 'Transfer' :
                             payment.method === 'check' ? 'Cek' : payment.method}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(payment.paidAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setViewingPayment(payment);
                                setIsViewDialogOpen(true);
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
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pembayaran</DialogTitle>
            <DialogDescription>{viewingPayment?.paymentNumber}</DialogDescription>
          </DialogHeader>
          {viewingPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nomor Invoice</p>
                  <p className="text-sm font-medium">{viewingPayment.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                  <p className="text-sm">{viewingPayment.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jumlah</p>
                  <p className="text-lg font-bold">{formatCurrency(viewingPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Metode</p>
                  <p className="text-sm capitalize">
                    {viewingPayment.method === 'cash' ? 'Tunai' : 
                     viewingPayment.method === 'transfer' ? 'Transfer' :
                     viewingPayment.method === 'check' ? 'Cek' : viewingPayment.method}
                  </p>
                </div>
                {viewingPayment.reference && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Referensi</p>
                    <p className="text-sm">{viewingPayment.reference}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dibayar Oleh</p>
                  <p className="text-sm">{viewingPayment.paidBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Disetujui Oleh</p>
                  <p className="text-sm">{viewingPayment.approvedBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal Bayar</p>
                  <p className="text-sm">{formatDate(viewingPayment.paidAt)}</p>
                </div>
              </div>

              {viewingPayment.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Catatan</p>
                  <p className="text-sm mt-1">{viewingPayment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}