"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  FileCheck,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  RefreshCw,
  Users,
} from "lucide-react";

type OverviewData = {
  greeting: { name: string; email: string };
  stats: {
    totalConnections: number;
    pendingRequests: number;
    registeredEvents: number;
    scholarshipApplications: number;
    upcomingEvents: number;
  };
  recentActivity: {
    id: string;
    title: string;
    description: string;
    type: "event" | "scholarship" | "connection" | "request";
    time: string;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    eventDate: string;
    location: string;
    mode: string;
  }[];
  applicationStatus: {
    pending: number;
    verified: number;
    completed: number;
  };
  quickActions: {
    label: string;
    href: string;
    description: string;
  }[];
};

const typeIcons: Record<string, typeof Activity> = {
  event: CalendarDays,
  scholarship: Award,
  connection: Users,
  request: MessageSquare,
};

const typeColors: Record<string, string> = {
  event: "bg-blue-50 text-blue-600 border-blue-200",
  scholarship: "bg-amber-50 text-amber-600 border-amber-200",
  connection: "bg-emerald-50 text-emerald-600 border-emerald-200",
  request: "bg-violet-50 text-violet-600 border-violet-200",
};

const actionIcons: Record<string, typeof Activity> = {
  "Browse Events": CalendarDays,
  "Apply for Scholarship": Award,
  "Grow Network": Users,
  "Update Profile": Compass,
};

let clientCache: { data: OverviewData; expiresAt: number } | null = null;
const CLIENT_CACHE_TTL_MS = 10_000;

