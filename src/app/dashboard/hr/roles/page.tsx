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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { roleService } from "@/lib/services/roleService";
import { Role, Permission } from "@/lib/types";
import { Shield, Plus, Edit, Trash2, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRoles(roleService.getAll());
    setPermissions(roleService.getAllPermissions());
    setLoading(false);
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        code: role.code,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        permissions: [],
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast.error("Mohon lengkapi nama dan kode role");
      return;
    }

    try {
      if (editingRole) {
        roleService.update(editingRole.id, {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
        toast.success("Role berhasil diupdate");
      } else {
        roleService.create({
          name: formData.name,
          code: formData.code,
          description: formData.description,
          permissions: formData.permissions,
          isSystemRole: false,
        });
        toast.success("Role berhasil ditambahkan");
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDelete = (role: Role) => {
    if (role.isSystemRole) {
      toast.error("System role tidak dapat dihapus");
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus role "${role.name}"?`)) {
      if (roleService.delete(role.id)) {
        toast.success("Role berhasil dihapus");
        loadData();
      } else {
        toast.error("Gagal menghapus role");
      }
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const toggleModulePermissions = (module: string) => {
    const modulePermissions = permissions
      .filter((p) => p.module === module)
      .map((p) => p.id);
    
    const allSelected = modulePermissions.every((id) =>
      formData.permissions.includes(id)
    );

    if (allSelected) {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter(
          (id) => !modulePermissions.includes(id)
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...modulePermissions])],
      }));
    }
  };

  const getPermissionsByModule = () => {
    const modules = [...new Set(permissions.map((p) => p.module))];
    return modules.map((module) => ({
      module,
      permissions: permissions.filter((p) => p.module === module),
    }));
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
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">
              Kelola role dan permission pengguna sistem
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Role
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Roles</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roles.filter((r) => r.isSystemRole).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permissions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Belum ada role
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {role.code}
                          </code>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {role.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {role.permissions.length} permissions
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {role.isSystemRole ? (
                            <Badge variant="default">System</Badge>
                          ) : (
                            <Badge variant="secondary">Custom</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(role)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!role.isSystemRole && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(role)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? `Edit Role: ${editingRole.name}` : "Tambah Role Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update informasi role dan permissions"
                : "Buat role baru dan assign permissions"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Role Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., HR Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">
                    Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g., hr_manager"
                    disabled={!!editingRole && editingRole.isSystemRole}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Deskripsi role"
                    rows={2}
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Permissions</Label>
                <div className="space-y-4">
                  {getPermissionsByModule().map(({ module, permissions: modulePerms }) => {
                    const allSelected = modulePerms.every((p) =>
                      formData.permissions.includes(p.id)
                    );
                    
                    return (
                      <div key={module} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm">{module}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleModulePermissions(module)}
                          >
                            {allSelected ? (
                              <>
                                <CheckSquare className="w-4 h-4 mr-1" />
                                Deselect All
                              </>
                            ) : (
                              <>
                                <Square className="w-4 h-4 mr-1" />
                                Select All
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {modulePerms.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={permission.id}
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-1 w-4 h-4 rounded border-gray-300"
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={permission.id}
                                  className="cursor-pointer font-medium text-sm"
                                >
                                  {permission.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.permissions.length} permissions selected
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
                {editingRole ? "Update" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
