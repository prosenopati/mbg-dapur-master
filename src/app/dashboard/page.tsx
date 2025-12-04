"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Truck,
  FileText,
  Calendar,
  ClipboardCheck,
} from "lucide-react";
import { dashboardService } from "@/lib/services/dashboardService";
import { DashboardMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getUserRole, type UserRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { purchaseOrderService } from "@/lib/services/purchaseOrderService";
import { workflowService } from "@/lib/services/workflowService";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    dailyOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    todayMeals: 0,
    completedOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>("Admin");
  
  // Mock data for weekly and monthly revenue
  const weeklyRevenue = metrics.totalRevenue * 6.5;
  const monthlyRevenue = metrics.totalRevenue * 28;

  useEffect(() => {
    const loadData = () => {
      setMetrics(dashboardService.getMetrics());
      setRecentActivity(dashboardService.getRecentActivity());
      setUserRole(getUserRole());
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", className: string }> = {
      pending: { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      preparing: { variant: "secondary", className: "bg-blue-50 text-blue-700 border-blue-200" },
      ready: { variant: "default", className: "bg-green-50 text-green-700 border-green-200" },
      delivered: { variant: "default", className: "bg-gray-50 text-gray-700 border-gray-200" },
      approved: { variant: "default", className: "bg-green-50 text-green-700 border-green-200" },
      rejected: { variant: "destructive", className: "bg-red-50 text-red-700 border-red-200" },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString("id-ID");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse text-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Supplier Dashboard View - ENHANCED WITH WORKFLOW
  if (userRole === "Supplier") {
    const supplierPOs = purchaseOrderService.getAll()
      .filter(po => po.status !== 'draft' && po.status !== 'pending_approval')
      .slice(0, 5);

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
            <Truck className="h-8 w-8 text-purple-600" />
            Dashboard Supplier
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Kelola Purchase Orders dan Pengiriman - Enhanced Workflow
          </p>
        </div>

        {/* Supplier Metrics - Enhanced & Centered */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                <CardTitle className="text-xs md:text-sm font-semibold text-center text-yellow-900 dark:text-yellow-100">
                  PO Menunggu
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-1">
                {purchaseOrderService.getByStatus('sent').length}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">perlu persetujuan</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                <CardTitle className="text-xs md:text-sm font-semibold text-center text-green-900 dark:text-green-100">
                  Disetujui
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">
                {purchaseOrderService.getByStatus('supplier_approved').length}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">bulan ini</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex flex-col items-center gap-2">
                <Truck className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                <CardTitle className="text-xs md:text-sm font-semibold text-center text-blue-900 dark:text-blue-100">
                  Dalam Pengiriman
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                {purchaseOrderService.getByStatus('in_transit').length}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">sedang dikirim</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                <CardTitle className="text-xs md:text-sm font-semibold text-center text-purple-900 dark:text-purple-100">
                  Selesai
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-1">
                {purchaseOrderService.getByStatus('completed').length}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">dibayar & ditutup</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Purchase Orders List with Workflow */}
        <Card>
          <CardHeader className="px-4 py-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base md:text-lg text-center md:text-left">
                Purchase Orders - Pelacakan Workflow
              </CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 text-center md:text-left">
                PO → Terima Supplier → Proforma Invoice → Pengiriman → Penerimaan → QC → Invoice Final → Pembayaran
              </p>
            </div>
            <Link href="/dashboard/procurement">
              <Button size="sm" className="h-8 text-xs md:text-sm">Lihat Semua</Button>
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-3">
              {supplierPOs.length === 0 ? (
                <p className="text-center text-sm md:text-base text-muted-foreground py-12">
                  Tidak ada Purchase Order
                </p>
              ) : (
                supplierPOs.map((po) => {
                  const workflow = workflowService.getByPO(po.id);
                  return (
                    <div key={po.id} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-2 flex-1 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <p className="text-sm md:text-base font-semibold">{po.poNumber}</p>
                            <Badge variant="outline" className="text-xs py-0.5 h-5">
                              {po.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {po.supplierName} • {po.items.length} Item
                          </p>
                          <p className="text-sm md:text-base font-bold text-primary">{formatCurrency(po.totalAmount)}</p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-2">
                          <Badge variant="secondary" className="text-xs md:text-sm h-6 md:h-7 px-3">
                            <ClipboardCheck className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5" />
                            {po.currentStep || 'Diproses'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Workflow Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs md:text-sm">
                          <span className="text-muted-foreground font-medium">Progres Workflow</span>
                          <span className="font-bold text-primary text-base md:text-lg">{po.workflowProgress || 0}%</span>
                        </div>
                        <Progress value={po.workflowProgress || 0} className="h-2 md:h-2.5" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Info Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 text-center md:text-left">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <ClipboardCheck className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-sm md:text-base font-bold text-purple-900 dark:text-purple-100">
                  Enhanced Workflow Purchase Order
                </p>
                <p className="text-xs md:text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                  <strong>Alur Lengkap:</strong> PO → Terima Supplier → Proforma Invoice → Pengiriman Barang → 
                  Penerimaan → Quality Control → Invoice Final → Pembayaran. 
                  Setiap tahapan terintegrasi dan dapat dilacak secara real-time untuk transparansi penuh.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default Dashboard for other roles
  const completionRate = metrics.dailyOrders > 0
    ? Math.round((metrics.completedOrders / metrics.dailyOrders) * 100)
    : 0;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          MBG Dapur Management System - Enhanced Procurement Workflow
        </p>
      </div>

      {/* Revenue Cards - 3 Cards Full Width Below Title */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-emerald-300/60 bg-emerald-500/12 dark:border-emerald-500/30 dark:bg-emerald-500/15 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-1 px-3 pt-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-2">
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {metrics.completedOrders} completed orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-300/60 bg-blue-500/12 dark:border-blue-500/30 dark:bg-blue-500/15 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-1 px-3 pt-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-blue-700 dark:text-blue-400">Pendapatan Minggu Ini</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-2">
            <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {formatCurrency(weeklyRevenue)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Last 7 days performance
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-300/60 bg-purple-500/12 dark:border-purple-500/30 dark:bg-purple-500/15 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-1 px-3 pt-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-purple-700 dark:text-purple-400">Pendapatan Bulan Ini</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-2">
            <div className="text-xl font-bold text-purple-700 dark:text-purple-400">
              {formatCurrency(monthlyRevenue)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Current month total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Grid - 5 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className={cn(
          "transition-all duration-200",
          metrics.pendingOrders > 5 && "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20"
        )}>
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Pending Orders</CardTitle>
              <Clock className={cn(
                "h-4 w-4",
                metrics.pendingOrders > 5 ? "text-yellow-600" : "text-orange-600"
              )} />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className={cn(
              "text-2xl font-bold",
              metrics.pendingOrders > 5 ? "text-yellow-600" : "text-orange-600"
            )}>
              {metrics.pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">waiting to process</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "transition-all duration-200",
          metrics.lowStockItems > 0 && "border-red-300 bg-red-50/50 dark:bg-red-950/20"
        )}>
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Low Stock Alert</CardTitle>
              <Package className={cn(
                "h-4 w-4",
                metrics.lowStockItems > 0 ? "text-red-600" : "text-gray-600"
              )} />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className={cn(
              "text-2xl font-bold",
              metrics.lowStockItems > 0 ? "text-red-600" : "text-gray-600"
            )}>
              {metrics.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">items need restock</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20">
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold text-blue-600">{metrics.dailyOrders}</div>
            <p className="text-xs text-muted-foreground mt-0.5">orders today</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/20">
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Meals Produced</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold text-purple-600">{metrics.todayMeals}</div>
            <p className="text-xs text-muted-foreground mt-0.5">total portions</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30 dark:bg-green-950/20">
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold text-green-600">{metrics.completedOrders}</div>
            <p className="text-xs text-muted-foreground mt-0.5">orders delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* 3-Column Stats Layout */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3 px-4 pt-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Order Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <span className="text-sm text-muted-foreground">Completion Rate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold">{completionRate}%</span>
                {completionRate >= 80 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-yellow-600" />
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted-foreground">Average per Order</span>
              <span className="font-semibold">
                {metrics.completedOrders > 0
                  ? formatCurrency(metrics.totalRevenue / metrics.completedOrders)
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground">Active Orders</span>
              <span className="font-semibold text-blue-600">
                {metrics.dailyOrders - metrics.completedOrders}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 px-4 pt-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-3">
            <div className={cn(
              "flex items-center justify-between p-3 rounded-lg",
              metrics.lowStockItems > 0 ? "bg-red-50 border border-red-200 dark:bg-red-950/20" : "bg-green-50 border border-green-200 dark:bg-green-950/20"
            )}>
              <div className="flex items-center gap-2">
                {metrics.lowStockItems > 0 ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <span className="text-sm font-medium">
                  {metrics.lowStockItems === 0 ? "All Stock Healthy" : "Attention Required"}
                </span>
              </div>
              <span className={cn(
                "text-xl font-bold",
                metrics.lowStockItems > 0 ? "text-red-600" : "text-green-600"
              )}>
                {metrics.lowStockItems}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted-foreground">Items Need Attention</span>
              <span className={cn(
                "font-semibold",
                metrics.lowStockItems > 0 ? "text-red-600" : "text-green-600"
              )}>
                {metrics.lowStockItems}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground">Today's Production</span>
              <span className="font-semibold text-purple-600">{metrics.todayMeals} portions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3 px-4 pt-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Activity className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentActivity.slice(0, 3).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-1.5 p-2.5 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium leading-none truncate flex-1">
                        {activity.title}
                      </p>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}