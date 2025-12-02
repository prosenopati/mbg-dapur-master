"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
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
import { Plus, Edit, Trash2, Search, BookOpen } from "lucide-react";
import { chartOfAccountsService } from "@/lib/services/accountingService";
import { ChartOfAccount, AccountType, AccountCategory, NormalBalance } from "@/lib/types/accounting";
import { toast } from "sonner";

const accountTypeLabels: Record<AccountType, string> = {
  asset: "Aset",
  liability: "Kewajiban",
  equity: "Modal",
  revenue: "Pendapatan",
  expense: "Beban",
  cogs: "HPP",
};

const accountCategoryLabels: Record<AccountCategory, string> = {
  current_asset: "Aset Lancar",
  fixed_asset: "Aset Tetap",
  inventory: "Persediaan",
  receivable: "Piutang",
  current_liability: "Hutang Lancar",
  long_term_liability: "Hutang Jangka Panjang",
  payable: "Hutang Usaha",
  capital: "Modal",
  retained_earnings: "Laba Ditahan",
  drawings: "Prive",
  sales_revenue: "Pendapatan Penjualan",
  service_revenue: "Pendapatan Jasa",
  other_revenue: "Pendapatan Lain-lain",
  operating_expense: "Beban Operasional",
  administrative_expense: "Beban Administrasi",
  marketing_expense: "Beban Pemasaran",
  cost_of_goods_sold: "Harga Pokok Penjualan",
};

const categoriesByType: Record<AccountType, AccountCategory[]> = {
  asset: ["current_asset", "fixed_asset", "inventory", "receivable"],
  liability: ["current_liability", "long_term_liability", "payable"],
  equity: ["capital", "retained_earnings", "drawings"],
  revenue: ["sales_revenue", "service_revenue", "other_revenue"],
  expense: ["operating_expense", "administrative_expense", "marketing_expense"],
  cogs: ["cost_of_goods_sold"],
};

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<ChartOfAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<AccountType | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "asset" as AccountType,
    category: "current_asset" as AccountCategory,
    normalBalance: "debit" as NormalBalance,
    description: "",
    isActive: true,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, filterType]);

  const loadAccounts = () => {
    const allAccounts = chartOfAccountsService.getAll();
    setAccounts(allAccounts.sort((a, b) => a.code.localeCompare(b.code)));
  };

  const filterAccounts = () => {
    let filtered = accounts;

    if (filterType !== "all") {
      filtered = filtered.filter((a) => a.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAccounts(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAccount) {
      // Update
      chartOfAccountsService.updateAccount(editingAccount.id, formData);
      toast.success("Akun berhasil diperbarui");
    } else {
      // Create
      chartOfAccountsService.createAccount({
        ...formData,
        isSystem: false,
      });
      toast.success("Akun berhasil ditambahkan");
    }

    loadAccounts();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (account: ChartOfAccount) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      category: account.category,
      normalBalance: account.normalBalance,
      description: account.description || "",
      isActive: account.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (account: ChartOfAccount) => {
    if (account.isSystem) {
      toast.error("Akun sistem tidak dapat dihapus");
      return;
    }

    if (account.balance !== 0) {
      toast.error("Akun dengan saldo tidak dapat dihapus");
      return;
    }

    chartOfAccountsService.delete(account.id);
    toast.success("Akun berhasil dihapus");
    loadAccounts();
  };

  const resetForm = () => {
    setEditingAccount(null);
    setFormData({
      code: "",
      name: "",
      type: "asset",
      category: "current_asset",
      normalBalance: "debit",
      description: "",
      isActive: true,
    });
  };

  const handleTypeChange = (type: AccountType) => {
    const newCategory = categoriesByType[type][0];
    const newNormalBalance: NormalBalance =
      type === "asset" || type === "expense" || type === "cogs" ? "debit" : "credit";

    setFormData({
      ...formData,
      type,
      category: newCategory,
      normalBalance: newNormalBalance,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeBadgeVariant = (type: AccountType) => {
    const variants: Record<AccountType, any> = {
      asset: "default",
      liability: "destructive",
      equity: "secondary",
      revenue: "default",
      expense: "outline",
      cogs: "outline",
    };
    return variants[type];
  };

  const stats = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter((a) => a.isActive).length,
    assets: accounts.filter((a) => a.type === "asset").length,
    liabilities: accounts.filter((a) => a.type === "liability").length,
    equity: accounts.filter((a) => a.type === "equity").length,
    revenue: accounts.filter((a) => a.type === "revenue").length,
    expenses: accounts.filter((a) => a.type === "expense" || a.type === "cogs").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Chart of Accounts
            </h1>
            <p className="text-muted-foreground mt-2">
              Daftar Akun / Rekening Perkiraan
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Akun
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? "Edit Akun" : "Tambah Akun Baru"}
                </DialogTitle>
                <DialogDescription>
                  {editingAccount
                    ? "Perbarui informasi akun"
                    : "Tambahkan akun baru ke dalam chart of accounts"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Kode Akun *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="e.g., 1-1001"
                      required
                      disabled={editingAccount?.isSystem}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Akun *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Kas"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipe Akun *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={handleTypeChange}
                      disabled={editingAccount?.isSystem}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(accountTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value as AccountCategory })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesByType[formData.type].map((category) => (
                          <SelectItem key={category} value={category}>
                            {accountCategoryLabels[category]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="normalBalance">Normal Balance *</Label>
                    <Select
                      value={formData.normalBalance}
                      onValueChange={(value) =>
                        setFormData({ ...formData, normalBalance: value as NormalBalance })
                      }
                      disabled={editingAccount?.isSystem}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debit">Debit</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isActive">Status *</Label>
                    <Select
                      value={formData.isActive ? "active" : "inactive"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, isActive: value === "active" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Tidak Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                    placeholder="Deskripsi akun (opsional)"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingAccount ? "Perbarui" : "Tambah"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Akun</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAccounts}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Aset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.assets}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Kewajiban</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.liabilities}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.equity}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.revenue}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Beban</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.expenses}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.activeAccounts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Daftar Akun
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kode atau nama akun..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    {Object.entries(accountTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Akun</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Normal Balance</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">Tidak ada akun ditemukan</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono font-medium">{account.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{account.name}</p>
                          {account.description && (
                            <p className="text-xs text-muted-foreground">{account.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(account.type)}>
                          {accountTypeLabels[account.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {accountCategoryLabels[account.category]}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {account.normalBalance === "debit" ? "Debit" : "Credit"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(account.balance)}
                      </TableCell>
                      <TableCell>
                        {account.isActive ? (
                          <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline">Tidak Aktif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(account)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!account.isSystem && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(account)}
                              disabled={account.balance !== 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
