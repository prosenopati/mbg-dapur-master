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
  AlertTriangle } from
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
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isWasteDialogOpen, setIsWasteDialogOpen] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<ProductionPlan | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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
    setIsPlanDialogOpen(false);
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
          <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Rencana Produksi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Buat Rencana Produksi</DialogTitle>
                <DialogDescription>
                  Tentukan menu dan bahan baku yang dibutuhkan
                </DialogDescription>
              </DialogHeader>
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
                      required />

                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shift">Shift *</Label>
                    <Select
                      value={planFormData.shift}
                      onValueChange={(value: any) =>
                      setPlanFormData({ ...planFormData, shift: value })
                      }>

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
                    {planFormData.outputs.map((output, index) =>
                    <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                        <Select
                        value={output.menuItemId}
                        onValueChange={(value) => {
                          const newOutputs = [...planFormData.outputs];
                          newOutputs[index].menuItemId = value;
                          setPlanFormData({ ...planFormData, outputs: newOutputs });
                        }}>

                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Pilih menu" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuItems.map((menu) =>
                            <SelectItem key={menu.id} value={menu.id}>
                                  {menu.name}
                                </SelectItem>
                            )}
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
                        className="w-24" />

                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOutputs = planFormData.outputs.filter((_, i) => i !== index);
                          setPlanFormData({ ...planFormData, outputs: newOutputs });
                        }}>

                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOutput}
                    className="w-full">

                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Output
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Bahan Baku Dibutuhkan</Label>
                  <div className="space-y-2">
                    {planFormData.materials.map((material, index) =>
                    <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                        <Select
                        value={material.inventoryItemId}
                        onValueChange={(value) => {
                          const newMaterials = [...planFormData.materials];
                          newMaterials[index].inventoryItemId = value;
                          setPlanFormData({ ...planFormData, materials: newMaterials });
                        }}>

                          <SelectTrigger className="flex-1">
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
                        className="w-24" />

                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newMaterials = planFormData.materials.filter((_, i) => i !== index);
                          setPlanFormData({ ...planFormData, materials: newMaterials });
                        }}>

                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMaterial}
                    className="w-full">

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
                    rows={2} />

                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPlanDialogOpen(false)}>

                    Batal
                  </Button>
                  <Button type="submit">Simpan Rencana</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isWasteDialogOpen} onOpenChange={setIsWasteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="!whitespace-pre-line">
                <AlertTriangle className="mr-2 h-4 w-4" />Catat

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
                  {productionPlans.length === 0 ?
                  <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">Tidak ada rencana produksi</p>
                      </TableCell>
                    </TableRow> :

                  productionPlans.map((plan) =>
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
                          onClick={() => {
                            setViewingPlan(plan);
                            setIsViewDialogOpen(true);
                          }}>

                                <Eye className="h-4 w-4" />
                              </Button>
                              {plan.status === "planned" &&
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartProduction(plan.id)}>

                                  <Play className="mr-2 h-4 w-4" />
                                  Mulai
                                </Button>
                          }
                              {plan.status === "in_progress" &&
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteProduction(plan.id)}>

                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Selesai
                                </Button>
                          }
                            </div>
                          </TableCell>
                      </TableRow>
                  )
                  }
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

      {/* View Production Plan Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Rencana Produksi</DialogTitle>
            <DialogDescription>{viewingPlan?.planNumber}</DialogDescription>
          </DialogHeader>
          {viewingPlan &&
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                  <p className="text-sm font-medium">{formatDate(viewingPlan.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shift</p>
                  <p className="text-sm capitalize">
                    {viewingPlan.shift === "morning" ? "Pagi" : viewingPlan.shift === "afternoon" ? "Siang" : "Malam"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingPlan.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Direncanakan Oleh</p>
                  <p className="text-sm">{viewingPlan.plannedBy}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Output Menu</p>
                <div className="space-y-2">
                  {viewingPlan.outputs.map((output, index) =>
                <div key={index} className="flex justify-between p-3 border rounded-lg">
                      <p className="font-medium">{output.menuItemName}</p>
                      <p className="text-sm">Jumlah: {output.plannedQuantity}</p>
                    </div>
                )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Bahan Baku Dibutuhkan</p>
                <div className="space-y-2">
                  {viewingPlan.materials.map((material, index) =>
                <div key={index} className="flex justify-between p-3 border rounded-lg">
                      <p className="font-medium">{material.inventoryItemName}</p>
                      <p className="text-sm">
                        {material.requiredQuantity} {material.unit}
                      </p>
                    </div>
                )}
                </div>
              </div>

              {viewingPlan.notes &&
            <div>
                  <p className="text-sm font-medium text-muted-foreground">Catatan</p>
                  <p className="text-sm mt-1">{viewingPlan.notes}</p>
                </div>
            }
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>
  );
}