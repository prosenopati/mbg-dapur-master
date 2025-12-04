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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Plus, Pencil, Trash2, Eye, Power, PowerOff, Calendar, CheckCircle, XCircle, Clock, Truck, Package, FileText, Search, X, UtensilsCrossed, ClipboardList, ChevronDown, ChevronUp, Save } from "lucide-react";
import { menuService } from "@/lib/services/menuService";
import { menuPlanService } from "@/lib/services/menuPlanService";
import { MenuItem, MenuCategory, MenuPlan, MenuPlanStatus, TargetGroup, DayOfWeek, IngredientCategory, MenuPlanIngredient } from "@/lib/types";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [menuPlans, setMenuPlans] = useState<MenuPlan[]>([]);
  const [filteredMenuPlans, setFilteredMenuPlans] = useState<MenuPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [planSearchQuery, setPlanSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [viewPlanDialog, setViewPlanDialog] = useState<MenuPlan | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [editingPlanData, setEditingPlanData] = useState<MenuPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "lunch" as MenuCategory,
    description: "",
    price: "",
    preparationTime: "",
    imageUrl: "",
  });
  const [planFormData, setPlanFormData] = useState({
    masterMenu: "",
    targetGroup: "SD" as TargetGroup,
    date: "",
    dayOfWeek: "Senin" as DayOfWeek,
    portionCount: "",
    notes: "",
  });
  const [planIngredients, setPlanIngredients] = useState<MenuPlanIngredient[]>([]);

  useEffect(() => {
    loadMenuItems();
    loadMenuPlans();
  }, []);

  useEffect(() => {
    filterMenuItems();
  }, [menuItems, searchQuery]);

  useEffect(() => {
    filterMenuPlans();
  }, [menuPlans, planSearchQuery]);

  const loadMenuItems = () => {
    setMenuItems(menuService.getAll());
  };

  const loadMenuPlans = () => {
    setMenuPlans(menuPlanService.getAll());
  };

  const filterMenuItems = () => {
    let filtered = menuItems;
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredMenuItems(filtered);
  };

  const filterMenuPlans = () => {
    let filtered = menuPlans;
    if (planSearchQuery) {
      filtered = filtered.filter(
        (plan) =>
          plan.planCode.toLowerCase().includes(planSearchQuery.toLowerCase()) ||
          plan.masterMenu.toLowerCase().includes(planSearchQuery.toLowerCase()) ||
          plan.targetGroup.toLowerCase().includes(planSearchQuery.toLowerCase())
      );
    }
    setFilteredMenuPlans(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "lunch",
      description: "",
      price: "",
      preparationTime: "",
      imageUrl: "",
    });
    setEditingItem(null);
  };

  const resetPlanForm = () => {
    setPlanFormData({
      masterMenu: "",
      targetGroup: "SD",
      date: "",
      dayOfWeek: "Senin",
      portionCount: "",
      notes: "",
    });
    setPlanIngredients([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const itemData = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      price: parseFloat(formData.price),
      preparationTime: parseInt(formData.preparationTime),
      imageUrl: formData.imageUrl || undefined,
      isAvailable: true,
      ingredients: [],
    };

    if (editingItem) {
      menuService.update(editingItem.id, itemData);
      toast.success("Menu item berhasil diperbarui");
    } else {
      menuService.create({
        id: Date.now().toString(),
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success("Menu item berhasil ditambahkan");
    }

    loadMenuItems();
    setIsDialogOpen(false);
    resetForm();
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (planIngredients.length === 0) {
      toast.error("Mohon tambahkan minimal 1 bahan");
      return;
    }

    const planData = {
      masterMenu: planFormData.masterMenu,
      targetGroup: planFormData.targetGroup,
      date: planFormData.date,
      dayOfWeek: planFormData.dayOfWeek,
      portionCount: parseInt(planFormData.portionCount),
      status: 'draft' as MenuPlanStatus,
      ingredients: planIngredients,
      notes: planFormData.notes || undefined,
    };

    menuPlanService.create({
      id: Date.now().toString(),
      planCode: menuPlanService.generatePlanCode(),
      ...planData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
    });
    toast.success("Menu plan berhasil dibuat");

    loadMenuPlans();
    setIsPlanDialogOpen(false);
    resetPlanForm();
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price.toString(),
      preparationTime: item.preparationTime.toString(),
      imageUrl: item.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleExpandPlan = (plan: MenuPlan) => {
    if (expandedPlanId === plan.id) {
      // Collapse if already expanded
      setExpandedPlanId(null);
      setEditingPlanData(null);
    } else {
      // Expand and load data
      setExpandedPlanId(plan.id);
      setEditingPlanData({ ...plan });
    }
  };

  const handleSaveInlineEdit = () => {
    if (!editingPlanData) return;

    if (editingPlanData.ingredients.length === 0) {
      toast.error("Mohon tambahkan minimal 1 bahan");
      return;
    }

    const planData = {
      masterMenu: editingPlanData.masterMenu,
      targetGroup: editingPlanData.targetGroup,
      date: editingPlanData.date,
      dayOfWeek: editingPlanData.dayOfWeek,
      portionCount: editingPlanData.portionCount,
      status: editingPlanData.status,
      ingredients: editingPlanData.ingredients,
      notes: editingPlanData.notes || undefined,
    };

    menuPlanService.update(editingPlanData.id, planData);
    toast.success("Menu plan berhasil diperbarui");

    loadMenuPlans();
    setExpandedPlanId(null);
    setEditingPlanData(null);
  };

  const handleCancelInlineEdit = () => {
    setExpandedPlanId(null);
    setEditingPlanData(null);
  };

  const updateInlineField = (field: keyof MenuPlan, value: any) => {
    if (!editingPlanData) return;
    setEditingPlanData({ ...editingPlanData, [field]: value });
  };

  const addInlineIngredient = () => {
    if (!editingPlanData) return;
    const newIngredients = [
      ...editingPlanData.ingredients,
      {
        id: Date.now().toString(),
        category: 'Karbohidrat' as IngredientCategory,
        productName: '',
        plannedQty: 0,
        unit: 'kg',
        notes: '',
      },
    ];
    setEditingPlanData({ ...editingPlanData, ingredients: newIngredients });
  };

  const updateInlineIngredient = (index: number, field: keyof MenuPlanIngredient, value: any) => {
    if (!editingPlanData) return;
    const updated = [...editingPlanData.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setEditingPlanData({ ...editingPlanData, ingredients: updated });
  };

  const removeInlineIngredient = (index: number) => {
    if (!editingPlanData) return;
    const updated = editingPlanData.ingredients.filter((_, i) => i !== index);
    setEditingPlanData({ ...editingPlanData, ingredients: updated });
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus menu item ini?")) {
      menuService.delete(id);
      loadMenuItems();
      toast.success("Menu item berhasil dihapus");
    }
  };

  const handleDeletePlan = (id: string) => {
    if (confirm("Yakin ingin menghapus menu plan ini?")) {
      menuPlanService.delete(id);
      loadMenuPlans();
      toast.success("Menu plan berhasil dihapus");
      if (expandedPlanId === id) {
        setExpandedPlanId(null);
        setEditingPlanData(null);
      }
    }
  };

  const handleToggleAvailability = (id: string) => {
    menuService.toggleAvailability(id);
    loadMenuItems();
  };

  const handleStatusChange = (id: string, newStatus: MenuPlanStatus) => {
    menuPlanService.updateStatus(id, newStatus, 'Admin');
    loadMenuPlans();
    toast.success(`Status berhasil diubah ke ${getStatusLabel(newStatus)}`);
    
    // Update expanded plan if it's the same one
    if (expandedPlanId === id && editingPlanData) {
      const updatedPlan = menuPlanService.getAll().find(p => p.id === id);
      if (updatedPlan) {
        setEditingPlanData({ ...updatedPlan });
      }
    }
  };

  const addIngredient = () => {
    setPlanIngredients([
      ...planIngredients,
      {
        id: Date.now().toString(),
        category: 'Karbohidrat',
        productName: '',
        plannedQty: 0,
        unit: 'kg',
        notes: '',
      },
    ]);
  };

  const updateIngredient = (index: number, field: keyof MenuPlanIngredient, value: any) => {
    const updated = [...planIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setPlanIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setPlanIngredients(planIngredients.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryBadge = (category: MenuCategory) => {
    const colors: Record<MenuCategory, string> = {
      breakfast: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      lunch: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      dinner: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      snack: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      beverage: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
    };

    return (
      <Badge className={colors[category]} variant="outline">
        {category}
      </Badge>
    );
  };

  const getStatusBadge = (status: MenuPlanStatus) => {
    const config: Record<MenuPlanStatus, { label: string; className: string; icon: any }> = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: FileText },
      confirmed: { label: "Dikonfirmasi", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle },
      production: { label: "Produksi", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Package },
      portioning: { label: "Pemorsian", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", icon: Package },
      delivery: { label: "Pengiriman", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck },
      completed: { label: "Selesai", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
      cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
    };

    const { label, className, icon: Icon } = config[status];
    return (
      <Badge className={cn("gap-1", className)} variant="outline">
        <Icon className="h-3 w-3" />
        <span className="hidden sm:inline">{label}</span>
      </Badge>
    );
  };

  const getStatusLabel = (status: MenuPlanStatus): string => {
    const labels: Record<MenuPlanStatus, string> = {
      draft: "Draft",
      confirmed: "Sudah Dikonfirmasi",
      production: "Produksi",
      portioning: "Pemorsian",
      delivery: "Pengiriman",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return labels[status];
  };

  const getStatusActions = (plan: MenuPlan) => {
    const actions = [];
    
    if (plan.status === 'draft') {
      actions.push(
        <Button key="confirm" size="sm" onClick={() => handleStatusChange(plan.id, 'confirmed')}>
          Konfirmasi
        </Button>
      );
    } else if (plan.status === 'confirmed') {
      actions.push(
        <Button key="production" size="sm" onClick={() => handleStatusChange(plan.id, 'production')}>
          Mulai Produksi
        </Button>
      );
    } else if (plan.status === 'production') {
      actions.push(
        <Button key="portioning" size="sm" onClick={() => handleStatusChange(plan.id, 'portioning')}>
          Mulai Pemorsian
        </Button>
      );
    } else if (plan.status === 'portioning') {
      actions.push(
        <Button key="delivery" size="sm" onClick={() => handleStatusChange(plan.id, 'delivery')}>
          Mulai Pengiriman
        </Button>
      );
    } else if (plan.status === 'delivery') {
      actions.push(
        <Button key="complete" size="sm" onClick={() => handleStatusChange(plan.id, 'completed')}>
          Selesai
        </Button>
      );
    }

    if (plan.status === 'draft' || plan.status === 'confirmed') {
      actions.push(
        <Button key="cancel" size="sm" variant="destructive" onClick={() => handleStatusChange(plan.id, 'cancelled')}>
          Batalkan
        </Button>
      );
    }

    return actions;
  };

  const stats = {
    menuItems: {
      total: menuItems.length,
      available: menuItems.filter((item) => item.isAvailable).length,
      unavailable: menuItems.filter((item) => !item.isAvailable).length,
      avgPrice: menuItems.reduce((sum, item) => sum + item.price, 0) / (menuItems.length || 1),
    },
    menuPlans: {
      total: menuPlans.length,
      draft: menuPlans.filter((p) => p.status === 'draft').length,
      active: menuPlans.filter((p) => ['confirmed', 'production', 'portioning', 'delivery'].includes(p.status)).length,
      completed: menuPlans.filter((p) => p.status === 'completed').length,
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Compact Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Menu Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Kelola menu & rencana menu
        </p>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items" className="gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="hidden sm:inline">Menu Items</span>
            <span className="sm:hidden">Items</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Menu Plans</span>
            <span className="sm:hidden">Plans</span>
          </TabsTrigger>
        </TabsList>

        {/* Menu Items Tab */}
        <TabsContent value="items" className="space-y-4">
          {/* Header with Add Button */}
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Tambah Menu Item</span>
                  <span className="sm:hidden">Tambah</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Edit Menu Item" : "Tambah Menu Item Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem
                      ? "Perbarui detail menu item."
                      : "Isi detail menu item baru."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">Nama *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs">Kategori *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value as MenuCategory })
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                          <SelectItem value="beverage">Beverage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs">Deskripsi *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="price" className="text-xs">Harga (IDR) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="preparationTime" className="text-xs">Waktu (menit) *</Label>
                      <Input
                        id="preparationTime"
                        type="number"
                        min="1"
                        value={formData.preparationTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preparationTime: e.target.value,
                          })
                        }
                        required
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="imageUrl" className="text-xs">URL Gambar (opsional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                      className="h-9"
                    />
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      size="sm"
                    >
                      Batal
                    </Button>
                    <Button type="submit" size="sm">
                      {editingItem ? "Perbarui" : "Buat"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Compact Stats Grid - 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Items</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-2xl font-bold">{stats.menuItems.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Tersedia</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-2xl font-bold text-green-600">
                  {stats.menuItems.available}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Tidak Tersedia</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-2xl font-bold text-red-600">
                  {stats.menuItems.unavailable}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Harga Rata-rata</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-lg font-bold">
                  {formatCurrency(stats.menuItems.avgPrice)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <Card>
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
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

          {/* Mobile Card View / Desktop Table */}
          {filteredMenuItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No items match your search" : "Belum ada menu items"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="grid gap-3 lg:hidden">
                {filteredMenuItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3 mb-3">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={60}
                            height={60}
                            className="rounded-md object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center shrink-0">
                            <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1 truncate">{item.name}</h3>
                          {getCategoryBadge(item.category)}
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Harga</p>
                          <p className="font-semibold">{formatCurrency(item.price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Waktu</p>
                          <p className="font-medium">{item.preparationTime} menit</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t">
                        <Badge variant={item.isAvailable ? "default" : "secondary"} className="text-xs">
                          {item.isAvailable ? "Tersedia" : "Tidak Tersedia"}
                        </Badge>
                        <div className="flex gap-1 ml-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleAvailability(item.id)}
                            className="h-8 w-8"
                          >
                            {item.isAvailable ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <Card className="hidden lg:block">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-base">Daftar Menu Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-10 text-xs">Gambar</TableHead>
                          <TableHead className="h-10 text-xs">Nama</TableHead>
                          <TableHead className="h-10 text-xs">Kategori</TableHead>
                          <TableHead className="h-10 text-xs">Harga</TableHead>
                          <TableHead className="h-10 text-xs">Waktu</TableHead>
                          <TableHead className="h-10 text-xs">Status</TableHead>
                          <TableHead className="h-10 text-xs text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMenuItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="py-3">
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="rounded-md object-cover"
                                />
                              ) : (
                                <div className="w-[40px] h-[40px] bg-muted rounded-md flex items-center justify-center">
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium py-3 text-sm">{item.name}</TableCell>
                            <TableCell className="py-3">{getCategoryBadge(item.category)}</TableCell>
                            <TableCell className="py-3 text-sm">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="py-3 text-sm">{item.preparationTime} mnt</TableCell>
                            <TableCell className="py-3">
                              <Badge variant={item.isAvailable ? "default" : "secondary"} className="text-xs">
                                {item.isAvailable ? "Tersedia" : "Tidak"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleAvailability(item.id)}
                                  className="h-8 w-8"
                                >
                                  {item.isAvailable ? (
                                    <PowerOff className="h-4 w-4" />
                                  ) : (
                                    <Power className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(item)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(item.id)}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Menu Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPlanDialogOpen} onOpenChange={(open) => {
              setIsPlanDialogOpen(open);
              if (!open) resetPlanForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Buat Menu Plan Baru</span>
                  <span className="sm:hidden">Tambah</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Buat Menu Plan Baru</DialogTitle>
                  <DialogDescription>
                    Isi detail untuk membuat menu plan baru.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePlanSubmit} className="space-y-6">
                  {/* Informasi Menu Plan */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground">Informasi Menu Plan</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="masterMenu">Master Menu *</Label>
                        <Input
                          id="masterMenu"
                          value={planFormData.masterMenu}
                          onChange={(e) =>
                            setPlanFormData({ ...planFormData, masterMenu: e.target.value })
                          }
                          placeholder="Nasi+Ayam Goreng+Sayur Asem"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetGroup">Kelompok Sasaran *</Label>
                        <Select
                          value={planFormData.targetGroup}
                          onValueChange={(value) =>
                            setPlanFormData({ ...planFormData, targetGroup: value as TargetGroup })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TK">TK</SelectItem>
                            <SelectItem value="SD">SD</SelectItem>
                            <SelectItem value="SMP">SMP</SelectItem>
                            <SelectItem value="SMA">SMA</SelectItem>
                            <SelectItem value="UMUM">UMUM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="date">Tanggal *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={planFormData.date}
                          onChange={(e) =>
                            setPlanFormData({ ...planFormData, date: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dayOfWeek">Hari *</Label>
                        <Select
                          value={planFormData.dayOfWeek}
                          onValueChange={(value) =>
                            setPlanFormData({ ...planFormData, dayOfWeek: value as DayOfWeek })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Senin">Senin</SelectItem>
                            <SelectItem value="Selasa">Selasa</SelectItem>
                            <SelectItem value="Rabu">Rabu</SelectItem>
                            <SelectItem value="Kamis">Kamis</SelectItem>
                            <SelectItem value="Jumat">Jumat</SelectItem>
                            <SelectItem value="Sabtu">Sabtu</SelectItem>
                            <SelectItem value="Minggu">Minggu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="portionCount">Jumlah Porsi *</Label>
                        <Input
                          id="portionCount"
                          type="number"
                          min="1"
                          value={planFormData.portionCount}
                          onChange={(e) =>
                            setPlanFormData({ ...planFormData, portionCount: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Catatan (opsional)</Label>
                      <Textarea
                        id="notes"
                        value={planFormData.notes}
                        onChange={(e) =>
                          setPlanFormData({ ...planFormData, notes: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Detail Bahan */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm uppercase text-muted-foreground">Detail Bahan</h3>
                      <Button type="button" size="sm" onClick={addIngredient}>
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah Bahan
                      </Button>
                    </div>

                    {planIngredients.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">Belum ada bahan. Klik tombol di atas untuk menambahkan.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {planIngredients.map((ingredient, index) => (
                          <Card key={ingredient.id}>
                            <CardContent className="pt-4">
                              <div className="grid gap-3 md:grid-cols-12 items-start">
                                <div className="md:col-span-2">
                                  <Label className="text-xs">Kategori</Label>
                                  <Select
                                    value={ingredient.category}
                                    onValueChange={(value) =>
                                      updateIngredient(index, 'category', value as IngredientCategory)
                                    }
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Karbohidrat">Karbohidrat</SelectItem>
                                      <SelectItem value="Protein Hewani">Protein Hewani</SelectItem>
                                      <SelectItem value="Protein Nabati">Protein Nabati</SelectItem>
                                      <SelectItem value="Sayur">Sayur</SelectItem>
                                      <SelectItem value="Buah">Buah</SelectItem>
                                      <SelectItem value="Bumbu">Bumbu</SelectItem>
                                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="md:col-span-3">
                                  <Label className="text-xs">Nama Produk</Label>
                                  <Input
                                    className="h-8"
                                    value={ingredient.productName}
                                    onChange={(e) =>
                                      updateIngredient(index, 'productName', e.target.value)
                                    }
                                    required
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label className="text-xs">Qty</Label>
                                  <Input
                                    className="h-8"
                                    type="number"
                                    step="0.01"
                                    value={ingredient.plannedQty}
                                    onChange={(e) =>
                                      updateIngredient(index, 'plannedQty', parseFloat(e.target.value))
                                    }
                                    required
                                  />
                                </div>
                                <div className="md:col-span-1">
                                  <Label className="text-xs">Unit</Label>
                                  <Select
                                    value={ingredient.unit}
                                    onValueChange={(value) =>
                                      updateIngredient(index, 'unit', value)
                                    }
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="kg">kg</SelectItem>
                                      <SelectItem value="gram">gram</SelectItem>
                                      <SelectItem value="liter">liter</SelectItem>
                                      <SelectItem value="potong">potong</SelectItem>
                                      <SelectItem value="buah">buah</SelectItem>
                                      <SelectItem value="pcs">pcs</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="md:col-span-3">
                                  <Label className="text-xs">Keterangan</Label>
                                  <Input
                                    className="h-8"
                                    value={ingredient.notes}
                                    onChange={(e) =>
                                      updateIngredient(index, 'notes', e.target.value)
                                    }
                                    placeholder="Catatan konversi"
                                  />
                                </div>
                                <div className="md:col-span-1 flex items-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-full"
                                    onClick={() => removeIngredient(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPlanDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit">
                      Buat
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Menu Plans Stats */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Plans</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-2xl font-bold">{stats.menuPlans.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Draft</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-2xl font-bold text-gray-600">
                  {stats.menuPlans.draft}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Aktif</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.menuPlans.active}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Selesai</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-2xl font-bold text-green-600">
                  {stats.menuPlans.completed}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <Card>
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari menu plans..."
                  value={planSearchQuery}
                  onChange={(e) => setPlanSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
                {planSearchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setPlanSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Menu Plans Table with Expandable Rows */}
          <Card>
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-base">Daftar Menu Plans</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-10 text-xs w-[50px]"></TableHead>
                      <TableHead className="h-10 text-xs">Kode Plan</TableHead>
                      <TableHead className="h-10 text-xs">Master Menu</TableHead>
                      <TableHead className="h-10 text-xs">Kelompok</TableHead>
                      <TableHead className="h-10 text-xs">Tanggal</TableHead>
                      <TableHead className="h-10 text-xs">Porsi</TableHead>
                      <TableHead className="h-10 text-xs">Status</TableHead>
                      <TableHead className="h-10 text-xs text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMenuPlans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-muted-foreground text-sm">
                            {planSearchQuery ? "Tidak ada hasil pencarian" : "Belum ada menu plans"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMenuPlans.map((plan) => (
                        <>
                          {/* Main Row */}
                          <TableRow key={plan.id} className={cn(
                            "cursor-pointer hover:bg-muted/50",
                            expandedPlanId === plan.id && "bg-muted/30"
                          )}>
                            <TableCell className="py-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleExpandPlan(plan)}
                              >
                                {expandedPlanId === plan.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium py-3 text-sm">{plan.planCode}</TableCell>
                            <TableCell className="max-w-xs truncate py-3 text-sm">{plan.masterMenu}</TableCell>
                            <TableCell className="py-3">
                              <Badge variant="outline" className="text-xs">{plan.targetGroup}</Badge>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{plan.date}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{plan.dayOfWeek}</span>
                            </TableCell>
                            <TableCell className="font-semibold py-3 text-sm">{plan.portionCount.toLocaleString('id-ID')}</TableCell>
                            <TableCell className="py-3">{getStatusBadge(plan.status)}</TableCell>
                            <TableCell className="text-right py-3">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewPlanDialog(plan)}
                                  title="Lihat Detail"
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {plan.status === 'draft' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeletePlan(plan.id)}
                                    title="Hapus"
                                    className="h-8 w-8"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expandable Row - Inline Edit Form */}
                          {expandedPlanId === plan.id && editingPlanData && (
                            <TableRow>
                              <TableCell colSpan={8} className="bg-muted/20 p-0">
                                <div className="p-6 space-y-6">
                                  {/* Status & Workflow Actions */}
                                  <div className="flex items-center justify-between bg-primary/5 p-4 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-medium">Status Workflow:</span>
                                      {getStatusBadge(editingPlanData.status)}
                                    </div>
                                    <div className="flex gap-2">
                                      {getStatusActions(editingPlanData)}
                                    </div>
                                  </div>

                                  {/* Edit Form */}
                                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-medium text-foreground">Master Menu *</Label>
                                      <Input
                                        value={editingPlanData.masterMenu}
                                        onChange={(e) => updateInlineField('masterMenu', e.target.value)}
                                        className="h-9 text-foreground font-medium"
                                        disabled={editingPlanData.status !== 'draft'}
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-medium text-foreground">Kelompok Sasaran *</Label>
                                      <Select
                                        value={editingPlanData.targetGroup}
                                        onValueChange={(value) => updateInlineField('targetGroup', value)}
                                        disabled={editingPlanData.status !== 'draft'}
                                      >
                                        <SelectTrigger className="h-9 text-foreground font-medium">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="TK">TK</SelectItem>
                                          <SelectItem value="SD">SD</SelectItem>
                                          <SelectItem value="SMP">SMP</SelectItem>
                                          <SelectItem value="SMA">SMA</SelectItem>
                                          <SelectItem value="UMUM">UMUM</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-medium text-foreground">Tanggal *</Label>
                                      <Input
                                        type="date"
                                        value={editingPlanData.date}
                                        onChange={(e) => updateInlineField('date', e.target.value)}
                                        className="h-9 text-foreground font-medium"
                                        disabled={editingPlanData.status !== 'draft'}
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-medium text-foreground">Hari *</Label>
                                      <Select
                                        value={editingPlanData.dayOfWeek}
                                        onValueChange={(value) => updateInlineField('dayOfWeek', value)}
                                        disabled={editingPlanData.status !== 'draft'}
                                      >
                                        <SelectTrigger className="h-9 text-foreground font-medium">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Senin">Senin</SelectItem>
                                          <SelectItem value="Selasa">Selasa</SelectItem>
                                          <SelectItem value="Rabu">Rabu</SelectItem>
                                          <SelectItem value="Kamis">Kamis</SelectItem>
                                          <SelectItem value="Jumat">Jumat</SelectItem>
                                          <SelectItem value="Sabtu">Sabtu</SelectItem>
                                          <SelectItem value="Minggu">Minggu</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-medium text-foreground">Jumlah Porsi *</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={editingPlanData.portionCount}
                                        onChange={(e) => updateInlineField('portionCount', parseInt(e.target.value))}
                                        className="h-9 text-foreground font-medium"
                                        disabled={editingPlanData.status !== 'draft'}
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs font-medium text-foreground">Catatan</Label>
                                      <Input
                                        value={editingPlanData.notes || ''}
                                        onChange={(e) => updateInlineField('notes', e.target.value)}
                                        className="h-9 text-foreground font-medium"
                                        disabled={editingPlanData.status !== 'draft'}
                                      />
                                    </div>
                                  </div>

                                  {/* Nested Ingredients Table */}
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-sm text-foreground">Detail Bahan</h4>
                                      {editingPlanData.status === 'draft' && (
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={addInlineIngredient}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Tambah Bahan
                                        </Button>
                                      )}
                                    </div>

                                    <div className="border rounded-lg overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-muted/50">
                                            <TableHead className="h-9 text-xs font-semibold text-foreground">Kategori</TableHead>
                                            <TableHead className="h-9 text-xs font-semibold text-foreground">Nama Produk</TableHead>
                                            <TableHead className="h-9 text-xs font-semibold text-foreground">Qty</TableHead>
                                            <TableHead className="h-9 text-xs font-semibold text-foreground">Unit</TableHead>
                                            <TableHead className="h-9 text-xs font-semibold text-foreground">Keterangan</TableHead>
                                            {editingPlanData.status === 'draft' && (
                                              <TableHead className="h-9 text-xs font-semibold text-foreground w-[50px]"></TableHead>
                                            )}
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {editingPlanData.ingredients.length === 0 ? (
                                            <TableRow>
                                              <TableCell colSpan={editingPlanData.status === 'draft' ? 6 : 5} className="text-center py-6 text-sm text-foreground">
                                                Belum ada bahan
                                              </TableCell>
                                            </TableRow>
                                          ) : (
                                            editingPlanData.ingredients.map((ing, idx) => (
                                              <TableRow key={ing.id}>
                                                <TableCell className="py-2">
                                                  <Select
                                                    value={ing.category}
                                                    onValueChange={(value) => updateInlineIngredient(idx, 'category', value)}
                                                    disabled={editingPlanData.status !== 'draft'}
                                                  >
                                                    <SelectTrigger className="h-8 text-xs text-foreground font-medium">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="Karbohidrat">Karbohidrat</SelectItem>
                                                      <SelectItem value="Protein Hewani">Protein Hewani</SelectItem>
                                                      <SelectItem value="Protein Nabati">Protein Nabati</SelectItem>
                                                      <SelectItem value="Sayur">Sayur</SelectItem>
                                                      <SelectItem value="Buah">Buah</SelectItem>
                                                      <SelectItem value="Bumbu">Bumbu</SelectItem>
                                                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </TableCell>
                                                <TableCell className="py-2">
                                                  <Input
                                                    value={ing.productName}
                                                    onChange={(e) => updateInlineIngredient(idx, 'productName', e.target.value)}
                                                    className="h-8 text-xs text-foreground font-medium"
                                                    disabled={editingPlanData.status !== 'draft'}
                                                  />
                                                </TableCell>
                                                <TableCell className="py-2">
                                                  <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={ing.plannedQty}
                                                    onChange={(e) => updateInlineIngredient(idx, 'plannedQty', parseFloat(e.target.value))}
                                                    className="h-8 text-xs w-20 text-foreground font-medium"
                                                    disabled={editingPlanData.status !== 'draft'}
                                                  />
                                                </TableCell>
                                                <TableCell className="py-2">
                                                  <Select
                                                    value={ing.unit}
                                                    onValueChange={(value) => updateInlineIngredient(idx, 'unit', value)}
                                                    disabled={editingPlanData.status !== 'draft'}
                                                  >
                                                    <SelectTrigger className="h-8 text-xs w-24 text-foreground font-medium">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="kg">kg</SelectItem>
                                                      <SelectItem value="gram">gram</SelectItem>
                                                      <SelectItem value="liter">liter</SelectItem>
                                                      <SelectItem value="potong">potong</SelectItem>
                                                      <SelectItem value="buah">buah</SelectItem>
                                                      <SelectItem value="pcs">pcs</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </TableCell>
                                                <TableCell className="py-2">
                                                  <Input
                                                    value={ing.notes || ''}
                                                    onChange={(e) => updateInlineIngredient(idx, 'notes', e.target.value)}
                                                    className="h-8 text-xs text-foreground font-medium"
                                                    placeholder="Catatan"
                                                    disabled={editingPlanData.status !== 'draft'}
                                                  />
                                                </TableCell>
                                                {editingPlanData.status === 'draft' && (
                                                  <TableCell className="py-2">
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-7 w-7"
                                                      onClick={() => removeInlineIngredient(idx)}
                                                    >
                                                      <Trash2 className="h-3 w-3 text-red-600" />
                                                    </Button>
                                                  </TableCell>
                                                )}
                                              </TableRow>
                                            ))
                                          )}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  {editingPlanData.status === 'draft' && (
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancelInlineEdit}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Tutup
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleSaveInlineEdit}
                                      >
                                        <Save className="h-4 w-4 mr-1" />
                                        Simpan Perubahan
                                      </Button>
                                    </div>
                                  )}

                                  {editingPlanData.status !== 'draft' && (
                                    <div className="flex justify-end pt-4 border-t">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancelInlineEdit}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Tutup
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Plan Dialog - Keep for quick view */}
      {viewPlanDialog && (
        <Dialog open={!!viewPlanDialog} onOpenChange={() => setViewPlanDialog(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span>Menu Plan</span>
                <Badge variant="outline" className="text-base">{viewPlanDialog.planCode}</Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status Progress */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Status Workflow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusBadge(viewPlanDialog.status)}
                    <span className="text-sm text-muted-foreground">
                      {viewPlanDialog.status === 'draft' && 'Kembali ke Draft'}
                      {viewPlanDialog.status === 'confirmed' && 'Sudah Dikonfirmasi'}
                      {viewPlanDialog.status === 'production' && 'Sedang Produksi'}
                      {viewPlanDialog.status === 'portioning' && 'Sedang Pemorsian'}
                      {viewPlanDialog.status === 'delivery' && 'Sedang Pengiriman'}
                      {viewPlanDialog.status === 'completed' && 'Telah Selesai'}
                      {viewPlanDialog.status === 'cancelled' && 'Dibatalkan'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {getStatusActions(viewPlanDialog)}
                  </div>
                </CardContent>
              </Card>

              {/* Informasi Menu Plan */}
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase text-blue-900 dark:text-blue-100">
                    Informasi Menu Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Master Menu</p>
                      <p className="font-semibold">{viewPlanDialog.masterMenu}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Kelompok Sasaran</p>
                      <Badge variant="outline" className="mt-1">{viewPlanDialog.targetGroup}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal</p>
                      <p className="font-semibold">{viewPlanDialog.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hari</p>
                      <p className="font-semibold">{viewPlanDialog.dayOfWeek}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Jumlah Porsi</p>
                      <p className="font-semibold text-lg text-primary">{viewPlanDialog.portionCount.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detail Menu Plan Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm uppercase text-muted-foreground">
                      Detail Menu Plan
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-9 text-xs">Kategori Produk MBG</TableHead>
                        <TableHead className="h-9 text-xs">Produk</TableHead>
                        <TableHead className="h-9 text-xs text-right">Qty Plan</TableHead>
                        <TableHead className="h-9 text-xs">Unit</TableHead>
                        <TableHead className="h-9 text-xs">Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewPlanDialog.ingredients.map((ing) => (
                        <TableRow key={ing.id}>
                          <TableCell className="py-2">
                            <Badge variant="outline" className="text-xs">
                              {ing.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium py-2 text-sm">{ing.productName}</TableCell>
                          <TableCell className="text-right font-semibold py-2 text-sm">
                            {ing.plannedQty.toLocaleString('id-ID', { 
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2 
                            })}
                          </TableCell>
                          <TableCell className="py-2 text-sm">{ing.unit}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs py-2">
                            {ing.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Workflow History */}
              {(viewPlanDialog.confirmedAt || viewPlanDialog.productionStartedAt) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Riwayat Workflow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {viewPlanDialog.confirmedAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-muted-foreground">Dikonfirmasi:</span>
                          <span className="font-medium">{new Date(viewPlanDialog.confirmedAt).toLocaleString('id-ID')}</span>
                          {viewPlanDialog.confirmedBy && (
                            <span className="text-muted-foreground">oleh {viewPlanDialog.confirmedBy}</span>
                          )}
                        </div>
                      )}
                      {viewPlanDialog.productionStartedAt && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-yellow-600" />
                          <span className="text-muted-foreground">Produksi dimulai:</span>
                          <span className="font-medium">{new Date(viewPlanDialog.productionStartedAt).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {viewPlanDialog.portioningStartedAt && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-orange-600" />
                          <span className="text-muted-foreground">Pemorsian dimulai:</span>
                          <span className="font-medium">{new Date(viewPlanDialog.portioningStartedAt).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {viewPlanDialog.deliveryStartedAt && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-purple-600" />
                          <span className="text-muted-foreground">Pengiriman dimulai:</span>
                          <span className="font-medium">{new Date(viewPlanDialog.deliveryStartedAt).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {viewPlanDialog.completedAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-muted-foreground">Selesai:</span>
                          <span className="font-medium">{new Date(viewPlanDialog.completedAt).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewPlanDialog(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}