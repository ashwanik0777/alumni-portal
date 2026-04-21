"use client";

import { type ComponentType, type ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Programs", href: "/admin/programs", icon: BookOpen },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Scholarships", href: "/admin/scholarships", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin/overview") {
    return pathname === "/admin" || pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setIsMobileOpen(false);
      return;
    }
    setIsCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    document.cookie = "auth_user=; path=/; max-age=0; samesite=strict";
    document.cookie = "auth_role=; path=/; max-age=0; samesite=strict";
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  const pageTitle = useMemo(() => {
    const match = navItems.find((item) => isActivePath(pathname, item.href));
    return match?.label || "Admin";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {isMobileOpen && (
        <button
          aria-label="Close menu overlay"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-0 left-0 z-50 w-screen max-w-none rounded-none border-0 bg-card shadow-2xl transition-transform duration-300 lg:inset-y-3 lg:left-8 lg:right-auto lg:w-auto lg:rounded-3xl lg:border lg:border-border/80 lg:bg-card/95 lg:backdrop-blur lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-24" : "lg:w-80",
        ].join(" ")}
      >
        <div aria-hidden className="pointer-events-none absolute -right-10 top-5 h-24 w-24 rounded-full border border-primary/20 bg-primary/10 blur-xl" />
        <div aria-hidden className="pointer-events-none absolute -right-8 bottom-6 h-20 w-20 rounded-full border border-secondary/20 bg-secondary/10 blur-lg" />
        

        <div className="flex h-full flex-col">
          <div className={[
            "flex items-center border-b border-border/70 px-4 py-4",
            isCollapsed ? "justify-center" : "justify-between",
          ].join(" ")}>
            {!isCollapsed && (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight">Admin Dashboard</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">Alumni Operations</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleSidebarToggle}
                className="hidden rounded-xl border border-border bg-background p-1.5 text-text-secondary hover:border-primary/40 hover:text-primary lg:inline-flex"
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded-xl border border-border bg-background p-1.5 text-text-secondary lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={[
                    "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                    active
                      ? "border border-primary/20 bg-primary text-white shadow-lg shadow-primary/20"
                      : "border border-transparent text-text-secondary hover:border-primary/15 hover:bg-primary/10 hover:text-primary",
                    isCollapsed ? "justify-center" : "",
                  ].join(" ")}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                  {active && !isCollapsed && <span className="ml-auto h-2 w-2 rounded-full bg-white" />}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border/70 p-3">
            <div
              className={[
                "flex items-center rounded-2xl border border-border/70 bg-background/70 p-2",
                isCollapsed ? "justify-center" : "gap-3",
              ].join(" ")}
            >
              {!isCollapsed && (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-text-primary">Super Admin</p>
                    <p className="truncate text-xs text-text-secondary">admin@jnvportal.in</p>
                  </div>
                </>
              )}

              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-text-secondary hover:border-primary/20 hover:bg-primary/10 hover:text-primary"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className={isCollapsed ? "lg:pl-26" : "lg:pl-82"}>
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Admin Panel</p>
              <h1 className="text-base font-black">{pageTitle}</h1>
            </div>

            <button
              onClick={() => setIsMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-text-secondary hover:text-primary"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
