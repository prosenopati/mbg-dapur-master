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
  DialogTrigger } from
"@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
"@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Eye,
  Clock,
  Play,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp } from
"lucide-react";
import { productionPlanService, wasteRecordService } from "@/lib/services/productionService";
import { menuService } from "@/lib/services/menuService";
import { inventoryService } from "@/lib/services/inventoryService";
import { stockTransactionService } from "@/lib/services/inventoryBatchService";
import { ProductionPlan, WasteRecord } from "@/lib/types/workflow";
import { toast } from "sonner";

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState("plans");
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([]);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [isWasteDialogOpen, setIsWasteDialogOpen] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const menuItems = menuService.getAll();
  const inventoryItems = inventoryService.getAll();

  const [planFormData, setPlanFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: "morning" as "morning" | "afternoon" | "evening",
    plannedBy: "Manajer Koki",
    notes: "",
    outputs: [] as {menuItemId: string;plannedQuantity: number;}[],
    materials: [] as {inventoryItemId: string;requiredQuantity: number;}[]
  });

  const [wasteFormData, setWasteFormData] = useState({
    inventoryItemId: "",
    quantity: 0,
    reason: "expired" as WasteRecord["reason"],
    recordedBy: "Staf Gudang",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProductionPlans(
      productionPlanService.getAll().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
    setWasteRecords(
      wasteRecordService.getAll().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (planFormData.outputs.length === 0) {
      toast.error("Tambahkan minimal satu output produksi");
      return;
    }

    const outputs = planFormData.outputs.map((output) => {
      const menuItem = menuItems.find((m) => m.id === output.menuItemId);
      return {
        menuItemId: output.menuItemId,
        menuItemName: menuItem?.name || "",
        plannedQuantity: output.plannedQuantity
      };
    });

    const materials = planFormData.materials.map((material) => {
      const inventoryItem = inventoryItems.find((i) => i.id === material.inventoryItemId);
      return {
        inventoryItemId: material.inventoryItemId,
        inventoryItemName: inventoryItem?.name || "",
        requiredQuantity: material.requiredQuantity,
        unit: inventoryItem?.unit || ""
      };
    });

    productionPlanService.createPlan({
      date: planFormData.date,
      shift: planFormData.shift,
      outputs,
      materials,
      status: "planned",
      plannedBy: planFormData.plannedBy,
      notes: planFormData.notes || undefined
    });

    toast.success("Rencana produksi berhasil dibuat");
    loadData();
    setShowPlanForm(false);
    resetPlanForm();
  };

  const handleStartProduction = (id: string) => {
    const plan = productionPlanService.getById(id);
    if (!plan) return;

    // Check material availability
    for (const material of plan.materials) {
      const inventoryItem = inventoryService.getById(material.inventoryItemId);
      if (!inventoryItem || inventoryItem.quantity < material.requiredQuantity) {
        toast.error(`Stok ${material.inventoryItemName} tidak mencukupi`);
        return;
      }
    }

    productionPlanService.updateStatus(id, "in_progress");
    toast.info("Produksi dimulai");
    loadData();
  };

  const handleCompleteProduction = (id: string) => {
    const plan = productionPlanService.getById(id);
    if (!plan) return;

    // Consume materials
    plan.materials.forEach((material) => {
      const inventoryItem = inventoryService.getById(material.inventoryItemId);
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity - material.requiredQuantity;
        inventoryService.updateQuantity(material.inventoryItemId, newQuantity);

        // Record transaction
        stockTransactionService.recordTransaction({
          inventoryItemId: material.inventoryItemId,
          inventoryItemName: material.inventoryItemName,
          type: "production_use",
          quantity: material.requiredQuantity,
          unit: material.unit,
          balanceBefore: inventoryItem.quantity,
          balanceAfter: newQuantity,
          referenceId: id,
          referenceType: "production",
          performedBy: plan.plannedBy
        });
      }
    });

    productionPlanService.updateStatus(id, "completed");
    toast.success("Produksi selesai");
    loadData();
  };

  const handleWasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inventoryItem = inventoryItems.find((i) => i.id === wasteFormData.inventoryItemId);
    if (!inventoryItem) return;

    // Record waste
    wasteRecordService.recordWaste({
      inventoryItemId: wasteFormData.inventoryItemId,
      inventoryItemName: inventoryItem.name,
      quantity: wasteFormData.quantity,
      unit: inventoryItem.unit,
      reason: wasteFormData.reason,
      recordedBy: wasteFormData.recordedBy,
      notes: wasteFormData.notes || undefined
    });

    // Update inventory
    const newQuantity = Math.max(0, inventoryItem.quantity - wasteFormData.quantity);
    inventoryService.updateQuantity(wasteFormData.inventoryItemId, newQuantity);

    // Record transaction
    stockTransactionService.recordTransaction({
      inventoryItemId: wasteFormData.inventoryItemId,
      inventoryItemName: inventoryItem.name,
      type: "waste",
      quantity: wasteFormData.quantity,
      unit: inventoryItem.unit,
      balanceBefore: inventoryItem.quantity,
      balanceAfter: newQuantity,
      performedBy: wasteFormData.recordedBy
    });

    toast.success("Waste berhasil dicatat");
    loadData();
    setIsWasteDialogOpen(false);
    resetWasteForm();
  };

  const resetPlanForm = () => {
    setPlanFormData({
      date: new Date().toISOString().split('T')[0],
      shift: "morning",
      plannedBy: "Manajer Koki",
      notes: "",
      outputs: [],
      materials: []
    });
  };

  const resetWasteForm = () => {
    setWasteFormData({
      inventoryItemId: "",
      quantity: 0,
      reason: "expired",
      recordedBy: "Staf Gudang",
      notes: ""
    });
  };

  const addOutput = () => {
    setPlanFormData({
      ...planFormData,
      outputs: [...planFormData.outputs, { menuItemId: "", plannedQuantity: 1 }]
    });
  };

  const addMaterial = () => {
    setPlanFormData({
      ...planFormData,
      materials: [...planFormData.materials, { inventoryItemId: "", requiredQuantity: 1 }]
    });
  };

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, {variant: any;label: string;icon: any;}> = {
      planned: { variant: "outline", label: "Direncanakan", icon: Clock },
      in_progress: { variant: "secondary", label: "Berlangsung", icon: Play },
      completed: { variant: "default", label: "Selesai", icon: CheckCircle2 },
      cancelled: { variant: "destructive", label: "Dibatalkan", icon: AlertTriangle }
    };

    const { variant, label, icon: Icon } = config[status] || config.planned;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>);

  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const stats = {
    totalPlans: productionPlans.length,
    planned: productionPlans.filter((p) => p.status === "planned").length,
    inProgress: productionPlans.filter((p) => p.status === "in_progress").length,
    completed: productionPlans.filter((p) => p.status === "completed").length,
    totalWaste: wasteRecords.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Produksi Dapur
          </h1>
          <p className="text-muted-foreground">
            Rencana produksi dan pelacakan waste
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPlanForm(!showPlanForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Rencana Produksi
          </Button>

          <Dialog open={isWasteDialogOpen} onOpenChange={setIsWasteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="!whitespace-pre-line">
                <AlertTriangle className="mr-2 h-4 w-4" />Catat Waste
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Catat Waste</DialogTitle>
                <DialogDescription>
                  Catat bahan yang terbuang atau rusak
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleWasteSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="waste-item">Bahan *</Label>
                  <Select
                    value={wasteFormData.inventoryItemId}
                    onValueChange={(value) =>
                    setWasteFormData({ ...wasteFormData, inventoryItemId: value })
                    }>

                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item) =>
                      <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.unit})
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waste-quantity">Jumlah *</Label>
                  <Input
                    id="waste-quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={wasteFormData.quantity}
                    onChange={(e) =>
                    setWasteFormData({ ...wasteFormData, quantity: parseFloat(e.target.value) })
                    }
                    required />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="waste-reason">Alasan *</Label>
                  <Select
                    value={wasteFormData.reason}
                    onValueChange={(value: any) =>
                    setWasteFormData({ ...wasteFormData, reason: value })
                    }>

                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expired">Kadaluarsa</SelectItem>
                      <SelectItem value="damaged">Rusak</SelectItem>
                      <SelectItem value="spoiled">Busuk</SelectItem>
                      <SelectItem value="overproduction">Produksi Berlebih</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waste-notes">Catatan</Label>
                  <Textarea
                    id="waste-notes"
                    value={wasteFormData.notes}
                    onChange={(e) =>
                    setWasteFormData({ ...wasteFormData, notes: e.target.value })
                    }
                    rows={2} />

                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsWasteDialogOpen(false)}>

                    Batal
                  </Button>
                  <Button type="submit">Simpan Waste</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Inline Production Plan Form */}
      {showPlanForm && (
        <Card className="border-primary/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Buat Rencana Produksi</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tentukan menu dan bahan baku yang dibutuhkan
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowPlanForm(false);
                resetPlanForm();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
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
                  <Label htmlFor="shift">Shift *</Label>
                  <Select
                    value={planFormData.shift}
                    onValueChange={(value: any) =>
                      setPlanFormData({ ...planFormData, shift: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Pagi</SelectItem>
                      <SelectItem value="afternoon">Siang</SelectItem>
                      <SelectItem value="evening">Malam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Output Menu *</Label>
                <div className="space-y-2">
                  {planFormData.outputs.map((output, index) => (
                    <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                      <Select
                        value={output.menuItemId}
                        onValueChange={(value) => {
                          const newOutputs = [...planFormData.outputs];
                          newOutputs[index].menuItemId = value;
                          setPlanFormData({ ...planFormData, outputs: newOutputs });
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Pilih menu" />
                        </SelectTrigger>
                        <SelectContent>
                          {menuItems.map((menu) => (
                            <SelectItem key={menu.id} value={menu.id}>
                              {menu.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={output.plannedQuantity}
                        onChange={(e) => {
                          const newOutputs = [...planFormData.outputs];
                          newOutputs[index].plannedQuantity = parseInt(e.target.value) || 1;
                          setPlanFormData({ ...planFormData, outputs: newOutputs });
                        }}
                        placeholder="Jumlah"
                        className="w-24"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOutputs = planFormData.outputs.filter((_, i) => i !== index);
                          setPlanFormData({ ...planFormData, outputs: newOutputs });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOutput}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Output
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Bahan Baku Dibutuhkan</Label>
                <div className="space-y-2">
                  {planFormData.materials.map((material, index) => (
                    <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                      <Select
                        value={material.inventoryItemId}
                        onValueChange={(value) => {
                          const newMaterials = [...planFormData.materials];
                          newMaterials[index].inventoryItemId = value;
                          setPlanFormData({ ...planFormData, materials: newMaterials });
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Pilih bahan" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={material.requiredQuantity}
                        onChange={(e) => {
                          const newMaterials = [...planFormData.materials];
                          newMaterials[index].requiredQuantity = parseFloat(e.target.value) || 1;
                          setPlanFormData({ ...planFormData, materials: newMaterials });
                        }}
                        placeholder="Jumlah"
                        className="w-24"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newMaterials = planFormData.materials.filter((_, i) => i !== index);
                          setPlanFormData({ ...planFormData, materials: newMaterials });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMaterial}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Bahan
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={planFormData.notes}
                  onChange={(e) =>
                    setPlanFormData({ ...planFormData, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPlanForm(false);
                    resetPlanForm();
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan Rencana</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="transition-shadow hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-foreground">Total Rencana</CardTitle>
              <div className="text-xl font-bold text-foreground">{stats.totalPlans}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg border-l-4 border-l-gray-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-foreground">Direncanakan</CardTitle>
              <div className="text-xl font-bold text-gray-600">{stats.planned}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-foreground">Berlangsung</CardTitle>
              <div className="text-xl font-bold text-blue-600">{stats.inProgress}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-foreground">Selesai</CardTitle>
              <div className="text-xl font-bold text-green-600">{stats.completed}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-lg border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-foreground">Catatan Waste</CardTitle>
              <div className="text-xl font-bold text-red-600">{stats.totalWaste}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader>
          <CardTitle>Manajemen Produksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plans">Rencana Produksi</TabsTrigger>
              <TabsTrigger value="waste">Catatan Waste</TabsTrigger>
            </TabsList>

            {/* Production Plans Tab */}
            <TabsContent value="plans" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Rencana</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Output</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">Tidak ada rencana produksi</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    productionPlans.map((plan) => (
                      <>
                        <TableRow key={plan.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{plan.planNumber}</TableCell>
                          <TableCell>{formatDate(plan.date)}</TableCell>
                          <TableCell className="capitalize">
                            {plan.shift === "morning" ? "Pagi" : plan.shift === "afternoon" ? "Siang" : "Malam"}
                          </TableCell>
                          <TableCell>{plan.outputs.length} item</TableCell>
                          <TableCell>{getStatusBadge(plan.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => togglePlanExpansion(plan.id)}
                                title="Detail"
                              >
                                {expandedPlanId === plan.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              {plan.status === "planned" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartProduction(plan.id)}
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Mulai
                                </Button>
                              )}
                              {plan.status === "in_progress" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCompleteProduction(plan.id)}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Selesai
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Inline Expanded Detail View */}
                        {expandedPlanId === plan.id && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/30 p-0">
                              <div className="p-6 space-y-6 animate-in slide-in-from-top-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold">Detail Rencana Produksi</h3>
                                    <p className="text-sm text-muted-foreground">{plan.planNumber}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setExpandedPlanId(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <Card>
                                    <CardContent className="pt-6">
                                      <p className="text-sm font-medium text-muted-foreground mb-1">Tanggal</p>
                                      <p className="text-base font-semibold">{formatDate(plan.date)}</p>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="pt-6">
                                      <p className="text-sm font-medium text-muted-foreground mb-1">Shift</p>
                                      <p className="text-base font-semibold capitalize">
                                        {plan.shift === "morning" ? "Pagi" : plan.shift === "afternoon" ? "Siang" : "Malam"}
                                      </p>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="pt-6">
                                      <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                                      <div className="mt-1">{getStatusBadge(plan.status)}</div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="pt-6">
                                      <p className="text-sm font-medium text-muted-foreground mb-1">Direncanakan Oleh</p>
                                      <p className="text-base font-semibold">{plan.plannedBy}</p>
                                    </CardContent>
                                  </Card>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <Card className="border-primary/20">
                                    <CardHeader>
                                      <CardTitle className="text-base">Output Menu</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2">
                                        {plan.outputs.map((output, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-background border rounded-lg hover:shadow-sm transition-shadow"
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                {index + 1}
                                              </div>
                                              <p className="font-medium">{output.menuItemName}</p>
                                            </div>
                                            <Badge variant="secondary" className="font-mono">
                                              {output.plannedQuantity} porsi
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="border-blue-500/20">
                                    <CardHeader>
                                      <CardTitle className="text-base">Bahan Baku Dibutuhkan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2">
                                        {plan.materials.map((material, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-background border rounded-lg hover:shadow-sm transition-shadow"
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 font-semibold text-sm">
                                                {index + 1}
                                              </div>
                                              <p className="font-medium">{material.inventoryItemName}</p>
                                            </div>
                                            <Badge variant="outline" className="font-mono">
                                              {material.requiredQuantity} {material.unit}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {plan.notes && (
                                  <Card className="border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20">
                                    <CardHeader>
                                      <CardTitle className="text-base">Catatan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-sm leading-relaxed">{plan.notes}</p>
                                    </CardContent>
                                  </Card>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t">
                                  <p className="text-xs text-muted-foreground">
                                    Dibuat pada {new Date(plan.createdAt).toLocaleString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </p>
                                  <div className="flex gap-2">
                                    {plan.status === "planned" && (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                          handleStartProduction(plan.id);
                                          setExpandedPlanId(null);
                                        }}
                                      >
                                        <Play className="mr-2 h-4 w-4" />
                                        Mulai Produksi
                                      </Button>
                                    )}
                                    {plan.status === "in_progress" && (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                          handleCompleteProduction(plan.id);
                                          setExpandedPlanId(null);
                                        }}
                                      >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Selesaikan Produksi
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Waste Records Tab */}
            <TabsContent value="waste" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bahan</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Dicatat Oleh</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wasteRecords.length === 0 ?
                  <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">Tidak ada catatan waste</p>
                      </TableCell>
                    </TableRow> :

                  wasteRecords.map((waste) =>
                  <TableRow key={waste.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{waste.inventoryItemName}</TableCell>
                        <TableCell>
                          {waste.quantity} {waste.unit}
                        </TableCell>
                        <TableCell className="capitalize">
                          {waste.reason === "expired" ? "Kadaluarsa" :
                        waste.reason === "damaged" ? "Rusak" :
                        waste.reason === "spoiled" ? "Busuk" :
                        waste.reason === "overproduction" ? "Produksi Berlebih" : "Lainnya"}
                        </TableCell>
                        <TableCell>{waste.recordedBy}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(waste.createdAt)}
                        </TableCell>
                      </TableRow>
                  )
                  }
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}