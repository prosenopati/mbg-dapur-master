"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Shield,
  Bell,
  Lock,
  Camera,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Data
  const [profileData, setProfileData] = useState({
    fullName: "Administrator MBG Dapur",
    email: "admin@mbgdapur.com",
    phone: "+62 812-3456-7890",
    position: "Kitchen Manager",
    department: "Operations",
    address: "Jl. Raya Kendal No. 123, Kendal, Jawa Tengah",
    bio: "Berpengalaman dalam manajemen dapur dan katering selama lebih dari 10 tahun.",
    joinDate: "2020-01-15",
    employeeId: "EMP-2020-001",
    avatar: "",
  });

  // Security Settings
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderAlerts: true,
    inventoryAlerts: true,
    payrollReminders: true,
    systemUpdates: false,
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock update
    toast.success("Profil berhasil diperbarui");
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }

    if (securityData.newPassword.length < 8) {
      toast.error("Password harus minimal 8 karakter");
      return;
    }

    // Mock password change
    toast.success("Password berhasil diubah");
    setSecurityData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleNotificationUpdate = () => {
    toast.success("Pengaturan notifikasi berhasil diperbarui");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola informasi profil dan pengaturan akun Anda
          </p>
        </div>

        {/* Profile Overview Card */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={profileData.avatar} alt={profileData.fullName} />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {getInitials(profileData.fullName)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{profileData.fullName}</h2>
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{profileData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{profileData.position} - {profileData.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Bergabung sejak {new Date(profileData.joinDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</span>
                  </div>
                </div>
              </div>

              {/* Employee ID Badge */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Employee ID</p>
                <Badge variant="outline" className="text-lg font-mono px-4 py-2">
                  {profileData.employeeId}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Profile Sections */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" />
              Informasi Personal
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              Keamanan
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifikasi
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Personal</CardTitle>
                <CardDescription>
                  Perbarui informasi pribadi dan detail kontak Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, fullName: e.target.value })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phone: e.target.value })
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Posisi</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="position"
                          value={profileData.position}
                          onChange={(e) =>
                            setProfileData({ ...profileData, position: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Departemen</Label>
                      <Select
                        value={profileData.department}
                        onValueChange={(value) =>
                          setProfileData({ ...profileData, department: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Kitchen">Kitchen</SelectItem>
                          <SelectItem value="Procurement">Procurement</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="HR">Human Resources</SelectItem>
                          <SelectItem value="Logistics">Logistics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Tanggal Bergabung</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="joinDate"
                          type="date"
                          value={profileData.joinDate}
                          onChange={(e) =>
                            setProfileData({ ...profileData, joinDate: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) =>
                          setProfileData({ ...profileData, address: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / Catatan</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={4}
                      placeholder="Ceritakan sedikit tentang diri Anda..."
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline">
                      Batal
                    </Button>
                    <Button type="submit" className="gap-2">
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ubah Password</CardTitle>
                <CardDescription>
                  Pastikan password Anda kuat dan unik untuk keamanan akun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Password Saat Ini *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={securityData.currentPassword}
                          onChange={(e) =>
                            setSecurityData({ ...securityData, currentPassword: e.target.value })
                          }
                          className="pl-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Password Baru *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={securityData.newPassword}
                          onChange={(e) =>
                            setSecurityData({ ...securityData, newPassword: e.target.value })
                          }
                          className="pl-10 pr-10"
                          required
                          minLength={8}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password harus minimal 8 karakter
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Konfirmasi Password Baru *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={securityData.confirmPassword}
                          onChange={(e) =>
                            setSecurityData({ ...securityData, confirmPassword: e.target.value })
                          }
                          className="pl-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline">
                      Batal
                    </Button>
                    <Button type="submit" className="gap-2">
                      <Lock className="h-4 w-4" />
                      Ubah Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle>Autentikasi Dua Faktor (2FA)</CardTitle>
                <CardDescription>
                  Tambahkan lapisan keamanan ekstra untuk akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Status 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Autentikasi dua faktor saat ini tidak aktif
                    </p>
                  </div>
                  <Button variant="outline">Aktifkan 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Notifikasi</CardTitle>
                <CardDescription>
                  Kelola bagaimana Anda menerima notifikasi dari sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Notifikasi Email</p>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi melalui email
                      </p>
                    </div>
                    <Button
                      variant={notificationSettings.emailNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: !notificationSettings.emailNotifications,
                        })
                      }
                    >
                      {notificationSettings.emailNotifications ? "Aktif" : "Nonaktif"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Notifikasi Pesanan</p>
                      <p className="text-sm text-muted-foreground">
                        Peringatan untuk pesanan baru dan perubahan status
                      </p>
                    </div>
                    <Button
                      variant={notificationSettings.orderAlerts ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          orderAlerts: !notificationSettings.orderAlerts,
                        })
                      }
                    >
                      {notificationSettings.orderAlerts ? "Aktif" : "Nonaktif"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Notifikasi Inventori</p>
                      <p className="text-sm text-muted-foreground">
                        Peringatan stok rendah dan kedaluwarsa
                      </p>
                    </div>
                    <Button
                      variant={notificationSettings.inventoryAlerts ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          inventoryAlerts: !notificationSettings.inventoryAlerts,
                        })
                      }
                    >
                      {notificationSettings.inventoryAlerts ? "Aktif" : "Nonaktif"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Pengingat Payroll</p>
                      <p className="text-sm text-muted-foreground">
                        Notifikasi jadwal pembayaran gaji
                      </p>
                    </div>
                    <Button
                      variant={notificationSettings.payrollReminders ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          payrollReminders: !notificationSettings.payrollReminders,
                        })
                      }
                    >
                      {notificationSettings.payrollReminders ? "Aktif" : "Nonaktif"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Update Sistem</p>
                      <p className="text-sm text-muted-foreground">
                        Informasi fitur baru dan pembaruan sistem
                      </p>
                    </div>
                    <Button
                      variant={notificationSettings.systemUpdates ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          systemUpdates: !notificationSettings.systemUpdates,
                        })
                      }
                    >
                      {notificationSettings.systemUpdates ? "Aktif" : "Nonaktif"}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleNotificationUpdate} className="gap-2">
                    <Save className="h-4 w-4" />
                    Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
