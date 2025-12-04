"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import {
  cashflowService,
  CATEGORY_LABELS,
  INFLOW_CATEGORIES,
  OUTFLOW_CATEGORIES,
} from "@/lib/services/financialService";
import { CashflowEntry, CashflowCategory } from "@/lib/types/workflow";
import { toast } from "sonner";

export default function CashFlowPage() {
  const [entries, setEntries] = useState<CashflowEntry[]>([]);
  const [isInflowDialogOpen, setIsInflowDialogOpen] = useState(false);
  const [isOutflowDialogOpen, setIsOutflowDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<CashflowEntry | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("all");

  const [inflowFormData, setInflowFormData] = useState({
    category: "" as CashflowCategory,
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash" as "cash" | "transfer" | "check" | "card" | "other",
    recordedBy: "Finance Staff",
    notes: "",
  });

  const [outflowFormData, setOutflowFormData] = useState({
    category: "" as CashflowCategory,
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash" as "cash" | "transfer" | "check" | "card" | "other",
    recordedBy: "Finance Staff",
    notes: "",
  });

  useEffect(() => {
    loadEntries();
  }, [dateFilter]);

  const loadEntries = () => {
    let allEntries = cashflowService.getAll();

    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      allEntries = allEntries.filter((e) => e.date.startsWith(today));
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      allEntries = cashflowService.getByDateRange(
        weekAgo.toISOString().split("T")[0],
        new Date().toISOString().split("T")[0]
      );
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      allEntries = cashflowService.getByDateRange(
        monthAgo.toISOString().split("T")[0],
        new Date().toISOString().split("T")[0]
      );
    }

    setEntries(allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleInflowSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inflowFormData.category) {
      toast.error("Pilih kategori pemasukan");
      return;
    }

    if (inflowFormData.amount <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    if (!inflowFormData.description.trim()) {
      toast.error("Masukkan deskripsi transaksi");
      return;
    }

    cashflowService.recordEntry({
      type: "inflow",
      category: inflowFormData.category,
      amount: inflowFormData.amount,
      description: inflowFormData.description,
      date: inflowFormData.date,
      paymentMethod: inflowFormData.paymentMethod,
      recordedBy: inflowFormData.recordedBy,
      notes: inflowFormData.notes || undefined,
    });

    toast.success("Pemasukan berhasil dicatat", {
      description: `${formatCurrency(inflowFormData.amount)} - ${inflowFormData.description}`,
    });
    loadEntries();
    setIsInflowDialogOpen(false);
    resetInflowForm();
  };

  const handleOutflowSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!outflowFormData.category) {
      toast.error("Pilih kategori pengeluaran");
      return;
    }

    if (outflowFormData.amount <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    if (!outflowFormData.description.trim()) {
      toast.error("Masukkan deskripsi transaksi");
      return;
    }

    cashflowService.recordEntry({
      type: "outflow",
      category: outflowFormData.category,
      amount: outflowFormData.amount,
      description: outflowFormData.description,
      date: outflowFormData.date,
      paymentMethod: outflowFormData.paymentMethod,
      recordedBy: outflowFormData.recordedBy,
      notes: outflowFormData.notes || undefined,
    });

    toast.success("Pengeluaran berhasil dicatat", {
      description: `${formatCurrency(outflowFormData.amount)} - ${outflowFormData.description}`,
    });
    loadEntries();
    setIsOutflowDialogOpen(false);
    resetOutflowForm();
  };

  const resetInflowForm = () => {
    setInflowFormData({
      category: "" as CashflowCategory,
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      recordedBy: "Finance Staff",
      notes: "",
    });
  };

  const resetOutflowForm = () => {
    setOutflowFormData({
      category: "" as CashflowCategory,
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      recordedBy: "Finance Staff",
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const inflows = entries.filter((e) => e.type === "inflow");
  const outflows = entries.filter((e) => e.type === "outflow");
  const totalInflow = inflows.reduce((sum, e) => sum + e.amount, 0);
  const totalOutflow = outflows.reduce((sum, e) => sum + e.amount, 0);
  const netCashflow = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Arus Kas (Cash Flow)
          </h1>
          <p className="text-muted-foreground mt-2">
            Pencatatan pemasukan dan pengeluaran untuk UMKM catering
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="week">7 Hari</SelectItem>
              <SelectItem value="month">30 Hari</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-green-50/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ArrowDownRight className="h-5 w-5 text-green-600" />
                </div>
                Total Pemasukan
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totalInflow)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {inflows.length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-red-50/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <ArrowUpRight className="h-5 w-5 text-red-600" />
                </div>
                Total Pengeluaran
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totalOutflow)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {outflows.length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                Saldo Bersih
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                netCashflow >= 0 ? "text-primary" : "text-red-600"
              }`}
            >
              {formatCurrency(netCashflow)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {netCashflow >= 0 ? "Surplus" : "Defisit"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Dialog open={isInflowDialogOpen} onOpenChange={setIsInflowDialogOpen}>
          <Button
            onClick={() => setIsInflowDialogOpen(true)}
            className="gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">Tambah Pemasukan</span>
          </Button>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <ArrowDownRight className="h-5 w-5" />
                Catat Pemasukan
              </DialogTitle>
              <DialogDescription>
                Tambahkan transaksi pemasukan kas/uang masuk
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInflowSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Kategori Pemasukan <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={inflowFormData.category}
                  onValueChange={(value: CashflowCategory) =>
                    setInflowFormData({ ...inflowFormData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {INFLOW_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Jumlah (Rp) <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  value={inflowFormData.amount}
                  onChange={(value) =>
                    setInflowFormData({ ...inflowFormData, amount: value })
                  }
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Deskripsi <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={inflowFormData.description}
                  onChange={(e) =>
                    setInflowFormData({
                      ...inflowFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Contoh: Pembayaran pesanan katering"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input
                    type="date"
                    value={inflowFormData.date}
                    onChange={(e) =>
                      setInflowFormData({ ...inflowFormData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Metode Pembayaran</Label>
                  <Select
                    value={inflowFormData.paymentMethod}
                    onValueChange={(value: any) =>
                      setInflowFormData({ ...inflowFormData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="transfer">Transfer Bank</SelectItem>
                      <SelectItem value="card">Kartu Debit/Kredit</SelectItem>
                      <SelectItem value="check">Cek</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Textarea
                  value={inflowFormData.notes}
                  onChange={(e) =>
                    setInflowFormData({ ...inflowFormData, notes: e.target.value })
                  }
                  placeholder="Catatan tambahan..."
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInflowDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Simpan Pemasukan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isOutflowDialogOpen} onOpenChange={setIsOutflowDialogOpen}>
          <Button
            onClick={() => setIsOutflowDialogOpen(true)}
            variant="destructive"
            className="gap-2 flex-1 sm:flex-none"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">Tambah Pengeluaran</span>
          </Button>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <ArrowUpRight className="h-5 w-5" />
                Catat Pengeluaran
              </DialogTitle>
              <DialogDescription>
                Tambahkan transaksi pengeluaran kas/uang keluar
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleOutflowSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Kategori Pengeluaran <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={outflowFormData.category}
                  onValueChange={(value: CashflowCategory) =>
                    setOutflowFormData({ ...outflowFormData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTFLOW_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Jumlah (Rp) <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  value={outflowFormData.amount}
                  onChange={(value) =>
                    setOutflowFormData({ ...outflowFormData, amount: value })
                  }
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Deskripsi <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={outflowFormData.description}
                  onChange={(e) =>
                    setOutflowFormData({
                      ...outflowFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Contoh: Pembelian bahan baku"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input
                    type="date"
                    value={outflowFormData.date}
                    onChange={(e) =>
                      setOutflowFormData({
                        ...outflowFormData,
                        date: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Metode Pembayaran</Label>
                  <Select
                    value={outflowFormData.paymentMethod}
                    onValueChange={(value: any) =>
                      setOutflowFormData({ ...outflowFormData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="transfer">Transfer Bank</SelectItem>
                      <SelectItem value="card">Kartu Debit/Kredit</SelectItem>
                      <SelectItem value="check">Cek</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Textarea
                  value={outflowFormData.notes}
                  onChange={(e) =>
                    setOutflowFormData({ ...outflowFormData, notes: e.target.value })
                  }
                  placeholder="Catatan tambahan..."
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOutflowDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="destructive">
                  Simpan Pengeluaran
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transactions Table */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Riwayat Transaksi Arus Kas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-muted">
                  <Wallet className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Belum Ada Transaksi</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mulai catat pemasukan atau pengeluaran untuk melihat riwayat
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal & Waktu</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm">
                        <div>
                          <div className="font-medium">{formatDate(entry.date)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(entry.createdAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            entry.type === "inflow"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {entry.type === "inflow" ? (
                            <>
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                              Masuk
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              Keluar
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {CATEGORY_LABELS[entry.category]}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {entry.description}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {entry.paymentMethod === "cash" && "Tunai"}
                        {entry.paymentMethod === "transfer" && "Transfer"}
                        {entry.paymentMethod === "card" && "Kartu"}
                        {entry.paymentMethod === "check" && "Cek"}
                        {entry.paymentMethod === "other" && "Lainnya"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-bold ${
                          entry.type === "inflow" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {entry.type === "inflow" ? "+" : "-"}{" "}
                        {formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setViewingEntry(entry);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Entry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingEntry?.type === "inflow" ? (
                <>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <ArrowDownRight className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-green-600">Detail Pemasukan</span>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <ArrowUpRight className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="text-red-600">Detail Pengeluaran</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewingEntry && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Jumlah</p>
                  <p
                    className={`text-3xl font-bold ${
                      viewingEntry.type === "inflow" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {viewingEntry.type === "inflow" ? "+" : "-"}{" "}
                    {formatCurrency(viewingEntry.amount)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                  <p className="text-sm font-medium mt-1">
                    {CATEGORY_LABELS[viewingEntry.category]}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Metode</p>
                  <p className="text-sm font-medium mt-1 capitalize">
                    {viewingEntry.paymentMethod === "cash" && "Tunai"}
                    {viewingEntry.paymentMethod === "transfer" && "Transfer Bank"}
                    {viewingEntry.paymentMethod === "card" && "Kartu"}
                    {viewingEntry.paymentMethod === "check" && "Cek"}
                    {viewingEntry.paymentMethod === "other" && "Lainnya"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                  <p className="text-sm mt-1">{formatDate(viewingEntry.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Waktu</p>
                  <p className="text-sm mt-1">{formatTime(viewingEntry.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
                  <p className="text-sm mt-1">{viewingEntry.description}</p>
                </div>
                {viewingEntry.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Catatan</p>
                    <p className="text-sm mt-1">{viewingEntry.notes}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Dicatat oleh</p>
                  <p className="text-sm mt-1">{viewingEntry.recordedBy}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}