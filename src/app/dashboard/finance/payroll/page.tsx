"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { payrollService } from "@/lib/services/payrollService";
import { employeeService } from "@/lib/services/employeeService";
import { Payroll, PayrollItem, PayrollSchedule, Employee } from "@/lib/types";
import {
  Plus,
  Eye,
  Trash2,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPayroll, setViewingPayroll] = useState<Payroll | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    schedule: "monthly" as PayrollSchedule,
    periodStart: "",
    periodEnd: "",
    paymentDate: "",
    items: [] as PayrollItem[],
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPayrolls(payrollService.getAll());
    setEmployees(employeeService.getActiveEmployees());
    setLoading(false);
  };

  const handleOpenDialog = () => {
    const today = new Date();
    setFormData({
      title: "",
      schedule: "monthly",
      periodStart: new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0],
      periodEnd: new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0],
      paymentDate: new Date(today.getFullYear(), today.getMonth() + 1, 5)
        .toISOString()
        .split("T")[0],
      items: [],
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleView = (payroll: Payroll) => {
    setViewingPayroll(payroll);
    setViewDialogOpen(true);
  };

  const handleAddEmployee = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          employeeId: "",
          employeeName: "",
          employeeNumber: "",
          position: "",
          amount: 0,
          notes: "",
        },
      ],
    }));
  };

  const handleRemoveEmployee = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleEmployeeChange = (index: number, employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeNumber: employee.employeeNumber,
        position: employee.position,
      };
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof PayrollItem,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || formData.items.length === 0) {
      toast.error("Mohon lengkapi title dan tambahkan minimal 1 karyawan");
      return;
    }

    // Validate all items have employee and amount
    const invalidItems = formData.items.some(
      (item) => !item.employeeId || item.amount <= 0
    );
    if (invalidItems) {
      toast.error("Mohon lengkapi data karyawan dan nominal untuk semua item");
      return;
    }

    try {
      payrollService.create({
        ...formData,
        status: "pending",
        createdBy: "u4", // Current user (Finance)
      });
      toast.success("Payroll berhasil dibuat");
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleProcess = (id: string) => {
    if (confirm("Apakah Anda yakin ingin memproses payroll ini?")) {
      payrollService.processPayroll(id, "u4");
      toast.success("Payroll berhasil diproses");
      loadData();
    }
  };

  const handleMarkAsPaid = (id: string) => {
    if (confirm("Apakah Anda yakin pembayaran sudah dilakukan?")) {
      payrollService.markAsPaid(id);
      toast.success("Payroll ditandai sebagai dibayar");
      loadData();
    }
  };

  const handleCancel = (id: string) => {
    if (confirm("Apakah Anda yakin ingin membatalkan payroll ini?")) {
      payrollService.cancelPayroll(id);
      toast.success("Payroll dibatalkan");
      loadData();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus payroll ini?")) {
      if (payrollService.delete(id)) {
        toast.success("Payroll berhasil dihapus");
        loadData();
      } else {
        toast.error("Gagal menghapus payroll");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: "default" | "secondary" | "outline" | "destructive"; className?: string }
    > = {
      pending: { variant: "outline" },
      processed: { variant: "secondary", className: "bg-blue-600 text-white" },
      paid: { variant: "default", className: "bg-green-600" },
      cancelled: { variant: "destructive" },
    };

    const config = variants[status] || { variant: "outline" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getScheduleBadge = (schedule: PayrollSchedule) => {
    const labels = {
      daily: "Harian",
      weekly: "Mingguan",
      monthly: "Bulanan",
      custom: "Custom",
    };
    return <Badge variant="outline">{labels[schedule]}</Badge>;
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
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalPending = payrollService.getTotalByStatus("pending");
  const totalProcessed = payrollService.getTotalByStatus("processed");
  const totalPaid = payrollService.getTotalByStatus("paid");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Payroll Management
            </h1>
            <p className="text-muted-foreground">
              Kelola pembayaran gaji dan honor karyawan
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Payroll
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
              <p className="text-xs text-muted-foreground">
                {payrolls.filter((p) => p.status === "pending").length} payrolls
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalProcessed)}</div>
              <p className="text-xs text-muted-foreground">
                {payrolls.filter((p) => p.status === "processed").length} payrolls
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground">
                {payrolls.filter((p) => p.status === "paid").length} payrolls
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payrolls</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payrolls.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Payrolls Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payroll Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Belum ada payroll
                      </TableCell>
                    </TableRow>
                  ) : (
                    payrolls.map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell className="font-mono text-sm">
                          {payroll.payrollNumber}
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {payroll.title}
                        </TableCell>
                        <TableCell>{getScheduleBadge(payroll.schedule)}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(payroll.periodStart)} -{" "}
                          {formatDate(payroll.periodEnd)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(payroll.paymentDate)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payroll.totalAmount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(payroll)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {payroll.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleProcess(payroll.id)}
                                  title="Process"
                                >
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancel(payroll.id)}
                                  title="Cancel"
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            {payroll.status === "processed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsPaid(payroll.id)}
                                title="Mark as Paid"
                              >
                                <DollarSign className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            {payroll.status === "cancelled" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(payroll.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Payroll Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Payroll Baru</DialogTitle>
            <DialogDescription>
              Buat pembayaran gaji/honor untuk karyawan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Gaji Bulanan Desember 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select
                    value={formData.schedule}
                    onValueChange={(value: PayrollSchedule) =>
                      setFormData({ ...formData, schedule: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Harian</SelectItem>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                      <SelectItem value="custom">Custom Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Tanggal Pembayaran</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodStart">Periode Mulai</Label>
                  <Input
                    id="periodStart"
                    type="date"
                    value={formData.periodStart}
                    onChange={(e) =>
                      setFormData({ ...formData, periodStart: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodEnd">Periode Selesai</Label>
                  <Input
                    id="periodEnd"
                    type="date"
                    value={formData.periodEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, periodEnd: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Catatan tambahan"
                    rows={2}
                  />
                </div>
              </div>

              {/* Employee Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Daftar Karyawan</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEmployee}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Karyawan
                  </Button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    Belum ada karyawan. Klik tombol "Tambah Karyawan" untuk menambahkan.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-4">
                            <Label className="text-xs">Karyawan</Label>
                            <Select
                              value={item.employeeId}
                              onValueChange={(value) =>
                                handleEmployeeChange(index, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih karyawan" />
                              </SelectTrigger>
                              <SelectContent>
                                {employees.map((emp) => (
                                  <SelectItem key={emp.id} value={emp.id}>
                                    {emp.fullName} - {emp.position}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">NIK</Label>
                            <Input
                              value={item.employeeNumber}
                              disabled
                              className="bg-muted text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Posisi</Label>
                            <Input
                              value={item.position}
                              disabled
                              className="bg-muted text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Nominal</Label>
                            <Input
                              type="number"
                              value={item.amount || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "amount",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="0"
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEmployee(index)}
                              className="text-red-600"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="col-span-12">
                            <Label className="text-xs">Catatan</Label>
                            <Input
                              value={item.notes || ""}
                              onChange={(e) =>
                                handleItemChange(index, "notes", e.target.value)
                              }
                              placeholder="Catatan (optional)"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.items.length > 0 && (
                  <div className="flex justify-end pt-4 border-t">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          formData.items.reduce((sum, item) => sum + item.amount, 0)
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">Buat Payroll</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Payroll Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Payroll</DialogTitle>
          </DialogHeader>
          {viewingPayroll && (
            <div className="space-y-6 py-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">Payroll Number</p>
                  <p className="font-mono font-medium">{viewingPayroll.payrollNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{viewingPayroll.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Schedule</p>
                  <p>{getScheduleBadge(viewingPayroll.schedule)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p>{getStatusBadge(viewingPayroll.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="text-sm">
                    {formatDate(viewingPayroll.periodStart)} -{" "}
                    {formatDate(viewingPayroll.periodEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Date</p>
                  <p className="text-sm">{formatDate(viewingPayroll.paymentDate)}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Daftar Karyawan</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIK</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Posisi</TableHead>
                        <TableHead>Catatan</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingPayroll.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {item.employeeNumber}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.employeeName}
                          </TableCell>
                          <TableCell>{item.position}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.notes || "-"}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-semibold">
                          Total Amount
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {formatCurrency(viewingPayroll.totalAmount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes */}
              {viewingPayroll.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Catatan</p>
                  <p className="text-sm">{viewingPayroll.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
