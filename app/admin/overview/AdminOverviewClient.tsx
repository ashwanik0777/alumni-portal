"use client";

import {
  Activity,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  IndianRupee,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type ComponentType, useEffect, useMemo, useRef, useState } from "react";

type Stat = {
  label: string;
  value: string;
  delta: string;
  icon: ComponentType<{ className?: string }>;
};

type FeedItem = {
  id: string;
  title: string;
  time: string;
  status: "success" | "pending";
};

type OverviewResponse = {
  message?: string;
  overview?: {
    fiscalYear: string;
    syncMode: string;
    stats: Array<{ label: string; value: string; delta: string }>;
    feed: FeedItem[];
  };
};

const statIconMap: Record<string, ComponentType<{ className?: string }>> = {
  "Registered Alumni": Users,
  "Active Mentorship": GraduationCap,
  "Monthly Donations": IndianRupee,
  "Weekly Activity": Activity,
};

const quickActions = [
  { label: "Approve Members", href: "/admin/members" },
  { label: "Assign Mentors", href: "/admin/mentorship" },
  { label: "Publish Event", href: "/admin/events" },
  { label: "Review Scholarships", href: "/admin/scholarships" },
];

const defaultStats: Stat[] = [
  { label: "Registered Alumni", value: "0", delta: "0%", icon: Users },
  { label: "Active Mentorship", value: "0", delta: "0%", icon: GraduationCap },
  { label: "Monthly Donations", value: "₹0", delta: "0%", icon: IndianRupee },
  { label: "Weekly Activity", value: "0", delta: "0%", icon: Activity },
];

function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="h-5 w-36 rounded bg-border/60" />
        <div className="mt-3 h-8 w-72 rounded bg-border/60" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-border/50" />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={`stat-skeleton-${index}`} className="rounded-2xl border border-border bg-card p-5">
            <div className="h-10 w-10 rounded-xl bg-border/60" />
            <div className="mt-4 h-7 w-24 rounded bg-border/60" />
            <div className="mt-2 h-4 w-32 rounded bg-border/50" />
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 xl:col-span-2 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`feed-skeleton-${index}`} className="h-16 rounded-xl bg-border/50" />
          ))}
        </article>
        <article className="rounded-2xl border border-border bg-card p-5 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`action-skeleton-${index}`} className="h-11 rounded-xl bg-border/50" />
          ))}
        </article>
      </section>
    </div>
  );
}

/* ===== Auto-scrolling Activity Feed ===== */
function ActivityFeed({ feed }: { feed: FeedItem[] }) {
  const displayFeed = feed.slice(0, 10);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items for seamless infinite loop
  const items = displayFeed.length > 5
    ? [...displayFeed, ...displayFeed]
    : displayFeed;

  const singleSetHeight = displayFeed.length * 60; // ~60px per item

  useEffect(() => {
    if (displayFeed.length <= 5) return;
    const el = scrollRef.current;
    if (!el) return;

    let animFrame: number;
    let offset = 0;
    const speed = 0.4; // px per frame

    const tick = () => {
      if (!isPaused) {
        offset += speed;
        if (offset >= singleSetHeight) offset = 0;
        el.style.transform = `translateY(-${offset}px)`;
      }
      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [displayFeed.length, singleSetHeight, isPaused]);

  if (displayFeed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-text-secondary">
        No activity feed available yet.
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{ maxHeight: `${Math.min(displayFeed.length, 5) * 60}px` }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Hide scrollbar + gradient fade */}
      <style>{`
        .activity-scroll-wrap::-webkit-scrollbar { display: none; }
        .activity-scroll-wrap { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div ref={scrollRef} className="activity-scroll-wrap" style={{ willChange: "transform" }}>
        {items.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex items-center justify-between rounded-xl border border-border bg-background p-3 mb-2"
            style={{ height: "52px" }}
          >
            <div className="flex items-center gap-3">
              {item.status === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Clock3 className="h-4 w-4 text-secondary shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{item.title}</p>
                <p className="text-xs text-text-secondary">{item.time}</p>
              </div>
            </div>
            <CalendarCheck className="h-4 w-4 text-text-secondary shrink-0" />
          </div>
        ))}
      </div>
      {/* Top & bottom fade gradients */}
      {displayFeed.length > 5 && (
        <>
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-card to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent pointer-events-none z-10" />
        </>
      )}
    </div>
  );
}

let cachedOverviewPayload: OverviewResponse | null = null;
let lastOverviewFetchTime = 0;
const OVERVIEW_CACHE_TTL_MS = 300_000; // 5 minutes

export default function AdminOverviewClient() {
  const isCached = cachedOverviewPayload !== null && Date.now() - lastOverviewFetchTime < OVERVIEW_CACHE_TTL_MS;

  const [fiscalYear, setFiscalYear] = useState(() => isCached ? cachedOverviewPayload!.overview?.fiscalYear || "FY 2026" : "FY 2026");
  const [syncMode, setSyncMode] = useState(() => isCached ? cachedOverviewPayload!.overview?.syncMode || "Live Sync" : "Live Sync");
  const [stats, setStats] = useState<Stat[]>(() => {
    if (isCached && cachedOverviewPayload!.overview?.stats) {
      const nextStats = cachedOverviewPayload!.overview!.stats.map((item) => ({
        ...item,
        icon: statIconMap[item.label] || Activity,
      }));
      return nextStats.length > 0 ? nextStats : defaultStats;
    }
    return defaultStats;
  });
  const [feed, setFeed] = useState<FeedItem[]>(() => isCached ? cachedOverviewPayload!.overview?.feed || [] : []);
  const [isLoading, setIsLoading] = useState(!isCached);

  const hasFeed = useMemo(() => feed.length > 0, [feed]);

  useEffect(() => {
    if (isCached) return;

    let isCancelled = false;
    const loadOverview = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/overview", { cache: "no-store" });
        const payload = (await response.json()) as OverviewResponse;

        if (!response.ok || !payload.overview) return;
        if (isCancelled) return;

        cachedOverviewPayload = payload;
        lastOverviewFetchTime = Date.now();

        setFiscalYear(payload.overview.fiscalYear || "FY 2026");
        setSyncMode(payload.overview.syncMode || "Live Sync");

        const nextStats = payload.overview.stats.map((item) => ({
          ...item,
          icon: statIconMap[item.label] || Activity,
        }));
        setStats(nextStats.length > 0 ? nextStats : defaultStats);
        setFeed(payload.overview.feed || []);
      } catch {
        // Ignore fetch errors
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    void loadOverview();
    return () => { isCancelled = true; };
  }, [isCached]);

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Control Center</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">Welcome back, Admin</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Track community health, approvals, and operations from one workspace.
            </p>
           
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-border bg-background px-3 py-2 font-semibold">{fiscalYear}</div>
            <div className="rounded-xl border border-border bg-background px-3 py-2 font-semibold">{syncMode}</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-start justify-between">
              <span className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-bold text-text-primary">
                {item.delta}
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <p className="text-2xl font-black">{item.value}</p>
            <p className="mt-1 text-sm text-text-secondary">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Admin Activity</h3>
            <span className="text-sm font-semibold text-text-secondary">Live Feed</span>
          </div>
          <ActivityFeed feed={feed} />
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <p className="mt-1 text-sm text-text-secondary">Use these shortcuts for daily operations.</p>
          <div className="mt-4 space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
              >
                {action.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
