"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Settings,
  LogOut,
  Building2,
  ChevronLeft,
  Bell,
  Package,
  Menu,
  Users,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/hooks/use-auth";
import { useSession } from "@/lib/hooks/use-session";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, isLoading: sessionLoading } = useSession();
  const logoutMutation = useLogout();

  useEffect(() => {
    setMounted(true);
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (mounted && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname, mounted]);

  const handleLinkClick = () => {
    if (mounted && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = () => {
    if (!session?.user) return "U";
    const first = session.user.firstName?.[0] || "";
    const last = session.user.lastName?.[0] || "";
    return (first + last).toUpperCase() || session.user.email[0].toUpperCase();
  };

  const getDisplayName = () => {
    if (!session?.user) return "User";
    if (session.user.firstName && session.user.lastName) {
      return `${session.user.firstName} ${session.user.lastName}`;
    }
    return session.user.email;
  };

  const navItems = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/sales",
      label: "Sales",
      icon: Receipt,
      active: pathname.startsWith("/dashboard/sales"),
    },
    {
      href: "/dashboard/purchases",
      label: "Purchases",
      icon: FileText,
      active: pathname.startsWith("/dashboard/purchases"),
    },
    {
      href: "/dashboard/payments",
      label: "Payments",
      icon: Receipt,
      active: pathname.startsWith("/dashboard/payments"),
    },
    {
      href: "/dashboard/products",
      label: "Products",
      icon: Package,
      active: pathname.startsWith("/dashboard/products"),
    },
    {
      href: "/dashboard/customers",
      label: "Customers",
      icon: Users,
      active: pathname.startsWith("/dashboard/customers"),
    },
    {
      href: "/dashboard/vendors",
      label: "Vendors",
      icon: Truck,
      active: pathname.startsWith("/dashboard/vendors"),
    },
  ];

  const bottomNavItems = [
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <div className="h-dvh bg-[#0a0a0a] text-white overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${
          sidebarOpen ? "w-64" : "md:w-20 w-64"
        } border-r border-white/10 bg-[#0a0a0a] transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50`}
      >
        <div
          className={`h-24 px-4 border-b border-white/10 flex items-center gap-2 flex-shrink-0 ${
            sidebarOpen ? "justify-between" : "md:justify-center"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {sidebarOpen ? (
              <div className="h-10 w-10 rounded-lg bg-brand-yellow-500 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-black" />
              </div>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Expand sidebar"
                className="h-10 w-10 rounded-lg bg-brand-yellow-500 hover:bg-brand-yellow-600 flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <Building2 className="h-6 w-6 text-black" />
              </button>
            )}
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                {sessionLoading ? (
                  <>
                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-16 bg-white/10 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <h2 className="text-sm font-bold text-white truncate">
                      {session?.organization.tradeName ||
                        session?.organization.legalName ||
                        "Organization"}
                    </h2>
                    <p className="text-xs text-gray-400 truncate">
                      {session?.organization.code || "Dashboard"}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors flex-shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2 flex-shrink-0">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-sm font-medium">
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </span>
            )}
          </button>
        </div>
      </aside>

      <main
        className={`flex h-dvh min-w-0 flex-col overflow-hidden transition-[padding] duration-300 ${
          sidebarOpen ? "md:pl-64" : "md:pl-20"
        }`}
      >
        <header className="h-24 border-b border-white/10 bg-[#0a0a0a] flex-shrink-0 z-30 flex items-center">
          <div className="px-4 flex items-center justify-between w-full">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="md:hidden text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                {sessionLoading ? (
                  <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse"></div>
                ) : (
                  <>
                    <div className="h-8 w-8 rounded-full bg-brand-yellow-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-black">
                        {getUserInitials()}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-white">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {session?.membership.role || "Member"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
