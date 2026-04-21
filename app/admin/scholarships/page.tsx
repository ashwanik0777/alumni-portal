"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  IndianRupee,
  Search,
  XCircle,
} from "lucide-react";

type ScholarshipStatus = "Pending" | "Approved" | "Rejected" | "Needs Info";

type ScholarshipRow = {
  id: string;
  scholarshipName: string;
  providerName: string;
  scholarshipYear: string;
  amountInr: number;
  seats: number;
  deadlineDate: string;
  eligibilityCriteria: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  status: ScholarshipStatus;
  rejectionReason: string | null;
  submittedAt: string;
  updatedAt: string;
};

type ScholarshipsApiResponse = {
  rows: ScholarshipRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalFundingInr: number;
  };
  filterOptions?: {
    years: string[];
  };
  message?: string;
};

type StatusListResponse = {
  rows: ScholarshipRow[];
  message?: string;
};

type ScholarshipView = "queue" | "approved" | "rejected";

const scholarshipsResponseCache = new Map<string, { expiresAt: number; data: ScholarshipsApiResponse }>();
const SCHOLARSHIPS_CLIENT_CACHE_TTL_MS = 12_000;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function statusChip(status: ScholarshipStatus) {
  if (status === "Approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Pending" || status === "Needs Info") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function statusIcon(status: ScholarshipStatus) {
  if (status === "Approved") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "Pending" || status === "Needs Info") return <Clock3 className="h-4 w-4" />;
  return <XCircle className="h-4 w-4" />;
}

function ScholarshipsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-7 w-64 rounded bg-border/60" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-border/50" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`kpi-${i}`} className="h-28 rounded-2xl border border-border bg-card" />
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`row-${i}`} className="h-24 rounded-xl bg-border/50" />
        ))}
      </section>
    </div>
  );
}

