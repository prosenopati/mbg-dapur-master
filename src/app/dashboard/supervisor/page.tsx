/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Building2,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Dapur {
  id: number;
  name: string;
  location: string;
  capacity: number;
  managerName: string;
  contact: string;
  status: string;
}

interface DailyMetric {
  id: number;
  dapurId: number;
  date: string;
  portionTarget: number;
  portionActual: number;
  budgetPerPortion: number;
  actualCostPerPortion: number;
  kitchenStatus: string;
}

interface MenuItem {
  id: number;
  dapurId: number;
  date: string;
  session: string;
  dishes: string[];
}

interface MaterialUsage {
  id: number;
  dapurId: number;
  date: string;
  materialName: string;
  unit: string;
  standardAmount: number;
  actualAmount: number;
  variance: number;
  status: string;
}

interface StaffAttendance {
  id: number;
  dapurId: number;
  date: string;
  totalStaff: number;
  present: number;
  onLeave: number;
  sick: number;
}

interface FeedbackEntry {
  id: number;
  dapurId: number;
  date: string;
  session: string;
  feedbackText: string;
  sentiment: string;
  status: string;
}

interface SanitationScore {
  id: number;
  dapurId: number;
  date: string;
  kitchenCleanliness: number;
  storage: number;
  equipment: number;
  personalHygiene: number;
  pestControl: number;
  documentation: number;
}

interface ProductionHistory {
  id: number;
  dapurId: number;
  date: string;
  dayName: string;
  target: number;
  actual: number;
}

