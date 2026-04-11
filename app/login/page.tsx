"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const accessPoints = [
  { title: "Alumni", text: "Network, events, opportunities" },
  { title: "Students", text: "Mentorship and guidance" },
  { title: "Mentors", text: "Support the next generation" },
  { title: "Coordinators", text: "Manage chapters and programs" },
];

const trustPoints = [
  "One account across all portal experiences",
  "Verified community access and moderation",
  "Secure session handling and role-aware visibility",
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-background text-text-primary min-h-screen">
      <section className="relative overflow-hidden py-10 sm:py-12 lg:py-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-10 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
            <div className="lg:col-span-5 rounded-4xl border border-primary/20 bg-primary p-7 sm:p-8 lg:p-10 text-white relative overflow-hidden">
              <div className="absolute -top-20 -right-16 h-52 w-52 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-secondary/20" />

              <div className="relative">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">
                  <Users className="h-4 w-4" />
                  Single Login Access
                </p>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mt-5">
                  A Unified Sign-In
                  <span className="block text-secondary">For Every Community Member</span>
                </h1>

                <p className="mt-4 text-white/85 leading-relaxed">
                  One secure account gives access to events, opportunities, mentorship, and collaborative alumni programs.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  {accessPoints.map((point) => (
                    <div key={point.title} className="rounded-xl border border-white/20 bg-white/5 p-3">
                      <p className="text-sm font-semibold">{point.title}</p>
                      <p className="text-[11px] text-white/75 mt-1">{point.text}</p>
                    </div>
                  ))}
                </div>

                <ul className="mt-7 space-y-3">
                  {trustPoints.map((point) => (
                    <li key={point} className="inline-flex items-center gap-2 text-sm text-white/90">
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-4xl border border-border bg-card p-7 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium Community Access
                </div>

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
                        className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                        className="w-full rounded-xl border border-border bg-background pl-10 pr-12 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
        </div>
      </section>
    </div>
  );
}
