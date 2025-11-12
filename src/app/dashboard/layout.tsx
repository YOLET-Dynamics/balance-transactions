"use client";

import { useState } from "react";
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
  ChevronRight,
  Search,
  Bell,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/lib/hooks/use-auth";
import { useSession } from "@/lib/hooks/use-session";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: session, isLoading: sessionLoading } = useSession();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user) return "U";
    const first = session.user.firstName?.[0] || "";
    const last = session.user.lastName?.[0] || "";
    return (first + last).toUpperCase() || session.user.email[0].toUpperCase();
  };

  // Get display name
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
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } border-r border-white/10 bg-black transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-yellow-500 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-black" />
            </div>
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
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? "bg-brand-yellow-500 text-black"
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

        <div className="p-4 border-t border-white/10">
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-[73px] border-b border-white/10 bg-black sticky top-0 z-10 flex items-center">
          <div className="px-4 flex items-center justify-between w-full">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                {sidebarOpen ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-brand-yellow-500 rounded-full"></span>
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

        {/* Page Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
