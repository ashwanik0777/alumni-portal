"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, IndianRupee, Users, Power, PowerOff, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import ScholarshipCreateForm from "./ScholarshipCreateForm";
import ApplicationsList from "./ApplicationsList";

type Scholarship = {
  id: string;
  scholarshipName: string;
  providerNames: string[];
  scholarshipYear: string;
  amountInr: number;
  seats: number;
  deadlineDate: string;
  eligibilityCriteria: string[];
  description: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  rows: Scholarship[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  summary: { totalCount: number; activeCount: number; totalFundingInr: number; totalApplications: number };
  filterOptions: { years: string[] };
  message?: string;
};

type ViewMode = "scholarships" | "applications" | "create";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);
}

export default function AdminScholarshipsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("scholarships");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string | undefined>();

  const loadScholarships = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, year: yearFilter, page: String(page), pageSize: "10" });
      const res = await fetch(`/api/admin/scholarships?${params}`);
      const json = await res.json();
      if (res.ok) { setData(json); setMessage(""); }
      else setMessage(json.message || "Error loading scholarships.");
    } catch { setMessage("Network error."); }
    finally { setLoading(false); }
  }, [search, yearFilter, page]);

  useEffect(() => { loadScholarships(); }, [loadScholarships]);

  const toggleActive = async (id: string, isActive: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/scholarships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        setMessage(`Scholarship ${isActive ? "activated" : "deactivated"}.`);
        loadScholarships();
      } else {
        const d = await res.json();
        setMessage(d.message || "Error toggling.");
      }
    } catch { setMessage("Network error."); }
    finally { setTogglingId(null); }
  };

  const summary = data?.summary || { totalCount: 0, activeCount: 0, totalFundingInr: 0, totalApplications: 0 };
  const rows = data?.rows || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const years = data?.filterOptions?.years || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Scholarship Management</h2>
            <p className="mt-2 text-sm text-text-secondary">Create scholarships, manage applications, verify documents, and track disbursements.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["scholarships", "applications", "create"] as ViewMode[]).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${viewMode === m ? "bg-primary text-white" : "border border-border bg-background text-text-secondary hover:text-primary"}`}>
                {m === "scholarships" ? "All Scholarships" : m === "applications" ? "Applications" : "Create New"}
              </button>
            ))}
          </div>
        </div>
        {message && <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{message}</p>}
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Total Scholarships" value={String(summary.totalCount)} />
        <KpiCard label="Active" value={String(summary.activeCount)} />
        <KpiCard label="Total Funding" value={formatCurrency(summary.totalFundingInr)} />
        <KpiCard label="Applications" value={String(summary.totalApplications)} />
      </section>

      {/* Create Form View */}
      {viewMode === "create" && (
        <ScholarshipCreateForm onCreated={() => { setViewMode("scholarships"); loadScholarships(); }} onMessage={setMessage} />
      )}

      {/* Applications View */}
      {viewMode === "applications" && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <ApplicationsList scholarshipId={selectedScholarshipId} onMessage={setMessage} />
        </section>
      )}

      {/* Scholarships List View */}
      {viewMode === "scholarships" && (
        <>
          {/* Filters */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="md:col-span-2">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Search</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                  <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search scholarship, provider, email..."
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary" />
                </div>
              </label>
              <label>
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Year</span>
                <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option>All</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
            </div>
          </section>

          {/* Table */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-lg font-bold mb-4">Scholarships ({pagination.total})</h3>

            {loading ? (
              <div className="space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-28 rounded-xl bg-border/40" />)}</div>
            ) : rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-text-secondary">No scholarships found.</div>
            ) : (
              <div className="space-y-3">
                {rows.map((s) => (
                  <article key={s.id} className={`rounded-xl border p-4 transition ${s.isActive ? "border-border bg-background" : "border-border/60 bg-background/60 opacity-70"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-text-primary truncate">{s.scholarshipName}</h4>
                          <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-600"}`}>
                            {s.isActive ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {s.providerNames.join(" • ")} • Year {s.scholarshipYear} • Deadline {s.deadlineDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* ON/OFF Toggle */}
                        <button onClick={() => toggleActive(s.id, !s.isActive)} disabled={togglingId === s.id}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${s.isActive ? "bg-emerald-500" : "bg-gray-300"} ${togglingId === s.id ? "opacity-60" : ""}`}>
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${s.isActive ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                        {/* View Applications */}
                        <button onClick={() => { setSelectedScholarshipId(s.id); setViewMode("applications"); }}
                          className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5">
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-text-secondary sm:grid-cols-4">
                      <p><IndianRupee className="inline h-3 w-3" /> {formatCurrency(s.amountInr)}</p>
                      <p><Users className="inline h-3 w-3" /> {s.seats} seats</p>
                      <p>Email: {s.contactEmail}</p>
                      <p>Phone: {s.contactPhone}</p>
                    </div>

                    {/* Eligibility Criteria Points */}
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">Eligibility Criteria</p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.eligibilityCriteria.map((c, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[11px] text-text-secondary">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">{i+1}</span>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-text-secondary"><span className="font-semibold text-text-primary">Description:</span> {s.description}</p>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
              <p>Page {pagination.page} of {pagination.totalPages} • {pagination.total} total</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 font-semibold disabled:opacity-60">
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 font-semibold disabled:opacity-60">
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-black text-text-primary">{value}</p>
    </article>
  );
}
