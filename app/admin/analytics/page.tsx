"use client";

import { useEffect, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import OverviewCards from "./OverviewCards";
import BarChart from "./BarChart";
import DonutChart from "./DonutChart";
import RecentActivity from "./RecentActivity";

type AnalyticsData = {
  overview: {
    totalMembers: number;
    totalEvents: number;
    totalPrograms: number;
    totalScholarships: number;
    activeScholarships: number;
    totalApplications: number;
    pendingApplications: number;
    verifiedApplications: number;
    completedApplications: number;
    totalFundingInr: number;
    disbursedFundingInr: number;
  };
  membersByStatus: { status: string; count: number }[];
  scholarshipsByYear: { year: string; count: number; funding: number }[];
  applicationsByStatus: { status: string; count: number }[];
  applicationsByCourse: { course: string; count: number }[];
  recentApplications: { name: string; scholarship: string; status: string; date: string }[];
  eventsByStatus: { status: string; count: number }[];
  topScholarships: { name: string; applications: number; amount: number }[];
  monthlyTrend: { month: string; applications: number; completions: number }[];
};

const statusColors: Record<string, string> = {
  Pending: "#f59e0b",
  Verified: "#3b82f6",
  Completed: "#10b981",
  Active: "#10b981",
  Approved: "#10b981",
  Rejected: "#ef4444",
  Upcoming: "#6366f1",
  "Needs Info": "#f59e0b",
  Past: "#94a3b8",
  Ongoing: "#3b82f6",
  Cancelled: "#ef4444",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (res.ok) setData(json);
      else setError(json.message || "Failed to load analytics.");
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 rounded-2xl bg-border/40 w-80" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-border/40" />)}</div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-52 rounded-2xl bg-border/40" />)}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <p className="text-sm text-rose-700">{error}</p>
        <button onClick={loadData} className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-2">
              <BarChart3 className="h-3.5 w-3.5" /> Analytics Intelligence Center
            </div>
            <h2 className="text-2xl font-black sm:text-3xl">Platform Analytics</h2>
            <p className="mt-1 text-sm text-text-secondary">Real-time insights from your database — members, events, scholarships, and applications.</p>
          </div>
          <button onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/30">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </section>

      {/* KPI Overview */}
      <OverviewCards data={data.overview} />

      {/* Charts Row 1 */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutChart
          title="Applications by Status"
          data={data.applicationsByStatus.map((d) => ({
            label: d.status,
            value: d.count,
            color: statusColors[d.status] || "#94a3b8",
          }))}
        />
        <DonutChart
          title="Members by Status"
          data={data.membersByStatus.map((d) => ({
            label: d.status,
            value: d.count,
            color: statusColors[d.status] || "#94a3b8",
          }))}
        />
      </section>

      {/* Charts Row 2 */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChart
          title="Applications by Course"
          data={data.applicationsByCourse.map((d) => ({ label: d.course, value: d.count }))}
          barColor="bg-primary"
        />
        <BarChart
          title="Top Scholarships (by Applications)"
          data={data.topScholarships.map((d) => ({ label: d.name, value: d.applications, secondary: d.amount }))}
          barColor="bg-secondary"
        />
      </section>

      {/* Charts Row 3 */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChart
          title="Scholarships by Year"
          data={data.scholarshipsByYear.map((d) => ({ label: d.year, value: d.count, secondary: d.funding }))}
          barColor="bg-primary"
          secondaryColor="bg-emerald-500"
          showSecondary
        />
        <DonutChart
          title="Events by Status"
          data={data.eventsByStatus.map((d) => ({
            label: d.status,
            value: d.count,
            color: statusColors[d.status] || "#94a3b8",
          }))}
        />
      </section>

      {/* Monthly Trend */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h4 className="text-sm font-bold mb-4">Monthly Trend (Last 6 Months)</h4>
        {data.monthlyTrend.length === 0 ? (
          <p className="text-xs text-text-secondary italic">No trend data yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {data.monthlyTrend.map((m) => (
              <div key={m.month} className="rounded-xl border border-border bg-background p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{m.month}</p>
                <p className="mt-1 text-lg font-black text-primary">{m.applications}</p>
                <p className="text-[10px] text-text-secondary">Applications</p>
                <p className="mt-1 text-sm font-bold text-emerald-600">{m.completions}</p>
                <p className="text-[10px] text-text-secondary">Completed</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <RecentActivity applications={data.recentApplications} />
    </div>
  );
}