export default function SupervisorDashboard() {
  const [dapurs, setDapurs] = useState<Dapur[]>([]);
  const [selectedDapurId, setSelectedDapurId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"single" | "comparison">("single");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [materialUsage, setMaterialUsage] = useState<MaterialUsage[]>([]);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendance[]>([]);
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [sanitationScores, setSanitationScores] = useState<SanitationScore[]>([]);
  const [productionHistory, setProductionHistory] = useState<ProductionHistory[]>([]);

  // Fetch all dapurs
  useEffect(() => {
    const fetchDapurs = async () => {
      try {
        const response = await fetch("/api/dapurs");
        if (!response.ok) throw new Error("Failed to fetch kitchens");
        const data = await response.json();
        setDapurs(data);
        if (data.length > 0) {
          setSelectedDapurId(data[0].id);
        }
      } catch (error) {
        toast.error("Failed to load kitchens");
        console.error(error);
      }
    };
    fetchDapurs();
  }, []);

  // Fetch data for selected dapur
  useEffect(() => {
    if (!selectedDapurId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          metricsRes,
          menuRes,
          materialRes,
          attendanceRes,
          feedbackRes,
          sanitationRes,
          productionRes,
        ] = await Promise.all([
          fetch(`/api/daily-metrics?dapurId=${selectedDapurId}&limit=50`),
          fetch(`/api/menu-items?dapurId=${selectedDapurId}&limit=10`),
          fetch(`/api/material-usage?dapurId=${selectedDapurId}&limit=50`),
          fetch(`/api/staff-attendance?dapurId=${selectedDapurId}&limit=50`),
          fetch(`/api/feedback-entries?dapurId=${selectedDapurId}&limit=50`),
          fetch(`/api/sanitation-scores?dapurId=${selectedDapurId}&limit=50`),
          fetch(`/api/production-history?dapurId=${selectedDapurId}&limit=50`),
        ]);

        const [metrics, menu, material, attendance, feedback, sanitation, production] =
          await Promise.all([
            metricsRes.json(),
            menuRes.json(),
            materialRes.json(),
            attendanceRes.json(),
            feedbackRes.json(),
            sanitationRes.json(),
            productionRes.json(),
          ]);

        setDailyMetrics(metrics);
        setMenuItems(menu);
        setMaterialUsage(material);
        setStaffAttendance(attendance);
        setFeedbackEntries(feedback);
        setSanitationScores(sanitation);
        setProductionHistory(production);
      } catch (error) {
        toast.error("Failed to load kitchen data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDapurId]);

  const selectedDapur = dapurs.find((d) => d.id === selectedDapurId);
  const latestMetric = dailyMetrics[dailyMetrics.length - 1];
  const todayMenu = menuItems.filter((m) => m.date === new Date().toISOString().split("T")[0]);

  // Calculate aggregated stats
  const avgSanitationScore =
    sanitationScores.length > 0
      ? Math.round(
          sanitationScores.reduce(
            (sum, s) =>
              sum +
              (s.kitchenCleanliness +
                s.storage +
                s.equipment +
                s.personalHygiene +
                s.pestControl +
                s.documentation) /
                6,
            0
          ) / sanitationScores.length
        )
      : 0;

  const totalFeedback = feedbackEntries.length;
  const positiveFeedback = feedbackEntries.filter((f) => f.sentiment === "positive").length;
  const negativeFeedback = feedbackEntries.filter((f) => f.sentiment === "negative").length;
  const neutralFeedback = totalFeedback - positiveFeedback - negativeFeedback;

  const avgAttendanceRate =
    staffAttendance.length > 0
      ? Math.round(
          (staffAttendance.reduce((sum, a) => sum + (a.present / a.totalStaff) * 100, 0) /
            staffAttendance.length) *
            10
        ) / 10
      : 0;

  // Render loading state
  if (loading && !selectedDapur) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (viewMode === "comparison") {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              Dashboard Pengawas MBG - Kabupaten Kendal
            </h1>
            <p className="text-muted-foreground mt-1">
              Perbandingan Multi Dapur - Wilayah Kab. Kendal, Jawa Tengah
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("single")}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Kembali ke Single View
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Laporan
            </Button>
          </div>
        </div>

        <ComparisonView dapurs={dapurs} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
            Dashboard Pengawas MBG - Kabupaten Kendal
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoring Multi Dapur - Wilayah Kab. Kendal, Jawa Tengah
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setViewMode("comparison")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Lihat Perbandingan
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Laporan
          </Button>
        </div>
      </div>

      {/* Kitchen Selector */}
      <Card className="bg-gradient-to-r from-teal-500/10 to-teal-600/10 border-teal-200 dark:border-teal-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Pilih Dapur untuk Monitoring Detail
          </CardTitle>
          <CardDescription>Kabupaten Kendal, Jawa Tengah</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedDapurId?.toString()}
            onValueChange={(value) => setSelectedDapurId(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Dapur" />
            </SelectTrigger>
            <SelectContent>
              {dapurs.map((dapur) => (
                <SelectItem key={dapur.id} value={dapur.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="font-semibold">{dapur.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({dapur.location})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDapur && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Manager</p>
                <p className="text-sm font-semibold">{selectedDapur.managerName}</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Kapasitas</p>
                <p className="text-sm font-semibold">{selectedDapur.capacity} porsi/hari</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Kontak</p>
                <p className="text-sm font-semibold">{selectedDapur.contact}</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={selectedDapur.status === "active" ? "default" : "secondary"}>
                  {selectedDapur.status}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          {latestMetric && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Produksi Hari Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        {latestMetric.portionActual.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Target: {latestMetric.portionTarget.toLocaleString()} porsi
                      </p>
                    </div>
                    <Activity className="h-10 w-10 text-blue-500" />
                  </div>
                  <Progress
                    value={(latestMetric.portionActual / latestMetric.portionTarget) * 100}
                    className="mt-3"
                  />
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Efisiensi Biaya
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Standar</span>
                      <span className="text-sm font-semibold font-mono">
                        Rp {latestMetric.budgetPerPortion.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Aktual</span>
                      <span className="text-sm font-semibold font-mono">
                        Rp {latestMetric.actualCostPerPortion.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs font-medium">Selisih</span>
                      <Badge
                        variant={
                          latestMetric.actualCostPerPortion > latestMetric.budgetPerPortion
                            ? "destructive"
                            : "default"
                        }
                        className="font-mono"
                      >
                        {((latestMetric.actualCostPerPortion - latestMetric.budgetPerPortion) /
                          latestMetric.budgetPerPortion) *
                          100 >
                        0
                          ? "+"
                          : ""}
                        {(
                          ((latestMetric.actualCostPerPortion - latestMetric.budgetPerPortion) /
                            latestMetric.budgetPerPortion) *
                          100
                        ).toFixed(1)}
                        %
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Skor Sanitasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-foreground">{avgSanitationScore}/100</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {avgSanitationScore >= 90
                          ? "Sangat Baik"
                          : avgSanitationScore >= 75
                          ? "Baik"
                          : "Perlu Perbaikan"}
                      </p>
                    </div>
                    <ShieldCheck className="h-10 w-10 text-purple-500" />
                  </div>
                  <Progress value={avgSanitationScore} className="mt-3" />
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-teal-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Kepuasan Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {positiveFeedback}/{totalFeedback} Positif
                      </p>
                    </div>
                    <ThumbsUp className="h-10 w-10 text-green-500" />
                  </div>
                  <Progress
                    value={totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0}
                    className="mt-3"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabbed Content - PRESERVED VISIBILITY */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="production" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Produksi</span>
              </TabsTrigger>
              <TabsTrigger value="materials" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Bahan & Staff</span>
              </TabsTrigger>
              <TabsTrigger value="quality" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Kualitas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Menu Hari Ini */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    Menu Hari Ini - Komposisi Lengkap
                  </CardTitle>
                  <CardDescription>
                    Susunan menu makanan bergizi seimbang untuk semua sesi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Pagi */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default" className="bg-orange-500">
                          🌅 Pagi
                        </Badge>
                      </div>
                      {todayMenu.find((m) => m.session === "pagi") ? (
                        <div className="space-y-2">
                          {todayMenu
                            .find((m) => m.session === "pagi")
                            ?.dishes.map((dish, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 p-2 bg-background rounded border"
                              >
                                <span className="text-xs font-semibold text-muted-foreground min-w-[20px]">
                                  {idx === 0 && "🍚"}
                                  {idx === 1 && "🍗"}
                                  {idx === 2 && "🥘"}
                                  {idx === 3 && "🥬"}
                                  {idx === 4 && "🍎"}
                                  {idx > 4 && "🌶️"}
                                </span>
                                <span className="text-sm flex-1">{dish}</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Menu belum tersedia
                        </p>
                      )}
                    </div>

                    {/* Siang */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default" className="bg-yellow-500">
                          ☀️ Siang
                        </Badge>
                      </div>
                      {todayMenu.find((m) => m.session === "siang") ? (
                        <div className="space-y-2">
                          {todayMenu
                            .find((m) => m.session === "siang")
                            ?.dishes.map((dish, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 p-2 bg-background rounded border"
                              >
                                <span className="text-xs font-semibold text-muted-foreground min-w-[20px]">
                                  {idx === 0 && "🍚"}
                                  {idx === 1 && "🐟"}
                                  {idx === 2 && "🥘"}
                                  {idx === 3 && "🥬"}
                                  {idx === 4 && "🍊"}
                                  {idx > 4 && "🌶️"}
                                </span>
                                <span className="text-sm flex-1">{dish}</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Menu belum tersedia
                        </p>
                      )}
                    </div>

                    {/* Malam */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default" className="bg-indigo-500">
                          🌙 Malam
                        </Badge>
                      </div>
                      {todayMenu.find((m) => m.session === "malam") ? (
                        <div className="space-y-2">
                          {todayMenu
                            .find((m) => m.session === "malam")
                            ?.dishes.map((dish, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 p-2 bg-background rounded border"
                              >
                                <span className="text-xs font-semibold text-muted-foreground min-w-[20px]">
                                  {idx === 0 && "🍚"}
                                  {idx === 1 && "🍖"}
                                  {idx === 2 && "🥘"}
                                  {idx === 3 && "🥬"}
                                  {idx === 4 && "🍉"}
                                  {idx > 4 && "🌶️"}
                                </span>
                                <span className="text-sm flex-1">{dish}</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Menu belum tersedia
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Komposisi Menu:
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span>🍚</span>
                        <span className="text-muted-foreground">Nasi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🍗🐟🍖</span>
                        <span className="text-muted-foreground">Lauk Protein</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🥘</span>
                        <span className="text-muted-foreground">Tempe/Tahu</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🥬</span>
                        <span className="text-muted-foreground">Sayur</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🍎🍊🍉</span>
                        <span className="text-muted-foreground">Buah</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🌶️</span>
                        <span className="text-muted-foreground">Sambal & Pelengkap</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overview Stats */}
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Sentiment Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800 text-center">
                        <ThumbsUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-green-600">
                          {totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Positif</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-center">
                        <Minus className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-600">
                          {totalFeedback > 0 ? Math.round((neutralFeedback / totalFeedback) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Netral</p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800 text-center">
                        <ThumbsDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-red-600">
                          {totalFeedback > 0 ? Math.round((negativeFeedback / totalFeedback) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Negatif</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Kehadiran Staff
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rata-rata Kehadiran</span>
                        <span className="text-lg font-bold text-green-600">{avgAttendanceRate}%</span>
                      </div>
                      <Progress value={avgAttendanceRate} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="production" className="space-y-4">
              {/* Production Charts */}
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Target vs Realisasi Produksi (7 Hari)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={productionHistory.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dayName" />
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
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={productionHistory.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dayName" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          stroke="#3b82f6"
                          fill="#3b82f680"
                          name="Produksi"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              {/* Material Usage Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Pemakaian Bahan Harian
                  </CardTitle>
                  <CardDescription>Data pemakaian bahan terbaru</CardDescription>
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
                      {materialUsage.slice(0, 10).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.materialName}</TableCell>
                          <TableCell className="text-right font-mono">
                            {item.standardAmount} {item.unit}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {item.actualAmount} {item.unit}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={item.variance > 0 ? "text-red-600" : "text-green-600"}>
                              {item.variance > 0 ? "+" : ""}
                              {item.variance} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.status === "normal" && <Badge variant="default">Normal</Badge>}
                            {item.status === "warning" && <Badge variant="secondary">Warning</Badge>}
                            {item.status === "alert" && <Badge variant="destructive">Alert</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Riwayat Skor Sanitasi
                  </CardTitle>
                  <CardDescription>Monitoring kebersihan dan sanitasi dapur</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Skor Rata-rata: {avgSanitationScore}/100</p>
                      <Progress value={avgSanitationScore} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sanitationScores.length} inspeksi tercatat dalam 7 hari terakhir
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// Comparison View Component
function ComparisonView({ dapurs }: { dapurs: Dapur[] }) {
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisonData = async () => {
      setLoading(true);
      try {
        const data = await Promise.all(
          dapurs.map(async (dapur) => {
            const [metricsRes, sanitationRes, feedbackRes, attendanceRes, productionRes] =
              await Promise.all([
                fetch(`/api/daily-metrics?dapurId=${dapur.id}&limit=7`),
                fetch(`/api/sanitation-scores?dapurId=${dapur.id}&limit=7`),
                fetch(`/api/feedback-entries?dapurId=${dapur.id}&limit=50`),
                fetch(`/api/staff-attendance?dapurId=${dapur.id}&limit=7`),
                fetch(`/api/production-history?dapurId=${dapur.id}&limit=7`),
              ]);

            const [metrics, sanitation, feedback, attendance, production] = await Promise.all([
              metricsRes.json(),
              sanitationRes.json(),
              feedbackRes.json(),
              attendanceRes.json(),
              productionRes.json(),
            ]);

            const latestMetric = metrics[metrics.length - 1];
            const avgSanitation =
              sanitation.reduce(
                (sum: number, s: any) =>
                  sum +
                  (s.kitchenCleanliness +
                    s.storage +
                    s.equipment +
                    s.personalHygiene +
                    s.pestControl +
                    s.documentation) /
                    6,
                0
              ) / (sanitation.length || 1);

            const positiveFeedback = feedback.filter((f: any) => f.sentiment === "positive").length;
            const feedbackRate = feedback.length > 0 ? (positiveFeedback / feedback.length) * 100 : 0;

            const avgAttendance =
              attendance.reduce((sum: number, a: any) => sum + (a.present / a.totalStaff) * 100, 0) /
              (attendance.length || 1);

            const avgProduction =
              production.reduce((sum: number, p: any) => sum + (p.actual / p.target) * 100, 0) /
              (production.length || 1);

            const costEfficiency = latestMetric
              ? ((latestMetric.budgetPerPortion - latestMetric.actualCostPerPortion) /
                  latestMetric.budgetPerPortion) *
                100
              : 0;

            return {
              name: dapur.name,
              shortName: dapur.name.replace("Dapur ", ""),
              location: dapur.location,
              capacity: dapur.capacity,
              managerName: dapur.managerName,
              production: Math.round(avgProduction * 10) / 10,
              costEfficiency: Math.round(costEfficiency * 10) / 10,
              sanitation: Math.round(avgSanitation * 10) / 10,
              feedback: Math.round(feedbackRate * 10) / 10,
              attendance: Math.round(avgAttendance * 10) / 10,
              overallScore: Math.round(
                ((avgProduction + costEfficiency + avgSanitation + feedbackRate + avgAttendance) / 5) *
                  10
              ) / 10,
            };
          })
        );

        // Sort by overall score
        data.sort((a, b) => b.overallScore - a.overallScore);
        setComparisonData(data);
      } catch (error) {
        toast.error("Failed to load comparison data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (dapurs.length > 0) {
      fetchComparisonData();
    }
  }, [dapurs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Peringkat Performa Dapur
          </CardTitle>
          <CardDescription>Ranking berdasarkan skor keseluruhan</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Dapur</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Produksi</TableHead>
                <TableHead className="text-right">Efisiensi</TableHead>
                <TableHead className="text-right">Sanitasi</TableHead>
                <TableHead className="text-right">Kepuasan</TableHead>
                <TableHead className="text-right">Kehadiran</TableHead>
                <TableHead className="text-right">Skor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((dapur, index) => (
                <TableRow key={dapur.name}>
                  <TableCell className="font-bold">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{dapur.name}</p>
                      <p className="text-xs text-muted-foreground">{dapur.location}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{dapur.managerName}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={dapur.production >= 95 ? "default" : "secondary"}>
                      {dapur.production}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={dapur.costEfficiency >= 0 ? "default" : "destructive"}>
                      {dapur.costEfficiency > 0 ? "+" : ""}
                      {dapur.costEfficiency}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={dapur.sanitation >= 85 ? "default" : "secondary"}>
                      {dapur.sanitation}/100
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={dapur.feedback >= 70 ? "default" : "secondary"}>
                      {dapur.feedback}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={dapur.attendance >= 90 ? "default" : "secondary"}>
                      {dapur.attendance}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-lg font-bold text-primary">{dapur.overallScore}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Comparison Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Produksi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="production" fill="#3b82f6" name="% Target Tercapai" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Efisiensi Biaya</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="costEfficiency" fill="#10b981" name="% Efisiensi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Skor Sanitasi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortName" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sanitation" fill="#8b5cf6" name="Skor Sanitasi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Radar Performa Multi-Metrik</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={comparisonData.slice(0, 3)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="shortName" />
                <PolarRadiusAxis domain={[0, 100]} />
                {comparisonData.slice(0, 3).map((_, index) => (
                  <Radar
                    key={index}
                    name={comparisonData[index].name}
                    dataKey="overallScore"
                    stroke={["#3b82f6", "#10b981", "#f59e0b"][index]}
                    fill={["#3b82f6", "#10b981", "#f59e0b"][index]}
                    fillOpacity={0.3}
                  />
                ))}
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Best Practices & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Best Practices & Rekomendasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData[0] && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="font-semibold text-green-900 dark:text-green-100">
                  🏆 Dapur Terbaik: {comparisonData[0].name}
                </p>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Skor keseluruhan: {comparisonData[0].overallScore}/100 - Jadikan benchmark untuk
                  dapur lainnya
                </p>
              </div>
            )}
            {comparisonData[comparisonData.length - 1] && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="font-semibold text-orange-900 dark:text-orange-100">
                  ⚠️ Perlu Perhatian: {comparisonData[comparisonData.length - 1].name}
                </p>
                <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                  Skor keseluruhan: {comparisonData[comparisonData.length - 1].overallScore}/100 -
                  Perlu perbaikan operasional dan pelatihan staff
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}