"use client";

import { type ComponentType, type ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/user", icon: LayoutDashboard },
  { label: "My Profile", href: "/user/profile", icon: User },
  { label: "My Network", href: "/user/network", icon: Users },
  { label: "Mentorship", href: "/user/mentorship", icon: Compass },
  { label: "Jobs", href: "/user/jobs", icon: Briefcase },
  { label: "Events", href: "/user/events", icon: BookOpen },
  { label: "Messages", href: "/user/messages", icon: MessageSquare },
  { label: "Settings", href: "/user/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/user") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function UserLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pageTitle = useMemo(() => {
    const match = navItems.find((item) => isActivePath(pathname, item.href));
    return match?.label || "User";
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
          "fixed left-0 top-0 z-50 h-screen border-r border-border bg-card transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-21" : "w-72",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 text-primary">
                <User className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-sm font-black">User Space</p>
                  <p className="text-[11px] text-text-secondary">Alumni Dashboard</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="hidden rounded-lg border border-border p-1.5 text-text-secondary hover:text-primary lg:inline-flex"
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded-lg border border-border p-1.5 text-text-secondary lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-primary/10 hover:text-primary",
                    isCollapsed ? "justify-center" : "",
                  ].join(" ")}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-3">
            <button
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-secondary hover:bg-primary/10 hover:text-primary",
                isCollapsed ? "justify-center" : "",
              ].join(" ")}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className={isCollapsed ? "lg:pl-21" : "lg:pl-72"}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="inline-flex rounded-lg border border-border p-2 text-text-secondary lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Member Panel</p>
                <h1 className="text-lg font-black">{pageTitle}</h1>
              </div>
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-text-secondary hover:text-primary">
              <Bell className="h-4 w-4" /> Notifications
            </button>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
