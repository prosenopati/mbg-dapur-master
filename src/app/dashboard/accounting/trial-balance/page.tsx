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
import { Badge } from "@/components/ui/badge";
import { Scale, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { accountingReportsService } from "@/lib/services/accountingService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrialBalancePage() {
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadTrialBalance();
  }, [asOfDate]);

  const loadTrialBalance = () => {
    const data = accountingReportsService.generateTrialBalance(asOfDate);
    setTrialBalance(data);
  };

  if (!trialBalance) {
    return <div>Loading...</div>;
  }

  const { totalDebit, totalCredit, isBalanced, lines } = trialBalance;
  const difference = Math.abs(totalDebit - totalCredit);

  const handleExport = () => {
    // Simple CSV export
    const headers = ["Kode Akun", "Nama Akun", "Tipe", "Debit", "Kredit"];
    const rows = lines.map((item: any) => [
      item.accountCode,
      item.accountName,
      item.accountType,
      item.debit.toString(),
      item.credit.toString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.join(",")),
      "",
      "TOTAL,,,," + totalDebit.toString() + "," + totalCredit.toString()
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `trial-balance-${asOfDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group by account type for better organization
  const groupedBalance = lines.reduce((acc: any, item: any) => {
    if (!acc[item.accountType]) {
      acc[item.accountType] = [];
    }
    acc[item.accountType].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const accountTypeOrder = ["asset", "liability", "equity", "revenue", "expense", "cogs"];
  const accountTypeLabels: Record<string, string> = {
    asset: "Aset",
    liability: "Kewajiban",
    equity: "Modal",
    revenue: "Pendapatan",
    expense: "Beban",
    cogs: "HPP"
  };
  const sortedTypes = Object.keys(groupedBalance).sort((a, b) => 
    accountTypeOrder.indexOf(a) - accountTypeOrder.indexOf(b)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Scale className="h-7 w-7 text-primary" />
            Neraca Saldo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trial Balance - Ringkasan saldo semua akun
          </p>
        </div>

        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Periode</CardTitle>
          <CardDescription>Pilih tanggal untuk melihat neraca saldo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label htmlFor="asOfDate">Per Tanggal</Label>
              <Input
                id="asOfDate"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
            <Button onClick={() => setAsOfDate(new Date().toISOString().split("T")[0])} variant="outline">
              Hari Ini
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Balance Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Debit</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              Rp {totalDebit.toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Kredit</CardDescription>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              Rp {totalCredit.toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Selisih</CardDescription>
            <CardTitle className={`text-2xl ${isBalanced ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
              Rp {difference.toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className={isBalanced ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"}>
          <CardHeader className="pb-3">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-xl flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">Seimbang</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <span className="text-destructive">Tidak Seimbang</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Neraca Saldo</CardTitle>
              <CardDescription>
                Per {new Date(asOfDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </CardDescription>
            </div>
            <Badge variant={isBalanced ? "default" : "destructive"} className="text-sm">
              {lines.length} Akun
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Kode</TableHead>
                  <TableHead>Nama Akun</TableHead>
                  <TableHead className="w-[120px]">Tipe</TableHead>
                  <TableHead className="w-[150px]">Kategori</TableHead>
                  <TableHead className="text-right w-[150px]">Debit</TableHead>
                  <TableHead className="text-right w-[150px]">Kredit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Belum ada data neraca saldo</p>
                      <p className="text-sm mt-1">Transaksi akan otomatis tercatat di neraca saldo</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {sortedTypes.map((type) => (
                      <React.Fragment key={type}>
                        {/* Type Header */}
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={6} className="font-bold text-primary">
                            {accountTypeLabels[type as keyof typeof accountTypeLabels]}
                          </TableCell>
                        </TableRow>
                        
                        {/* Accounts under this type */}
                        {groupedBalance[type]
                          .sort((a, b) => a.accountCode.localeCompare(b.accountCode))
                          .map((item) => (
                            <TableRow key={item.accountId}>
                              <TableCell className="font-mono text-sm">
                                {item.accountCode}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.accountName}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {item.accountType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {item.accountCategory}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {item.debit > 0 ? (
                                  <span className="text-green-600 dark:text-green-400">
                                    Rp {item.debit.toLocaleString("id-ID")}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {item.credit > 0 ? (
                                  <span className="text-red-600 dark:text-red-400">
                                    Rp {item.credit.toLocaleString("id-ID")}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        
                        {/* Subtotal for this type */}
                        <TableRow className="bg-muted/20 font-semibold">
                          <TableCell colSpan={4} className="text-right">
                            Subtotal {accountTypeLabels[type as keyof typeof accountTypeLabels]}
                          </TableCell>
                          <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                            Rp {groupedBalance[type].reduce((sum, item) => sum + item.debit, 0).toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell className="text-right font-mono text-red-600 dark:text-red-400">
                            Rp {groupedBalance[type].reduce((sum, item) => sum + item.credit, 0).toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                    
                    {/* Grand Total */}
                    <TableRow className="bg-primary/10 font-bold border-t-2 text-lg">
                      <TableCell colSpan={4} className="text-right">
                        TOTAL
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                        Rp {totalDebit.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-600 dark:text-red-400">
                        Rp {totalCredit.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                    
                    {/* Difference if not balanced */}
                    {!isBalanced && (
                      <TableRow className="bg-destructive/10">
                        <TableCell colSpan={4} className="text-right font-bold text-destructive">
                          SELISIH (Harus 0!)
                        </TableCell>
                        <TableCell colSpan={2} className="text-right font-mono font-bold text-destructive">
                          Rp {difference.toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Info Note */}
          {lines.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
              <p className="font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Catatan Neraca Saldo:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-6">
                <li>Neraca Saldo harus selalu seimbang (Total Debit = Total Kredit)</li>
                <li>Jika tidak seimbang, ada kesalahan dalam pencatatan jurnal</li>
                <li>Akun dengan saldo 0 tidak ditampilkan</li>
                <li>Data dikelompokkan berdasarkan tipe akun untuk kemudahan analisis</li>
              </ul>
              
              {!isBalanced && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded">
                  <p className="text-destructive font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Perhatian: Neraca Saldo tidak seimbang!
                  </p>
                  <p className="text-destructive/80 text-xs mt-1">
                    Periksa kembali jurnal-jurnal yang telah diinput. Setiap jurnal harus memiliki total debit = total kredit.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}