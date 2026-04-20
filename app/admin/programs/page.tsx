"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  Search,
  XCircle,
} from "lucide-react";

type ProgramStatus = "Pending" | "Approved" | "Rejected" | "Needs Info";

type ProgramRow = {
  id: string;
  title: string;
  category: string;
  programYear: string;
  mode: string;
  coordinatorName: string;
  coordinatorEmail: string;
  contactNumber: string;
  status: ProgramStatus;
  rejectionReason: string | null;
  submittedAt: string;
  updatedAt: string;
};

type ProgramsApiResponse = {
  rows: ProgramRow[];
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
  };
  message?: string;
};

type StatusListResponse = {
  rows: ProgramRow[];
  message?: string;
};

type ProgramView = "queue" | "approved" | "rejected";

const programsResponseCache = new Map<string, { expiresAt: number; data: ProgramsApiResponse }>();
const PROGRAMS_CLIENT_CACHE_TTL_MS = 12_000;

function statusChip(status: ProgramStatus) {
  if (status === "Approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Pending" || status === "Needs Info") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function statusIcon(status: ProgramStatus) {
  if (status === "Approved") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "Pending" || status === "Needs Info") return <Clock3 className="h-4 w-4" />;
  return <XCircle className="h-4 w-4" />;
}

function ProgramsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-7 w-64 rounded bg-border/60" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-border/50" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`kpi-${i}`} className="h-28 rounded-2xl border border-border bg-card" />
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`row-${i}`} className="h-20 rounded-xl bg-border/50" />
        ))}
      </section>
    </div>
  );
}

