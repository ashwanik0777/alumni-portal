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

type OtpRequestResponse = {
  message?: string;
  verificationId?: string;
  expiresAt?: string;
  devOtp?: string;
};

type StatusListResponse = {
  rows: MemberRow[];
  message?: string;
};

type MemberView = "queue" | "approved" | "rejected";

const membersResponseCache = new Map<string, { expiresAt: number; data: MembersApiResponse }>();
const MEMBERS_CLIENT_CACHE_TTL_MS = 300_000; // 5 minutes

let cachedApprovedRows: MemberRow[] | null = null;
let cachedRejectedRows: MemberRow[] | null = null;
let statusListCacheTime = 0;

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
  const defaultQueryStr = "search=&status=All&batch=All&page=1&pageSize=10";
  const initialCache = membersResponseCache.get(defaultQueryStr);
  const isInitialCached = initialCache && initialCache.expiresAt > Date.now();

  const [rows, setRows] = useState<MemberRow[]>(() => isInitialCached ? initialCache!.data.rows || [] : []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [summary, setSummary] = useState(() => isInitialCached ? initialCache!.data.summary || { pendingCount: 0, approvedCount: 0, rejectedCount: 0 } : { pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  const [totalPages, setTotalPages] = useState(() => isInitialCached ? initialCache!.data.pagination?.totalPages || 1 : 1);
  const [total, setTotal] = useState(() => isInitialCached ? initialCache!.data.pagination?.total || 0 : 0);
  const [loading, setLoading] = useState(!isInitialCached);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState<MemberView>("queue");
  
  const isStatusCached = Date.now() - statusListCacheTime < MEMBERS_CLIENT_CACHE_TTL_MS;
  const [approvedRows, setApprovedRows] = useState<MemberRow[]>(() => isStatusCached ? cachedApprovedRows || [] : []);
  const [rejectedRows, setRejectedRows] = useState<MemberRow[]>(() => isStatusCached ? cachedRejectedRows || [] : []);
  const [statusListLoading, setStatusListLoading] = useState(!isStatusCached);
  const [otpVerificationId, setOtpVerificationId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState("");
  const [otpRequestedEmail, setOtpRequestedEmail] = useState("");
  const [showCreateMember, setShowCreateMember] = useState(false);

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

  const loadMembers = async (signal?: AbortSignal, forceFresh = false) => {
    const cacheKey = queryString;
    const cached = forceFresh ? undefined : membersResponseCache.get(cacheKey);
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
      const response = await fetch(`/api/admin/members?${queryString}${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
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
      membersResponseCache.set(cacheKey, {
        expiresAt: Date.now() + MEMBERS_CLIENT_CACHE_TTL_MS,
        data: payload,
      });
      setMessage("");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessage("Network error while loading members.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStatusLists = async (forceFresh = false) => {
    if (!forceFresh && isStatusCached) {
      setStatusListLoading(false);
      return;
    }
    setStatusListLoading(true);
    try {
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const [approvedRes, rejectedRes] = await Promise.all([
        fetch(`/api/admin/members/lists?type=approved${refreshParam}`, { cache: forceFresh ? "no-store" : "default" }),
        fetch(`/api/admin/members/lists?type=rejected${refreshParam}`, { cache: forceFresh ? "no-store" : "default" }),
      ]);

      const approvedPayload = (await approvedRes.json()) as StatusListResponse;
      const rejectedPayload = (await rejectedRes.json()) as StatusListResponse;

      if (approvedRes.ok) {
        setApprovedRows(approvedPayload.rows || []);
        cachedApprovedRows = approvedPayload.rows || [];
      }
      if (rejectedRes.ok) {
        setRejectedRows(rejectedPayload.rows || []);
        cachedRejectedRows = rejectedPayload.rows || [];
      }
      statusListCacheTime = Date.now();
    } catch {
      setMessage("Unable to load approval/rejection lists.");
    } finally {
      setStatusListLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadMembers(controller.signal);
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [queryString]);

  useEffect(() => {
    void loadStatusLists();
  }, []);

  const applyOptimisticStatusUpdate = (memberId: string, status: MemberStatus, rejectionReason?: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === memberId
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
      const targetInQueue = rows.find((item) => item.id === memberId);
      const withoutTarget = prev.filter((item) => item.id !== memberId);
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
      const targetInQueue = rows.find((item) => item.id === memberId);
      const withoutTarget = prev.filter((item) => item.id !== memberId);
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
      const existing = rows.find((item) => item.id === memberId);
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

  const updateStatus = async (memberId: string, status: MemberStatus) => {
    const rejectionReason = status === "Rejected" ? window.prompt("Enter rejection reason") || "" : undefined;
    if (status === "Rejected" && !rejectionReason?.trim()) {
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

      applyOptimisticStatusUpdate(memberId, status, rejectionReason);
      membersResponseCache.clear();
      await loadMembers(undefined, true);
      await loadStatusLists(true);
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
      membersResponseCache.clear();
      await loadMembers(undefined, true);
      await loadStatusLists(true);
      setMessage(`Bulk approve completed. ${payload.updatedCount || 0} record(s) updated.`);
    } catch {
      setMessage("Network error while bulk approving.");
    } finally {
      setActionLoading(false);
    }
  };

  const requestOtp = async () => {
    const email = newMember.email.trim().toLowerCase();
    if (!email) {
      setMessage("Enter member email first for OTP request.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/members/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as OtpRequestResponse;
      if (!response.ok || !payload.verificationId) {
        setMessage(payload.message || "Unable to request OTP.");
        return;
      }

      setOtpVerificationId(payload.verificationId);
      setOtpExpiresAt(payload.expiresAt || "");
      setOtpRequestedEmail(email);
      if (payload.devOtp) {
        setMessage(`OTP sent. Demo OTP: ${payload.devOtp}`);
      } else {
        setMessage("OTP sent successfully.");
      }
    } catch {
      setMessage("Network error while requesting OTP.");
    } finally {
      setActionLoading(false);
    }
  };

  const createMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!otpVerificationId || !otpCode) {
      setMessage("Request and verify OTP first to create member.");
      return;
    }

    if (newMember.email.trim().toLowerCase() !== otpRequestedEmail) {
      setMessage("OTP was generated for a different email. Please request OTP again.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMember,
          otpVerificationId,
          otpCode,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to create member.");
        return;
      }

      setNewMember({ fullName: "", email: "", passingYear: "", house: "", mobile: "", fatherName: "" });
      setOtpVerificationId("");
      setOtpCode("");
      setOtpExpiresAt("");
      setOtpRequestedEmail("");
      setPage(1);
      membersResponseCache.clear();
      await loadMembers(undefined, true);
      await loadStatusLists(true);
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

  const exportApprovedList = () => {
    if (approvedRows.length === 0) {
      setMessage("No approved records to export.");
      return;
    }

    const header = "ID,Full Name,Email,Batch,House,Mobile,Father Name,Approved At";
    const lines = approvedRows.map((row) =>
      [
        row.id,
        row.fullName,
        row.email,
        row.passingYear,
        row.house,
        row.mobile,
        row.fatherName,
        new Date(row.updatedAt).toLocaleString(),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `approved-members-${new Date().toISOString().slice(0, 10)}.csv`;
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Members Management</h2>
            <p className="mt-2 text-sm text-text-secondary">
                View and manage member applications, approvals, and rejections.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateMember((prev) => !prev)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
          >
            {showCreateMember ? "Close Create Member" : "Create New Member"}
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

      {showCreateMember && (
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-lg font-bold">Create New Member</h3>
        <form onSubmit={createMember} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Full Name" value={newMember.fullName} onChange={(e) => setNewMember((p) => ({ ...p, fullName: e.target.value }))} required />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Email" type="email" value={newMember.email} onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))} required />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Passing Year" value={newMember.passingYear} onChange={(e) => setNewMember((p) => ({ ...p, passingYear: e.target.value }))} required />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="House" value={newMember.house} onChange={(e) => setNewMember((p) => ({ ...p, house: e.target.value }))} required />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Mobile" value={newMember.mobile} onChange={(e) => setNewMember((p) => ({ ...p, mobile: e.target.value }))} required />
          <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Father Name" value={newMember.fatherName} onChange={(e) => setNewMember((p) => ({ ...p, fatherName: e.target.value }))} required />

          <input
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm md:col-span-2"
            placeholder="Enter OTP"
            value={otpCode}
            onChange={(event) => setOtpCode(event.target.value)}
            required
          />
          <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-secondary">
            {otpVerificationId
              ? `OTP linked • Expires: ${otpExpiresAt ? new Date(otpExpiresAt).toLocaleTimeString() : "soon"}`
              : "Request OTP to verify member creation"}
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button type="button" onClick={requestOtp} disabled={actionLoading} className="mr-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary disabled:opacity-70">
              Request OTP
            </button>
            <button type="submit" disabled={actionLoading} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-70">
              <UserPlus className="h-4 w-4" /> Add Member
            </button>
          </div>
        </form>
      </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Members Table</h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-text-secondary">
            <Filter className="h-3.5 w-3.5" /> {total} records
          </span>
        </div>

        <div className="space-y-3">
          {activeView === "queue" && rows.map((row) => (
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
              <p className="text-sm font-black text-text-primary">{row.fullName}</p>
              <p className="text-xs text-text-secondary">{row.id} • {row.email} • Batch {row.passingYear}</p>
              <p className="mt-2 text-xs text-emerald-700">Approved at: {new Date(row.updatedAt).toLocaleString()}</p>
            </article>
          ))}

          {activeView === "rejected" && !statusListLoading && rejectedRows.map((row) => (
            <article key={`rejected-${row.id}`} className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
              <p className="text-sm font-black text-text-primary">{row.fullName}</p>
              <p className="text-xs text-text-secondary">{row.id} • {row.email} • Batch {row.passingYear}</p>
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
              No approved records found.
            </div>
          )}

          {activeView === "rejected" && !statusListLoading && rejectedRows.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-text-secondary">
              No rejected records found.
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
