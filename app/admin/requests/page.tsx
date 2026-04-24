"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  Inbox,
  MessageSquarePlus,
  Search,
  XCircle,
} from "lucide-react";

type RequestStatus = "Open" | "In Progress" | "Resolved" | "Closed";
type RequestPriority = "Low" | "Medium" | "High" | "Critical";
type RequestCategory = "Support" | "Feedback" | "Bug Report" | "Feature Request" | "Account" | "Other";

type RequestRow = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  adminNote: string | null;
  submittedAt: string;
  updatedAt: string;
};

type RequestsApiResponse = {
  rows: RequestRow[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  summary: {
    openCount: number;
    inProgressCount: number;
    resolvedCount: number;
    closedCount: number;
    criticalCount: number;
  };
  message?: string;
};

const requestsResponseCache = new Map<string, { expiresAt: number; data: RequestsApiResponse }>();
const REQUESTS_CLIENT_CACHE_TTL_MS = 300_000; // 5 min

function statusChip(status: RequestStatus) {
  if (status === "Open") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "In Progress") return "border-blue-200 bg-blue-50 text-blue-700";
  if (status === "Resolved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-gray-200 bg-gray-50 text-gray-600";
}

function statusIcon(status: RequestStatus) {
  if (status === "Open") return <Inbox className="h-4 w-4" />;
  if (status === "In Progress") return <Clock3 className="h-4 w-4" />;
  if (status === "Resolved") return <CheckCircle2 className="h-4 w-4" />;
  return <XCircle className="h-4 w-4" />;
}

function priorityChip(priority: RequestPriority) {
  if (priority === "Critical") return "border-rose-300 bg-rose-50 text-rose-700";
  if (priority === "High") return "border-orange-200 bg-orange-50 text-orange-700";
  if (priority === "Medium") return "border-yellow-200 bg-yellow-50 text-yellow-700";
  return "border-gray-200 bg-gray-50 text-gray-600";
}

function RequestsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-7 w-64 rounded bg-border/60" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-border/50" />
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`kpi-${i}`} className="h-24 rounded-2xl border border-border bg-card" />
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

