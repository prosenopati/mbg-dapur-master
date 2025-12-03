"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChefHat,
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  ClipboardList,
  TrendingUp,
  Shield,
  Zap,
  User,
  Lock,
  Wallet,
  Truck,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const demoCredentials = [
    {
      role: "Admin",
      email: "admin@mbgdapur.com",
      password: "admin123",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      dashboard: "/dashboard"
    },
    {
      role: "Manager",
      email: "manager@mbgdapur.com",
      password: "manager123",
      icon: User,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      dashboard: "/dashboard"
    },
    {
      role: "Dapur",
      email: "dapur@mbgdapur.com",
      password: "dapur123",
      icon: ChefHat,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      dashboard: "/dashboard"
    },
    {
      role: "Keuangan",
      email: "keuangan@mbgdapur.com",
      password: "keuangan123",
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      dashboard: "/dashboard"
    },
    {
      role: "Supplier",
      email: "supplier@mbgdapur.com",
      password: "supplier123",
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      dashboard: "/dashboard"
    },
    {
      role: "Pengawas",
      email: "pengawas@mbgdapur.com",
      password: "pengawas123",
      icon: Eye,
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950",
      dashboard: "/dashboard/supervisor"
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find matching credential
    const matchedCred = demoCredentials.find(cred => cred.email === email);
    const role = matchedCred ? matchedCred.role : "Admin";
    
    // Store user session
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_role", role);
    localStorage.setItem("is_logged_in", "true");
    
    toast.success(`Login berhasil sebagai ${role}!`, {
      description: "Selamat datang di MBG Dapur"
    });
    
    router.push(matchedCred?.dashboard || "/dashboard");
  };

  const handleQuickLogin = (credential: typeof demoCredentials[0]) => {
    // Store user session
    localStorage.setItem("user_email", credential.email);
    localStorage.setItem("user_role", credential.role);
    localStorage.setItem("is_logged_in", "true");
    
    toast.success(`Login berhasil sebagai ${credential.role}!`, {
      description: "Selamat datang di MBG Dapur"
    });
    
    router.push(credential.dashboard);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MBG Dapur</span>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start mb-16 md:mb-24">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
              🚀 Prototype Version 1.0
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Manajemen Dapur <span className="text-primary">Modern & Efisien</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Platform lengkap untuk mengelola menu, inventori, dan pesanan dapur Anda. 
              Dari prototipe localStorage hingga siap produksi dengan database.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Explore Dashboard
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>

          {/* Enhanced Login Card with Demo Credentials */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Pilih demo credential atau login manual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@mbgdapur.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-9"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs md:text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 text-sm md:text-base">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Quick Demo Login
                    </span>
                  </div>
                </div>

                {/* Demo Credential Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {demoCredentials.map((cred) => {
                    const Icon = cred.icon;
                    return (
                      <Button
                        key={cred.role}
                        type="button"
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-center gap-2 hover:border-primary/50"
                        onClick={() => handleQuickLogin(cred)}
                      >
                        <div className={`w-10 h-10 rounded-lg ${cred.bgColor} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${cred.color}`} />
                        </div>
                        <span className="text-xs font-medium">{cred.role}</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-2">
                  <p className="font-medium text-foreground">💡 Demo Credentials:</p>
                  <div className="space-y-1 text-muted-foreground">
                    {demoCredentials.map(cred => (
                      <p key={cred.role}>
                        <span className="font-medium text-foreground">{cred.role}:</span> {cred.email} / {cred.password}
                      </p>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-2 pt-2 border-t">
                    <em>Klik tombol role untuk login langsung</em>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div id="features" className="space-y-8 md:space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">Fitur Lengkap untuk Dapur Anda</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Sistem manajemen terintegrasi yang memudahkan operasional dapur dari A hingga Z
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <UtensilsCrossed className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base md:text-lg">Menu Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Kelola menu dengan mudah. Tambah, edit, dan atur ketersediaan item dengan real-time updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Package className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base md:text-lg">Inventory Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Monitor stok bahan baku. Notifikasi otomatis untuk barang yang perlu di-restock.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ClipboardList className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base md:text-lg">Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Kelola pesanan dengan workflow status: Pending → Preparing → Ready → Delivered.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base md:text-lg">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Lihat metrik penting: revenue harian, pesanan aktif, dan status inventori.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="mt-16 md:mt-24 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">Prototype → Production Ready</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Dibangun dengan arsitektur yang mudah di-migrate dari localStorage ke database produksi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <Card className="border-2">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <CardTitle className="text-base md:text-lg">Prototype Phase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs md:text-sm text-muted-foreground">
                  ✓ LocalStorage service layer<br />
                  ✓ TypeScript interfaces<br />
                  ✓ Sample data seeding<br />
                  ✓ Full CRUD operations
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base md:text-lg">Migration Ready</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs md:text-sm text-muted-foreground">
                  ✓ Abstracted data layer<br />
                  ✓ Prisma-compatible types<br />
                  ✓ Easy API integration<br />
                  ✓ Minimal refactoring
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <ChefHat className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-base md:text-lg">Production Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs md:text-sm text-muted-foreground">
                  ✓ PostgreSQL/MySQL<br />
                  ✓ Authentication system<br />
                  ✓ API endpoints<br />
                  ✓ Multi-user support
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 md:mt-24 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Siap untuk Mulai?</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Explore dashboard prototype dan lihat bagaimana MBG Dapur dapat mengoptimalkan operasional dapur Anda.
          </p>
          <Link href="/dashboard">
            <Button size="lg">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Open Dashboard
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 md:mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>© 2024 MBG Dapur Management System. Prototype Version.</p>
          <p className="mt-2">Built with Next.js 15, TypeScript, Tailwind CSS & Shadcn/UI</p>
        </div>
      </footer>
    </div>
  );
}