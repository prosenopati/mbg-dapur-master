"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookText, TrendingUp, TrendingDown, CalendarDays, FileText } from "lucide-react";
import { chartOfAccountsService, ledgerService } from "@/lib/services/accountingService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LedgerEntry {
  date: Date;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
  balance: number;
  journalId: string;
}

export default function GeneralLedgerPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      loadLedger();
    }
  }, [selectedAccountId, startDate, endDate]);

  const loadAccounts = () => {
    const allAccounts = chartOfAccountsService.getAll();
    setAccounts(allAccounts);
    
    // Select first account by default
    if (allAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(allAccounts[0].id);
    }
  };

  const loadLedger = () => {
    if (!selectedAccountId) return;

    let entries = ledgerService.getByAccount(selectedAccountId);
    
    // Filter by date range if specified
    if (startDate && endDate) {
      entries = ledgerService.getByDateRange(selectedAccountId, startDate, endDate);
    } else if (startDate) {
      entries = entries.filter(e => new Date(e.date) >= new Date(startDate));
    } else if (endDate) {
      entries = entries.filter(e => new Date(e.date) <= new Date(endDate));
    }

    setLedgerEntries(entries);
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const calculateTotals = () => {
    const totalDebit = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);
    const finalBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].balance : 0;
    
    return { totalDebit, totalCredit, finalBalance };
  };

  const { totalDebit, totalCredit, finalBalance } = calculateTotals();

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BookText className="h-7 w-7 text-primary" />
            Buku Besar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            General Ledger - Riwayat transaksi per akun
          </p>
        </div>
      </div>

      {/* Account Selection & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>Pilih akun dan periode untuk melihat buku besar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Akun</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Dari Tanggal</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Sampai Tanggal</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {(startDate || endDate) && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={clearDateFilter}>
                Reset Filter Tanggal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Summary */}
      {selectedAccount && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardDescription>Akun Dipilih</CardDescription>
              <CardTitle className="text-xl">{selectedAccount.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{selectedAccount.code}</Badge>
                <Badge>{selectedAccount.type}</Badge>
                <Badge variant="secondary">{selectedAccount.category}</Badge>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Total Debit
              </CardDescription>
              <CardTitle className="text-xl">
                Rp {totalDebit.toLocaleString("id-ID")}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Total Kredit
              </CardDescription>
              <CardTitle className="text-xl">
                Rp {totalCredit.toLocaleString("id-ID")}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Ledger Entries Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Riwayat Transaksi</CardTitle>
              <CardDescription>
                {ledgerEntries.length} transaksi
                {(startDate || endDate) && " (filtered)"}
              </CardDescription>
            </div>
            {selectedAccount && ledgerEntries.length > 0 && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Saldo Akhir</div>
                <div className={`text-2xl font-bold ${finalBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  Rp {Math.abs(finalBalance).toLocaleString("id-ID")}
                  {finalBalance < 0 && " (Kredit)"}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Tanggal</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="w-[120px]">Referensi</TableHead>
                  <TableHead className="text-right w-[140px]">Debit</TableHead>
                  <TableHead className="text-right w-[140px]">Kredit</TableHead>
                  <TableHead className="text-right w-[140px]">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedAccountId ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <BookText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Pilih akun untuk melihat buku besar</p>
                    </TableCell>
                  </TableRow>
                ) : ledgerEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Belum ada transaksi untuk akun ini</p>
                      {(startDate || endDate) && (
                        <p className="text-sm mt-2">Coba ubah filter tanggal</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {ledgerEntries.map((entry, index) => (
                      <TableRow key={`${entry.journalId}-${index}`}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(entry.date).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell>
                          {entry.reference && (
                            <Badge variant="outline" className="text-xs">
                              {entry.reference}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.debit > 0 ? (
                            <span className="text-green-600 dark:text-green-400">
                              Rp {entry.debit.toLocaleString("id-ID")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.credit > 0 ? (
                            <span className="text-red-600 dark:text-red-400">
                              Rp {entry.credit.toLocaleString("id-ID")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          <span className={entry.balance >= 0 ? "text-foreground" : "text-muted-foreground"}>
                            Rp {Math.abs(entry.balance).toLocaleString("id-ID")}
                            {entry.balance < 0 && " (K)"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow className="bg-muted/50 font-bold border-t-2">
                      <TableCell colSpan={3} className="text-right">
                        TOTAL
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                        Rp {totalDebit.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-600 dark:text-red-400">
                        Rp {totalCredit.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={finalBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          Rp {Math.abs(finalBalance).toLocaleString("id-ID")}
                        </span>
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          {ledgerEntries.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Debit (menambah aset/beban, mengurangi kewajiban/modal/pendapatan)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Kredit (mengurangi aset/beban, menambah kewajiban/modal/pendapatan)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">(K)</span>
                <span>= Saldo Kredit</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}