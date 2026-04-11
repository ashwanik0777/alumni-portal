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
      <section className="relative overflow-hidden py-8 sm:py-10 lg:py-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-10 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative grid lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-6 rounded-4xl border border-primary/20 bg-primary p-7 sm:p-9 lg:p-10 text-white relative overflow-hidden">
              <div className="absolute -top-16 -right-14 h-52 w-52 rounded-full border border-white/20" />
              <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10" />

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/15 p-2.5">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">Alumni Portal</p>
                    <p className="text-[11px] text-white/70 uppercase tracking-wide">Unified Community Access</p>
                  </div>
                </div>

                <h1 className="mt-10 text-4xl sm:text-5xl font-black leading-[1.08]">
                  Sign in once.
                  <span className="block text-secondary">Access everything.</span>
                </h1>

                <p className="mt-5 text-white/85 max-w-xl leading-relaxed">
                  Connect with alumni, discover opportunities, join events, and manage mentorship from one secure account.
                </p>

                <div className="mt-8 grid sm:grid-cols-3 gap-3">
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

                <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium, secure, and role-aware login experience
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 rounded-4xl border border-border bg-card p-7 sm:p-9 shadow-sm">
              <div
                style={{
                  opacity: formVisible ? 1 : 0,
                  transform: formVisible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.22s ease, transform 0.22s ease",
                }}
              >
                {formMode === "login" && (
                  <>
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-primary">Welcome Back</p>
                    <h2 className="mt-1 text-3xl sm:text-4xl font-black">Sign In</h2>
                    <p className="mt-2 text-sm text-text-secondary">Enter your account credentials to continue.</p>

                    <form onSubmit={onLoginSubmit} className="mt-7 space-y-4">
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Email Address</span>
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
                          <span className="text-sm font-medium">Password</span>
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
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>

                    <div className="mt-6 grid sm:grid-cols-2 gap-3">
                      <Link
                        href="/register"
                        className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-text-primary hover:border-primary/30 transition-colors"
                      >
                        Create New Account
                      </Link>
                      <Link
                        href="/directory"
                        className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-text-primary hover:border-primary/30 transition-colors"
                      >
                        Explore Directory
                      </Link>
                    </div>
                  </>
                )}

                {formMode === "forgot-request" && (
                  <>
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back to sign in
                    </button>

                    <p className="text-[11px] uppercase tracking-wide font-semibold text-primary">Password Recovery</p>
                    <h2 className="mt-1 text-3xl sm:text-4xl font-black">Reset access</h2>
                    <p className="mt-2 text-sm text-text-secondary">Enter your registered email to receive a reset code.</p>

                    <form onSubmit={onForgotRequest} className="mt-7 space-y-4">
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Email Address</span>
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

                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                      >
                        Send Reset Code
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                )}

                {formMode === "forgot-reset" && (
                  <>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot-request")}
                      className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>

                    <p className="text-[11px] uppercase tracking-wide font-semibold text-primary">Verification</p>
                    <h2 className="mt-1 text-3xl sm:text-4xl font-black">Enter reset code</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      We sent a code to <span className="font-semibold text-text-primary">{forgotEmail || "your email"}</span>. Set your new password below.
                    </p>

                    <form onSubmit={onForgotReset} className="mt-7 space-y-4">
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Reset Code</span>
                        <input
                          type="text"
                          placeholder="Enter 6-digit code"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">New Password</span>
                        <input
                          type="password"
                          placeholder="Minimum 8 characters"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </label>

                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                      >
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
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-primary">Done</p>
                    <h2 className="mt-1 text-3xl sm:text-4xl font-black">Password Updated</h2>
                    <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
                      Your password has been reset successfully. Continue by signing in with your new credentials.
                    </p>
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                    >
                      Back To Sign In
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="mt-8 rounded-xl border border-border bg-background p-4 text-sm text-text-secondary leading-relaxed">
                  By signing in, you agree to our{" "}
                  <Link href="/terms" className="font-semibold text-primary hover:underline">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="font-semibold text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
