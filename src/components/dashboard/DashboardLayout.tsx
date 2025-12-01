"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  ClipboardList,
  Menu,
  X,
  ChefHat,
  ShoppingCart,
  PackageCheck,
  Flame,
  DollarSign,
  TrendingUp,
  ChevronDown,
  UserCog,
  Wallet,
  User,
  Settings,
  LogOut,
  Shield,
  Truck,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getUserRole, getUserEmail, filterNavigationByRole, getRoleInfo, type UserRole } from "@/lib/rbac";

const navGroups = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Menu",
        href: "/dashboard/menu",
        icon: UtensilsCrossed,
      },
      {
        title: "Inventory",
        href: "/dashboard/inventory",
        icon: Package,
      },
      {
        title: "Orders",
        href: "/dashboard/orders",
        icon: ClipboardList,
      },
      {
        title: "Production",
        href: "/dashboard/production",
        icon: Flame,
      },
    ],
  },
  {
    title: "Procurement",
    items: [
      {
        title: "Purchase Orders",
        href: "/dashboard/procurement",
        icon: ShoppingCart,
      },
      {
        title: "Receiving",
        href: "/dashboard/receiving",
        icon: PackageCheck,
      },
    ],
  },
  {
    title: "HR",
    items: [
      {
        title: "Employees",
        href: "/dashboard/hr/employees",
        icon: UserCog,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Arus Kas",
        href: "/dashboard/finance/cashflow",
        icon: ArrowLeftRight,
      },
      {
        title: "Payroll",
        href: "/dashboard/finance/payroll",
        icon: Wallet,
      },
      {
        title: "Payments",
        href: "/dashboard/payments",
        icon: DollarSign,
      },
      {
        title: "Financial Reports",
        href: "/dashboard/financial",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("Admin");
  const [userEmail, setUserEmail] = useState("");
  const [filteredNavGroups, setFilteredNavGroups] = useState(navGroups);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const subMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const role = getUserRole();
    const email = getUserEmail();
    setUserRole(role);
    setUserEmail(email);
    setFilteredNavGroups(filterNavigationByRole(navGroups));
  }, []);

  // Find which group contains the current active path
  useEffect(() => {
    const currentGroup = filteredNavGroups.find((group) =>
      group.items.some((item) => pathname === item.href)
    );
    if (currentGroup) {
      setActiveGroup(currentGroup.title);
    }
  }, [pathname, filteredNavGroups]);

  // Click outside handler to close submenu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (subMenuRef.current && !subMenuRef.current.contains(event.target as Node)) {
        setIsSubMenuOpen(false);
        setActiveGroup(null);
      }
    }

    if (isSubMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isSubMenuOpen]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("bearer_token");
      localStorage.removeItem("user");
      localStorage.removeItem("session");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_role");
      localStorage.removeItem("is_logged_in");
      
      toast.success("Logout berhasil!", {
        description: "Anda telah keluar dari sistem. Sampai jumpa!",
      });
      
      setMobileMenuOpen(false);
      
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Terjadi kesalahan saat logout", {
        description: "Silakan coba lagi.",
      });
    }
  };

  const confirmLogout = () => {
    setShowLogoutDialog(true);
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      Admin: Shield,
      Manager: User,
      Dapur: ChefHat,
      Keuangan: Wallet,
      Supplier: Truck,
    };
    return icons[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      Admin: "bg-red-100 text-red-700 border-red-200",
      Manager: "bg-blue-100 text-blue-700 border-blue-200",
      Dapur: "bg-orange-100 text-orange-700 border-orange-200",
      Keuangan: "bg-green-100 text-green-700 border-green-200",
      Supplier: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[role];
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  const handleTabHover = (groupTitle: string) => {
    setActiveGroup(groupTitle);
    setIsSubMenuOpen(true);
  };

  const handleSubMenuLinkClick = () => {
    // Keep menu open briefly to allow navigation
    setTimeout(() => {
      setIsSubMenuOpen(false);
      setActiveGroup(null);
    }, 100);
  };

  const RoleIcon = getRoleIcon(userRole);

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-foreground">MBG Dapur</span>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </Link>

          {/* Desktop Navigation - Tab Style */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" ref={subMenuRef}>
            {filteredNavGroups.map((group) => {
              const hasActiveItem = group.items.some(item => pathname === item.href);
              const isExpanded = activeGroup === group.title && isSubMenuOpen;
              
              return (
                <button
                  key={group.title}
                  onMouseEnter={() => handleTabHover(group.title)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200",
                    hasActiveItem 
                      ? "bg-primary/10 text-primary border-b-2 border-primary" 
                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                    isExpanded && "bg-accent"
                  )}
                >
                  {group.title}
                </button>
              );
            })}

            {/* Horizontal Sub Menu - Positioned Below Tabs */}
            {activeGroup && isSubMenuOpen && (
              <div 
                className="absolute top-full left-0 right-0 border-t border-border bg-accent/50 shadow-lg"
              >
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2">
                    {filteredNavGroups
                      .find((group) => group.title === activeGroup)
                      ?.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={handleSubMenuLinkClick}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-foreground hover:bg-background hover:shadow-sm"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Right Side: Role Badge & User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            <Badge variant="outline" className={cn("gap-1.5", getRoleColor(userRole))}>
              <RoleIcon className="h-3 w-3" />
              {userRole}
            </Badge>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src="" alt={userRole} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {getInitials(userEmail)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userRole}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                {userRole === "Admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={confirmLogout}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <nav className="px-4 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
              {/* User Profile Section - Mobile */}
              <div className="pb-4 border-b border-border">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
                >
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src="" alt={userRole} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {getInitials(userEmail)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{userRole}</p>
                      <Badge variant="outline" className={cn("text-xs h-5", getRoleColor(userRole))}>
                        <RoleIcon className="h-2.5 w-2.5 mr-1" />
                        {userRole}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </Link>
              </div>

              {filteredNavGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                              : "text-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className={cn("h-5 w-5 shrink-0", isActive && "drop-shadow-sm")} />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Account Section - Mobile */}
              <div>
                <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Account
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      pathname === "/dashboard/profile"
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <User className="h-5 w-5 shrink-0" />
                    <span>Profile</span>
                  </Link>
                  {userRole === "Admin" && (
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        pathname === "/dashboard/settings"
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Settings className="h-5 w-5 shrink-0" />
                      <span>Settings</span>
                    </Link>
                  )}
                  <button
                    onClick={confirmLogout}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
              
              {/* Version in Mobile Menu */}
              <div className="pt-4 border-t border-border">
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 border border-primary/20">
                  <p className="text-xs font-medium text-foreground">System Version</p>
                  <p className="mt-1 text-xs text-muted-foreground">v1.0.0 - Prototype</p>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-8">{children}</main>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <span>Konfirmasi Logout</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Apakah Anda yakin ingin keluar dari sistem? Anda perlu login kembali untuk mengakses dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}