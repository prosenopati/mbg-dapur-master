"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { employeeService } from "@/lib/services/employeeService";
import { Employee, EmploymentStatus, EmploymentType } from "@/lib/types";
import { UserPlus, Edit, Trash2, Users, Eye } from "lucide-react";
import { toast } from "sonner";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employeeNumber: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    placeOfBirth: "",
    idNumber: "",
    position: "",
    department: "",
    employmentType: "full-time" as EmploymentType,
    employmentStatus: "active" as EmploymentStatus,
    joinDate: "",
    endDate: "",
    bankName: "",
    bankAccount: "",
    accountHolderName: "",
    taxNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEmployees(employeeService.getAll());
    setLoading(false);
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        employeeNumber: employee.employeeNumber,
        fullName: employee.fullName,
        email: employee.email || "",
        phone: employee.phone,
        address: employee.address,
        dateOfBirth: employee.dateOfBirth,
        placeOfBirth: employee.placeOfBirth,
        idNumber: employee.idNumber,
        position: employee.position,
        department: employee.department,
        employmentType: employee.employmentType,
        employmentStatus: employee.employmentStatus,
        joinDate: employee.joinDate,
        endDate: employee.endDate || "",
        bankName: employee.bankName || "",
        bankAccount: employee.bankAccount || "",
        accountHolderName: employee.accountHolderName || "",
        taxNumber: employee.taxNumber || "",
        emergencyContactName: employee.emergencyContactName || "",
        emergencyContactPhone: employee.emergencyContactPhone || "",
        emergencyContactRelation: employee.emergencyContactRelation || "",
      });
    } else {
      setEditingEmployee(null);
      const newEmployeeNumber = employeeService.generateEmployeeNumber();
      setFormData({
        employeeNumber: newEmployeeNumber,
        fullName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        placeOfBirth: "",
        idNumber: "",
        position: "",
        department: "",
        employmentType: "full-time",
        employmentStatus: "active",
        joinDate: new Date().toISOString().split("T")[0],
        endDate: "",
        bankName: "",
        bankAccount: "",
        accountHolderName: "",
        taxNumber: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
      });
    }
    setDialogOpen(true);
  };

  const handleView = (employee: Employee) => {
    setViewingEmployee(employee);
    setViewDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.position || !formData.department) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      if (editingEmployee) {
        employeeService.update(editingEmployee.id, formData);
        toast.success("Data karyawan berhasil diupdate");
      } else {
        employeeService.create(formData);
        toast.success("Karyawan berhasil ditambahkan");
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data karyawan ini?")) {
      if (employeeService.delete(id)) {
        toast.success("Karyawan berhasil dihapus");
        loadData();
      } else {
        toast.error("Gagal menghapus karyawan");
      }
    }
  };

  const getStatusBadge = (status: EmploymentStatus) => {
    const variants: Record<EmploymentStatus, { variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
      active: { variant: "default", className: "bg-green-600" },
      inactive: { variant: "secondary" },
      terminated: { variant: "destructive" },
      "on-leave": { variant: "outline" },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </Badge>
    );
  };

  const getTypeBadge = (type: EmploymentType) => {
    return <Badge variant="outline">{type.replace("-", " ")}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
            <p className="text-muted-foreground">
              Kelola data karyawan dan informasi kepegawaian
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Karyawan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((e) => e.employmentStatus === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Full-Time</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((e) => e.employmentType === "full-time").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Part-Time/Contract</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter((e) => e.employmentType !== "full-time").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Karyawan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIK</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Belum ada karyawan
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-mono text-sm">
                          {employee.employeeNumber}
                        </TableCell>
                        <TableCell className="font-medium">{employee.fullName}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{getTypeBadge(employee.employmentType)}</TableCell>
                        <TableCell>{getStatusBadge(employee.employmentStatus)}</TableCell>
                        <TableCell>{employee.phone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(employee)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(employee)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(employee.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Karyawan" : "Tambah Karyawan Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee
                ? "Update informasi karyawan"
                : "Tambahkan karyawan baru ke sistem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Informasi Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeNumber">NIK Karyawan</Label>
                    <Input
                      id="employeeNumber"
                      value={formData.employeeNumber}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">No. KTP</Label>
                    <Input
                      id="idNumber"
                      value={formData.idNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, idNumber: e.target.value })
                      }
                      placeholder="33240xxxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({ ...formData, dateOfBirth: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placeOfBirth">Tempat Lahir</Label>
                    <Input
                      id="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={(e) =>
                        setFormData({ ...formData, placeOfBirth: e.target.value })
                      }
                      placeholder="Kendal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      No. Telepon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Alamat lengkap"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Informasi Kepegawaian</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">
                      Posisi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      placeholder="e.g., Kepala Dapur, Driver/Kurir"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">
                      Departemen <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData({ ...formData, department: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih departemen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Procurement">Procurement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Tipe Kepegawaian</Label>
                    <Select
                      value={formData.employmentType}
                      onValueChange={(value: EmploymentType) =>
                        setFormData({ ...formData, employmentType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-Time</SelectItem>
                        <SelectItem value="part-time">Part-Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentStatus">Status</Label>
                    <Select
                      value={formData.employmentStatus}
                      onValueChange={(value: EmploymentStatus) =>
                        setFormData({ ...formData, employmentStatus: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on-leave">On Leave</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Tanggal Bergabung</Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) =>
                        setFormData({ ...formData, joinDate: e.target.value })
                      }
                    />
                  </div>
                  {formData.employmentType === "contract" && (
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Tanggal Berakhir Kontrak</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bank & Tax Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Informasi Bank & Pajak</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Nama Bank</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({ ...formData, bankName: e.target.value })
                      }
                      placeholder="Bank BRI, Bank Mandiri, dll"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">No. Rekening</Label>
                    <Input
                      id="bankAccount"
                      value={formData.bankAccount}
                      onChange={(e) =>
                        setFormData({ ...formData, bankAccount: e.target.value })
                      }
                      placeholder="xxxx-xx-xxxxxx-xx-x"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName">Nama Pemegang Rekening</Label>
                    <Input
                      id="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={(e) =>
                        setFormData({ ...formData, accountHolderName: e.target.value })
                      }
                      placeholder="Nama sesuai rekening"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">NPWP</Label>
                    <Input
                      id="taxNumber"
                      value={formData.taxNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, taxNumber: e.target.value })
                      }
                      placeholder="xx.xxx.xxx.x-xxx.xxx"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Kontak Darurat</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Nama</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        setFormData({ ...formData, emergencyContactName: e.target.value })
                      }
                      placeholder="Nama kontak darurat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">No. Telepon</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, emergencyContactPhone: e.target.value })
                      }
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelation">Hubungan</Label>
                    <Input
                      id="emergencyContactRelation"
                      value={formData.emergencyContactRelation}
                      onChange={(e) =>
                        setFormData({ ...formData, emergencyContactRelation: e.target.value })
                      }
                      placeholder="Istri, Suami, Orang Tua, dll"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                {editingEmployee ? "Update" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Karyawan</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-6 py-4">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-sm mb-3 border-b pb-2">
                  Informasi Personal
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">NIK Karyawan</p>
                    <p className="font-medium">{viewingEmployee.employeeNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nama Lengkap</p>
                    <p className="font-medium">{viewingEmployee.fullName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">No. KTP</p>
                    <p className="font-medium">{viewingEmployee.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tempat, Tanggal Lahir</p>
                    <p className="font-medium">
                      {viewingEmployee.placeOfBirth},{" "}
                      {new Date(viewingEmployee.dateOfBirth).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{viewingEmployee.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telepon</p>
                    <p className="font-medium">{viewingEmployee.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Alamat</p>
                    <p className="font-medium">{viewingEmployee.address}</p>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h3 className="font-semibold text-sm mb-3 border-b pb-2">
                  Informasi Kepegawaian
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Posisi</p>
                    <p className="font-medium">{viewingEmployee.position}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Departemen</p>
                    <p className="font-medium">{viewingEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipe Kepegawaian</p>
                    <p>{getTypeBadge(viewingEmployee.employmentType)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p>{getStatusBadge(viewingEmployee.employmentStatus)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tanggal Bergabung</p>
                    <p className="font-medium">
                      {new Date(viewingEmployee.joinDate).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  {viewingEmployee.endDate && (
                    <div>
                      <p className="text-muted-foreground">Tanggal Berakhir Kontrak</p>
                      <p className="font-medium">
                        {new Date(viewingEmployee.endDate).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank & Tax Information */}
              {(viewingEmployee.bankName || viewingEmployee.taxNumber) && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 border-b pb-2">
                    Informasi Bank & Pajak
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {viewingEmployee.bankName && (
                      <>
                        <div>
                          <p className="text-muted-foreground">Nama Bank</p>
                          <p className="font-medium">{viewingEmployee.bankName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">No. Rekening</p>
                          <p className="font-medium">{viewingEmployee.bankAccount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Nama Pemegang Rekening</p>
                          <p className="font-medium">{viewingEmployee.accountHolderName}</p>
                        </div>
                      </>
                    )}
                    {viewingEmployee.taxNumber && (
                      <div>
                        <p className="text-muted-foreground">NPWP</p>
                        <p className="font-medium">{viewingEmployee.taxNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {viewingEmployee.emergencyContactName && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 border-b pb-2">
                    Kontak Darurat
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nama</p>
                      <p className="font-medium">{viewingEmployee.emergencyContactName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Telepon</p>
                      <p className="font-medium">{viewingEmployee.emergencyContactPhone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hubungan</p>
                      <p className="font-medium">{viewingEmployee.emergencyContactRelation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
