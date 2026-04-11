"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  { value: "4,200+", label: "Active members", icon: Users },
  { value: "1,300+", label: "Mentor sessions", icon: BookOpen },
  { value: "89%", label: "Positive outcomes", icon: TrendingUp },
];

type FormMode = "login" | "forgot-request" | "forgot-reset" | "forgot-success";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("login");
  const [formVisible, setFormVisible] = useState(true);
  const [forgotEmail, setForgotEmail] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  const switchMode = (next: FormMode) => {
    setFormVisible(false);
    setTimeout(() => {
      setFormMode(next);
      setSuccess(false);
      setFormVisible(true);
    }, 220);
  };

  const onLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(true);
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
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

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

                      {success && (
                        <div className="flex items-center gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-text-primary">
                          <Check className="h-4 w-4 text-secondary" />
                          Sign-in check passed. Connect this to your auth backend to continue.
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                      >
                        Sign in
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>

                    <div className="mt-7">
                      <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary/80">Or continue with</p>
                      <div className="flex items-center justify-center gap-3">
                        <button type="button" className="h-11 w-11 rounded-full border border-border bg-background text-sm font-bold text-primary hover:border-primary/40 transition-colors">G</button>
                        <button type="button" className="h-11 w-11 rounded-full border border-border bg-background text-sm font-bold text-primary hover:border-primary/40 transition-colors">GH</button>
                        <button type="button" className="h-11 w-11 rounded-full border border-border bg-background text-sm font-bold text-primary hover:border-primary/40 transition-colors">A</button>
                      </div>
                    </div>
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

                <div className="mt-8 rounded-xl border border-border bg-background p-4 text-sm text-text-secondary leading-relaxed">
                  By signing in, you agree to our{" "}
                  <Link href="/terms" className="font-semibold text-primary hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="font-semibold text-primary hover:underline">Privacy Policy</Link>.
                </div>

                <p className="mt-8 text-center text-xs text-text-secondary/80">&copy; {new Date().getFullYear()} Alumni Portal</p>
              </div>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