function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-5 w-36 rounded bg-border/60" />
        <div className="mt-3 h-8 w-80 max-w-full rounded bg-border/60" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-border/50" />
      </section>
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`stat-${i}`} className="h-24 rounded-2xl border border-border bg-card" />
        ))}
      </section>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-72 rounded-2xl border border-border bg-card xl:col-span-2" />
        <div className="h-72 rounded-2xl border border-border bg-card" />
      </section>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export default function UserDashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userEmail = typeof window !== "undefined"
    ? (() => {
        try {
          const saved = localStorage.getItem("user_event_registration_profile_v1");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.attendeeEmail) return parsed.attendeeEmail;
          }
        } catch { /* skip */ }
        try {
          const saved = localStorage.getItem("user_profile_draft_v1");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.email) return parsed.email;
          }
        } catch { /* skip */ }
        return "aman.alumni@jnvportal.in";
      })()
    : "aman.alumni@jnvportal.in";

  const loadData = useCallback(async (forceFresh = false) => {
    // Check client cache
    if (!forceFresh && clientCache && clientCache.expiresAt > Date.now()) {
      setData(clientCache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading((prev) => prev || data === null);
      setError("");
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const response = await fetch(`/api/user/overview?email=${encodeURIComponent(userEmail)}${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.message || "Unable to load dashboard.");
        return;
      }
      setData(json);
      clientCache = { data: json, expiresAt: Date.now() + CLIENT_CACHE_TTL_MS };
    } catch {
      setError("Network error while loading dashboard.");
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) return <OverviewSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <p className="text-sm text-rose-700">{error}</p>
        <button onClick={() => void loadData(true)} className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: "Connections", value: data.stats.totalConnections, hint: data.stats.pendingRequests > 0 ? `${data.stats.pendingRequests} pending` : "All caught up", icon: Users, color: "text-emerald-600" },
    { label: "Registered Events", value: data.stats.registeredEvents, hint: `${data.stats.upcomingEvents} upcoming`, icon: CalendarDays, color: "text-blue-600" },
    { label: "Scholarship Apps", value: data.stats.scholarshipApplications, hint: `${data.applicationStatus.pending} pending`, icon: Award, color: "text-amber-600" },
    { label: "Upcoming Events", value: data.stats.upcomingEvents, hint: "Events you're attending", icon: BookOpen, color: "text-violet-600" },
    { label: "Pending Requests", value: data.stats.pendingRequests, hint: "Needs your attention", icon: Briefcase, color: "text-rose-600" },
  ];

  const totalApps = data.applicationStatus.pending + data.applicationStatus.verified + data.applicationStatus.completed;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-2">
              <LayoutDashboard className="h-3.5 w-3.5" /> Personal Dashboard
            </div>
            <h2 className="text-2xl font-black sm:text-3xl">
              Welcome back, {data.greeting.name.split(" ")[0]}!
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-text-secondary">
              Track your profile growth, networking updates, event registrations, and scholarship progress from one place.
            </p>
          </div>
          <button
            onClick={() => void loadData(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/30 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {statCards.map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
            <div className="mb-3 flex items-start justify-between">
              <span className={`inline-flex rounded-xl bg-primary/10 p-2 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-secondary" />
            </div>
            <p className="text-2xl font-black">{item.value}</p>
            <p className="mt-1 text-sm text-text-secondary">{item.label}</p>
            <p className="mt-2 text-xs font-semibold text-primary">{item.hint}</p>
          </article>
        ))}
      </section>

      {/* Activity Feed + Quick Actions */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Activity */}
        <article className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-lg font-bold">
              <Activity className="h-4.5 w-4.5 text-primary" /> Recent Activity
            </h3>
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
              {data.recentActivity.length} items
            </span>
          </div>

          {data.recentActivity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
              <p className="text-sm text-text-secondary">No recent activity yet. Start by exploring events or applying for scholarships!</p>
              <Link href="/user/events" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Browse Events <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.map((item) => {
                const Icon = typeIcons[item.type] || Activity;
                const colorCls = typeColors[item.type] || "bg-gray-50 text-gray-600 border-gray-200";
                return (
                  <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/20">
                    <span className={`mt-0.5 inline-flex shrink-0 items-center justify-center rounded-lg border p-2 ${colorCls}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary truncate">{item.title}</p>
                      <p className="text-xs text-text-secondary">{item.description}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-text-secondary whitespace-nowrap">
                      {formatRelativeTime(item.time)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        {/* Quick Actions */}
        <article className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <p className="mt-1 text-sm text-text-secondary">Shortcuts to key areas of your dashboard.</p>
          <div className="mt-4 space-y-2.5">
            {data.quickActions.map((action) => {
              const ActionIcon = actionIcons[action.label] || ArrowRight;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center justify-between rounded-xl border border-border bg-background p-3 transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary transition-transform group-hover:scale-105">
                      <ActionIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{action.label}</p>
                      <p className="text-[11px] text-text-secondary">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-secondary group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        </article>
      </section>

      {/* Upcoming Events + Scholarship Status */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Upcoming Events */}
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-sm font-bold">
              <CalendarDays className="h-4 w-4 text-primary" /> Upcoming Events
            </h3>
            <Link href="/user/events" className="text-xs font-semibold text-primary hover:underline">
              See all
            </Link>
          </div>

          {data.upcomingEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-text-secondary">
              No upcoming events. <Link href="/user/events" className="font-semibold text-primary hover:underline">Browse events</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/20">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{event.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.location}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                    {event.mode}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Scholarship Application Status */}
        <article className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-sm font-bold">
              <Award className="h-4 w-4 text-primary" /> Scholarship Applications
            </h3>
            <Link href="/user/scholarships" className="text-xs font-semibold text-primary hover:underline">
              Apply now
            </Link>
          </div>

          {totalApps === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-text-secondary">
              No applications yet. <Link href="/user/scholarships" className="font-semibold text-primary hover:underline">Browse scholarships</Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-semibold text-amber-700">Pending Review</p>
                </div>
                <p className="text-lg font-black text-amber-700">{data.applicationStatus.pending}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-700">Verified</p>
                </div>
                <p className="text-lg font-black text-blue-700">{data.applicationStatus.verified}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700">Completed (Disbursed)</p>
                </div>
                <p className="text-lg font-black text-emerald-700">{data.applicationStatus.completed}</p>
              </div>

              {/* Progress bar */}
              <div className="mt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
                  <span>Application Progress</span>
                  <span>{totalApps} total</span>
                </div>
                <div className="mt-1.5 flex h-2.5 w-full overflow-hidden rounded-full bg-border/60">
                  {data.applicationStatus.completed > 0 && (
                    <div className="bg-emerald-500 transition-all" style={{ width: `${(data.applicationStatus.completed / totalApps) * 100}%` }} />
                  )}
                  {data.applicationStatus.verified > 0 && (
                    <div className="bg-blue-500 transition-all" style={{ width: `${(data.applicationStatus.verified / totalApps) * 100}%` }} />
                  )}
                  {data.applicationStatus.pending > 0 && (
                    <div className="bg-amber-400 transition-all" style={{ width: `${(data.applicationStatus.pending / totalApps) * 100}%` }} />
                  )}
                </div>
              </div>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
