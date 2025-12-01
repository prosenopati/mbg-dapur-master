"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  User, 
  ChefHat, 
  Wallet, 
  Truck, 
  Copy, 
  CheckCircle2,
  ArrowLeft,
  Key,
  Mail,
  Lock
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface DemoCredential {
  role: string;
  username: string;
  email: string;
  password: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  permissions: string[];
}

export default function CredentialsPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const demoCredentials: DemoCredential[] = [
    {
      role: "Admin",
      username: "admin",
      email: "admin@mbgdapur.com",
      password: "admin123",
      description: "Full access ke semua modul sistem",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
      permissions: [
        "Dashboard Overview",
        "Menu Management",
        "Inventory Control",
        "Order Management",
        "Production Planning",
        "Purchase Orders",
        "Receiving",
        "User Management",
        "Employee Management",
        "Payroll Processing",
        "Payment Management",
        "Financial Reports",
        "Settings"
      ]
    },
    {
      role: "Manager",
      username: "manager",
      email: "manager@mbgdapur.com",
      password: "manager123",
      description: "Semua fitur dashboard kecuali Pengaturan",
      icon: User,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      permissions: [
        "Dashboard Overview",
        "Menu Management",
        "Inventory Control",
        "Order Management",
        "Production Planning",
        "Approve Purchase Orders",
        "Receiving",
        "Employee Management",
        "Payroll Processing",
        "Payment Management",
        "Financial Reports"
      ]
    },
    {
      role: "Dapur",
      username: "dapur",
      email: "dapur@mbgdapur.com",
      password: "dapur123",
      description: "Akses Menu Plan, Orders, PO, Receiving, Production",
      icon: ChefHat,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      permissions: [
        "Menu Planning",
        "View Orders",
        "Update Order Status",
        "View Purchase Orders",
        "Receiving Management",
        "Production Planning"
      ]
    },
    {
      role: "Keuangan",
      username: "keuangan",
      email: "keuangan@mbgdapur.com",
      password: "keuangan123",
      description: "Akses Financial Reports, Payments, Payroll",
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-50",
      permissions: [
        "Financial Reports",
        "Process Payments",
        "Payroll Processing",
        "View Invoices",
        "Payment History"
      ]
    },
    {
      role: "Supplier",
      username: "supplier",
      email: "supplier@mbgdapur.com",
      password: "supplier123",
      description: "Terima notif PO, konfirmasi order, invoice",
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      permissions: [
        "View Purchase Orders",
        "Accept/Reject PO",
        "Update Delivery Status",
        "View Invoices",
        "View Payment History"
      ]
    }
  ];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} disalin ke clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/dashboard/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Pengaturan
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Demo Credentials</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kredensial demo untuk testing berbagai role di sistem
          </p>
        </div>

        {/* Info Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Mode Prototype - Test Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              Gunakan kredensial di bawah untuk login dengan role yang berbeda dan test fitur sesuai permission.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Catatan:</strong> Dalam mode prototype, semua kredensial berfungsi untuk demo purposes. 
              Data disimpan di localStorage browser.
            </p>
          </CardContent>
        </Card>

        {/* Credentials Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {demoCredentials.map((cred) => {
            const Icon = cred.icon;
            return (
              <Card key={cred.role} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${cred.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${cred.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{cred.role}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {cred.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Credentials */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="font-medium">Username</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded border">
                        <code className="text-sm font-mono">{cred.username}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard(cred.username, `${cred.role}-username`)}
                        >
                          {copiedField === `${cred.role}-username` ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="font-medium">Email</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded border">
                        <code className="text-sm font-mono">{cred.email}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard(cred.email, `${cred.role}-email`)}
                        >
                          {copiedField === `${cred.role}-email` ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        <span className="font-medium">Password</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded border">
                        <code className="text-sm font-mono">{cred.password}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard(cred.password, `${cred.role}-password`)}
                        >
                          {copiedField === `${cred.role}-password` ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Akses & Permission:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cred.permissions.slice(0, 3).map((permission, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {cred.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{cred.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Quick Login Button */}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      localStorage.setItem('demo_login_email', cred.email);
                      localStorage.setItem('demo_login_password', cred.password);
                      toast.success(`Kredensial ${cred.role} siap digunakan!`, {
                        description: "Kembali ke halaman login untuk masuk"
                      });
                    }}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Set untuk Quick Login
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Workflow Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workflow Purchase Order ke Invoice</CardTitle>
            <CardDescription>
              Alur kerja otomatis dari pembuatan PO hingga invoice untuk payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <Badge variant="outline">Manager</Badge>
                </div>
                <p className="text-sm text-muted-foreground pl-10">
                  Buat dan approve Purchase Order
                </p>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-2xl text-muted-foreground">→</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <Badge variant="outline">Supplier</Badge>
                </div>
                <p className="text-sm text-muted-foreground pl-10">
                  Terima notif PO dan konfirmasi persetujuan
                </p>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-2xl text-muted-foreground">→</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <Badge variant="outline">Keuangan</Badge>
                </div>
                <p className="text-sm text-muted-foreground pl-10">
                  Invoice otomatis dibuat, proses payment
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium">Fitur Otomatis:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Notifikasi real-time ke Supplier saat PO dibuat oleh Manager</li>
                <li>Invoice otomatis ter-generate saat Supplier menyetujui PO</li>
                <li>Keuangan menerima invoice untuk di-review dan proses pembayaran</li>
                <li>Update status otomatis di semua modul terkait</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}