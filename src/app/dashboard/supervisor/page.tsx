/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  UtensilsCrossed,
  Package,
  Users,
  ClipboardCheck,
  Camera,
  Upload,
  Download,
  FileText,
  ShieldCheck,
  Truck,
  Clock,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react";

// Dummy Data
const kpiData = {
  portionToday: 1250,
  portionTarget: 1200,
  menu: {
    pagi: "Nasi Putih, Ayam Goreng, Sayur Bayam, Tempe",
    siang: "Nasi Putih, Ikan Bandeng, Sayur Asem, Tahu",
    malam: "Nasi Putih, Rendang Sapi, Sayur Lodeh, Tempe"
  },
  budgetPerPortion: 15000,
  actualCostPerPortion: 14200,
  kitchenStatus: "Normal" as "Normal" | "Overload" | "Gangguan"
};

const productionData = [
  { day: "Sen", target: 1200, actual: 1180 },
  { day: "Sel", target: 1200, actual: 1220 },
  { day: "Rab", target: 1200, actual: 1195 },
  { day: "Kam", target: 1200, actual: 1210 },
  { day: "Jum", target: 1200, actual: 1250 },
  { day: "Sab", target: 1000, actual: 980 },
  { day: "Min", target: 1000, actual: 1020 },
];

const nutritionData = [
  { name: "Karbohidrat", value: 40, color: "#3b82f6" },
  { name: "Protein", value: 30, color: "#10b981" },
  { name: "Sayur", value: 20, color: "#f59e0b" },
  { name: "Buah", value: 10, color: "#ef4444" },
];

const materialUsageData = [
  { bahan: "Beras", unit: "kg", standard: 450, actual: 445, selisih: -5, status: "normal" },
  { bahan: "Ayam", unit: "kg", standard: 200, actual: 210, selisih: 10, status: "warning" },
  { bahan: "Ikan Bandeng", unit: "kg", standard: 150, actual: 148, selisih: -2, status: "normal" },
  { bahan: "Daging Sapi", unit: "kg", standard: 100, actual: 105, selisih: 5, status: "normal" },
  { bahan: "Sayur Bayam", unit: "kg", standard: 80, actual: 82, selisih: 2, status: "normal" },
  { bahan: "Minyak Goreng", unit: "liter", standard: 50, actual: 58, selisih: 8, status: "alert" },
];

const stockData = [
  { name: "Normal", value: 75, color: "#10b981" },
  { name: "Rendah", value: 15, color: "#f59e0b" },
  { name: "Kritis", value: 10, color: "#ef4444" },
];

const budgetData = [
  { kategori: "Bahan Baku", anggaran: 9000, realisasi: 8500 },
  { kategori: "Tenaga Kerja", anggaran: 3500, realisasi: 3600 },
  { kategori: "Logistik", anggaran: 1500, realisasi: 1400 },
  { kategori: "Utilitas", anggaran: 1000, realisasi: 700 },
];

const supplierData = [
  { nama: "PT Beras Jaya", bahan: "Beras Premium", hargaKg: 12500, lastOrder: "2024-11-24", rating: 4.8 },
  { nama: "CV Sumber Protein", bahan: "Ayam Potong", hargaKg: 35000, lastOrder: "2024-11-25", rating: 4.5 },
  { nama: "UD Ikan Segar", bahan: "Ikan Bandeng", hargaKg: 45000, lastOrder: "2024-11-24", rating: 4.7 },
  { nama: "Toko Sayur Sejahtera", bahan: "Sayur Mix", hargaKg: 8000, lastOrder: "2024-11-26", rating: 4.6 },
];

const sanitationData = [
  { subject: "Kebersihan Dapur", A: 95, fullMark: 100 },
  { subject: "Penyimpanan", A: 88, fullMark: 100 },
  { subject: "Peralatan", A: 92, fullMark: 100 },
  { subject: "Personal Hygiene", A: 90, fullMark: 100 },
  { subject: "Pest Control", A: 85, fullMark: 100 },
  { subject: "Dokumentasi", A: 93, fullMark: 100 },
];

const attendanceData = [
  { name: "Hadir", value: 45, color: "#10b981" },
  { name: "Izin", value: 3, color: "#f59e0b" },
  { name: "Sakit", value: 2, color: "#ef4444" },
];

const complaintData = [
  { type: "Positif", count: 75 },
  { type: "Netral", count: 20 },
  { type: "Negatif", count: 5 },
];

