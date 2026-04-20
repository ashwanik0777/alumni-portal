"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  ChevronLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  House,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  { value: "4,200+", label: "Active members", icon: Users },
  { value: "1,300+", label: "Mentor sessions", icon: BookOpen },
  { value: "89%", label: "Positive outcomes", icon: TrendingUp },
];

type FormMode = "login" | "forgot-request" | "forgot-reset" | "forgot-success" | "set-password";

const FIRST_LOGIN_USERS_KEY = "pending_first_login_users_v1";

type PendingFirstLoginUser = {
  email: string;
  role: "user";
  firstName: string;
  tempPassword: string;
  currentPassword: string;
  mustSetPassword: boolean;
  createdAt: string;
};

const DEMO_CREDENTIALS = {
  admin: {
    email: "admin@jnvportal.in",
    password: "Admin@123",
    firstName: "Admin",
  },
  user: {
    email: "alumni@jnvportal.in",
    password: "User@123",
    firstName: "Alumni",
  },
  both: {
    email: "access@jnvportal.in",
    password: "admin123",
    firstName: "Alumni",
  },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("login");
  const [formVisible, setFormVisible] = useState(true);
  const [forgotEmail, setForgotEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [multiAccess, setMultiAccess] = useState(false);
  const [pendingFirstName, setPendingFirstName] = useState("");
  const [firstLoginEmail, setFirstLoginEmail] = useState("");
  const [firstLoginFirstName, setFirstLoginFirstName] = useState("Alumni");

  const resolveFirstNameFromEmail = (email: string) => {
    const localPart = email.trim().split("@")[0] || "Alumni";
    const cleanName = localPart.replace(/[._+\-\d]/g, " ").trim();
    const firstChunk = cleanName.split(/\s+/).filter(Boolean)[0] || "Alumni";
    return firstChunk.charAt(0).toUpperCase() + firstChunk.slice(1).toLowerCase();
  };

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  const switchMode = (next: FormMode) => {
    setFormVisible(false);
    setTimeout(() => {
      setFormMode(next);
      setSuccess(false);
      setLoginMessage("");
      setMultiAccess(false);
      if (next !== "set-password") {
        setFirstLoginEmail("");
      }
      setFormVisible(true);
    }, 220);
  };

  const getPendingUsers = () => {
    const raw = localStorage.getItem(FIRST_LOGIN_USERS_KEY);
    if (!raw) return [] as PendingFirstLoginUser[];
    try {
      return JSON.parse(raw) as PendingFirstLoginUser[];
    } catch {
      return [] as PendingFirstLoginUser[];
    }
  };

  const savePendingUsers = (users: PendingFirstLoginUser[]) => {
    localStorage.setItem(FIRST_LOGIN_USERS_KEY, JSON.stringify(users));
  };

  const resolveAccessFromEmail = (email: string): "user" | "admin" | "both" => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail.includes("+both") || normalizedEmail.startsWith("multi.")) {
      return "both";
    }

    if (normalizedEmail.includes("+admin") || normalizedEmail.startsWith("admin.")) {
      return "admin";
    }

    return "user";
  };

  const continueLogin = (targetRole: "user" | "admin", firstName = "Alumni") => {
    const cookieAge = 60 * 60 * 8;
    document.cookie = `auth_user=active; path=/; max-age=${cookieAge}; samesite=strict`;
    document.cookie = `auth_role=${targetRole}; path=/; max-age=${cookieAge}; samesite=strict`;
    localStorage.setItem("auth_user", "active");
    localStorage.setItem("auth_role", targetRole);
    localStorage.setItem("auth_first_name", firstName);
    setSuccess(true);
    setLoginMessage(`Signed in successfully. Redirecting to ${targetRole === "admin" ? "Admin" : "User"} dashboard.`);
    const nextPath = searchParams.get("next");
    const safeNextPath = nextPath && nextPath.startsWith("/") ? nextPath : null;
    setTimeout(() => {
      router.push(safeNextPath || (targetRole === "admin" ? "/admin" : "/user"));
    }, 350);
  };

  const onLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const normalizedEmail = email.trim().toLowerCase();
    const detectedAccess = resolveAccessFromEmail(email);
    const firstName = resolveFirstNameFromEmail(email);
    setPendingFirstName(firstName);

    setSuccess(false);

    const pendingUsers = getPendingUsers();
    const pendingAccount = pendingUsers.find((item) => item.email === normalizedEmail);
    if (pendingAccount) {
      if (password !== pendingAccount.currentPassword) {
        setMultiAccess(false);
        setLoginMessage("Invalid password. Please use the temporary password sent on approval email.");
        return;
      }

      if (pendingAccount.mustSetPassword) {
        setMultiAccess(false);
        setFirstLoginEmail(pendingAccount.email);
        setFirstLoginFirstName(pendingAccount.firstName || "Alumni");
        setLoginMessage("First login detected. Please set your new password.");
        switchMode("set-password");
        return;
      }

      setMultiAccess(false);
      continueLogin("user", pendingAccount.firstName || "Alumni");
      return;
    }

    if (normalizedEmail === DEMO_CREDENTIALS.admin.email) {
      if (password !== DEMO_CREDENTIALS.admin.password) {
        setMultiAccess(false);
        setLoginMessage("Invalid admin password. Please use the provided admin credentials.");
        return;
      }
      setMultiAccess(false);
      continueLogin("admin", DEMO_CREDENTIALS.admin.firstName);
      return;
    }

    if (normalizedEmail === DEMO_CREDENTIALS.user.email) {
      if (password !== DEMO_CREDENTIALS.user.password) {
        setMultiAccess(false);
        setLoginMessage("Invalid user password. Please use the provided user credentials.");
        return;
      }
      setMultiAccess(false);
      continueLogin("user", DEMO_CREDENTIALS.user.firstName);
      return;
    }

    if (normalizedEmail === DEMO_CREDENTIALS.both.email) {
      if (password !== DEMO_CREDENTIALS.both.password) {
        setMultiAccess(false);
        setLoginMessage("Invalid password for account chooser demo.");
        return;
      }
      setMultiAccess(true);
      setLoginMessage("Your credentials are valid for both accounts. Please choose which account you want to open.");
      return;
    }

    if (normalizedEmail.endsWith("@jnvportal.in") || detectedAccess === "admin") {
      setMultiAccess(false);
      setLoginMessage("Unknown credentials. Please use one of the demo accounts shown below.");
      return;
    }

    if (detectedAccess === "both") {
      setMultiAccess(true);
      setLoginMessage("Your credentials are valid for both accounts. Please choose which account you want to open.");
      return;
    }

    setMultiAccess(false);
    continueLogin(detectedAccess, firstName);
  };

  const onForgotRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("forgotEmail") || "");
    setForgotEmail(email);
    switchMode("forgot-reset");
  };

  const onForgotReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    switchMode("forgot-success");
  };

  const onSetPasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (newPassword.length < 8) {
      setLoginMessage("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLoginMessage("Password and confirm password do not match.");
      return;
    }

    const pendingUsers = getPendingUsers();
    const updated = pendingUsers.map((item) =>
      item.email === firstLoginEmail
        ? {
            ...item,
            currentPassword: newPassword,
            mustSetPassword: false,
          }
        : item,
    );
    savePendingUsers(updated);

    setLoginMessage("Password set successfully. Redirecting to user dashboard.");
    continueLogin("user", firstLoginFirstName || "Alumni");
  };

  return (
    <div
      className="bg-background text-text-primary min-h-screen"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateX(0)" : "translateX(-24px)",
        transition: "opacity 0.45s ease, transform 0.45s ease",
      }}
    >
      <section className="relative overflow-hidden min-h-screen">
        <div className="grid min-h-screen lg:grid-cols-12">
          <aside
            className="relative lg:col-span-6 p-7 sm:p-9 lg:p-12 text-white overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 60% at 10% 10%, rgba(255,255,255,0.12), transparent 65%), radial-gradient(ellipse 70% 60% at 90% 90%, rgba(201,162,39,0.22), transparent 70%)",
              backgroundColor: "var(--color-primary)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full border border-white/20 bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full border border-secondary/30 bg-secondary/20 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 bottom-10 h-64 w-64 rounded-full border border-white/10 bg-white/5 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <svg
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-36 w-full opacity-80 lg:hidden"
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,20 C60,95 130,10 200,56 C260,96 330,54 400,22 L400,120 L0,120 Z"
                fill="rgba(255,255,255,0.18)"
              />
              <path
                d="M0,48 C70,105 140,42 200,74 C265,105 330,66 400,44 L400,120 L0,120 Z"
                fill="rgba(201,162,39,0.24)"
              />
            </svg>

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-2.5 shadow-sm">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-bold">Alumni Portal</p>
                  <p className="text-[11px] text-white/70 uppercase tracking-[0.18em]">Unified Community Access</p>
                </div>
              </div>

              <h1 className="mt-10 text-4xl sm:text-5xl font-black leading-[1.08]">
                Sign in once.
                <span className="block text-secondary">Access everything.</span>
              </h1>

              <p className="mt-5 text-white/85 max-w-xl leading-relaxed">
                Connect with alumni, discover opportunities, join events, and manage mentorship from one secure account.
              </p>

              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                AI-inspired and role-aware access experience
              </p>

              <div className="mt-8 grid sm:grid-cols-3 gap-3 max-w-2xl">
                {stats.map(({ value, label, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-white/20 bg-white/5 p-3">
                    <div className="inline-flex items-center justify-center rounded-lg bg-white/10 p-2 mb-2">
                      <Icon className="h-4 w-4 text-secondary" />
                    </div>
                    <p className="text-lg font-black">{value}</p>
                    <p className="text-[11px] text-white/75">{label}</p>
                  </div>
                ))}
              </div>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2 max-w-2xl">
                <li className="list-none rounded-2xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="flex items-center gap-2 text-xs font-semibold">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    Secure Unified Identity
                  </p>
                  <p className="mt-1 text-[11px] text-white/75">One account for events, jobs, mentorship, and alumni directory.</p>
                </li>
                <li className="list-none rounded-2xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="flex items-center gap-2 text-xs font-semibold">
                    <Briefcase className="h-4 w-4 text-secondary" />
                    Career and Network Access
                  </p>
                  <p className="mt-1 text-[11px] text-white/75">Discover referrals, openings, and verified opportunities faster.</p>
                </li>
              </ul>

              <div className="mt-6 rounded-2xl border border-white/20 bg-white/5 p-3.5 max-w-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">Upcoming</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="h-4 w-4 text-secondary" />
                  Alumni Leadership Meet - 23 April
                </p>
              </div>
            </div>
          </aside>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 z-20 hidden lg:block"
            style={{ left: "calc(50% - 40px)", width: "80px" }}
          >
            <svg className="h-full w-full" viewBox="0 0 80 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 0 0 L 40 0 C 78 82, 80 162, 60 242 C 40 322, 0 402, 20 482 C 40 562, 80 642, 60 722 C 40 802, 0 882, 40 900 L 0 900 Z"
                fill="currentColor"
                className="text-primary"
              />
              <path
                d="M 80 0 L 40 0 C 78 82, 80 162, 60 242 C 40 322, 0 402, 20 482 C 40 562, 80 642, 60 722 C 40 802, 0 882, 40 900 L 80 900 Z"
                fill="currentColor"
                className="text-card"
              />
            </svg>
          </div>

          <main className="lg:col-span-6 flex items-center justify-center px-6 py-10 sm:px-10 bg-card">
            <div className="w-full max-w-md">
              <div className="mb-5 flex items-center justify-end">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-text-primary hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <House className="h-3.5 w-3.5" />
                  Go to Home
                </Link>
              </div>

              <div
                style={{
                  opacity: formVisible ? 1 : 0,
                  transform: formVisible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.22s ease, transform 0.22s ease",
                }}
              >
                {formMode === "login" && (
                  <>
                    <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-primary">Welcome Back</p>
                    <h2 className="mt-1 text-3xl sm:text-4xl font-black">Sign in</h2>
                    <p className="mt-2 text-sm text-text-secondary">Enter your credentials to access your dashboard.</p>


                    <form onSubmit={onLoginSubmit} className="mt-7 space-y-4">
                      <label className="block">
                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Email Address</span>
                        <div className="relative">
                          <Mail className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>
                      </label>

                      <label className="block">
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Password</span>
                          <button
                            type="button"
                            onClick={() => switchMode("forgot-request")}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <LockKeyhole className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="w-full rounded-xl border border-border bg-background pl-10 pr-12 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-secondary hover:text-primary transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </label>


                      {!!loginMessage && (
                        <div className="flex items-center gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-text-primary">
                          <Check className="h-4 w-4 text-secondary" />
                          {loginMessage}
                        </div>
                      )}

                      {multiAccess && (
                        <div className="rounded-xl border border-border bg-background p-3">
                          <p className="text-xs font-semibold text-text-secondary">Choose Account</p>
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => continueLogin("user", pendingFirstName || "Alumni")}
                              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                            >
                              Continue as User
                            </button>
                            <button
                              type="button"
                              onClick={() => continueLogin("admin", pendingFirstName || "Alumni")}
                              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                            >
                              Continue as Admin
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={success}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                      >
                        Sign in
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>

                   

                  </>
                )}

                {formMode === "forgot-request" && (
                  <>
                    <button type="button" onClick={() => switchMode("login")} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary">
                      <ChevronLeft className="h-4 w-4" /> Back to sign in
                    </button>

                    <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-primary">Password Recovery</p>
                    <h2 className="mt-1 text-3xl sm:text-4xl font-black">Forgot password?</h2>
                    <p className="mt-2 text-sm text-text-secondary">Enter your registered email to receive a reset code.</p>

                    <form onSubmit={onForgotRequest} className="mt-7 space-y-4">
                      <label className="block">
                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Email Address</span>
                        <div className="relative">
                          <Mail className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            name="forgotEmail"
                            type="email"
                            placeholder="you@example.com"
                            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </div>
                      </label>

                      <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                        Send Reset Code
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                )}

                {formMode === "forgot-reset" && (
                  <>
                    <button type="button" onClick={() => switchMode("forgot-request")} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary">
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>

                    <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-primary">Verification</p>
                    <h2 className="mt-1 text-3xl sm:text-4xl font-black">Enter reset code</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      We sent a code to <span className="font-semibold text-text-primary">{forgotEmail || "your email"}</span>. Set your new password below.
                    </p>

                    <form onSubmit={onForgotReset} className="mt-7 space-y-4">
                      <label className="block">
                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Reset Code</span>
                        <input
                          type="text"
                          placeholder="Enter 6-digit code"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">New Password</span>
                        <input
                          type="password"
                          placeholder="Minimum 8 characters"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </label>

                      <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                        Reset Password
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                )}

                {formMode === "forgot-success" && (
                  <div className="text-center py-8">
                    <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/20 border border-secondary/40">
                      <CheckCircle2 className="h-8 w-8 text-secondary" />
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-primary">Done</p>
                    <h2 className="mt-1 text-3xl sm:text-4xl font-black">Password Updated</h2>
                    <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
                      Your password has been reset successfully. Continue by signing in with your new credentials.
                    </p>
                    <button type="button" onClick={() => switchMode("login")} className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
                      Back To Sign In
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {formMode === "set-password" && (
                  <>
                    <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-primary">First Login Security</p>
                    <h2 className="mt-1 text-3xl sm:text-4xl font-black">Set Your Password</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      You are signing in for the first time with temporary credentials.
                      Please set a new password for <span className="font-semibold text-text-primary">{firstLoginEmail || "your account"}</span>.
                    </p>

                    <form onSubmit={onSetPasswordSubmit} className="mt-7 space-y-4">
                      <label className="block">
                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">New Password</span>
                        <input
                          name="newPassword"
                          type="password"
                          placeholder="Minimum 8 characters"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Confirm New Password</span>
                        <input
                          name="confirmPassword"
                          type="password"
                          placeholder="Re-enter new password"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </label>

                      {!!loginMessage && (
                        <div className="flex items-center gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-text-primary">
                          <Check className="h-4 w-4 text-secondary" />
                          {loginMessage}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                      >
                        Save Password And Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                )}

                <div className="mt-8 rounded-2xl border border-border bg-background/80 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">Secure and compliant sign-in</p>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                        By continuing, you accept our legal terms and data handling practices.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Link
                      href="/terms"
                      className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      Terms of Service
                    </Link>
                    <Link
                      href="/privacy"
                      className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </div>

                <p className="mt-6 text-center text-xs text-text-secondary/80">&copy; {new Date().getFullYear()} Alumni Portal</p>
              </div>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