export default function AdminRequestsPage() {
  const defaultQueryStr = "search=&status=All&priority=All&category=All&page=1&pageSize=10";
  const initialCache = requestsResponseCache.get(defaultQueryStr);
  const isInitialCached = initialCache && initialCache.expiresAt > Date.now();

  const [rows, setRows] = useState<RequestRow[]>(() => isInitialCached ? initialCache!.data.rows || [] : []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [summary, setSummary] = useState(() => isInitialCached ? initialCache!.data.summary || { openCount: 0, inProgressCount: 0, resolvedCount: 0, closedCount: 0, criticalCount: 0 } : { openCount: 0, inProgressCount: 0, resolvedCount: 0, closedCount: 0, criticalCount: 0 });
  const [totalPages, setTotalPages] = useState(() => isInitialCached ? initialCache!.data.pagination?.totalPages || 1 : 1);
  const [total, setTotal] = useState(() => isInitialCached ? initialCache!.data.pagination?.total || 0 : 0);
  const [loading, setLoading] = useState(!isInitialCached);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [showCreateRequest, setShowCreateRequest] = useState(false);

  const [newRequest, setNewRequest] = useState({
    requesterName: "",
    requesterEmail: "",
    subject: "",
    description: "",
    category: "Support" as RequestCategory,
    priority: "Medium" as RequestPriority,
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("search", search);
    params.set("status", statusFilter);
    params.set("priority", priorityFilter);
    params.set("category", categoryFilter);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [search, statusFilter, priorityFilter, categoryFilter, page, pageSize]);

  const loadRequests = async (signal?: AbortSignal, forceFresh = false) => {
    const cacheKey = queryString;
    const cached = forceFresh ? undefined : requestsResponseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      setRows(cached.data.rows || []);
      setSummary(cached.data.summary || { openCount: 0, inProgressCount: 0, resolvedCount: 0, closedCount: 0, criticalCount: 0 });
      setTotalPages(cached.data.pagination?.totalPages || 1);
      setTotal(cached.data.pagination?.total || 0);
      setLoading(false);
      return;
    }

    try {
      setLoading((prev) => prev || rows.length === 0);
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const response = await fetch(`/api/admin/requests?${queryString}${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
        signal,
      });
      const payload = (await response.json()) as RequestsApiResponse;

      if (!response.ok) {
        setMessage(payload.message || "Unable to load requests.");
        return;
      }

      setRows(payload.rows || []);
      setSummary(payload.summary || { openCount: 0, inProgressCount: 0, resolvedCount: 0, closedCount: 0, criticalCount: 0 });
      setTotalPages(payload.pagination?.totalPages || 1);
      setTotal(payload.pagination?.total || 0);
      requestsResponseCache.set(cacheKey, { expiresAt: Date.now() + REQUESTS_CLIENT_CACHE_TTL_MS, data: payload });
      setMessage("");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessage("Network error while loading requests.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadRequests(controller.signal);
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const updateStatus = async (requestId: string, status: RequestStatus) => {
    let adminNote: string | undefined;
    if (status === "In Progress" || status === "Resolved") {
      adminNote = window.prompt(`Add admin note for "${status}" status:`) || undefined;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to update request status.");
        return;
      }

      // Optimistic update
      setRows((prev) =>
        prev.map((row) =>
          row.id === requestId
            ? { ...row, status, adminNote: adminNote || row.adminNote, updatedAt: new Date().toISOString() }
            : row,
        ),
      );

      await loadRequests(undefined, true);
      setMessage(`Request status updated to ${status}.`);
    } catch {
      setMessage("Network error while updating request.");
    } finally {
      setActionLoading(false);
    }
  };

  const createRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequest),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to create request.");
        return;
      }

      setNewRequest({ requesterName: "", requesterEmail: "", subject: "", description: "", category: "Support", priority: "Medium" });
      setShowCreateRequest(false);
      setPage(1);
      await loadRequests(undefined, true);
      setMessage("Request created successfully.");
    } catch {
      setMessage("Network error while creating request.");
    } finally {
      setActionLoading(false);
    }
  };

  const exportCsv = () => {
    if (rows.length === 0) {
      setMessage("No requests to export.");
      return;
    }

    const header = "ID,Requester,Email,Subject,Category,Priority,Status,Admin Note,Submitted,Updated";
    const lines = rows.map((row) =>
      [
        row.id,
        row.requesterName,
        row.requesterEmail,
        row.subject,
        row.category,
        row.priority,
        row.status,
        row.adminNote || "",
        new Date(row.submittedAt).toLocaleString(),
        new Date(row.updatedAt).toLocaleString(),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );

    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `requests-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <RequestsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Requests Management</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Track and manage support tickets, feedback, bug reports, and feature requests from alumni.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateRequest((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
          >
            <MessageSquarePlus className="h-4 w-4" />
            {showCreateRequest ? "Close" : "New Request"}
          </button>
        </div>
        {message && <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{message}</p>}
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Open</p>
          <p className="mt-2 text-2xl font-black text-amber-600">{summary.openCount}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">In Progress</p>
          <p className="mt-2 text-2xl font-black text-blue-600">{summary.inProgressCount}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Resolved</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{summary.resolvedCount}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Closed</p>
          <p className="mt-2 text-2xl font-black text-text-primary">{summary.closedCount}</p>
        </article>
        <article className="col-span-2 xl:col-span-1 rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">
            <AlertTriangle className="h-3.5 w-3.5" /> Critical
          </p>
          <p className="mt-2 text-2xl font-black text-rose-700">{summary.criticalCount}</p>
        </article>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">Filters and Actions</h3>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
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
                placeholder="Search by name, email, subject"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
          </label>

          <label>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
            >
              <option>All</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Priority</span>
            <select
              value={priorityFilter}
              onChange={(event) => { setPriorityFilter(event.target.value); setPage(1); }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
            >
              <option>All</option>
              <option>Support</option>
              <option>Feedback</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>Account</option>
              <option>Other</option>
            </select>
          </label>
        </div>
      </section>

      {/* Create Request Form */}
      {showCreateRequest && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Create New Request</h3>
          <form onSubmit={createRequest} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Requester Name" value={newRequest.requesterName} onChange={(e) => setNewRequest((p) => ({ ...p, requesterName: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Requester Email" type="email" value={newRequest.requesterEmail} onChange={(e) => setNewRequest((p) => ({ ...p, requesterEmail: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Subject" value={newRequest.subject} onChange={(e) => setNewRequest((p) => ({ ...p, subject: e.target.value }))} required />
            <textarea className="rounded-xl border border-border bg-background px-3 py-2 text-sm md:col-span-2 min-h-[80px]" placeholder="Description" value={newRequest.description} onChange={(e) => setNewRequest((p) => ({ ...p, description: e.target.value }))} />
            <div className="space-y-3">
              <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={newRequest.category} onChange={(e) => setNewRequest((p) => ({ ...p, category: e.target.value as RequestCategory }))}>
                <option value="Support">Support</option>
                <option value="Feedback">Feedback</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Account">Account</option>
                <option value="Other">Other</option>
              </select>
              <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={newRequest.priority} onChange={(e) => setNewRequest((p) => ({ ...p, priority: e.target.value as RequestPriority }))}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button type="submit" disabled={actionLoading} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-70">
                <MessageSquarePlus className="h-4 w-4" /> Submit Request
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Requests List */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Requests Queue</h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-text-secondary">
            <Filter className="h-3.5 w-3.5" /> {total} requests
          </span>
        </div>

        <div className="space-y-3">
          {rows.map((row) => {
            const expanded = expandedId === row.id;

            return (
              <article key={row.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-text-primary truncate">{row.subject}</p>
                    <p className="text-xs text-text-secondary">{row.id} • {row.requesterName} • {row.requesterEmail}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={["inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold", priorityChip(row.priority)].join(" ")}>
                      {row.priority === "Critical" && <AlertTriangle className="h-3 w-3" />}
                      {row.priority}
                    </span>
                    <span className={["inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold", statusChip(row.status)].join(" ")}>
                      {statusIcon(row.status)} {row.status}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">{row.category}</span>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">Submitted: {new Date(row.submittedAt).toLocaleDateString()}</span>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">Updated: {new Date(row.updatedAt).toLocaleString()}</span>
                </div>

                {row.adminNote && (
                  <p className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    Admin Note: {row.adminNote}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setExpandedId(expanded ? "" : row.id)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35"
                  >
                    {expanded ? "Hide Details" : "View Details"}
                  </button>

                  {row.status === "Open" && (
                    <button
                      onClick={() => updateStatus(row.id, "In Progress")}
                      disabled={actionLoading}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-70"
                    >
                      Start Progress
                    </button>
                  )}

                  {(row.status === "Open" || row.status === "In Progress") && (
                    <button
                      onClick={() => updateStatus(row.id, "Resolved")}
                      disabled={actionLoading}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-70"
                    >
                      Resolve
                    </button>
                  )}

                  {row.status !== "Closed" && (
                    <button
                      onClick={() => updateStatus(row.id, "Closed")}
                      disabled={actionLoading}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-70"
                    >
                      Close
                    </button>
                  )}

                  {row.status === "Closed" && (
                    <button
                      onClick={() => updateStatus(row.id, "Open")}
                      disabled={actionLoading}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-70"
                    >
                      Reopen
                    </button>
                  )}
                </div>

                {expanded && (
                  <div className="mt-3 rounded-xl border border-border bg-card p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">Full Description</p>
                    <p className="mt-2 text-sm text-text-primary whitespace-pre-wrap">
                      {row.description || "No description provided."}
                    </p>
                  </div>
                )}
              </article>
            );
          })}

          {rows.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-text-secondary">
              No requests found for selected filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-text-secondary">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
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
