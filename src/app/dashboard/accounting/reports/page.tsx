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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Calendar, Building2, Wallet, ArrowUpDown } from "lucide-react";
import { accountingReportsService } from "@/lib/services/accountingService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FinancialReportsPage() {
  const [balanceSheet, setBalanceSheet] = useState<any | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<any | null>(null);
  const [cashFlow, setCashFlow] = useState<any | null>(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadReports();
  }, [asOfDate, startDate, endDate]);

  const loadReports = () => {
    const bs = accountingReportsService.generateBalanceSheet(asOfDate);
    const is = accountingReportsService.generateIncomeStatement(startDate, endDate);
    const cf = accountingReportsService.generateCashFlowStatement(startDate, endDate);
    
    setBalanceSheet(bs);
    setIncomeStatement(is);
    setCashFlow(cf);
  };

  const exportToCSV = (reportType: string, data: any) => {
    let csvContent = "";
    let filename = `${reportType}-${asOfDate}.csv`;

    if (reportType === "balance-sheet" && balanceSheet) {
      const allAssets = [...balanceSheet.currentAssets, ...balanceSheet.fixedAssets];
      const allLiabilities = [...balanceSheet.currentLiabilities, ...balanceSheet.longTermLiabilities];
      
      csvContent = [
        "NERACA (BALANCE SHEET)",
        `Per ${new Date(asOfDate).toLocaleDateString("id-ID")}`,
        "",
        "ASET",
        ...allAssets.map((a: any) => `${a.accountName},Rp ${a.amount.toLocaleString("id-ID")}`),
        `Total Aset,Rp ${balanceSheet.totalAssets.toLocaleString("id-ID")}`,
        "",
        "KEWAJIBAN",
        ...allLiabilities.map((l: any) => `${l.accountName},Rp ${l.amount.toLocaleString("id-ID")}`),
        `Total Kewajiban,Rp ${balanceSheet.totalLiabilities.toLocaleString("id-ID")}`,
        "",
        "EKUITAS",
        ...balanceSheet.equity.map((e: any) => `${e.accountName},Rp ${e.amount.toLocaleString("id-ID")}`),
        `Total Ekuitas,Rp ${balanceSheet.totalEquity.toLocaleString("id-ID")}`,
        "",
        `Total Kewajiban & Ekuitas,Rp ${(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString("id-ID")}`,
      ].join("\n");
    } else if (reportType === "income-statement" && incomeStatement) {
      filename = `income-statement-${startDate}-${endDate}.csv`;
      csvContent = [
        "LAPORAN LABA RUGI (INCOME STATEMENT)",
        `Periode ${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(endDate).toLocaleDateString("id-ID")}`,
        "",
        "PENDAPATAN",
        ...incomeStatement.revenue.map((r: any) => `${r.accountName},Rp ${r.amount.toLocaleString("id-ID")}`),
        `Total Pendapatan,Rp ${incomeStatement.totalRevenue.toLocaleString("id-ID")}`,
        "",
        "HPP",
        ...incomeStatement.cogs.map((c: any) => `${c.accountName},Rp ${c.amount.toLocaleString("id-ID")}`),
        `Total HPP,Rp ${incomeStatement.totalCOGS.toLocaleString("id-ID")}`,
        "",
        `Laba Kotor,Rp ${incomeStatement.grossProfit.toLocaleString("id-ID")}`,
        "",
        "BEBAN OPERASIONAL",
        ...incomeStatement.operatingExpenses.map((e: any) => `${e.accountName},Rp ${e.amount.toLocaleString("id-ID")}`),
        `Total Beban,Rp ${incomeStatement.totalOperatingExpenses.toLocaleString("id-ID")}`,
        "",
        `Laba/Rugi Bersih,Rp ${incomeStatement.netIncome.toLocaleString("id-ID")}`,
      ].join("\n");
    } else if (reportType === "cash-flow" && cashFlow) {
      filename = `cash-flow-${startDate}-${endDate}.csv`;
      csvContent = [
        "LAPORAN ARUS KAS (CASH FLOW STATEMENT)",
        `Periode ${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(endDate).toLocaleDateString("id-ID")}`,
        "",
        "AKTIVITAS OPERASIONAL",
        ...cashFlow.operating.map((op: any) => `${op.name},Rp ${op.amount.toLocaleString("id-ID")}`),
        `Arus Kas Bersih dari Aktivitas Operasional,Rp ${cashFlow.netOperating.toLocaleString("id-ID")}`,
        "",
        "AKTIVITAS INVESTASI",
        ...cashFlow.investing.map((inv: any) => `${inv.name},Rp ${inv.amount.toLocaleString("id-ID")}`),
        `Arus Kas Bersih dari Aktivitas Investasi,Rp ${cashFlow.netInvesting.toLocaleString("id-ID")}`,
        "",
        "AKTIVITAS PENDANAAN",
        ...cashFlow.financing.map((fin: any) => `${fin.name},Rp ${fin.amount.toLocaleString("id-ID")}`),
        `Arus Kas Bersih dari Aktivitas Pendanaan,Rp ${cashFlow.netFinancing.toLocaleString("id-ID")}`,
        "",
        `Perubahan Kas Bersih,Rp ${cashFlow.netChange.toLocaleString("id-ID")}`,
      ].join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Laporan Keuangan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Financial Statements - Neraca, Laba Rugi, dan Arus Kas
          </p>
        </div>
      </div>

      {/* Tabs for different reports */}
      <Tabs defaultValue="balance-sheet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="balance-sheet" className="flex items-center gap-2 py-3">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Neraca</span>
          </TabsTrigger>
          <TabsTrigger value="income-statement" className="flex items-center gap-2 py-3">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Laba Rugi</span>
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2 py-3">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Arus Kas</span>
          </TabsTrigger>
        </TabsList>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet" className="space-y-4">
          {/* Date Filter */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Filter Periode</CardTitle>
              </div>
              <CardDescription>Pilih tanggal untuk neraca</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1 max-w-xs">
                  <Label htmlFor="bs-date">Per Tanggal</Label>
                  <Input
                    id="bs-date"
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                  />
                </div>
                <Button onClick={() => exportToCSV("balance-sheet", balanceSheet)} variant="outline" size="lg" className="shadow-sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {balanceSheet && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Total Aset</CardDescription>
                    <CardTitle className="text-2xl text-blue-600 dark:text-blue-400 font-mono">
                      Rp {balanceSheet.totalAssets.toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Total Kewajiban</CardDescription>
                    <CardTitle className="text-2xl text-red-600 dark:text-red-400 font-mono">
                      Rp {balanceSheet.totalLiabilities.toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Total Ekuitas</CardDescription>
                    <CardTitle className="text-2xl text-green-600 dark:text-green-400 font-mono">
                      Rp {balanceSheet.totalEquity.toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Balance Sheet Table */}
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Neraca (Balance Sheet)
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Per {new Date(balanceSheet.asOfDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Akun</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Assets Section */}
                        <TableRow className="bg-blue-500/10 border-t-2">
                          <TableCell colSpan={2} className="font-bold text-blue-600 dark:text-blue-400 py-3">
                            ASET
                          </TableCell>
                        </TableRow>
                        {balanceSheet.currentAssets.map((asset: any, index: number) => (
                          <TableRow key={`current-asset-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{asset.accountName}</TableCell>
                            <TableCell className="text-right font-mono">
                              Rp {asset.amount.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        {balanceSheet.fixedAssets.map((asset: any, index: number) => (
                          <TableRow key={`fixed-asset-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{asset.accountName}</TableCell>
                            <TableCell className="text-right font-mono">
                              Rp {asset.amount.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total Aset</TableCell>
                          <TableCell className="text-right font-mono text-blue-600 dark:text-blue-400">
                            Rp {balanceSheet.totalAssets.toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>

                        {/* Spacing */}
                        <TableRow>
                          <TableCell colSpan={2} className="h-4"></TableCell>
                        </TableRow>

                        {/* Liabilities Section */}
                        <TableRow className="bg-red-500/10 border-t-2">
                          <TableCell colSpan={2} className="font-bold text-red-600 dark:text-red-400 py-3">
                            KEWAJIBAN
                          </TableCell>
                        </TableRow>
                        {balanceSheet.currentLiabilities.map((liability: any, index: number) => (
                          <TableRow key={`current-liability-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{liability.accountName}</TableCell>
                            <TableCell className="text-right font-mono">
                              Rp {liability.amount.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        {balanceSheet.longTermLiabilities.map((liability: any, index: number) => (
                          <TableRow key={`long-term-liability-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{liability.accountName}</TableCell>
                            <TableCell className="text-right font-mono">
                              Rp {liability.amount.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total Kewajiban</TableCell>
                          <TableCell className="text-right font-mono text-red-600 dark:text-red-400">
                            Rp {balanceSheet.totalLiabilities.toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>

                        {/* Spacing */}
                        <TableRow>
                          <TableCell colSpan={2} className="h-4"></TableCell>
                        </TableRow>

                        {/* Equity Section */}
                        <TableRow className="bg-green-500/10 border-t-2">
                          <TableCell colSpan={2} className="font-bold text-green-600 dark:text-green-400 py-3">
                            EKUITAS
                          </TableCell>
                        </TableRow>
                        {balanceSheet.equity.map((eq: any, index: number) => (
                          <TableRow key={`equity-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{eq.accountName}</TableCell>
                            <TableCell className="text-right font-mono">
                              Rp {eq.amount.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total Ekuitas</TableCell>
                          <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                            Rp {balanceSheet.totalEquity.toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>

                        {/* Total */}
                        <TableRow className="bg-primary/10 font-bold text-lg border-t-2">
                          <TableCell>TOTAL KEWAJIBAN & EKUITAS</TableCell>
                          <TableCell className="text-right font-mono text-primary">
                            Rp {(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Equation Check */}
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Persamaan Akuntansi:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Aset = Kewajiban + Ekuitas
                    </p>
                    <p className="text-sm font-mono mt-2">
                      Rp {balanceSheet.totalAssets.toLocaleString("id-ID")} = 
                      Rp {balanceSheet.totalLiabilities.toLocaleString("id-ID")} + 
                      Rp {balanceSheet.totalEquity.toLocaleString("id-ID")}
                    </p>
                    {balanceSheet.totalAssets === (balanceSheet.totalLiabilities + balanceSheet.totalEquity) ? (
                      <Badge className="mt-2 bg-green-100 text-green-700 border-green-200" variant="outline">✓ Neraca Seimbang</Badge>
                    ) : (
                      <Badge className="mt-2" variant="destructive">⚠ Neraca Tidak Seimbang</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Income Statement */}
        <TabsContent value="income-statement" className="space-y-4">
          {/* Date Range Filter */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Filter Periode</CardTitle>
              </div>
              <CardDescription>Pilih rentang tanggal untuk laporan laba rugi</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="is-start">Dari Tanggal</Label>
                  <Input
                    id="is-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="is-end">Sampai Tanggal</Label>
                  <Input
                    id="is-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button onClick={() => exportToCSV("income-statement", incomeStatement)} variant="outline" size="lg" className="shadow-sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {incomeStatement && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Total Pendapatan
                    </CardDescription>
                    <CardTitle className="text-2xl text-green-600 dark:text-green-400 font-mono">
                      Rp {incomeStatement.totalRevenue.toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Total Beban
                    </CardDescription>
                    <CardTitle className="text-2xl text-red-600 dark:text-red-400 font-mono">
                      Rp {incomeStatement.totalOperatingExpenses.toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className={`shadow-md hover:shadow-lg transition-shadow border-l-4 ${incomeStatement.netIncome >= 0 ? "border-l-green-500 bg-green-50 dark:bg-green-950/20" : "border-l-red-500 bg-red-50 dark:bg-red-950/20"}`}>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <DollarSign className="h-4 w-4" />
                      Laba/Rugi Bersih
                    </CardDescription>
                    <CardTitle className={`text-2xl font-mono ${incomeStatement.netIncome >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      Rp {Math.abs(incomeStatement.netIncome).toLocaleString("id-ID")}
                      {incomeStatement.netIncome < 0 && " (Rugi)"}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Income Statement Table */}
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Laporan Laba Rugi (Income Statement)
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Periode {new Date(incomeStatement.startDate).toLocaleDateString("id-ID")} - {new Date(incomeStatement.endDate).toLocaleDateString("id-ID")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Akun</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Revenue Section */}
                        <TableRow className="bg-green-500/10 border-t-2">
                          <TableCell colSpan={2} className="font-bold text-green-600 dark:text-green-400 py-3">
                            PENDAPATAN
                          </TableCell>
                        </TableRow>
                        {incomeStatement.revenue.map((rev: any, index: number) => (
                          <TableRow key={`revenue-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{rev.accountName}</TableCell>
                            <TableCell className="text-right font-mono">
                              Rp {rev.amount.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total Pendapatan</TableCell>
                          <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                            Rp {incomeStatement.totalRevenue.toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>

                        {/* Spacing */}
                        <TableRow>
                          <TableCell colSpan={2} className="h-4"></TableCell>
                        </TableRow>

                        {/* COGS Section */}
                        <TableRow className="bg-yellow-500/10 border-t-2">
                          <TableCell colSpan={2} className="font-bold text-yellow-600 dark:text-yellow-400 py-3">
                            HPP (Harga Pokok Penjualan)
                          </TableCell>
                        </TableRow>
                        {incomeStatement.cogs.map((cog: any, index: number) => (
                          <TableRow key={`cog-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{cog.accountName}</TableCell>
                            <TableCell className="text-right font-mono">
                              Rp {cog.amount.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total HPP</TableCell>
                          <TableCell className="text-right font-mono text-yellow-600 dark:text-yellow-400">
                            Rp {incomeStatement.totalCOGS.toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>

                        {/* Spacing */}
                        <TableRow>
                          <TableCell colSpan={2} className="h-4"></TableCell>
                        </TableRow>

                        {/* Gross Profit */}
                        <TableRow className="bg-green-500/10 font-bold">
                          <TableCell>Laba Kotor</TableCell>
                          <TableCell className="text-right font-mono text-green-600 dark:text-green-400">
                            Rp {incomeStatement.grossProfit.toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>

                        {/* Spacing */}
                        <TableRow>
                          <TableCell colSpan={2} className="h-4"></TableCell>
                        </TableRow>

                        {/* Operating Expenses Section */}
                        <TableRow className="bg-red-500/10 border-t-2">
                          <TableCell colSpan={2} className="font-bold text-red-600 dark:text-red-400 py-3">
                            BEBAN OPERASIONAL
                          </TableCell>
                        </TableRow>
                        {incomeStatement.operatingExpenses.map((expense: any, index: number) => (
                          <TableRow key={`expense-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{expense.accountName}</TableCell>
                            <TableCell className="text-right font-mono">
                              Rp {expense.amount.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total Beban</TableCell>
                          <TableCell className="text-right font-mono text-red-600 dark:text-red-400">
                            Rp {incomeStatement.totalOperatingExpenses.toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>

                        {/* Net Income */}
                        <TableRow className={`${incomeStatement.netIncome >= 0 ? "bg-green-500/10" : "bg-red-500/10"} font-bold text-lg border-t-2`}>
                          <TableCell>
                            {incomeStatement.netIncome >= 0 ? "LABA BERSIH" : "RUGI BERSIH"}
                          </TableCell>
                          <TableCell className={`text-right font-mono ${incomeStatement.netIncome >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            Rp {Math.abs(incomeStatement.netIncome).toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Profit Margin */}
                  {incomeStatement.totalRevenue > 0 && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Analisis:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Margin Laba:</p>
                          <p className="font-mono font-bold text-lg">
                            {((incomeStatement.netIncome / incomeStatement.totalRevenue) * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status:</p>
                          {incomeStatement.netIncome >= 0 ? (
                            <Badge className="text-sm bg-green-100 text-green-700 border-green-200" variant="outline">Profitable</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-sm">Loss Making</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Cash Flow Statement */}
        <TabsContent value="cash-flow" className="space-y-4">
          {/* Date Range Filter */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Filter Periode</CardTitle>
              </div>
              <CardDescription>Pilih rentang tanggal untuk laporan arus kas</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="cf-start">Dari Tanggal</Label>
                  <Input
                    id="cf-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="cf-end">Sampai Tanggal</Label>
                  <Input
                    id="cf-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button onClick={() => exportToCSV("cash-flow", cashFlow)} variant="outline" size="lg" className="shadow-sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {cashFlow && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className={`shadow-md hover:shadow-lg transition-shadow border-l-4 ${cashFlow.netOperating >= 0 ? "border-l-blue-500" : "border-l-orange-500"}`}>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Operasional</CardDescription>
                    <CardTitle className={`text-xl font-mono ${cashFlow.netOperating >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}>
                      Rp {Math.abs(cashFlow.netOperating).toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className={`shadow-md hover:shadow-lg transition-shadow border-l-4 ${cashFlow.netInvesting >= 0 ? "border-l-purple-500" : "border-l-pink-500"}`}>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Investasi</CardDescription>
                    <CardTitle className={`text-xl font-mono ${cashFlow.netInvesting >= 0 ? "text-purple-600 dark:text-purple-400" : "text-pink-600 dark:text-pink-400"}`}>
                      Rp {Math.abs(cashFlow.netInvesting).toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className={`shadow-md hover:shadow-lg transition-shadow border-l-4 ${cashFlow.netFinancing >= 0 ? "border-l-indigo-500" : "border-l-rose-500"}`}>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Pendanaan</CardDescription>
                    <CardTitle className={`text-xl font-mono ${cashFlow.netFinancing >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400"}`}>
                      Rp {Math.abs(cashFlow.netFinancing).toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className={`shadow-md hover:shadow-lg transition-shadow border-l-4 ${cashFlow.netChange >= 0 ? "border-l-green-500 bg-green-50 dark:bg-green-950/20" : "border-l-red-500 bg-red-50 dark:bg-red-950/20"}`}>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Perubahan Kas</CardDescription>
                    <CardTitle className={`text-xl font-mono ${cashFlow.netChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      Rp {Math.abs(cashFlow.netChange).toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Cash Flow Statement Table */}
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Laporan Arus Kas (Cash Flow Statement)
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Periode {new Date(cashFlow.startDate).toLocaleDateString("id-ID")} - {new Date(cashFlow.endDate).toLocaleDateString("id-ID")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Aktivitas</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Operating Activities */}
                        <TableRow className="bg-blue-500/10 border-t-2">
                          <TableCell colSpan={2} className="font-bold text-blue-600 dark:text-blue-400 py-3">
                            AKTIVITAS OPERASIONAL
                          </TableCell>
                        </TableRow>
                        {cashFlow.operating.map((op: any, index: number) => (
                          <TableRow key={`operating-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{op.name}</TableCell>
                            <TableCell className={`text-right font-mono ${op.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                              {op.amount >= 0 ? "+" : "-"} Rp {Math.abs(op.amount).toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Arus Kas Bersih dari Aktivitas Operasional</TableCell>
                          <TableCell className={`text-right font-mono ${cashFlow.netOperating >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            Rp {Math.abs(cashFlow.netOperating).toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>

                        {/* Spacing */}
                        <TableRow>
                          <TableCell colSpan={2} className="h-4"></TableCell>
                        </TableRow>

                        {/* Investing Activities */}
                        <TableRow className="bg-purple-500/10 border-t-2">
                          <TableCell colSpan={2} className="font-bold text-purple-600 dark:text-purple-400 py-3">
                            AKTIVITAS INVESTASI
                          </TableCell>
                        </TableRow>
                        {cashFlow.investing.map((inv: any, index: number) => (
                          <TableRow key={`investing-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{inv.name}</TableCell>
                            <TableCell className={`text-right font-mono ${inv.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                              {inv.amount >= 0 ? "+" : "-"} Rp {Math.abs(inv.amount).toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Arus Kas Bersih dari Aktivitas Investasi</TableCell>
                          <TableCell className={`text-right font-mono ${cashFlow.netInvesting >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            Rp {Math.abs(cashFlow.netInvesting).toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>

                        {/* Spacing */}
                        <TableRow>
                          <TableCell colSpan={2} className="h-4"></TableCell>
                        </TableRow>

                        {/* Financing Activities */}
                        <TableRow className="bg-orange-500/10 border-t-2">
                          <TableCell colSpan={2} className="font-bold text-orange-600 dark:text-orange-400 py-3">
                            AKTIVITAS PENDANAAN
                          </TableCell>
                        </TableRow>
                        {cashFlow.financing.map((fin: any, index: number) => (
                          <TableRow key={`financing-${index}`} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-8">{fin.name}</TableCell>
                            <TableCell className={`text-right font-mono ${fin.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                              {fin.amount >= 0 ? "+" : "-"} Rp {Math.abs(fin.amount).toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Arus Kas Bersih dari Aktivitas Pendanaan</TableCell>
                          <TableCell className={`text-right font-mono ${cashFlow.netFinancing >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            Rp {Math.abs(cashFlow.netFinancing).toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>

                        {/* Net Change */}
                        <TableRow className={`${cashFlow.netChange >= 0 ? "bg-green-500/10" : "bg-red-500/10"} font-bold text-lg border-t-2`}>
                          <TableCell>PERUBAHAN KAS BERSIH</TableCell>
                          <TableCell className={`text-right font-mono ${cashFlow.netChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {cashFlow.netChange >= 0 ? "+" : "-"} Rp {Math.abs(cashFlow.netChange).toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Analysis */}
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-2 text-sm">
                    <p className="font-semibold">Analisis Arus Kas:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                      <li>
                        Aktivitas Operasional: {cashFlow.netOperating >= 0 ? "Positif (Baik)" : "Negatif (Perlu Perhatian)"}
                      </li>
                      <li>
                        Aktivitas Investasi: {cashFlow.netInvesting >= 0 ? "Positif (Divestasi)" : "Negatif (Sedang Investasi)"}
                      </li>
                      <li>
                        Aktivitas Pendanaan: {cashFlow.netFinancing >= 0 ? "Positif (Dapat Pendanaan)" : "Negatif (Bayar Hutang)"}
                      </li>
                      <li className="font-semibold text-foreground">
                        Perubahan Kas: {cashFlow.netChange >= 0 ? "Kas bertambah (Sehat)" : "Kas berkurang (Monitor)"}
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}