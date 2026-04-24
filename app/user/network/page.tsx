"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Filter,
  Handshake,
  MapPin,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type ConnectionRequest = {
  id: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  message: string;
  status: "Pending" | "Accepted" | "Declined" | "Cancelled";
  createdAt: string;
  updatedAt: string;
};

type UserConnection = {
  connectionId: string;
  name: string;
  email: string;
  batch: string;
  city: string;
  role: string;
  company: string;
  connectedAt: string;
};

type DiscoverProfile = {
  profileId: string;
  fullName: string;
  email: string;
  batch: string;
  city: string;
  role: string;
  company: string;
  reason: string;
};

type ConnectionsApiResponse = {
  incoming: ConnectionRequest[];
  sent: ConnectionRequest[];
  connections: UserConnection[];
  discover: DiscoverProfile[];
  summary: {
    pendingIncoming: number;
    pendingSent: number;
    totalConnections: number;
    discoverCount: number;
  };
  message?: string;
};

let networkCache: { data: ConnectionsApiResponse; expiresAt: number } | null = null;
const NETWORK_CACHE_TTL_MS = 10_000;

function getStoredUserProfile() {
  if (typeof window === "undefined") return { fullName: "", email: "" };
  try {
    const raw = localStorage.getItem("user_profile_draft_v1");
    if (raw) {
      const p = JSON.parse(raw) as { fullName?: string; email?: string };
      return { fullName: p.fullName?.trim() || "", email: p.email?.trim().toLowerCase() || "" };
    }
  } catch { /* skip */ }
  return { fullName: "Aman Sharma", email: "aman.alumni@jnvportal.in" };
}

function NetworkSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="h-5 w-40 rounded bg-border/60" />
        <div className="mt-3 h-7 w-72 max-w-full rounded bg-border/60" />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`m-${i}`} className="h-16 rounded-lg border border-border bg-background" />
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="h-10 w-80 rounded-xl bg-border/40" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`r-${i}`} className="h-24 rounded-lg bg-border/40" />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function UserNetworkPage() {
  const profile = useMemo(() => getStoredUserProfile(), []);
  const [tab, setTab] = useState<"connections" | "requests" | "discover">("connections");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [incoming, setIncoming] = useState<ConnectionRequest[]>([]);
  const [discover, setDiscover] = useState<DiscoverProfile[]>([]);
  const [summary, setSummary] = useState({ pendingIncoming: 0, pendingSent: 0, totalConnections: 0, discoverCount: 0 });

  const loadData = useCallback(async (forceFresh = false) => {
    if (!profile.email) { setLoading(false); return; }

    if (!forceFresh && networkCache && networkCache.expiresAt > Date.now()) {
      applyData(networkCache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading((prev) => prev || connections.length === 0);
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const res = await fetch(`/api/user/connections?email=${encodeURIComponent(profile.email)}&search=${encodeURIComponent(search)}${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
      });
      const data = (await res.json()) as ConnectionsApiResponse;
      if (!res.ok) { setMessage(data.message || "Unable to load network."); return; }

      applyData(data);
      networkCache = { data, expiresAt: Date.now() + NETWORK_CACHE_TTL_MS };
      setMessage("");
    } catch {
      setMessage("Network error while loading data.");
    } finally {
      setLoading(false);
    }
  }, [profile.email, search]);

  function applyData(data: ConnectionsApiResponse) {
    setConnections(data.connections || []);
    setIncoming((data.incoming || []).filter((r) => r.status === "Pending"));
    setDiscover(data.discover || []);
    setSummary(data.summary || { pendingIncoming: 0, pendingSent: 0, totalConnections: 0, discoverCount: 0 });
  }

  useEffect(() => { void loadData(); }, [loadData]);

  const handleAccept = async (requestId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/user/connections/requests/${encodeURIComponent(requestId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: profile.email, action: "accept" }),
      });
      const d = await res.json();
      if (!res.ok) { setMessage(d.message || "Error accepting."); return; }
      networkCache = null;
      await loadData(true);
      setMessage("Connection accepted!");
    } catch { setMessage("Network error."); }
    finally { setActionLoading(false); }
  };

  const handleDecline = async (requestId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/user/connections/requests/${encodeURIComponent(requestId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: profile.email, action: "decline" }),
      });
      const d = await res.json();
      if (!res.ok) { setMessage(d.message || "Error declining."); return; }
      networkCache = null;
      await loadData(true);
      setMessage("Request declined.");
    } catch { setMessage("Network error."); }
    finally { setActionLoading(false); }
  };

  const handleConnect = async (receiverEmail: string) => {
    const msg = window.prompt("Connection message", "Let us connect through alumni network.") || "";
    if (!msg.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/user/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderEmail: profile.email, senderName: profile.fullName, receiverEmail, message: msg }),
      });
      const d = await res.json();
      if (!res.ok) { setMessage(d.message || "Unable to send."); return; }
      networkCache = null;
      await loadData(true);
      setMessage("Connection request sent!");
    } catch { setMessage("Network error."); }
    finally { setActionLoading(false); }
  };

  const filteredConnections = useMemo(() => {
    if (!search.trim()) return connections;
    const q = search.toLowerCase();
    return connections.filter((c) =>
      c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) || c.city.toLowerCase().includes(q),
    );
  }, [connections, search]);

  if (loading) return <NetworkSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Users className="h-3.5 w-3.5" /> My Network
            </p>
            <h2 className="mt-2 text-2xl font-black">Grow your alumni circle with purpose</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Manage connections, respond to requests, and discover alumni aligned to your goals.
            </p>
          </div>
          <button
            onClick={() => { networkCache = null; void loadData(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/30"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total Connections" value={String(summary.totalConnections)} />
          <StatCard label="Pending Requests" value={String(summary.pendingIncoming)} />
          <StatCard label="Discover People" value={String(summary.discoverCount)} />
          <StatCard label="Sent Pending" value={String(summary.pendingSent)} />
        </div>

        {message && (
          <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{message}</p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            {(["connections", "requests", "discover"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  tab === key ? "bg-primary text-white" : "text-text-secondary hover:text-primary"
                }`}
              >
                {key === "connections" ? `Connections (${summary.totalConnections})` : key === "requests" ? `Requests (${summary.pendingIncoming})` : `Discover (${summary.discoverCount})`}
              </button>
            ))}
          </div>

          {tab === "connections" && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people, role, company"
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-72"
              />
            </div>
          )}
        </div>

        {/* Connections Tab */}
        {tab === "connections" && (
          <div className="mt-4 grid gap-3">
            {filteredConnections.length === 0 ? (
              <EmptyState text="No connections yet. Discover alumni and send requests!" />
            ) : (
              filteredConnections.map((item) => (
                <article key={item.connectionId} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary">{item.role} at {item.company}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      <Handshake className="h-3.5 w-3.5" /> Connected
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                      <Clock3 className="h-3.5 w-3.5" /> Batch {item.batch}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                      <MapPin className="h-3.5 w-3.5" /> {item.city}
                    </span>
                    <span className="rounded-full bg-card px-2 py-1">
                      Since {new Date(item.connectedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === "requests" && (
          <div className="mt-4 grid gap-3">
            {incoming.length === 0 ? (
              <EmptyState text="No pending requests right now." />
            ) : (
              incoming.map((item) => (
                <article key={item.id} className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-bold">{item.senderName}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{item.senderEmail}</p>
                  <p className="mt-2 text-sm text-text-secondary">{item.message}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleAccept(item.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-70"
                    >
                      <Check className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDecline(item.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-70"
                    >
                      <X className="h-3.5 w-3.5" /> Decline
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Discover Tab */}
        {tab === "discover" && (
          <div className="mt-4 grid gap-3">
            {discover.length === 0 ? (
              <EmptyState text="No more suggestions right now. Check again later." />
            ) : (
              discover.map((item) => (
                <article key={item.profileId} className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-bold">{item.fullName}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{item.role} • {item.company}</p>
                  <p className="mt-1 text-xs text-text-secondary">{item.city} • Batch {item.batch}</p>
                  <p className="mt-2 text-sm text-text-secondary">{item.reason}</p>
                  <button
                    type="button"
                    onClick={() => void handleConnect(item.email)}
                    disabled={actionLoading}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-70"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Send Connection Request
                  </button>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-background px-3 py-3">
      <p className="text-xl font-black text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </article>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center">
      <p className="text-sm font-semibold text-text-primary">Nothing to show</p>
      <p className="mt-1 text-xs text-text-secondary">{text}</p>
    </div>
  );
}
