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
import { FileText, Download, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { accountingService } from "@/lib/services/accounting";
import { BalanceSheet, IncomeStatement, CashFlowStatement } from "@/lib/types/accounting";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FinancialReportsPage() {
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowStatement | null>(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadReports();
  }, [asOfDate, startDate, endDate]);

  const loadReports = () => {
    const bs = accountingService.getBalanceSheet(new Date(asOfDate));
    const is = accountingService.getIncomeStatement(new Date(startDate), new Date(endDate));
    const cf = accountingService.getCashFlowStatement(new Date(startDate), new Date(endDate));
    
    setBalanceSheet(bs);
    setIncomeStatement(is);
    setCashFlow(cf);
  };

  const exportToCSV = (reportType: string, data: any) => {
    let csvContent = "";
    const filename = `${reportType}-${asOfDate}.csv`;

    if (reportType === "balance-sheet" && balanceSheet) {
      csvContent = [
        "NERACA (BALANCE SHEET)",
        `Per ${new Date(asOfDate).toLocaleDateString("id-ID")}`,
        "",
        "ASET",
        ...balanceSheet.assets.map(a => `${a.name},Rp ${a.amount.toLocaleString("id-ID")}`),
        `Total Aset,Rp ${balanceSheet.totalAssets.toLocaleString("id-ID")}`,
        "",
        "KEWAJIBAN",
        ...balanceSheet.liabilities.map(l => `${l.name},Rp ${l.amount.toLocaleString("id-ID")}`),
        `Total Kewajiban,Rp ${balanceSheet.totalLiabilities.toLocaleString("id-ID")}`,
        "",
        "EKUITAS",
        ...balanceSheet.equity.map(e => `${e.name},Rp ${e.amount.toLocaleString("id-ID")}`),
        `Total Ekuitas,Rp ${balanceSheet.totalEquity.toLocaleString("id-ID")}`,
        "",
        `Total Kewajiban & Ekuitas,Rp ${balanceSheet.totalLiabilitiesAndEquity.toLocaleString("id-ID")}`,
      ].join("\n");
    } else if (reportType === "income-statement" && incomeStatement) {
      csvContent = [
        "LAPORAN LABA RUGI (INCOME STATEMENT)",
        `Periode ${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(endDate).toLocaleDateString("id-ID")}`,
        "",
        "PENDAPATAN",
        ...incomeStatement.revenue.map(r => `${r.name},Rp ${r.amount.toLocaleString("id-ID")}`),
        `Total Pendapatan,Rp ${incomeStatement.totalRevenue.toLocaleString("id-ID")}`,
        "",
        "BEBAN",
        ...incomeStatement.expenses.map(e => `${e.name},Rp ${e.amount.toLocaleString("id-ID")}`),
        `Total Beban,Rp ${incomeStatement.totalExpenses.toLocaleString("id-ID")}`,
        "",
        `Laba/Rugi Bersih,Rp ${incomeStatement.netIncome.toLocaleString("id-ID")}`,
      ].join("\n");
    } else if (reportType === "cash-flow" && cashFlow) {
      csvContent = [
        "LAPORAN ARUS KAS (CASH FLOW STATEMENT)",
        `Periode ${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(endDate).toLocaleDateString("id-ID")}`,
        "",
        "AKTIVITAS OPERASIONAL",
        ...cashFlow.operating.map(o => `${o.name},Rp ${o.amount.toLocaleString("id-ID")}`),
        `Total Arus Kas Operasional,Rp ${cashFlow.netOperating.toLocaleString("id-ID")}`,
        "",
        "AKTIVITAS INVESTASI",
        ...cashFlow.investing.map(i => `${i.name},Rp ${i.amount.toLocaleString("id-ID")}`),
        `Total Arus Kas Investasi,Rp ${cashFlow.netInvesting.toLocaleString("id-ID")}`,
        "",
        "AKTIVITAS PENDANAAN",
        ...cashFlow.financing.map(f => `${f.name},Rp ${f.amount.toLocaleString("id-ID")}`),
        `Total Arus Kas Pendanaan,Rp ${cashFlow.netFinancing.toLocaleString("id-ID")}`,
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="balance-sheet">Neraca</TabsTrigger>
          <TabsTrigger value="income-statement">Laba Rugi</TabsTrigger>
          <TabsTrigger value="cash-flow">Arus Kas</TabsTrigger>
        </TabsList>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet" className="space-y-4">
          {/* Date Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Periode</CardTitle>
              <CardDescription>Pilih tanggal untuk neraca</CardDescription>
            </CardHeader>
            <CardContent>
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
                <Button onClick={() => exportToCSV("balance-sheet", balanceSheet)} variant="outline">
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Aset</CardDescription>
                    <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                      Rp {balanceSheet.totalAssets.toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Kewajiban</CardDescription>
                    <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                      Rp {balanceSheet.totalLiabilities.toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Ekuitas</CardDescription>
                    <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                      Rp {balanceSheet.totalEquity.toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Balance Sheet Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Neraca (Balance Sheet)</CardTitle>
                  <CardDescription>
                    Per {new Date(balanceSheet.asOfDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Akun</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Assets Section */}
                        <TableRow className="bg-blue-500/10">
                          <TableCell colSpan={2} className="font-bold text-blue-600 dark:text-blue-400">
                            ASET
                          </TableCell>
                        </TableRow>
                        {balanceSheet.assets.map((asset, index) => (
                          <TableRow key={`asset-${index}`}>
                            <TableCell className="pl-8">{asset.name}</TableCell>
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
                        <TableRow className="bg-red-500/10">
                          <TableCell colSpan={2} className="font-bold text-red-600 dark:text-red-400">
                            KEWAJIBAN
                          </TableCell>
                        </TableRow>
                        {balanceSheet.liabilities.map((liability, index) => (
                          <TableRow key={`liability-${index}`}>
                            <TableCell className="pl-8">{liability.name}</TableCell>
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
                        <TableRow className="bg-green-500/10">
                          <TableCell colSpan={2} className="font-bold text-green-600 dark:text-green-400">
                            EKUITAS
                          </TableCell>
                        </TableRow>
                        {balanceSheet.equity.map((eq, index) => (
                          <TableRow key={`equity-${index}`}>
                            <TableCell className="pl-8">{eq.name}</TableCell>
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
                            Rp {balanceSheet.totalLiabilitiesAndEquity.toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Equation Check */}
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Persamaan Akuntansi:</p>
                    <p className="text-sm text-muted-foreground">
                      Aset = Kewajiban + Ekuitas
                    </p>
                    <p className="text-sm font-mono mt-2">
                      Rp {balanceSheet.totalAssets.toLocaleString("id-ID")} = 
                      Rp {balanceSheet.totalLiabilities.toLocaleString("id-ID")} + 
                      Rp {balanceSheet.totalEquity.toLocaleString("id-ID")}
                    </p>
                    {balanceSheet.totalAssets === balanceSheet.totalLiabilitiesAndEquity ? (
                      <Badge className="mt-2" variant="default">✓ Neraca Seimbang</Badge>
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
          <Card>
            <CardHeader>
              <CardTitle>Filter Periode</CardTitle>
              <CardDescription>Pilih rentang tanggal untuk laporan laba rugi</CardDescription>
            </CardHeader>
            <CardContent>
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
                <Button onClick={() => exportToCSV("income-statement", incomeStatement)} variant="outline">
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Total Pendapatan
                    </CardDescription>
                    <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                      Rp {incomeStatement.totalRevenue.toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Total Beban
                    </CardDescription>
                    <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                      Rp {incomeStatement.totalExpenses.toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className={incomeStatement.netIncome >= 0 ? "border-green-500/50" : "border-red-500/50"}>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Laba/Rugi Bersih
                    </CardDescription>
                    <CardTitle className={`text-2xl ${incomeStatement.netIncome >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      Rp {Math.abs(incomeStatement.netIncome).toLocaleString("id-ID")}
                      {incomeStatement.netIncome < 0 && " (Rugi)"}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Income Statement Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Laporan Laba Rugi (Income Statement)</CardTitle>
                  <CardDescription>
                    Periode {new Date(incomeStatement.startDate).toLocaleDateString("id-ID")} - {new Date(incomeStatement.endDate).toLocaleDateString("id-ID")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Akun</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Revenue Section */}
                        <TableRow className="bg-green-500/10">
                          <TableCell colSpan={2} className="font-bold text-green-600 dark:text-green-400">
                            PENDAPATAN
                          </TableCell>
                        </TableRow>
                        {incomeStatement.revenue.map((rev, index) => (
                          <TableRow key={`revenue-${index}`}>
                            <TableCell className="pl-8">{rev.name}</TableCell>
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

                        {/* Expenses Section */}
                        <TableRow className="bg-red-500/10">
                          <TableCell colSpan={2} className="font-bold text-red-600 dark:text-red-400">
                            BEBAN
                          </TableCell>
                        </TableRow>
                        {incomeStatement.expenses.map((expense, index) => (
                          <TableRow key={`expense-${index}`}>
                            <TableCell className="pl-8">{expense.name}</TableCell>
                            <TableCell className="text-right font-mono">
                              Rp {expense.amount.toLocaleString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell>Total Beban</TableCell>
                          <TableCell className="text-right font-mono text-red-600 dark:text-red-400">
                            Rp {incomeStatement.totalExpenses.toLocaleString("id-ID")}
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
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
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
                            <Badge variant="default" className="text-sm">Profitable</Badge>
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
          <Card>
            <CardHeader>
              <CardTitle>Filter Periode</CardTitle>
              <CardDescription>Pilih rentang tanggal untuk laporan arus kas</CardDescription>
            </CardHeader>
            <CardContent>
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
                <Button onClick={() => exportToCSV("cash-flow", cashFlow)} variant="outline">
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Operasional</CardDescription>
                    <CardTitle className={`text-xl ${cashFlow.netOperating >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      Rp {Math.abs(cashFlow.netOperating).toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Investasi</CardDescription>
                    <CardTitle className={`text-xl ${cashFlow.netInvesting >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      Rp {Math.abs(cashFlow.netInvesting).toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Pendanaan</CardDescription>
                    <CardTitle className={`text-xl ${cashFlow.netFinancing >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      Rp {Math.abs(cashFlow.netFinancing).toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className={cashFlow.netChange >= 0 ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}>
                  <CardHeader className="pb-3">
                    <CardDescription>Perubahan Kas</CardDescription>
                    <CardTitle className={`text-xl ${cashFlow.netChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      Rp {Math.abs(cashFlow.netChange).toLocaleString("id-ID")}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Cash Flow Statement Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Laporan Arus Kas (Cash Flow Statement)</CardTitle>
                  <CardDescription>
                    Periode {new Date(cashFlow.startDate).toLocaleDateString("id-ID")} - {new Date(cashFlow.endDate).toLocaleDateString("id-ID")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Aktivitas</TableHead>
                          <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Operating Activities */}
                        <TableRow className="bg-blue-500/10">
                          <TableCell colSpan={2} className="font-bold text-blue-600 dark:text-blue-400">
                            AKTIVITAS OPERASIONAL
                          </TableCell>
                        </TableRow>
                        {cashFlow.operating.map((op, index) => (
                          <TableRow key={`operating-${index}`}>
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
                        <TableRow className="bg-purple-500/10">
                          <TableCell colSpan={2} className="font-bold text-purple-600 dark:text-purple-400">
                            AKTIVITAS INVESTASI
                          </TableCell>
                        </TableRow>
                        {cashFlow.investing.map((inv, index) => (
                          <TableRow key={`investing-${index}`}>
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
                        <TableRow className="bg-orange-500/10">
                          <TableCell colSpan={2} className="font-bold text-orange-600 dark:text-orange-400">
                            AKTIVITAS PENDANAAN
                          </TableCell>
                        </TableRow>
                        {cashFlow.financing.map((fin, index) => (
                          <TableRow key={`financing-${index}`}>
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
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
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