export default function AdminScholarshipsPage() {
  const [rows, setRows] = useState<ScholarshipRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [summary, setSummary] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalFundingInr: 0,
  });
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState<ScholarshipView>("queue");
  const [approvedRows, setApprovedRows] = useState<ScholarshipRow[]>([]);
  const [rejectedRows, setRejectedRows] = useState<ScholarshipRow[]>([]);
  const [statusListLoading, setStatusListLoading] = useState(false);
  const [showCreateScholarship, setShowCreateScholarship] = useState(false);

  const [newScholarship, setNewScholarship] = useState({
    scholarshipName: "",
    providerName: "",
    scholarshipYear: String(new Date().getFullYear()),
    amountInr: "",
    seats: "",
    deadlineDate: "",
    eligibilityCriteria: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("search", search);
    params.set("status", statusFilter);
    params.set("year", yearFilter);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [page, pageSize, search, statusFilter, yearFilter]);

  const loadScholarships = useCallback(
    async (signal?: AbortSignal, forceFresh = false) => {
      const cacheKey = queryString;
      const cached = forceFresh ? undefined : scholarshipsResponseCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        setRows(cached.data.rows || []);
        setSummary(
          cached.data.summary || {
            pendingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
            totalFundingInr: 0,
          },
        );
        setYearOptions(cached.data.filterOptions?.years || []);
        setTotalPages(cached.data.pagination?.totalPages || 1);
        setTotal(cached.data.pagination?.total || 0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
        const response = await fetch(`/api/admin/scholarships?${queryString}${refreshParam}`, {
          cache: forceFresh ? "no-store" : "default",
          signal,
        });
        const payload = (await response.json()) as ScholarshipsApiResponse;

        if (!response.ok) {
          setMessage(payload.message || "Unable to load scholarships.");
          return;
        }

        setRows(payload.rows || []);
        setSummary(
          payload.summary || {
            pendingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
            totalFundingInr: 0,
          },
        );
        setYearOptions(payload.filterOptions?.years || []);
        setTotalPages(payload.pagination?.totalPages || 1);
        setTotal(payload.pagination?.total || 0);
        scholarshipsResponseCache.set(cacheKey, {
          expiresAt: Date.now() + SCHOLARSHIPS_CLIENT_CACHE_TTL_MS,
          data: payload,
        });
        setMessage("");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMessage("Network error while loading scholarships.");
        }
      } finally {
        setLoading(false);
      }
    },
    [queryString],
  );

  const loadStatusLists = async (forceFresh = false) => {
    setStatusListLoading(true);
    try {
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const [approvedRes, rejectedRes] = await Promise.all([
        fetch(`/api/admin/scholarships/lists?type=approved${refreshParam}`, {
          cache: forceFresh ? "no-store" : "default",
        }),
        fetch(`/api/admin/scholarships/lists?type=rejected${refreshParam}`, {
          cache: forceFresh ? "no-store" : "default",
        }),
      ]);

      const approvedPayload = (await approvedRes.json()) as StatusListResponse;
      const rejectedPayload = (await rejectedRes.json()) as StatusListResponse;

      if (approvedRes.ok) setApprovedRows(approvedPayload.rows || []);
      if (rejectedRes.ok) setRejectedRows(rejectedPayload.rows || []);
    } catch {
      setMessage("Unable to load approval/rejection lists.");
    } finally {
      setStatusListLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadScholarships(controller.signal);
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadScholarships]);

  useEffect(() => {
    void loadStatusLists();
  }, []);

  const applyOptimisticStatusUpdate = (
    scholarshipId: string,
    status: ScholarshipStatus,
    rejectionReason?: string,
  ) => {
    const targetInQueue = rows.find((item) => item.id === scholarshipId);

    setRows((prev) =>
      prev.map((row) =>
        row.id === scholarshipId
          ? {
              ...row,
              status,
              rejectionReason: status === "Rejected" ? rejectionReason || null : null,
              updatedAt: new Date().toISOString(),
            }
          : row,
      ),
    );

    setApprovedRows((prev) => {
      const withoutTarget = prev.filter((item) => item.id !== scholarshipId);
      if (status !== "Approved" || !targetInQueue) {
        return withoutTarget;
      }
      return [
        {
          ...targetInQueue,
          status,
          rejectionReason: null,
          updatedAt: new Date().toISOString(),
        },
        ...withoutTarget,
      ];
    });

    setRejectedRows((prev) => {
      const withoutTarget = prev.filter((item) => item.id !== scholarshipId);
      if (status !== "Rejected" || !targetInQueue) {
        return withoutTarget;
      }
      return [
        {
          ...targetInQueue,
          status,
          rejectionReason: rejectionReason || "Rejected by admin",
          updatedAt: new Date().toISOString(),
        },
        ...withoutTarget,
      ];
    });

    setSummary((prev) => {
      const existing = rows.find((item) => item.id === scholarshipId);
      if (!existing || existing.status === status) {
        return prev;
      }

      const next = { ...prev };
      if (existing.status === "Pending" || existing.status === "Needs Info") {
        next.pendingCount = Math.max(0, next.pendingCount - 1);
      }
      if (existing.status === "Approved") {
        next.approvedCount = Math.max(0, next.approvedCount - 1);
      }
      if (existing.status === "Rejected") {
        next.rejectedCount = Math.max(0, next.rejectedCount - 1);
      }

      if (status === "Pending" || status === "Needs Info") {
        next.pendingCount += 1;
      }
      if (status === "Approved") {
        next.approvedCount += 1;
      }
      if (status === "Rejected") {
        next.rejectedCount += 1;
      }

      return next;
    });
  };

  const updateStatus = async (scholarshipId: string, status: ScholarshipStatus) => {
    const rejectionReason = status === "Rejected" ? window.prompt("Enter rejection reason") || "" : undefined;
    if (status === "Rejected" && !rejectionReason?.trim()) {
      setMessage("Rejection reason is required.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/scholarships/${scholarshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to update scholarship status.");
        return;
      }

      applyOptimisticStatusUpdate(scholarshipId, status, rejectionReason);
      scholarshipsResponseCache.clear();
      await loadScholarships(undefined, true);
      await loadStatusLists(true);
      setMessage(`Scholarship status updated to ${status}.`);
    } catch {
      setMessage("Network error while updating scholarship.");
    } finally {
      setActionLoading(false);
    }
  };

  const bulkApprove = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/scholarships/bulk-approve", { method: "POST" });
      const payload = (await response.json()) as { updatedCount?: number; message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to run bulk approve.");
        return;
      }
      scholarshipsResponseCache.clear();
      await loadScholarships(undefined, true);
      await loadStatusLists(true);
      setMessage(`Bulk approve completed. ${payload.updatedCount || 0} record(s) updated.`);
    } catch {
      setMessage("Network error while bulk approving scholarships.");
    } finally {
      setActionLoading(false);
    }
  };

  const createScholarship = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amountInr = Number(newScholarship.amountInr);
    const seats = Number(newScholarship.seats);
    if (!Number.isFinite(amountInr) || amountInr < 0) {
      setMessage("Amount must be a valid positive number.");
      return;
    }
    if (!Number.isInteger(seats) || seats <= 0) {
      setMessage("Seats must be a valid integer greater than 0.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newScholarship,
          amountInr,
          seats,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to create scholarship.");
        return;
      }

      setNewScholarship({
        scholarshipName: "",
        providerName: "",
        scholarshipYear: String(new Date().getFullYear()),
        amountInr: "",
        seats: "",
        deadlineDate: "",
        eligibilityCriteria: "",
        description: "",
        contactEmail: "",
        contactPhone: "",
      });
      setPage(1);
      scholarshipsResponseCache.clear();
      await loadScholarships(undefined, true);
      await loadStatusLists(true);
      setMessage("Scholarship created successfully.");
    } catch {
      setMessage("Network error while creating scholarship.");
    } finally {
      setActionLoading(false);
    }
  };

  const exportCsv = () => {
    if (rows.length === 0) {
      setMessage("No records to export.");
      return;
    }

    const header =
      "ID,Scholarship,Provider,Year,Amount INR,Seats,Deadline,Status,Contact Email,Contact Phone,Updated At";
    const lines = rows.map((row) =>
      [
        row.id,
        row.scholarshipName,
        row.providerName,
        row.scholarshipYear,
        row.amountInr,
        row.seats,
        row.deadlineDate,
        row.status,
        row.contactEmail,
        row.contactPhone,
        new Date(row.updatedAt).toLocaleString(),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );

    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `scholarships-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const activeRows =
    activeView === "queue" ? rows : activeView === "approved" ? approvedRows : rejectedRows;

  if (loading) {
    return <ScholarshipsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Scholarship Management</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Create, review, approve, and manage scholarships from one dynamic admin workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateScholarship((prev) => !prev)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
          >
            {showCreateScholarship ? "Close Create Scholarship" : "Create New Scholarship"}
          </button>
        </div>
        {message && (
          <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">
            {message}
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Pending</p>
          <p className="mt-2 text-2xl font-black text-text-primary">{summary.pendingCount}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Approved</p>
          <p className="mt-2 text-2xl font-black text-text-primary">{summary.approvedCount}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Rejected</p>
          <p className="mt-2 text-2xl font-black text-text-primary">{summary.rejectedCount}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Total Funding</p>
          <p className="mt-2 text-2xl font-black text-text-primary">{formatCurrency(summary.totalFundingInr)}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">Filters and Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={bulkApprove}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Bulk Approve Pending
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="md:col-span-2">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              Search
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by scholarship, provider, contact email"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
          </label>

          <label>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              <Filter className="mr-1 inline h-3.5 w-3.5" /> Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Needs Info</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Year</span>
            <select
              value={yearFilter}
              onChange={(event) => {
                setYearFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
            >
              <option>All</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {showCreateScholarship && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Create New Scholarship</h3>
          <form onSubmit={createScholarship} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={newScholarship.scholarshipName}
              onChange={(event) => setNewScholarship((prev) => ({ ...prev, scholarshipName: event.target.value }))}
              placeholder="Scholarship Name"
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              required
            />
            <input
              value={newScholarship.providerName}
              onChange={(event) => setNewScholarship((prev) => ({ ...prev, providerName: event.target.value }))}
              placeholder="Provider Name"
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              required
            />
            <input
              value={newScholarship.scholarshipYear}
              onChange={(event) => setNewScholarship((prev) => ({ ...prev, scholarshipYear: event.target.value }))}
              placeholder="Scholarship Year"
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              required
            />
            <label className="relative">
              <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="number"
                min="0"
                value={newScholarship.amountInr}
                onChange={(event) => setNewScholarship((prev) => ({ ...prev, amountInr: event.target.value }))}
                placeholder="Amount (INR)"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none focus:border-primary"
                required
              />
            </label>
            <input
              type="number"
              min="1"
              value={newScholarship.seats}
              onChange={(event) => setNewScholarship((prev) => ({ ...prev, seats: event.target.value }))}
              placeholder="Total Seats"
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              required
            />
            <input
              type="date"
              value={newScholarship.deadlineDate}
              onChange={(event) => setNewScholarship((prev) => ({ ...prev, deadlineDate: event.target.value }))}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              required
            />
            <input
              value={newScholarship.contactEmail}
              onChange={(event) => setNewScholarship((prev) => ({ ...prev, contactEmail: event.target.value }))}
              placeholder="Contact Email"
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              required
              type="email"
            />
            <input
              value={newScholarship.contactPhone}
              onChange={(event) => setNewScholarship((prev) => ({ ...prev, contactPhone: event.target.value }))}
              placeholder="Contact Phone"
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
              required
            />
            <input
              value={newScholarship.eligibilityCriteria}
              onChange={(event) =>
                setNewScholarship((prev) => ({ ...prev, eligibilityCriteria: event.target.value }))
              }
              placeholder="Eligibility Criteria"
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary md:col-span-3"
              required
            />
            <textarea
              value={newScholarship.description}
              onChange={(event) => setNewScholarship((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Scholarship Description"
              className="min-h-24 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary md:col-span-3"
              required
            />
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? "Saving..." : "Create Scholarship"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Scholarship Review Queue</h3>
          <div className="inline-flex rounded-xl border border-border bg-background p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveView("queue")}
              className={`rounded-lg px-3 py-1.5 ${
                activeView === "queue" ? "bg-primary text-white" : "text-text-secondary"
              }`}
            >
              Queue
            </button>
            <button
              onClick={() => setActiveView("approved")}
              className={`rounded-lg px-3 py-1.5 ${
                activeView === "approved" ? "bg-primary text-white" : "text-text-secondary"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setActiveView("rejected")}
              className={`rounded-lg px-3 py-1.5 ${
                activeView === "rejected" ? "bg-primary text-white" : "text-text-secondary"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {statusListLoading && activeView !== "queue" ? (
          <p className="text-sm text-text-secondary">Loading {activeView} scholarships...</p>
        ) : activeRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-text-secondary">
            No scholarships found for this view.
          </div>
        ) : (
          <div className="space-y-3">
            {activeRows.map((row) => (
              <article key={row.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-text-primary">{row.scholarshipName}</h4>
                    <p className="text-xs text-text-secondary">
                      {row.providerName} • Year {row.scholarshipYear} • Deadline {row.deadlineDate}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusChip(
                      row.status,
                    )}`}
                  >
                    {statusIcon(row.status)} {row.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-text-secondary sm:grid-cols-2 lg:grid-cols-4">
                  <p>
                    <span className="font-semibold text-text-primary">Amount:</span> {formatCurrency(row.amountInr)}
                  </p>
                  <p>
                    <span className="font-semibold text-text-primary">Seats:</span> {row.seats}
                  </p>
                  <p>
                    <span className="font-semibold text-text-primary">Contact:</span> {row.contactEmail}
                  </p>
                  <p>
                    <span className="font-semibold text-text-primary">Phone:</span> {row.contactPhone}
                  </p>
                </div>

                <p className="mt-3 text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">Eligibility:</span> {row.eligibilityCriteria}
                </p>
                <p className="mt-2 text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">Description:</span> {row.description}
                </p>

                {row.rejectionReason && (
                  <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs text-rose-700">
                    Rejection reason: {row.rejectionReason}
                  </p>
                )}

                {activeView === "queue" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(row.id, "Approved")}
                      disabled={actionLoading}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(row.id, "Needs Info")}
                      disabled={actionLoading}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark Needs Info
                    </button>
                    <button
                      onClick={() => updateStatus(row.id, "Rejected")}
                      disabled={actionLoading}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
          <p>
            Showing page {page} of {totalPages} • Total records: {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || actionLoading}
              className="rounded-lg border border-border bg-background px-3 py-1.5 font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || actionLoading}
              className="rounded-lg border border-border bg-background px-3 py-1.5 font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