export default function AdminProgramsPage() {
  const [rows, setRows] = useState<ProgramRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [summary, setSummary] = useState({ pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState<ProgramView>("queue");
  const [approvedRows, setApprovedRows] = useState<ProgramRow[]>([]);
  const [rejectedRows, setRejectedRows] = useState<ProgramRow[]>([]);
  const [statusListLoading, setStatusListLoading] = useState(false);
  const [showCreateProgram, setShowCreateProgram] = useState(false);

  const [newProgram, setNewProgram] = useState({
    title: "",
    category: "",
    programYear: "",
    mode: "",
    coordinatorName: "",
    coordinatorEmail: "",
    contactNumber: "",
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

  const loadPrograms = async (signal?: AbortSignal, forceFresh = false) => {
    const cacheKey = queryString;
    const cached = forceFresh ? undefined : programsResponseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      setRows(cached.data.rows || []);
      setSummary(cached.data.summary || { pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
      setTotalPages(cached.data.pagination?.totalPages || 1);
      setTotal(cached.data.pagination?.total || 0);
      setLoading(false);
      return;
    }

    try {
      setLoading((prev) => prev || rows.length === 0);
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const response = await fetch(`/api/admin/programs?${queryString}${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
        signal,
      });
      const payload = (await response.json()) as ProgramsApiResponse;

      if (!response.ok) {
        setMessage(payload.message || "Unable to load programs.");
        return;
      }

      setRows(payload.rows || []);
      setSummary(payload.summary || { pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
      setTotalPages(payload.pagination?.totalPages || 1);
      setTotal(payload.pagination?.total || 0);
      programsResponseCache.set(cacheKey, {
        expiresAt: Date.now() + PROGRAMS_CLIENT_CACHE_TTL_MS,
        data: payload,
      });
      setMessage("");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessage("Network error while loading programs.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStatusLists = async (forceFresh = false) => {
    setStatusListLoading(true);
    try {
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const [approvedRes, rejectedRes] = await Promise.all([
        fetch(`/api/admin/programs/lists?type=approved${refreshParam}`, { cache: forceFresh ? "no-store" : "default" }),
        fetch(`/api/admin/programs/lists?type=rejected${refreshParam}`, { cache: forceFresh ? "no-store" : "default" }),
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
      void loadPrograms(controller.signal);
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [queryString]);

  useEffect(() => {
    void loadStatusLists();
  }, []);

  const applyOptimisticStatusUpdate = (programId: string, status: ProgramStatus, rejectionReason?: string) => {
    const targetInQueue = rows.find((item) => item.id === programId);

    setRows((prev) =>
      prev.map((row) =>
        row.id === programId
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
      const withoutTarget = prev.filter((item) => item.id !== programId);
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
      const withoutTarget = prev.filter((item) => item.id !== programId);
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
      const existing = rows.find((item) => item.id === programId);
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

  const updateStatus = async (programId: string, status: ProgramStatus) => {
    const rejectionReason = status === "Rejected" ? window.prompt("Enter rejection reason") || "" : undefined;
    if (status === "Rejected" && !rejectionReason?.trim()) {
      setMessage("Rejection reason is required.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/programs/${programId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to update program status.");
        return;
      }

      applyOptimisticStatusUpdate(programId, status, rejectionReason);
      programsResponseCache.clear();
      await loadPrograms(undefined, true);
      await loadStatusLists(true);
      setMessage(`Program status updated to ${status}.`);
    } catch {
      setMessage("Network error while updating program.");
    } finally {
      setActionLoading(false);
    }
  };

  const bulkApprove = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/programs/bulk-approve", { method: "POST" });
      const payload = (await response.json()) as { updatedCount?: number; message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to run bulk approve.");
        return;
      }
      programsResponseCache.clear();
      await loadPrograms(undefined, true);
      await loadStatusLists(true);
      setMessage(`Bulk approve completed. ${payload.updatedCount || 0} record(s) updated.`);
    } catch {
      setMessage("Network error while bulk approving programs.");
    } finally {
      setActionLoading(false);
    }
  };

  const createProgram = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProgram),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to create program.");
        return;
      }

      setNewProgram({
        title: "",
        category: "",
        programYear: "",
        mode: "",
        coordinatorName: "",
        coordinatorEmail: "",
        contactNumber: "",
      });
      setPage(1);
      programsResponseCache.clear();
      await loadPrograms(undefined, true);
      await loadStatusLists(true);
      setMessage("Program created successfully.");
    } catch {
      setMessage("Network error while creating program.");
    } finally {
      setActionLoading(false);
    }
  };

  const exportCsv = () => {
    if (rows.length === 0) {
      setMessage("No records to export.");
      return;
    }

    const header = "ID,Title,Category,Year,Mode,Coordinator,Coordinator Email,Contact,Status,Updated At";
    const lines = rows.map((row) =>
      [
        row.id,
        row.title,
        row.category,
        row.programYear,
        row.mode,
        row.coordinatorName,
        row.coordinatorEmail,
        row.contactNumber,
        row.status,
        new Date(row.updatedAt).toLocaleString(),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );

    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `programs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const exportApprovedList = () => {
    if (approvedRows.length === 0) {
      setMessage("No approved programs to export.");
      return;
    }

    const header = "ID,Title,Category,Year,Mode,Coordinator,Coordinator Email,Contact,Approved At";
    const lines = approvedRows.map((row) =>
      [
        row.id,
        row.title,
        row.category,
        row.programYear,
        row.mode,
        row.coordinatorName,
        row.coordinatorEmail,
        row.contactNumber,
        new Date(row.updatedAt).toLocaleString(),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );

    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `approved-programs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <ProgramsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Programs Management</h2>
            <p className="mt-2 text-sm text-text-secondary">
                View and manage program applications, approvals, and rejections.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateProgram((prev) => !prev)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
          >
            {showCreateProgram ? "Close Create Program" : "Create New Program"}
          </button>
        </div>
        {message && <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{message}</p>}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Pending Approval</p>
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
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">Filters and Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveView("queue")}
              className={[
                "rounded-lg border px-3 py-2 text-xs font-semibold",
                activeView === "queue"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background text-text-primary hover:border-primary/30 hover:text-primary",
              ].join(" ")}
            >
              Queue View
            </button>
            <button
              onClick={() => setActiveView("approved")}
              className={[
                "rounded-lg border px-3 py-2 text-xs font-semibold",
                activeView === "approved"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background text-text-primary hover:border-primary/30 hover:text-primary",
              ].join(" ")}
            >
              Approved List
            </button>
            <button
              onClick={() => setActiveView("rejected")}
              className={[
                "rounded-lg border px-3 py-2 text-xs font-semibold",
                activeView === "rejected"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background text-text-primary hover:border-primary/30 hover:text-primary",
              ].join(" ")}
            >
              Rejected List
            </button>
            <button
              onClick={bulkApprove}
              disabled={actionLoading}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-70"
            >
              Bulk Approve
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              onClick={exportApprovedList}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
            >
              <Download className="h-3.5 w-3.5" /> Export Approved
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="md:col-span-2">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, coordinator, email"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
          </label>

          <label>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Status</span>
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
              <option>2024</option>
              <option>2025</option>
              <option>2026</option>
              <option>2027</option>
            </select>
          </label>
        </div>
      </section>

      {showCreateProgram && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Create New Program</h3>
          <form onSubmit={createProgram} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Program Title" value={newProgram.title} onChange={(e) => setNewProgram((p) => ({ ...p, title: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Category" value={newProgram.category} onChange={(e) => setNewProgram((p) => ({ ...p, category: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Program Year" value={newProgram.programYear} onChange={(e) => setNewProgram((p) => ({ ...p, programYear: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Mode (Online/Offline/Hybrid)" value={newProgram.mode} onChange={(e) => setNewProgram((p) => ({ ...p, mode: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Coordinator Name" value={newProgram.coordinatorName} onChange={(e) => setNewProgram((p) => ({ ...p, coordinatorName: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Coordinator Email" type="email" value={newProgram.coordinatorEmail} onChange={(e) => setNewProgram((p) => ({ ...p, coordinatorEmail: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm md:col-span-2" placeholder="Contact Number" value={newProgram.contactNumber} onChange={(e) => setNewProgram((p) => ({ ...p, contactNumber: e.target.value }))} required />

            <div className="md:col-span-3 flex justify-end">
              <button type="submit" disabled={actionLoading} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-70">
                Add Program
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Programs Table</h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-text-secondary">
            <Filter className="h-3.5 w-3.5" /> {total} records
          </span>
        </div>

        <div className="space-y-3">
          {activeView === "queue" && rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-text-primary">{row.title}</p>
                  <p className="text-xs text-text-secondary">{row.id} • {row.category} • {row.mode}</p>
                </div>
                <span className={["inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", statusChip(row.status)].join(" ")}>
                  {statusIcon(row.status)} {row.status}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                <span className="rounded-full border border-border bg-card px-2.5 py-1">Year: {row.programYear}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1">Coordinator: {row.coordinatorName}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1">Email: {row.coordinatorEmail}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1">Contact: {row.contactNumber}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1">Updated: {new Date(row.updatedAt).toLocaleString()}</span>
              </div>

              {row.rejectionReason && (
                <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  Rejection reason: {row.rejectionReason}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {(row.status === "Pending" || row.status === "Needs Info") && (
                  <button
                    onClick={() => updateStatus(row.id, "Approved")}
                    disabled={actionLoading}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-70"
                  >
                    Approve
                  </button>
                )}

                {row.status === "Pending" && (
                  <button
                    onClick={() => updateStatus(row.id, "Needs Info")}
                    disabled={actionLoading}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-70"
                  >
                    Needs Info
                  </button>
                )}

                {(row.status === "Pending" || row.status === "Needs Info") && (
                  <button
                    onClick={() => updateStatus(row.id, "Rejected")}
                    disabled={actionLoading}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-70"
                  >
                    Reject
                  </button>
                )}
              </div>
            </article>
          ))}

          {activeView === "approved" && !statusListLoading && approvedRows.map((row) => (
            <article key={`approved-${row.id}`} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <p className="text-sm font-black text-text-primary">{row.title}</p>
              <p className="text-xs text-text-secondary">{row.id} • {row.category} • Year {row.programYear}</p>
              <p className="mt-2 text-xs text-emerald-700">Approved at: {new Date(row.updatedAt).toLocaleString()}</p>
            </article>
          ))}

          {activeView === "rejected" && !statusListLoading && rejectedRows.map((row) => (
            <article key={`rejected-${row.id}`} className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
              <p className="text-sm font-black text-text-primary">{row.title}</p>
              <p className="text-xs text-text-secondary">{row.id} • {row.category} • Year {row.programYear}</p>
              <p className="mt-2 text-xs text-rose-700">Reason: {row.rejectionReason || "Rejected by admin"}</p>
            </article>
          ))}

          {statusListLoading && activeView !== "queue" && (
            <div className="space-y-2 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`status-list-loading-${i}`} className="h-16 rounded-xl bg-border/50" />
              ))}
            </div>
          )}

          {activeView === "queue" && rows.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-text-secondary">
              No records found for selected filters.
            </div>
          )}

          {activeView === "approved" && !statusListLoading && approvedRows.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-text-secondary">
              No approved programs found.
            </div>
          )}

          {activeView === "rejected" && !statusListLoading && rejectedRows.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-text-secondary">
              No rejected programs found.
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-text-secondary">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={activeView !== "queue" || page === 1}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={activeView !== "queue" || page === totalPages}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