const recentComplaints = [
  { id: 1, date: "2024-11-26", session: "Pagi", complaint: "Nasi kurang hangat", sentiment: "negative", status: "resolved" },
  { id: 2, date: "2024-11-26", session: "Siang", complaint: "Porsi sayur sangat baik", sentiment: "positive", status: "noted" },
  { id: 3, date: "2024-11-25", session: "Malam", complaint: "Ayam terlalu kering", sentiment: "negative", status: "in-progress" },
  { id: 4, date: "2024-11-25", session: "Siang", complaint: "Menu sangat memuaskan", sentiment: "positive", status: "noted" },
];

export default function SupervisorDashboard() {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const variance = kpiData.actualCostPerPortion - kpiData.budgetPerPortion;
  const variancePercent = ((variance / kpiData.budgetPerPortion) * 100).toFixed(1);
  const isOverBudget = variance > 0;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setSelectedPhotos([...selectedPhotos, ...newPhotos]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
            Dashboard Pengawas MBG
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoring & Audit Dapur - Pengawas Pemerintah
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Laporan
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* 1. KPI Utama - Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jumlah Porsi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground">{kpiData.portionToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Target: {kpiData.portionTarget.toLocaleString()} porsi</p>
              </div>
              <Activity className="h-10 w-10 text-blue-500" />
            </div>
            <Progress value={(kpiData.portionToday / kpiData.portionTarget) * 100} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Anggaran vs Realisasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Standar</span>
                <span className="text-sm font-semibold font-mono">Rp {kpiData.budgetPerPortion.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Realisasi</span>
                <span className="text-sm font-semibold font-mono">Rp {kpiData.actualCostPerPortion.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs font-medium">Selisih</span>
                <Badge variant={isOverBudget ? "destructive" : "default"} className="font-mono">
                  {isOverBudget ? "+" : ""}{variancePercent}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status Dapur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge 
                  variant={kpiData.kitchenStatus === "Normal" ? "default" : "destructive"}
                  className="text-lg px-4 py-2"
                >
                  {kpiData.kitchenStatus === "Normal" && <CheckCircle className="h-4 w-4 mr-2" />}
                  {kpiData.kitchenStatus === "Overload" && <AlertTriangle className="h-4 w-4 mr-2" />}
                  {kpiData.kitchenStatus === "Gangguan" && <XCircle className="h-4 w-4 mr-2" />}
                  {kpiData.kitchenStatus}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Operasional lancar</p>
              </div>
              <ShieldCheck className="h-10 w-10 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Hari Ini */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            Menu Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Badge variant="outline" className="mb-2">Pagi</Badge>
              <p className="text-sm">{kpiData.menu.pagi}</p>
            </div>
            <div className="space-y-1">
              <Badge variant="outline" className="mb-2">Siang</Badge>
              <p className="text-sm">{kpiData.menu.siang}</p>
            </div>
            <div className="space-y-1">
              <Badge variant="outline" className="mb-2">Malam</Badge>
              <p className="text-sm">{kpiData.menu.malam}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Produksi Harian */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Target vs Realisasi Produksi (7 Hari)
            </CardTitle>
            <CardDescription>Perbandingan produksi harian</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="target" fill="#94a3b8" name="Target" />
                <Bar dataKey="actual" fill="#3b82f6" name="Realisasi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trend Produksi 7 Hari
            </CardTitle>
            <CardDescription>Grafik pergerakan produksi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="#3b82f680" name="Produksi" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. Menu & Nutrisi */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              Komposisi Nutrisi
            </CardTitle>
            <CardDescription>Distribusi kandungan gizi per porsi</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={nutritionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {nutritionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Checklist Kepatuhan Nutrisi
            </CardTitle>
            <CardDescription>Standar gizi pemerintah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Karbohidrat (40-45%)</span>
                <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Sesuai</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Protein (25-30%)</span>
                <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Sesuai</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sayuran (15-20%)</span>
                <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Sesuai</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Buah (10-15%)</span>
                <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Sesuai</Badge>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm">Kalori per porsi (750-850 kkal)</span>
                <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />800 kkal</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Higienitas & Keamanan</span>
                <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Aman</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Bahan Baku & Stok */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Pemakaian Bahan Harian
            </CardTitle>
            <CardDescription>Standar vs Aktual (26 November 2024)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan</TableHead>
                  <TableHead className="text-right">Standard</TableHead>
                  <TableHead className="text-right">Aktual</TableHead>
                  <TableHead className="text-right">Selisih</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialUsageData.map((item) => (
                  <TableRow key={item.bahan}>
                    <TableCell className="font-medium">{item.bahan}</TableCell>
                    <TableCell className="text-right font-mono">{item.standard} {item.unit}</TableCell>
                    <TableCell className="text-right font-mono">{item.actual} {item.unit}</TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={item.selisih > 0 ? "text-red-600" : "text-green-600"}>
                        {item.selisih > 0 ? "+" : ""}{item.selisih} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.status === "normal" && <Badge variant="default">Normal</Badge>}
                      {item.status === "warning" && <Badge variant="secondary">Perlu Cek</Badge>}
                      {item.status === "alert" && <Badge variant="destructive">Abnormal</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {materialUsageData.some(item => item.status === "alert") && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-900 dark:text-red-100">
                  Alert: Pemakaian minyak goreng melebihi standar +16%. Perlu investigasi.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Status Stok Bahan
            </CardTitle>
            <CardDescription>Ketersediaan inventori</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {stockData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-xs font-medium text-orange-900 dark:text-orange-100">
                10% bahan dalam status kritis - perlu pemesanan segera
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Keuangan & Anggaran */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Anggaran vs Realisasi per Kategori
            </CardTitle>
            <CardDescription>Breakdown biaya harian</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="kategori" />
                <YAxis />
                <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="anggaran" fill="#94a3b8" name="Anggaran" />
                <Bar dataKey="realisasi" fill="#10b981" name="Realisasi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Breakdown Biaya per Porsi
            </CardTitle>
            <CardDescription>Rincian biaya Rp {kpiData.actualCostPerPortion.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Bahan Baku</span>
                  <span className="text-sm font-semibold font-mono">Rp 8,500 (60%)</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Tenaga Kerja</span>
                  <span className="text-sm font-semibold font-mono">Rp 3,600 (25%)</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Logistik</span>
                  <span className="text-sm font-semibold font-mono">Rp 1,400 (10%)</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Utilitas (Gas, Listrik, Air)</span>
                  <span className="text-sm font-semibold font-mono">Rp 700 (5%)</span>
                </div>
                <Progress value={5} className="h-2" />
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total Biaya per Porsi</span>
                  <span className="text-lg font-bold font-mono text-green-600">Rp {kpiData.actualCostPerPortion.toLocaleString()}</span>
                </div>
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-900 dark:text-green-100">
                    ✓ Efisiensi {Math.abs(Number(variancePercent))}% - Hemat Rp {Math.abs(variance).toLocaleString()} per porsi
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Supplier & Pembelian */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Supplier & Harga Bahan Baku
          </CardTitle>
          <CardDescription>Daftar supplier aktif dan harga terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Bahan</TableHead>
                <TableHead className="text-right">Harga/kg</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierData.map((supplier, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{supplier.nama}</TableCell>
                  <TableCell>{supplier.bahan}</TableCell>
                  <TableCell className="text-right font-mono">Rp {supplier.hargaKg.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{supplier.lastOrder}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-semibold">{supplier.rating}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 7. Kebersihan & Keamanan Pangan */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Skor Sanitasi & Kebersihan
            </CardTitle>
            <CardDescription>Audit harian aspek keamanan pangan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={sanitationData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Skor" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                ✓ Rata-rata skor sanitasi: 90.5/100 - Status: Sangat Baik
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Checklist Audit Harian
            </CardTitle>
            <CardDescription>Verifikasi keamanan pangan - 26 Nov 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-950">
                <span className="text-sm">Suhu penyimpanan dingin (0-4°C)</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-950">
                <span className="text-sm">Suhu penyimpanan beku (-18°C)</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-950">
                <span className="text-sm">Peralatan masak bersih & steril</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-950">
                <span className="text-sm">Personal hygiene staff (APD lengkap)</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-950">
                <span className="text-sm">Tidak ada hama/pest</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-950">
                <span className="text-sm">Dokumentasi FIFO (First In First Out)</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-950">
                <span className="text-sm">Sertifikat halal & izin edar</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 8. SDM Dapur */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Kehadiran Staff Dapur
            </CardTitle>
            <CardDescription>Status absensi hari ini (50 orang)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center border border-green-200 dark:border-green-800">
                <p className="text-2xl font-bold text-green-600">45</p>
                <p className="text-xs text-muted-foreground">Hadir</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg text-center border border-orange-200 dark:border-orange-800">
                <p className="text-2xl font-bold text-orange-600">3</p>
                <p className="text-xs text-muted-foreground">Izin</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg text-center border border-red-200 dark:border-red-800">
                <p className="text-2xl font-bold text-red-600">2</p>
                <p className="text-xs text-muted-foreground">Sakit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Shift & Produktivitas
            </CardTitle>
            <CardDescription>Kinerja staff per shift</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Shift Pagi (06:00 - 14:00)</span>
                  <span className="text-sm font-semibold">20 orang</span>
                </div>
                <Progress value={95} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Produktivitas: 95%</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Shift Siang (10:00 - 18:00)</span>
                  <span className="text-sm font-semibold">18 orang</span>
                </div>
                <Progress value={92} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Produktivitas: 92%</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Shift Malam (14:00 - 22:00)</span>
                  <span className="text-sm font-semibold">12 orang</span>
                </div>
                <Progress value={88} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Produktivitas: 88%</p>
              </div>
              <div className="pt-3 border-t">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    📊 Rata-rata produktivitas: 91.7% - Target tercapai
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 9. Komplain & Evaluasi Makanan */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Sentiment Feedback Makanan
            </CardTitle>
            <CardDescription>Evaluasi kepuasan (100 responden)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={complaintData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800 text-center">
                <ThumbsUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-600">75%</p>
                <p className="text-xs text-muted-foreground">Positif</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-center">
                <Minus className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-600">20%</p>
                <p className="text-xs text-muted-foreground">Netral</p>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800 text-center">
                <ThumbsDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-red-600">5%</p>
                <p className="text-xs text-muted-foreground">Negatif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Komplain Terbaru
            </CardTitle>
            <CardDescription>Feedback dan tindak lanjut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentComplaints.map((complaint) => (
                <div key={complaint.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{complaint.session}</Badge>
                      <span className="text-xs text-muted-foreground">{complaint.date}</span>
                    </div>
                    {complaint.sentiment === "positive" && <ThumbsUp className="h-4 w-4 text-green-600" />}
                    {complaint.sentiment === "negative" && <ThumbsDown className="h-4 w-4 text-red-600" />}
                  </div>
                  <p className="text-sm mb-2">{complaint.complaint}</p>
                  <Badge variant={
                    complaint.status === "resolved" ? "default" : 
                    complaint.status === "in-progress" ? "secondary" : 
                    "outline"
                  } className="text-xs">
                    {complaint.status === "resolved" && "✓ Resolved"}
                    {complaint.status === "in-progress" && "⏳ In Progress"}
                    {complaint.status === "noted" && "📝 Noted"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 10. Foto Dokumentasi Operasional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Dokumentasi Foto Operasional
          </CardTitle>
          <CardDescription>Upload foto sesi pagi, siang, malam (26 November 2024)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pagi" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pagi">Pagi</TabsTrigger>
              <TabsTrigger value="siang">Siang</TabsTrigger>
              <TabsTrigger value="malam">Malam</TabsTrigger>
            </TabsList>
            <TabsContent value="pagi" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Persiapan Bahan</p>
                    </div>
                  </div>
                </div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Proses Masak</p>
                    </div>
                  </div>
                </div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Penyajian</p>
                    </div>
                  </div>
                </div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Distribusi</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <label htmlFor="upload-pagi" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Foto Pagi
                    <input
                      id="upload-pagi"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="siang" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Persiapan Bahan</p>
                    </div>
                  </div>
                </div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Proses Masak</p>
                    </div>
                  </div>
                </div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Penyajian</p>
                    </div>
                  </div>
                </div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Distribusi</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <label htmlFor="upload-siang" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Foto Siang
                    <input
                      id="upload-siang"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="malam" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Persiapan Bahan</p>
                    </div>
                  </div>
                </div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Proses Masak</p>
                    </div>
                  </div>
                </div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Penyajian</p>
                    </div>
                  </div>
                </div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Distribusi</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <label htmlFor="upload-malam" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Foto Malam
                    <input
                      id="upload-malam"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              💡 Dokumentasi foto wajib untuk setiap sesi makan sebagai bukti audit dan transparansi operasional dapur
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}