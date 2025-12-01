"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { dashboardService } from "@/lib/services/dashboardService";
import { DashboardMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getUserRole, type UserRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  const weeklyRevenue = metrics.totalRevenue * 6.5; // ~6.5 days average
  const monthlyRevenue = metrics.totalRevenue * 28; // ~28 days average

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
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-pulse text-primary mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Supplier Dashboard View
  if (userRole === "Supplier") {
    return (
      <DashboardLayout>
        <div className="space-y-3 md:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                <Truck className="h-6 w-6 text-purple-600" />
                Supplier Dashboard
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kelola Purchase Orders dan Pengiriman
              </p>
            </div>
          </div>

          {/* Supplier Metrics - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <Card>
              <CardHeader className="pb-1 px-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-medium text-muted-foreground">Pending PO</CardTitle>
                  <Clock className="h-3.5 w-3.5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent className="px-2.5 pb-2">
                <div className="text-xl font-bold text-yellow-600">3</div>
                <p className="text-[10px] text-muted-foreground">need approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 px-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-medium text-muted-foreground">Approved</CardTitle>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="px-2.5 pb-2">
                <div className="text-xl font-bold text-green-600">12</div>
                <p className="text-[10px] text-muted-foreground">this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 px-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-medium text-muted-foreground">In Transit</CardTitle>
                  <Truck className="h-3.5 w-3.5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="px-2.5 pb-2">
                <div className="text-xl font-bold text-blue-600">5</div>
                <p className="text-[10px] text-muted-foreground">on delivery</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 px-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-medium text-muted-foreground">Invoices</CardTitle>
                  <FileText className="h-3.5 w-3.5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="px-2.5 pb-2">
                <div className="text-xl font-bold text-purple-600">8</div>
                <p className="text-[10px] text-muted-foreground">awaiting payment</p>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Orders List - Compact */}
          <Card>
            <CardHeader className="px-3 py-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">Purchase Orders</CardTitle>
                <p className="text-[10px] text-muted-foreground mt-0.5">Daftar PO yang perlu diproses</p>
              </div>
              <Link href="/dashboard/procurement">
                <Button size="sm" className="h-7 text-xs">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-2">
                {/* Sample PO Items - Compact */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">PO-2024-001</p>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] py-0 h-4">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Dapur MBG Pusat • 15 Items</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        20 Nov 2024
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Truck className="h-2.5 w-2.5" />
                        Est: 22 Nov
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold">{formatCurrency(15500000)}</p>
                    <Button size="sm" variant="outline" className="h-6 text-xs px-2">Review</Button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">PO-2024-002</p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] py-0 h-4">
                        In Transit
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Dapur MBG Cabang A • 22 Items</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        18 Nov 2024
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Truck className="h-2.5 w-2.5" />
                        Est: 21 Nov
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold">{formatCurrency(23750000)}</p>
                    <Button size="sm" variant="outline" className="h-6 text-xs px-2">Track</Button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">PO-2024-003</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] py-0 h-4">
                        Delivered
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Dapur MBG Cabang B • 18 Items</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        15 Nov 2024
                      </span>
                      <span className="flex items-center gap-0.5">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        19 Nov 2024
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-semibold">{formatCurrency(18900000)}</p>
                      <p className="text-[10px] text-green-600">Invoice sent</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-6 text-xs px-2">View</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card - Compact */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-purple-900">Workflow Purchase Order</p>
                  <p className="text-[10px] text-purple-700">
                    Setelah Anda menyetujui PO, invoice akan otomatis dibuat dan dikirim ke bagian Keuangan untuk proses pembayaran.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Default Dashboard for other roles
  const completionRate = metrics.dailyOrders > 0
    ? Math.round((metrics.completedOrders / metrics.dailyOrders) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-3 md:space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            MBG Dapur Management System
          </p>
        </div>

        {/* Revenue Cards - 3 Cards Full Width Below Title */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Today's Revenue Card */}
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

          {/* Weekly Revenue Card */}
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

          {/* Monthly Revenue Card */}
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
    </DashboardLayout>
  );
}