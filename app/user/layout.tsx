"use client";

import { type ComponentType, type ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Compass,
  GraduationCapIcon,
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
          "fixed inset-y-3 left-3 z-50 rounded-4xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-24" : "w-80",
        ].join(" ")}
      >
        <div aria-hidden className="pointer-events-none absolute -right-10 top-5 h-24 w-24 rounded-full border border-secondary/30 bg-secondary/10 blur-xl" />
        <div aria-hidden className="pointer-events-none absolute -right-8 bottom-6 h-20 w-20 rounded-full border border-primary/20 bg-primary/10 blur-lg" />
        
       

        <div className="flex h-full flex-col">
          <div className={[
            "flex items-center border-b border-border/70 px-4 py-4",
            isCollapsed ? "justify-center" : "justify-between",
          ].join(" ")}>
            {!isCollapsed && (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-secondary/30 text-primary shadow-sm">
                  <GraduationCapIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight">User Space</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">Alumni Dashboard</p>
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-secondary/30 bg-secondary/20 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-text-primary">Aman Sharma</p>
                    <p className="truncate text-xs text-text-secondary">aman.alumni@jnvportal.in</p>
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

      <div className={isCollapsed ? "lg:pl-28" : "lg:pl-84"}>
       

        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
