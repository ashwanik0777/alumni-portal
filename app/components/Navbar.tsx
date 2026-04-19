"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { GraduationCap, LayoutDashboard, LogIn, LogOut, Menu, Moon, Settings, Sun, User, UserCircle2, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firstName, setFirstName] = useState("Alumni");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // Initialize theme from system preference or local storage
  useEffect(() => {
    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      const authUser = localStorage.getItem("auth_user") === "active";
      const authRole = (localStorage.getItem("auth_role") as "user" | "admin" | null) || "user";
      const storedFirstName = localStorage.getItem("auth_first_name") || "Alumni";

      setIsAuthenticated(authUser);
      setRole(authRole === "admin" ? "admin" : "user");
      setFirstName(storedFirstName);
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    document.cookie = "auth_user=; path=/; max-age=0; samesite=strict";
    document.cookie = "auth_role=; path=/; max-age=0; samesite=strict";
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_first_name");
    setIsAuthenticated(false);
    setIsProfileOpen(false);
    setIsOpen(false);
    router.push("/login");
  };

  const dashboardHref = role === "admin" ? "/admin" : "/user";
  const settingsHref = role === "admin" ? "/admin/settings" : "/user/settings";
  const firstInitial = firstName.trim().charAt(0).toUpperCase() || "A";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Directory", href: "/directory" },
    { name: "Scholarships", href: "/scholarships" },
    { name: "Events", href: "/events" },
    { name: "Jobs", href: "/jobs" },
    { name: "Mentorship", href: "/mentorship" },
  ];

  const isActiveLink = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (pathname?.startsWith("/login") || pathname?.startsWith("/admin") || pathname?.startsWith("/user")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl text-primary tracking-tight">
                Alumni<span className="text-secondary">Portal</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActiveLink(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="h-6 w-px bg-border mx-1"></div>

            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="inline-flex items-center rounded-xl border border-border bg-background p-1.5 text-sm font-semibold text-text-primary hover:border-primary/40 hover:text-primary transition-colors"
                  aria-label="Open profile menu"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
                    {firstInitial}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute -right-2 mt-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-xl z-50">
                    <div className="mb-1 rounded-xl border border-border/80 bg-background px-3 py-2">
                      <p className="text-sm font-bold text-text-primary">{firstName}</p>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-text-secondary">{role} account</p>
                    </div>
                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-primary hover:bg-background hover:text-primary"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href={settingsHref}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-primary hover:bg-background hover:text-primary"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Join Network
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-text-secondary hover:text-primary transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out origin-top ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        } overflow-hidden bg-card border-b border-border`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                isActiveLink(link.href)
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-text-primary hover:text-primary hover:bg-primary/5"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
                  <UserCircle2 className="w-5 h-5 text-primary" />
                  <p className="text-sm font-semibold text-text-primary">{firstName}</p>
                </div>
                <Link
                  href={dashboardHref}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-text-primary font-medium hover:bg-background transition-colors w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href={settingsHref}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-text-primary font-medium hover:bg-background transition-colors w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-text-primary font-medium hover:bg-background transition-colors w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity w-full shadow-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Join Network
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
