"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Filter, Eye, Trash2, CalendarDays, Save, XCircle } from "lucide-react";
import { toast } from "sonner";
import { journalEntryService, chartOfAccountsService } from "@/lib/services/accountingService";
import { JournalEntry, JournalEntryLine } from "@/lib/types/accounting";

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<Omit<JournalEntryLine, "id">[]>([
    { accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0, description: "" },
    { accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0, description: "" },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allEntries = journalEntryService.getAll();
    const allAccounts = chartOfAccountsService.getAll();
    setEntries(allEntries);
    setAccounts(allAccounts);
  };

  const handleAddLine = () => {
    setLines([
      ...lines,
      { accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0, description: "" },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    } else {
      toast.error("Minimal 2 baris jurnal diperlukan");
    }
  };

  const handleLineChange = (
    index: number,
    field: keyof Omit<JournalEntryLine, "id">,
    value: string | number
  ) => {
    const newLines = [...lines];
    
    if (field === "accountId" && typeof value === "string") {
      const account = accounts.find((a) => a.id === value);
      if (account) {
        newLines[index] = {
          ...newLines[index],
          accountId: value,
          accountCode: account.code,
          accountName: account.name,
        };
      }
    } else {
      newLines[index] = { ...newLines[index], [field]: value };
    }
    
    setLines(newLines);
  };

  const calculateTotals = () => {
    const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    return { totalDebit, totalCredit };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { totalDebit, totalCredit } = calculateTotals();
    
    if (totalDebit !== totalCredit) {
      toast.error("Total Debit dan Kredit harus seimbang!", {
        description: `Debit: Rp ${totalDebit.toLocaleString("id-ID")} | Kredit: Rp ${totalCredit.toLocaleString("id-ID")}`,
      });
      return;
    }

    if (totalDebit === 0 || totalCredit === 0) {
      toast.error("Total Debit dan Kredit tidak boleh 0");
      return;
    }

    // Validate all lines have accounts
    if (lines.some((line) => !line.accountId)) {
      toast.error("Semua baris harus memiliki akun");
      return;
    }

    const newEntry: Omit<JournalEntry, "id" | "entryNumber" | "createdAt" | "updatedAt"> = {
      date: new Date(date).toISOString(),
      type: "manual",
      status: "draft",
      description,
      reference: reference || undefined,
      lines: lines.map((line, index) => ({ ...line, id: `line-${index}` })) as JournalEntryLine[],
      totalDebit,
      totalCredit,
      createdBy: "User",
    };

    const createdEntry = journalEntryService.createEntry(newEntry);
    journalEntryService.postEntry(createdEntry.id, "User");
    
    toast.success("Jurnal berhasil ditambahkan", {
      description: `${description} - Rp ${totalDebit.toLocaleString("id-ID")}`,
    });

    // Reset form
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setReference("");
    setLines([
      { accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0, description: "" },
      { accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0, description: "" },
    ]);
    setIsAddDialogOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus jurnal ini?")) {
      journalEntryService.delete(id);
      toast.success("Jurnal berhasil dihapus");
      loadData();
    }
  };

  const handleView = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsViewDialogOpen(true);
  };

  const filteredEntries = entries.filter((entry) => {
    // Filter by type
    if (filterType !== "all" && entry.type !== filterType) return false;

    // Filter by period
    const entryDate = new Date(entry.date);
    const now = new Date();
    
    if (filterPeriod === "today") {
      return entryDate.toDateString() === now.toDateString();
    } else if (filterPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= weekAgo;
    } else if (filterPeriod === "month") {
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Jurnal Umum
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            General Journal - Pencatatan transaksi keuangan
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jurnal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-5 w-5 text-primary" />
                Tambah Jurnal Manual
              </DialogTitle>
              <DialogDescription>
                Masukkan entri jurnal dengan sistem double-entry bookkeeping
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Deskripsi *</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Pembayaran sewa kantor bulan Desember"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="reference">Referensi (Opsional)</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Contoh: INV-001, PO-123"
                  />
                </div>
              </div>

              {/* Journal Lines */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Baris Jurnal</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                    <Plus className="mr-2 h-3 w-3" />
                    Tambah Baris
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[250px]">Akun</TableHead>
                        <TableHead className="w-[200px]">Keterangan</TableHead>
                        <TableHead className="text-right w-[130px]">Debit</TableHead>
                        <TableHead className="text-right w-[130px]">Kredit</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={line.accountId}
                              onValueChange={(value) => handleLineChange(index, "accountId", value)}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih akun" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.code} - {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={line.description}
                              onChange={(e) => handleLineChange(index, "description", e.target.value)}
                              placeholder="Keterangan"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.debit || ""}
                              onChange={(e) => handleLineChange(index, "debit", parseFloat(e.target.value) || 0)}
                              className="text-right"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.credit || ""}
                              onChange={(e) => handleLineChange(index, "credit", parseFloat(e.target.value) || 0)}
                              className="text-right"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLine(index)}
                              disabled={lines.length <= 2}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className={`p-4 rounded-lg border-2 ${isBalanced ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" : "bg-muted/50 border-border"}`}>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Debit:</span>
                      <span className="font-bold font-mono">Rp {totalDebit.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Kredit:</span>
                      <span className="font-bold font-mono">Rp {totalCredit.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  
                  {!isBalanced && totalDebit > 0 && totalCredit > 0 && (
                    <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">Tidak Seimbang!</span>
                      <span>Selisih: Rp {Math.abs(totalDebit - totalCredit).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  
                  {isBalanced && (
                    <div className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2 font-medium">
                      <Save className="h-4 w-4" />
                      <span>✓ Seimbang - Siap disimpan</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={!isBalanced} size="lg">
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Jurnal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Jurnal</CardDescription>
            <CardTitle className="text-3xl">{entries.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Jurnal Manual</CardDescription>
            <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">
              {entries.filter((e) => e.type === "manual").length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Jurnal Otomatis</CardDescription>
            <CardTitle className="text-3xl text-purple-600 dark:text-purple-400">
              {entries.filter((e) => e.type === "auto").length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Bulan Ini</CardDescription>
            <CardTitle className="text-3xl text-green-600 dark:text-green-400">
              {entries.filter((e) => {
                const entryDate = new Date(e.date);
                const now = new Date();
                return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
              }).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle>Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipe Jurnal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="auto">Otomatis</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Periode</SelectItem>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries Table */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Daftar Jurnal</CardTitle>
          </div>
          <CardDescription>
            Menampilkan {filteredEntries.length} dari {entries.length} jurnal
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Kredit</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Belum ada jurnal</p>
                      <p className="text-sm mt-1">Klik "Tambah Jurnal" untuk membuat entri baru</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          {new Date(entry.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{entry.description}</TableCell>
                      <TableCell>
                        {entry.reference && (
                          <Badge variant="outline" className="font-mono text-xs">{entry.reference}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.type === "manual" ? "default" : "secondary"}>
                          {entry.type === "manual" ? "Manual" : "Otomatis"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        Rp {entry.totalDebit.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        Rp {entry.totalCredit.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(entry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {entry.type === "manual" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Detail Jurnal
            </DialogTitle>
            <DialogDescription>
              {selectedEntry && new Date(selectedEntry.date).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg text-sm">
                <div>
                  <span className="text-muted-foreground">Deskripsi:</span>
                  <p className="font-medium">{selectedEntry.description}</p>
                </div>
                {selectedEntry.reference && (
                  <div>
                    <span className="text-muted-foreground">Referensi:</span>
                    <p className="font-medium">{selectedEntry.reference}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Tipe:</span>
                  <p className="font-medium capitalize">{selectedEntry.type === "manual" ? "Manual" : "Otomatis"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Dibuat:</span>
                  <p className="font-medium">
                    {new Date(selectedEntry.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Akun</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{line.accountName}</div>
                            <div className="text-xs text-muted-foreground font-mono">{line.accountCode}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{line.description}</TableCell>
                        <TableCell className="text-right font-mono">
                          {line.debit > 0 ? `Rp ${line.debit.toLocaleString("id-ID")}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {line.credit > 0 ? `Rp ${line.credit.toLocaleString("id-ID")}` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold border-t-2">
                      <TableCell colSpan={2}>TOTAL</TableCell>
                      <TableCell className="text-right font-mono">
                        Rp {selectedEntry.totalDebit.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        Rp {selectedEntry.totalCredit.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}