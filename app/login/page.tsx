"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck, Users } from "lucide-react";

const accessPoints = ["Alumni", "Students", "Mentors", "Coordinators"];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-background text-text-primary min-h-screen">
      <section className="relative overflow-hidden py-12 sm:py-14 lg:py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-14 -left-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-5 rounded-4xl border border-border bg-card p-7 sm:p-8 lg:p-10 shadow-sm flex flex-col">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary w-fit">
                <Users className="h-4 w-4" />
                Single Login Access
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mt-5">
                One Secure Gateway
                <span className="block text-primary">For The Entire Community</span>
              </h1>

              <p className="mt-4 text-text-secondary leading-relaxed">
                Use one account to access directory features, career opportunities, events, mentorship, and
                support experiences across the Alumni Portal.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                {accessPoints.map((point) => (
                  <div key={point} className="rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-text-primary">
                    {point}
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-border bg-background p-5">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Trusted and Moderated Access
                </p>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Accounts are managed with secure sign-in practices and alumni moderation controls to keep
                  the community reliable and authentic.
                </p>
              </div>

              <div className="mt-auto pt-7">
                <p className="text-sm text-text-secondary">
                  New here?{" "}
                  <Link href="/register" className="font-semibold text-primary hover:underline">
                    Create your account
                  </Link>
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-4xl border border-border bg-card p-7 sm:p-8 lg:p-10 shadow-sm">
              <div className="flex items-center gap-2 text-primary mb-3">
                <GraduationCap className="h-5 w-5" />
                <span className="text-sm font-semibold">Portal Sign In</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black">Welcome Back</h2>
              <p className="mt-2 text-text-secondary">
                Enter your credentials to continue with your single community login.
              </p>

              <form className="mt-7 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Email Address</span>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Password</span>
                  <div className="relative">
                    <LockKeyhole className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-12 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary"
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

                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="inline-flex items-center gap-2 text-text-secondary cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                    Keep me signed in
                  </label>
                  <Link href="/contact" className="font-medium text-primary hover:underline">
                    Need login help?
                  </Link>
                </div>

                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 rounded-xl border border-border bg-background p-4 text-sm text-text-secondary leading-relaxed">
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
      </section>
    </div>
  );
}
