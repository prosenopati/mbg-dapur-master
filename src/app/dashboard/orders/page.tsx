"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Eye,
  Clock,
  ChefHat,
  CheckCircle2,
  Truck,
  ArrowRight,
  Building2,
  User,
  Phone,
  MapPin,
  FileText,
  Users,
  Car,
  ClipboardCheck,
  Search,
  X,
  ShoppingBag,
} from "lucide-react";
import { orderService } from "@/lib/services/orderService";
import { menuService } from "@/lib/services/menuService";
import { Order, OrderStatus, MenuItem, OrderItem, CourierInfo, DeliveryConfirmation } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCourierDialogOpen, setIsCourierDialogOpen] = useState(false);
  const [isDeliveryConfirmDialogOpen, setIsDeliveryConfirmDialogOpen] = useState(false);
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<Order | null>(null);
  const [selectedOrderForConfirm, setSelectedOrderForConfirm] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    institutionName: "",
    studentCount: "",
    institutionAddress: "",
    institutionContact: "",
    notes: "",
    items: [] as { menuItemId: string; quantity: number; notes?: string }[],
  });

  const [courierForm, setCourierForm] = useState({
    name: "",
    phone: "",
    vehicleType: "",
    vehicleNumber: "",
  });

  const [confirmForm, setConfirmForm] = useState({
    receivedBy: "",
    position: "",
    notes: "",
  });

  useEffect(() => {
    loadOrders();
    setMenuItems(menuService.getAvailableItems());
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, activeTab]);

  const loadOrders = () => {
    setOrders(orderService.getAll().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const filterOrders = () => {
    let filtered = orders;

    // Status filter
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.status === activeTab);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.institutionName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      institutionName: "",
      studentCount: "",
      institutionAddress: "",
      institutionContact: "",
      notes: "",
      items: [],
    });
  };

  const resetCourierForm = () => {
    setCourierForm({
      name: "",
      phone: "",
      vehicleType: "",
      vehicleNumber: "",
    });
  };

  const resetConfirmForm = () => {
    setConfirmForm({
      receivedBy: "",
      position: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast.error("Mohon tambahkan minimal satu item pesanan");
      return;
    }

    const orderItems: OrderItem[] = formData.items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        menuItemName: menuItem?.name || "",
        quantity: item.quantity,
        price: menuItem?.price || 0,
        notes: item.notes,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    orderService.createOrder({
      items: orderItems,
      customerName: formData.customerName || undefined,
      customerPhone: formData.customerPhone || undefined,
      institutionName: formData.institutionName || undefined,
      studentCount: formData.studentCount ? parseInt(formData.studentCount) : undefined,
      institutionAddress: formData.institutionAddress || undefined,
      institutionContact: formData.institutionContact || undefined,
      status: "pending",
      totalAmount,
      notes: formData.notes || undefined,
    });

    toast.success("Pesanan berhasil dibuat");
    loadOrders();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleAssignCourier = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrderForCourier) return;

    if (!courierForm.name || !courierForm.phone) {
      toast.error("Mohon lengkapi data kurir");
      return;
    }

    const courierInfo: CourierInfo = {
      name: courierForm.name,
      phone: courierForm.phone,
      vehicleType: courierForm.vehicleType || undefined,
      vehicleNumber: courierForm.vehicleNumber || undefined,
      assignedAt: new Date().toISOString(),
    };

    const deliveryNoteNumber = `SJ-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    orderService.update(selectedOrderForCourier.id, {
      courier: courierInfo,
      deliveryNoteNumber,
    });

    toast.success("Kurir berhasil ditugaskan");
    loadOrders();
    setIsCourierDialogOpen(false);
    setSelectedOrderForCourier(null);
    resetCourierForm();
  };

  const handleDeliveryConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrderForConfirm) return;

    if (!confirmForm.receivedBy) {
      toast.error("Mohon isi nama penerima");
      return;
    }

    const confirmation: DeliveryConfirmation = {
      receivedBy: confirmForm.receivedBy,
      position: confirmForm.position || undefined,
      receivedAt: new Date().toISOString(),
      notes: confirmForm.notes || undefined,
    };

    orderService.update(selectedOrderForConfirm.id, {
      deliveryConfirmation: confirmation,
      status: "delivered",
      completedAt: new Date().toISOString(),
    });

    toast.success("Konfirmasi penerimaan berhasil");
    loadOrders();
    setIsDeliveryConfirmDialogOpen(false);
    setSelectedOrderForConfirm(null);
    resetConfirmForm();
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    orderService.updateStatus(orderId, newStatus);
    toast.success("Status pesanan diperbarui");
    loadOrders();
  };

  const addOrderItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { menuItemId: "", quantity: 1 }],
    });
  };

  const removeOrderItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateOrderItem = (
    index: number,
    field: "menuItemId" | "quantity" | "notes",
    value: string | number
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config = {
      pending: { icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Pending" },
      preparing: { icon: ChefHat, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Preparing" },
      ready: { icon: CheckCircle2, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Ready" },
      delivered: { icon: Truck, className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", label: "Delivered" },
    };

    const { icon: Icon, className, label } = config[status];
    return (
      <Badge variant="outline" className={cn("gap-1", className)}>
        <Icon className="h-3 w-3" />
        <span className="hidden sm:inline">{label}</span>
      </Badge>
    );
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const workflow: Record<OrderStatus, OrderStatus | null> = {
      pending: "preparing",
      preparing: "ready",
      ready: "delivered",
      delivered: null,
    };
    return workflow[currentStatus];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola pesanan & pengiriman
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Pesanan Baru</span>
              <span className="sm:hidden">Baru</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Pesanan Baru</DialogTitle>
              <DialogDescription>
                Tambahkan informasi lembaga, item pesanan, dan detail pelanggan
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Institution Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Building2 className="h-4 w-4" />
                  Informasi Lembaga/Sekolah
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Nama Lembaga/Sekolah</Label>
                    <Input
                      id="institutionName"
                      value={formData.institutionName}
                      onChange={(e) =>
                        setFormData({ ...formData, institutionName: e.target.value })
                      }
                      placeholder="Contoh: SD Negeri 1 Jakarta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentCount">Jumlah Siswa Penerima</Label>
                    <Input
                      id="studentCount"
                      type="number"
                      min="1"
                      value={formData.studentCount}
                      onChange={(e) =>
                        setFormData({ ...formData, studentCount: e.target.value })
                      }
                      placeholder="Contoh: 150"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionAddress">Alamat Lembaga</Label>
                  <Textarea
                    id="institutionAddress"
                    value={formData.institutionAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, institutionAddress: e.target.value })
                    }
                    placeholder="Alamat lengkap lembaga/sekolah"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionContact">Kontak Person Lembaga</Label>
                  <Input
                    id="institutionContact"
                    value={formData.institutionContact}
                    onChange={(e) =>
                      setFormData({ ...formData, institutionContact: e.target.value })
                    }
                    placeholder="Nama & nomor kontak person di lembaga"
                  />
                </div>
              </div>

              <div className="border-t pt-4" />

              {/* Customer Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <User className="h-4 w-4" />
                  Informasi Pemesan (Opsional)
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nama Pemesan</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                      placeholder="Opsional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">No. Telepon Pemesan</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, customerPhone: e.target.value })
                      }
                      placeholder="Opsional"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4" />

              {/* Order Items */}
              <div className="space-y-2">
                <Label>Item Pesanan *</Label>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Select
                          value={item.menuItemId}
                          onValueChange={(value) =>
                            updateOrderItem(index, "menuItemId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih menu" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuItems.map((menuItem) => (
                              <SelectItem key={menuItem.id} value={menuItem.id}>
                                {menuItem.name} - {formatCurrency(menuItem.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateOrderItem(index, "quantity", parseInt(e.target.value))
                            }
                            placeholder="Qty"
                            className="w-20"
                          />
                          <Input
                            value={item.notes || ""}
                            onChange={(e) =>
                              updateOrderItem(index, "notes", e.target.value)
                            }
                            placeholder="Catatan khusus (opsional)"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOrderItem(index)}
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOrderItem}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Item
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan Pesanan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Instruksi khusus atau catatan tambahan..."
                  rows={2}
                />
              </div>

              {formData.items.length > 0 && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium">Ringkasan Pesanan</p>
                  <p className="text-2xl font-bold mt-2">
                    Total: {formatCurrency(
                      formData.items.reduce((sum, item) => {
                        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
                        return sum + (menuItem?.price || 0) * item.quantity;
                      }, 0)
                    )}
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Buat Pesanan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compact Stats - 2 cols mobile, 5 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Semua</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold">{stats.all}</div>
          </CardContent>
        </Card>
        <Card className={cn(stats.pending > 0 && "border-yellow-200 bg-yellow-50/50")}>
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-yellow-600" />
              <CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className={cn(stats.preparing > 0 && "border-blue-200 bg-blue-50/50")}>
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center gap-1">
              <ChefHat className="h-3 w-3 text-blue-600" />
              <CardTitle className="text-xs font-medium text-muted-foreground">Diproses</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold text-blue-600">{stats.preparing}</div>
          </CardContent>
        </Card>
        <Card className={cn(stats.ready > 0 && "border-green-200 bg-green-50/50")}>
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <CardTitle className="text-xs font-medium text-muted-foreground">Siap</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 px-3 pt-3">
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3 text-gray-600" />
              <CardTitle className="text-xs font-medium text-muted-foreground">Terkirim</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl font-bold text-gray-600">{stats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders by number, institution, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders with Tabs */}
      <Card>
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-base">Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                Semua<span className="hidden sm:inline ml-1">({stats.all})</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">
                Pending<span className="hidden sm:inline ml-1">({stats.pending})</span>
              </TabsTrigger>
              <TabsTrigger value="preparing" className="text-xs sm:text-sm">
                Proses<span className="hidden sm:inline ml-1">({stats.preparing})</span>
              </TabsTrigger>
              <TabsTrigger value="ready" className="text-xs sm:text-sm">
                Siap<span className="hidden sm:inline ml-1">({stats.ready})</span>
              </TabsTrigger>
              <TabsTrigger value="delivered" className="text-xs sm:text-sm">
                Terkirim<span className="hidden sm:inline ml-1">({stats.delivered})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No orders match your search" : "Tidak ada pesanan"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="grid gap-3 lg:hidden">
                    {filteredOrders.map((order) => (
                      <Card key={order.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm mb-1">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {order.institutionName || order.customerName || "Walk-in"}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Items</p>
                              <p className="font-medium">{order.items.length} item</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Total</p>
                              <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                            </div>
                            {order.studentCount && (
                              <div className="col-span-2">
                                <p className="text-xs text-muted-foreground">Siswa</p>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <p className="font-medium">{order.studentCount}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setViewingOrder(order);
                                setIsViewDialogOpen(true);
                              }}
                              className="flex-1 h-8 text-xs"
                            >
                              <Eye className="mr-1.5 h-3 w-3" />
                              Detail
                            </Button>
                            {order.status === "ready" && !order.courier && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrderForCourier(order);
                                  setIsCourierDialogOpen(true);
                                }}
                                className="flex-1 h-8 text-xs"
                              >
                                <Car className="mr-1.5 h-3 w-3" />
                                Tugaskan
                              </Button>
                            )}
                            {order.status === "ready" && order.courier && !order.deliveryConfirmation && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrderForConfirm(order);
                                  setIsDeliveryConfirmDialogOpen(true);
                                }}
                                className="flex-1 h-8 text-xs"
                              >
                                <ClipboardCheck className="mr-1.5 h-3 w-3" />
                                Konfirmasi
                              </Button>
                            )}
                            {getNextStatus(order.status) && !order.courier && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    order.id,
                                    getNextStatus(order.status)!
                                  )
                                }
                                className="flex-1 h-8 text-xs"
                              >
                                <ArrowRight className="mr-1.5 h-3 w-3" />
                                {getNextStatus(order.status)}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-10 text-xs">No. Pesanan</TableHead>
                          <TableHead className="h-10 text-xs">Lembaga/Pelanggan</TableHead>
                          <TableHead className="h-10 text-xs">Siswa</TableHead>
                          <TableHead className="h-10 text-xs">Item</TableHead>
                          <TableHead className="h-10 text-xs">Total</TableHead>
                          <TableHead className="h-10 text-xs">Status</TableHead>
                          <TableHead className="h-10 text-xs">Kurir</TableHead>
                          <TableHead className="h-10 text-xs text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium py-3 text-sm">
                              {order.orderNumber}
                            </TableCell>
                            <TableCell className="py-3">
                              <div>
                                <p className="font-medium text-sm">
                                  {order.institutionName || order.customerName || "Walk-in"}
                                </p>
                                {order.institutionContact && (
                                  <p className="text-xs text-muted-foreground">
                                    {order.institutionContact}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              {order.studentCount ? (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{order.studentCount}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="py-3">
                              <span className="text-sm">
                                {order.items.length} item
                              </span>
                            </TableCell>
                            <TableCell className="font-medium py-3 text-sm">
                              {formatCurrency(order.totalAmount)}
                            </TableCell>
                            <TableCell className="py-3">{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="py-3">
                              {order.courier ? (
                                <div className="flex items-center gap-1">
                                  <Car className="h-3 w-3 text-green-600" />
                                  <span className="text-xs text-green-600">Ditugaskan</span>
                                </div>
                              ) : order.status === "ready" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrderForCourier(order);
                                    setIsCourierDialogOpen(true);
                                  }}
                                  className="h-7 text-xs"
                                >
                                  <Car className="mr-1 h-3 w-3" />
                                  Tugaskan
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setViewingOrder(order);
                                    setIsViewDialogOpen(true);
                                  }}
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {order.status === "ready" && order.courier && !order.deliveryConfirmation && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrderForConfirm(order);
                                      setIsDeliveryConfirmDialogOpen(true);
                                    }}
                                    className="h-8 text-xs"
                                  >
                                    <ClipboardCheck className="mr-1 h-3 w-3" />
                                    Konfirmasi
                                  </Button>
                                )}
                                {getNextStatus(order.status) && !order.courier && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(
                                        order.id,
                                        getNextStatus(order.status)!
                                      )
                                    }
                                    className="h-8 text-xs"
                                  >
                                    <ArrowRight className="mr-1 h-3 w-3" />
                                    {getNextStatus(order.status)}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>

    {/* View Order Dialog */}
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pesanan</DialogTitle>
          <DialogDescription>
            {viewingOrder?.orderNumber}
          </DialogDescription>
        </DialogHeader>
        {viewingOrder && (
          <div className="space-y-6">
            {/* Institution Info */}
            {viewingOrder.institutionName && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Building2 className="h-4 w-4" />
                  Informasi Lembaga
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Nama Lembaga</p>
                    <p className="text-sm font-medium">{viewingOrder.institutionName}</p>
                  </div>
                  {viewingOrder.studentCount && (
                    <div>
                      <p className="text-xs text-muted-foreground">Jumlah Siswa</p>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <p className="text-sm font-medium">{viewingOrder.studentCount} siswa</p>
                      </div>
                    </div>
                  )}
                  {viewingOrder.institutionAddress && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Alamat</p>
                      <p className="text-sm">{viewingOrder.institutionAddress}</p>
                    </div>
                  )}
                  {viewingOrder.institutionContact && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Kontak Person</p>
                      <p className="text-sm">{viewingOrder.institutionContact}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Info */}
            {(viewingOrder.customerName || viewingOrder.customerPhone) && (
              <div className="grid grid-cols-2 gap-4">
                {viewingOrder.customerName && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pemesan</p>
                    <p className="text-sm font-medium">{viewingOrder.customerName}</p>
                  </div>
                )}
                {viewingOrder.customerPhone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telepon</p>
                    <p className="text-sm">{viewingOrder.customerPhone}</p>
                  </div>
                )}
              </div>
            )}

            {/* Status */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
              <div>{getStatusBadge(viewingOrder.status)}</div>
            </div>

            {/* Courier Info */}
            {viewingOrder.courier && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Car className="h-4 w-4" />
                  Informasi Kurir
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div>
                    <p className="text-xs text-muted-foreground">Nama Kurir</p>
                    <p className="text-sm font-medium">{viewingOrder.courier.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telepon</p>
                    <p className="text-sm">{viewingOrder.courier.phone}</p>
                  </div>
                  {viewingOrder.courier.vehicleType && (
                    <div>
                      <p className="text-xs text-muted-foreground">Jenis Kendaraan</p>
                      <p className="text-sm">{viewingOrder.courier.vehicleType}</p>
                    </div>
                  )}
                  {viewingOrder.courier.vehicleNumber && (
                    <div>
                      <p className="text-xs text-muted-foreground">Nomor Kendaraan</p>
                      <p className="text-sm font-mono">{viewingOrder.courier.vehicleNumber}</p>
                    </div>
                  )}
                  {viewingOrder.deliveryNoteNumber && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Nomor Surat Jalan</p>
                      <p className="text-sm font-mono font-medium">{viewingOrder.deliveryNoteNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Confirmation */}
            {viewingOrder.deliveryConfirmation && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <ClipboardCheck className="h-4 w-4" />
                  Konfirmasi Penerimaan
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div>
                    <p className="text-xs text-muted-foreground">Diterima Oleh</p>
                    <p className="text-sm font-medium">{viewingOrder.deliveryConfirmation.receivedBy}</p>
                  </div>
                  {viewingOrder.deliveryConfirmation.position && (
                    <div>
                      <p className="text-xs text-muted-foreground">Jabatan</p>
                      <p className="text-sm">{viewingOrder.deliveryConfirmation.position}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Waktu Penerimaan</p>
                    <p className="text-sm">{formatTime(viewingOrder.deliveryConfirmation.receivedAt)}</p>
                  </div>
                  {viewingOrder.deliveryConfirmation.notes && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Catatan</p>
                      <p className="text-sm">{viewingOrder.deliveryConfirmation.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Item Pesanan</p>
              <div className="space-y-2">
                {viewingOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.menuItemName}</p>
                      <p className="text-sm text-muted-foreground">
                        Jumlah: {item.quantity}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Catatan: {item.notes}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {viewingOrder.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Catatan Pesanan</p>
                <p className="text-sm mt-1">{viewingOrder.notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-lg font-bold">Total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(viewingOrder.totalAmount)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <p>Dibuat: {formatTime(viewingOrder.createdAt)}</p>
              </div>
              <div>
                {viewingOrder.completedAt && (
                  <p>Selesai: {formatTime(viewingOrder.completedAt)}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Assign Courier Dialog */}
    <Dialog open={isCourierDialogOpen} onOpenChange={setIsCourierDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tugaskan Kurir</DialogTitle>
          <DialogDescription>
            Tambahkan informasi petugas pengantar untuk pesanan #{selectedOrderForCourier?.orderNumber}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAssignCourier} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courierName">Nama Kurir *</Label>
            <Input
              id="courierName"
              value={courierForm.name}
              onChange={(e) => setCourierForm({ ...courierForm, name: e.target.value })}
              placeholder="Nama lengkap kurir"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="courierPhone">No. Telepon *</Label>
            <Input
              id="courierPhone"
              value={courierForm.phone}
              onChange={(e) => setCourierForm({ ...courierForm, phone: e.target.value })}
              placeholder="Nomor telepon kurir"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Jenis Kendaraan</Label>
            <Select
              value={courierForm.vehicleType}
              onValueChange={(value) => setCourierForm({ ...courierForm, vehicleType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kendaraan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Motor">Motor</SelectItem>
                <SelectItem value="Mobil">Mobil</SelectItem>
                <SelectItem value="Sepeda">Sepeda</SelectItem>
                <SelectItem value="Truk">Truk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Nomor Kendaraan</Label>
            <Input
              id="vehicleNumber"
              value={courierForm.vehicleNumber}
              onChange={(e) => setCourierForm({ ...courierForm, vehicleNumber: e.target.value })}
              placeholder="Contoh: B 1234 ABC"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCourierDialogOpen(false);
                resetCourierForm();
              }}
            >
              Batal
            </Button>
            <Button type="submit">Tugaskan Kurir</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Delivery Confirmation Dialog */}
    <Dialog open={isDeliveryConfirmDialogOpen} onOpenChange={setIsDeliveryConfirmDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Penerimaan</DialogTitle>
          <DialogDescription>
            Konfirmasikan bahwa pesanan #{selectedOrderForConfirm?.orderNumber} telah diterima
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleDeliveryConfirmation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receivedBy">Nama Penerima *</Label>
            <Input
              id="receivedBy"
              value={confirmForm.receivedBy}
              onChange={(e) => setConfirmForm({ ...confirmForm, receivedBy: e.target.value })}
              placeholder="Nama yang menerima pesanan"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Jabatan/Posisi</Label>
            <Input
              id="position"
              value={confirmForm.position}
              onChange={(e) => setConfirmForm({ ...confirmForm, position: e.target.value })}
              placeholder="Contoh: Kepala Sekolah, Admin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNotes">Catatan Penerimaan</Label>
            <Textarea
              id="confirmNotes"
              value={confirmForm.notes}
              onChange={(e) => setConfirmForm({ ...confirmForm, notes: e.target.value })}
              placeholder="Catatan tambahan (opsional)"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeliveryConfirmDialogOpen(false);
                resetConfirmForm();
              }}
            >
              Batal
            </Button>
            <Button type="submit">Konfirmasi Penerimaan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}