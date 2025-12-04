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
import { Plus, Pencil, Trash2, PackagePlus, AlertTriangle, Search, Filter, X, Package2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { inventoryService } from "@/lib/services/inventoryService";
import { InventoryItem, InventoryStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "all">("all");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    minimumStock: "",
    supplier: "",
  });

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    filterItems();
  }, [inventoryItems, searchQuery, statusFilter]);

  const loadInventory = () => {
    setInventoryItems(inventoryService.getAll());
  };

  const filterItems = () => {
    let filtered = inventoryItems;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: "",
      unit: "",
      minimumStock: "",
      supplier: "",
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseFloat(formData.quantity);
    const minimumStock = parseFloat(formData.minimumStock);
    
    let status: InventoryStatus = "in-stock";
    if (quantity === 0) status = "out-of-stock";
    else if (quantity <= minimumStock) status = "low-stock";

    const itemData = {
      name: formData.name,
      category: formData.category,
      quantity,
      unit: formData.unit,
      minimumStock,
      supplier: formData.supplier || undefined,
      status,
    };

    if (editingItem) {
      inventoryService.update(editingItem.id, itemData);
    } else {
      inventoryService.create({
        id: Date.now().toString(),
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    loadInventory();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      minimumStock: item.minimumStock.toString(),
      supplier: item.supplier || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      inventoryService.delete(id);
      loadInventory();
    }
  };

  const handleRestockClick = (item: InventoryItem) => {
    setRestockingItem(item);
    setRestockAmount("");
    setIsRestockDialogOpen(true);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockingItem && restockAmount) {
      inventoryService.restock(restockingItem.id, parseFloat(restockAmount));
      loadInventory();
      setIsRestockDialogOpen(false);
      setRestockingItem(null);
      setRestockAmount("");
    }
  };

  const getStatusBadge = (status: InventoryStatus) => {
    const variants = {
      "in-stock": { 
        variant: "default" as const, 
        label: "In Stock", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: TrendingUp
      },
      "low-stock": { 
        variant: "outline" as const, 
        label: "Low Stock", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Minus
      },
      "out-of-stock": { 
        variant: "destructive" as const, 
        label: "Out of Stock", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: TrendingDown
      },
    };

    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={cn("gap-1", config.className)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const lowStockItems = inventoryItems.filter(
    (item) => item.status === "low-stock" || item.status === "out-of-stock"
  );

  const stats = {
    total: inventoryItems.length,
    inStock: inventoryItems.filter((item) => item.status === "in-stock").length,
    lowStock: inventoryItems.filter((item) => item.status === "low-stock").length,
    outOfStock: inventoryItems.filter((item) => item.status === "out-of-stock").length,
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        {/* Header with Alert Card */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left: Title and Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:flex-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inventory</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track kitchen stock
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Edit Item" : "Add New Item"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem
                      ? "Update the inventory item details."
                      : "Fill in the details to add a new item."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">Item Name *</Label>
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
                      <Label htmlFor="category" className="text-xs">Category *</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        required
                        placeholder="e.g., Bahan Pokok"
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="quantity" className="text-xs">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        required
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="unit" className="text-xs">Unit *</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        required
                        placeholder="kg, pcs"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="minimumStock" className="text-xs">Min Stock *</Label>
                      <Input
                        id="minimumStock"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.minimumStock}
                        onChange={(e) =>
                          setFormData({ ...formData, minimumStock: e.target.value })
                        }
                        required
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="supplier" className="text-xs">Supplier (optional)</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) =>
                        setFormData({ ...formData, supplier: e.target.value })
                      }
                      placeholder="Supplier name"
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
                      Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      {editingItem ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Right: Restock Alert Card - 60% width, centered */}
          {lowStockItems.length > 0 && (
            <div className="lg:flex lg:justify-center lg:w-[60%]">
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/10 w-full">
                <CardContent className="px-4 py-3">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0" />
                      <span className="text-sm font-bold text-yellow-900 dark:text-yellow-400">
                        {lowStockItems.length} Item{lowStockItems.length > 1 ? "s" : ""} Need Restocking
                      </span>
                    </div>
                    <span className="text-xs text-yellow-800 dark:text-yellow-500">
                      {lowStockItems.map((item) => item.name).join(", ")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Stats Grid - Center Aligned Content with Bigger Text */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="px-4 py-4">
              <div className="flex flex-col items-center justify-center text-center gap-1">
                <Package2 className="h-6 w-6 text-primary mb-1" />
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-4 py-4">
              <div className="flex flex-col items-center justify-center text-center gap-1">
                <TrendingUp className="h-6 w-6 text-green-600 mb-1" />
                <div className="text-3xl font-bold text-green-600">{stats.inStock}</div>
                <p className="text-xs text-muted-foreground">In Stock</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-4 py-4">
              <div className="flex flex-col items-center justify-center text-center gap-1">
                <Minus className="h-6 w-6 text-yellow-600 mb-1" />
                <div className="text-3xl font-bold text-yellow-600">{stats.lowStock}</div>
                <p className="text-xs text-muted-foreground">Low Stock</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-4 py-4">
              <div className="flex flex-col items-center justify-center text-center gap-1">
                <TrendingDown className="h-6 w-6 text-red-600 mb-1" />
                <div className="text-3xl font-bold text-red-600">{stats.outOfStock}</div>
                <p className="text-xs text-muted-foreground">Out of Stock</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search items, category, supplier..."
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
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className="h-9 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "in-stock" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("in-stock")}
                  className="h-9 text-xs"
                >
                  In Stock
                </Button>
                <Button
                  variant={statusFilter === "low-stock" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("low-stock")}
                  className="h-9 text-xs"
                >
                  Low
                </Button>
                <Button
                  variant={statusFilter === "out-of-stock" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("out-of-stock")}
                  className="h-9 text-xs"
                >
                  Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Card View / Desktop Table */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package2 className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "No items match your filters" 
                  : "No inventory items yet"}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="grid gap-3 lg:hidden">
              {filteredItems.map((item) => (
                <Card key={item.id} className={cn(
                  "transition-all",
                  item.status === "out-of-stock" && "border-red-200 dark:border-red-900/50",
                  item.status === "low-stock" && "border-yellow-200 dark:border-yellow-900/50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Quantity</p>
                        <p className={cn(
                          "font-semibold",
                          item.quantity <= item.minimumStock && "text-red-600"
                        )}>
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Min Stock</p>
                        <p className="font-medium">{item.minimumStock} {item.unit}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">Supplier</p>
                        <p className="text-sm">{item.supplier || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestockClick(item)}
                        className="flex-1 h-8 text-xs"
                      >
                        <PackagePlus className="mr-1.5 h-3.5 w-3.5" />
                        Restock
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
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden lg:block">
              <CardHeader className="px-4 py-3">
                <CardTitle className="text-base">Inventory Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-10 text-xs">Item Name</TableHead>
                        <TableHead className="h-10 text-xs">Category</TableHead>
                        <TableHead className="h-10 text-xs">Quantity</TableHead>
                        <TableHead className="h-10 text-xs">Min Stock</TableHead>
                        <TableHead className="h-10 text-xs">Status</TableHead>
                        <TableHead className="h-10 text-xs">Supplier</TableHead>
                        <TableHead className="h-10 text-xs">Last Restocked</TableHead>
                        <TableHead className="h-10 text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium py-3 text-sm">{item.name}</TableCell>
                          <TableCell className="py-3 text-sm">{item.category}</TableCell>
                          <TableCell className="py-3">
                            <span className={cn(
                              "text-sm",
                              item.quantity <= item.minimumStock && "text-red-600 font-semibold"
                            )}>
                              {item.quantity} {item.unit}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-sm">
                            {item.minimumStock} {item.unit}
                          </TableCell>
                          <TableCell className="py-3">{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="py-3 text-sm text-muted-foreground">
                            {item.supplier || "-"}
                          </TableCell>
                          <TableCell className="py-3 text-xs text-muted-foreground">
                            {formatDate(item.lastRestocked)}
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRestockClick(item)}
                                title="Restock"
                                className="h-8 w-8"
                              >
                                <PackagePlus className="h-4 w-4 text-green-600" />
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
      </div>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Restock Item</DialogTitle>
            <DialogDescription className="text-sm">
              Add quantity to {restockingItem?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRestockSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Current Stock</Label>
              <p className="text-sm font-medium">
                {restockingItem?.quantity} {restockingItem?.unit}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="restockAmount" className="text-xs">Amount to Add *</Label>
              <Input
                id="restockAmount"
                type="number"
                min="0.1"
                step="0.1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                required
                placeholder={`Enter amount in ${restockingItem?.unit}`}
                className="h-9"
              />
            </div>
            {restockAmount && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm">
                  <span className="font-medium">New total:</span>{" "}
                  {(parseFloat(restockingItem?.quantity.toString() || "0") +
                    parseFloat(restockAmount)).toFixed(1)}{" "}
                  {restockingItem?.unit}
                </p>
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRestockDialogOpen(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">Confirm Restock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}