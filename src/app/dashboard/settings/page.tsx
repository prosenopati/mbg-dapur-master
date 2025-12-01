"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, Key, Bell, Palette, Database } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const settingsCategories = [
    {
      title: "User Management",
      description: "Kelola pengguna dan akses sistem",
      icon: Users,
      href: "/dashboard/settings/users",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Role Management",
      description: "Kelola role dan permission",
      icon: Shield,
      href: "/dashboard/settings/roles",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Demo Credentials",
      description: "Lihat kredensial demo untuk berbagai role",
      icon: Key,
      href: "/dashboard/settings/credentials",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Notifications",
      description: "Pengaturan notifikasi sistem",
      icon: Bell,
      href: "/dashboard/settings/notifications",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      disabled: true,
    },
    {
      title: "Appearance",
      description: "Tema dan tampilan aplikasi",
      icon: Palette,
      href: "/dashboard/settings/appearance",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      disabled: true,
    },
    {
      title: "System",
      description: "Pengaturan sistem dan database",
      icon: Database,
      href: "/dashboard/settings/system",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      disabled: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola konfigurasi dan pengaturan sistem MBG Dapur
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settingsCategories.map((category) => {
            const Icon = category.icon;
            
            if (category.disabled) {
              return (
                <Card key={category.title} className="opacity-60">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-2`}>
                      <Icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" disabled className="w-full">
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Link key={category.title} href={category.href}>
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-2`}>
                      <Icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Buka Pengaturan
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Mode Prototype
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Saat ini aplikasi berjalan dalam mode prototype menggunakan localStorage.
              Semua pengaturan disimpan secara lokal di browser Anda.
            </p>
            <p className="text-xs">
              <strong>Catatan:</strong> Data akan hilang jika Anda clear browser cache atau menggunakan mode incognito.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
