"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Wallet,
} from "lucide-react";
import { 
  financialReportService, 
  cashflowService,
  CATEGORY_LABELS,
  INFLOW_CATEGORIES,
  OUTFLOW_CATEGORIES,
} from "@/lib/services/financialService";
import { CashflowEntry, CashflowCategory } from "@/lib/types/workflow";
import { toast } from "sonner";

export default function FinancialPage() {
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month");
  const [activeTab, setActiveTab] = useState("overview");
  const [cashflowEntries, setCashflowEntries] = useState<CashflowEntry[]>([]);
  const [isInflowDialogOpen, setIsInflowDialogOpen] = useState(false);
  const [isOutflowDialogOpen, setIsOutflowDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<CashflowEntry | null>(null);

  const [inflowFormData, setInflowFormData] = useState({
    category: '' as CashflowCategory,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'check' | 'card' | 'other',
    recordedBy: 'Finance Staff',
    notes: '',
  });

  const [outflowFormData, setOutflowFormData] = useState({
    category: '' as CashflowCategory,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'check' | 'card' | 'other',
    recordedBy: 'Finance Staff',
    notes: '',
  });

  const calculatePeriodDates = (periodType: string) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (periodType) {
      case "week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    loadFinancialData();
  }, [period]);

  const loadFinancialData = () => {
    const { startDate, endDate } = calculatePeriodDates(period);
    const entries = cashflowService.getByDateRange(startDate, endDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setCashflowEntries(entries);
  };

  const handleInflowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inflowFormData.category) {
      toast.error("Pilih kategori pendapatan");
      return;
    }

    if (inflowFormData.amount <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    cashflowService.recordEntry({
      type: 'inflow',
      category: inflowFormData.category,
      amount: inflowFormData.amount,
      description: inflowFormData.description,
      date: inflowFormData.date,
      paymentMethod: inflowFormData.paymentMethod,
      recordedBy: inflowFormData.recordedBy,
      notes: inflowFormData.notes || undefined,
    });

    toast.success("Pemasukan berhasil dicatat");
    loadFinancialData();
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

    cashflowService.recordEntry({
      type: 'outflow',
      category: outflowFormData.category,
      amount: outflowFormData.amount,
      description: outflowFormData.description,
      date: outflowFormData.date,
      paymentMethod: outflowFormData.paymentMethod,
      recordedBy: outflowFormData.recordedBy,
      notes: outflowFormData.notes || undefined,
    });

    toast.success("Pengeluaran berhasil dicatat");
    loadFinancialData();
    setIsOutflowDialogOpen(false);
    resetOutflowForm();
  };

  const resetInflowForm = () => {
    setInflowFormData({
      category: '' as CashflowCategory,
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      recordedBy: 'Finance Staff',
      notes: '',
    });
  };

  const resetOutflowForm = () => {
    setOutflowFormData({
      category: '' as CashflowCategory,
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      recordedBy: 'Finance Staff',
      notes: '',
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

  const { startDate, endDate } = calculatePeriodDates(period);
  const summary = financialReportService.generateSummary(startDate, endDate);
  const incomeStatement = financialReportService.generateIncomeStatement(startDate, endDate);
  
  const inflows = cashflowEntries.filter(e => e.type === 'inflow');
  const outflows = cashflowEntries.filter(e => e.type === 'outflow');
  const totalInflow = inflows.reduce((sum, e) => sum + e.amount, 0);
  const totalOutflow = outflows.reduce((sum, e) => sum + e.amount, 0);
  const netCashflow = totalInflow - totalOutflow;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Laporan Keuangan
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola cash flow dan analisis laporan laba rugi
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-lg p-1 border shadow-sm">
          <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-36 border-0 shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 Hari</SelectItem>
              <SelectItem value="month">30 Hari</SelectItem>
              <SelectItem value="quarter">3 Bulan</SelectItem>
              <SelectItem value="year">1 Tahun</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-gradient-to-br from-card to-green-50/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
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
              Cash In periode ini
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-gradient-to-br from-card to-red-50/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
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
              Cash Out periode ini
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary shadow-lg hover:shadow-xl transition-shadow duration-200 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                Net Cashflow
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netCashflow >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {formatCurrency(netCashflow)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Selisih kas bersih
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-gradient-to-br from-card to-yellow-50/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                Hutang Pending
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {formatCurrency(summary.pendingPayments)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Belum dibayar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Manajemen Keuangan</CardTitle>
            <div className="flex gap-2">
              <Dialog open={isInflowDialogOpen} onOpenChange={setIsInflowDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Cash In
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Catat Pemasukan (Cash In)</DialogTitle>
                    <DialogDescription>
                      Tambahkan transaksi pemasukan kas
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInflowSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Kategori *</Label>
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
                          {INFLOW_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Jumlah (Rp) *</Label>
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
                      <Label>Deskripsi *</Label>
                      <Input
                        value={inflowFormData.description}
                        onChange={(e) =>
                          setInflowFormData({ ...inflowFormData, description: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tanggal *</Label>
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
                        <Label>Metode *</Label>
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
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Catatan</Label>
                      <Textarea
                        value={inflowFormData.notes}
                        onChange={(e) =>
                          setInflowFormData({ ...inflowFormData, notes: e.target.value })
                        }
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
                      <Button type="submit">Simpan</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isOutflowDialogOpen} onOpenChange={setIsOutflowDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Cash Out
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Catat Pengeluaran (Cash Out)</DialogTitle>
                    <DialogDescription>
                      Tambahkan transaksi pengeluaran kas
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleOutflowSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Kategori *</Label>
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
                          {OUTFLOW_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Jumlah (Rp) *</Label>
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
                      <Label>Deskripsi *</Label>
                      <Input
                        value={outflowFormData.description}
                        onChange={(e) =>
                          setOutflowFormData({ ...outflowFormData, description: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tanggal *</Label>
                        <Input
                          type="date"
                          value={outflowFormData.date}
                          onChange={(e) =>
                            setOutflowFormData({ ...outflowFormData, date: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Metode *</Label>
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
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Catatan</Label>
                      <Textarea
                        value={outflowFormData.notes}
                        onChange={(e) =>
                          setOutflowFormData({ ...outflowFormData, notes: e.target.value })
                        }
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
                      <Button type="submit">Simpan</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
              <TabsTrigger value="income-statement">Laba Rugi</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Inflows by Category */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Pemasukan per Kategori
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {incomeStatement.income.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Tidak ada pemasukan
                        </p>
                      ) : (
                        incomeStatement.income.items.map((item) => (
                          <div key={item.category} className="flex items-center justify-between">
                            <span className="text-sm">{CATEGORY_LABELS[item.category]}</span>
                            <span className="text-sm font-semibold text-green-600">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        ))
                      )}
                      {incomeStatement.income.items.length > 0 && (
                        <div className="pt-3 border-t flex items-center justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(incomeStatement.income.total)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Outflows by Category */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      Pengeluaran per Kategori
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {incomeStatement.expenses.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Tidak ada pengeluaran
                        </p>
                      ) : (
                        incomeStatement.expenses.items.map((item) => (
                          <div key={item.category} className="flex items-center justify-between">
                            <span className="text-sm">{CATEGORY_LABELS[item.category]}</span>
                            <span className="text-sm font-semibold text-red-600">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        ))
                      )}
                      {incomeStatement.expenses.items.length > 0 && (
                        <div className="pt-3 border-t flex items-center justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-red-600">
                            {formatCurrency(incomeStatement.expenses.total)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Cash Flow Tab */}
            <TabsContent value="cashflow" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Transaksi Cash Flow</h3>
                  <div className="flex gap-2 text-sm">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Pemasukan
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Pengeluaran
                    </span>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashflowEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">Belum ada transaksi</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      cashflowEntries.map((entry) => (
                        <TableRow key={entry.id} className="hover:bg-muted/50">
                          <TableCell className="text-sm">
                            {formatDate(entry.date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${entry.type === 'inflow' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className="text-sm">{CATEGORY_LABELS[entry.category]}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{entry.description}</TableCell>
                          <TableCell className="text-sm capitalize">{entry.paymentMethod}</TableCell>
                          <TableCell className={`text-right font-semibold ${entry.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.type === 'inflow' ? '+' : '-'} {formatCurrency(entry.amount)}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Income Statement / Laba Rugi Tab */}
            <TabsContent value="income-statement" className="mt-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Neraca Laba Rugi</h3>
                      <p className="text-sm text-muted-foreground">
                        Periode: {formatDate(startDate)} - {formatDate(endDate)}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-primary/50" />
                  </div>
                </div>

                <Card>
                  <CardHeader className="bg-green-50/50 dark:bg-green-950/20">
                    <CardTitle className="text-base text-green-700 dark:text-green-400">
                      PENDAPATAN
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      {incomeStatement.income.items.map((item) => (
                        <div key={item.category} className="flex items-center justify-between py-2">
                          <span className="text-sm pl-4">{CATEGORY_LABELS[item.category]}</span>
                          <span className="font-mono">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t-2 border-green-200 dark:border-green-800 flex items-center justify-between font-semibold">
                        <span>Total Pendapatan</span>
                        <span className="text-green-600">{formatCurrency(incomeStatement.income.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-red-50/50 dark:bg-red-950/20">
                    <CardTitle className="text-base text-red-700 dark:text-red-400">
                      BEBAN & PENGELUARAN
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      {incomeStatement.expenses.items.map((item) => (
                        <div key={item.category} className="flex items-center justify-between py-2">
                          <span className="text-sm pl-4">{CATEGORY_LABELS[item.category]}</span>
                          <span className="font-mono">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t-2 border-red-200 dark:border-red-800 flex items-center justify-between font-semibold">
                        <span>Total Beban</span>
                        <span className="text-red-600">{formatCurrency(incomeStatement.expenses.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-2 ${incomeStatement.netIncome >= 0 ? 'border-primary bg-primary/5' : 'border-red-500 bg-red-50/50 dark:bg-red-950/20'}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {incomeStatement.netIncome >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Total Pendapatan - Total Beban
                        </p>
                      </div>
                      <div className={`text-3xl font-bold ${incomeStatement.netIncome >= 0 ? 'text-primary' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(incomeStatement.netIncome))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Entry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>
              {viewingEntry?.type === 'inflow' ? 'Pemasukan' : 'Pengeluaran'}
            </DialogDescription>
          </DialogHeader>
          {viewingEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                  <p className="text-sm font-medium">{CATEGORY_LABELS[viewingEntry.category]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jumlah</p>
                  <p className={`text-lg font-bold ${viewingEntry.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(viewingEntry.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                  <p className="text-sm">{formatDate(viewingEntry.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Metode</p>
                  <p className="text-sm capitalize">{viewingEntry.paymentMethod}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
                  <p className="text-sm">{viewingEntry.description}</p>
                </div>
                {viewingEntry.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Catatan</p>
                    <p className="text-sm">{viewingEntry.notes}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Dicatat oleh</p>
                  <p className="text-sm">{viewingEntry.recordedBy}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}