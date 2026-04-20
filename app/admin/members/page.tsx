"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  Search,
  UserPlus,
  XCircle,
} from "lucide-react";

type MemberStatus = "Pending" | "Approved" | "Rejected" | "Needs Info";

type MemberRow = {
  id: string;
  fullName: string;
  email: string;
  passingYear: string;
  house: string;
  mobile: string;
  fatherName: string;
  status: MemberStatus;
  rejectionReason: string | null;
  submittedAt: string;
  updatedAt: string;
};

type MembersApiResponse = {
  rows: MemberRow[];
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

function statusChip(status: MemberStatus) {
  if (status === "Approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Pending" || status === "Needs Info") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function statusIcon(status: MemberStatus) {
  if (status === "Approved") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "Pending" || status === "Needs Info") return <Clock3 className="h-4 w-4" />;
  return <XCircle className="h-4 w-4" />;
}

function MembersSkeleton() {
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

export default function AdminMembersPage() {
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [summary, setSummary] = useState({ pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [newMember, setNewMember] = useState({
    fullName: "",
    email: "",
    passingYear: "",
    house: "",
    mobile: "",
    fatherName: "",
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("search", search);
    params.set("status", statusFilter);
    params.set("batch", batchFilter);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params.toString();
  }, [batchFilter, page, pageSize, search, statusFilter]);

  const loadMembers = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/members?${queryString}`, {
        cache: "no-store",
        signal,
      });
      const payload = (await response.json()) as MembersApiResponse;

      if (!response.ok) {
        setMessage(payload.message || "Unable to load members.");
        return;
      }

      setRows(payload.rows || []);
      setSummary(payload.summary || { pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
      setTotalPages(payload.pagination?.totalPages || 1);
      setTotal(payload.pagination?.total || 0);
      setMessage("");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessage("Network error while loading members.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadMembers(controller.signal);
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [queryString]);

  const updateStatus = async (memberId: string, status: MemberStatus) => {
    const rejectionReason = status === "Rejected" ? window.prompt("Enter rejection reason") || "" : undefined;
    if (status === "Rejected" && !rejectionReason.trim()) {
      setMessage("Rejection reason is required.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to update member status.");
        return;
      }

      await loadMembers();
      setMessage(`Member status updated to ${status}.`);
    } catch {
      setMessage("Network error while updating member.");
    } finally {
      setActionLoading(false);
    }
  };

  const bulkApprove = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/members/bulk-approve", { method: "POST" });
      const payload = (await response.json()) as { updatedCount?: number; message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to run bulk approve.");
        return;
      }
      await loadMembers();
      setMessage(`Bulk approve completed. ${payload.updatedCount || 0} record(s) updated.`);
    } catch {
      setMessage("Network error while bulk approving.");
    } finally {
      setActionLoading(false);
    }
  };

  const createMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to create member.");
        return;
      }

      setNewMember({ fullName: "", email: "", passingYear: "", house: "", mobile: "", fatherName: "" });
      setPage(1);
      await loadMembers();
      setMessage("Member created successfully.");
    } catch {
      setMessage("Network error while creating member.");
    } finally {
      setActionLoading(false);
    }
  };

  const exportCsv = () => {
    if (rows.length === 0) {
      setMessage("No records to export.");
      return;
    }

    const header = "ID,Full Name,Email,Batch,House,Mobile,Father Name,Status,Updated At";
    const lines = rows.map((row) =>
      [
        row.id,
        row.fullName,
        row.email,
        row.passingYear,
        row.house,
        row.mobile,
        row.fatherName,
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
    anchor.download = `members-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <MembersSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <h2 className="text-2xl font-black sm:text-3xl">Members Management</h2>
        <p className="mt-2 text-sm text-text-secondary">Fully dynamic member records from database with protected admin APIs.</p>
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
                placeholder="Search by name, email, mobile"
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
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Batch</span>
            <select
              value={batchFilter}
              onChange={(event) => {
                setBatchFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
            >
              <option>All</option>
              <option>2012</option>
              <option>2015</option>
              <option>2018</option>
              <option>2021</option>
              <option>2024</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-lg font-bold">Create New Member</h3>
        <form onSubmit={createMember} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Full Name" value={newMember.fullName} onChange={(e) => setNewMember((p) => ({ ...p, fullName: e.target.value }))} required />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Email" type="email" value={newMember.email} onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))} required />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Passing Year" value={newMember.passingYear} onChange={(e) => setNewMember((p) => ({ ...p, passingYear: e.target.value }))} required />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="House" value={newMember.house} onChange={(e) => setNewMember((p) => ({ ...p, house: e.target.value }))} required />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Mobile" value={newMember.mobile} onChange={(e) => setNewMember((p) => ({ ...p, mobile: e.target.value }))} required />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Father Name" value={newMember.fatherName} onChange={(e) => setNewMember((p) => ({ ...p, fatherName: e.target.value }))} required />
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" disabled={actionLoading} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-70">
              <UserPlus className="h-4 w-4" /> Add Member
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Members Table</h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-text-secondary">
            <Filter className="h-3.5 w-3.5" /> {total} records
          </span>
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-text-primary">{row.fullName}</p>
                  <p className="text-xs text-text-secondary">{row.id} • {row.email} • {row.mobile}</p>
                </div>
                <span className={["inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", statusChip(row.status)].join(" ")}>
                  {statusIcon(row.status)} {row.status}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                <span className="rounded-full border border-border bg-card px-2.5 py-1">Batch: {row.passingYear}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1">House: {row.house}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1">Father: {row.fatherName}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1">Updated: {new Date(row.updatedAt).toLocaleString()}</span>
              </div>

              {row.rejectionReason && (
                <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  Rejection reason: {row.rejectionReason}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => updateStatus(row.id, "Approved")}
                  disabled={actionLoading}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-70"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(row.id, "Needs Info")}
                  disabled={actionLoading}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-70"
                >
                  Needs Info
                </button>
                <button
                  onClick={() => updateStatus(row.id, "Rejected")}
                  disabled={actionLoading}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-70"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}

          {rows.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-text-secondary">
              No records found for selected filters.
            </div>
          )}
        </div>

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
