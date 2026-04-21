"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Filter,
  Handshake,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type ConnectionRequestStatus = "Pending" | "Accepted" | "Declined" | "Cancelled";

type ConnectionRequest = {
  id: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  message: string;
  status: ConnectionRequestStatus;
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

type RequestTab = "incoming" | "sent" | "connections" | "discover";

const connectionsCache = new Map<string, { expiresAt: number; data: ConnectionsApiResponse }>();
const CONNECTIONS_CACHE_TTL_MS = 8_000;

function getStoredUserProfile() {
  if (typeof window === "undefined") {
    return {
      fullName: "",
      email: "",
    };
  }

  try {
    const profileRaw = localStorage.getItem("user_profile_draft_v1");
    if (profileRaw) {
      const parsed = JSON.parse(profileRaw) as { fullName?: string; email?: string };
      return {
        fullName: parsed.fullName?.trim() || "",
        email: parsed.email?.trim().toLowerCase() || "",
      };
    }
  } catch {
    // Ignore malformed local storage and continue with fallback values.
  }

  return {
    fullName: "Aman Sharma",
    email: "aman.alumni@jnvportal.in",
  };
}

function statusChip(status: ConnectionRequestStatus) {
  if (status === "Accepted") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Pending") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function RequestsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="h-7 w-64 rounded bg-border/60" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-border/50" />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-card" />
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-border/50" />
        ))}
      </section>
    </div>
  );
}

export default function UserRequestsPage() {
  const initialProfile = useMemo(() => getStoredUserProfile(), []);

  const [profile, setProfile] = useState(initialProfile);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tab, setTab] = useState<RequestTab>("incoming");

  const [incoming, setIncoming] = useState<ConnectionRequest[]>([]);
  const [sent, setSent] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [discover, setDiscover] = useState<DiscoverProfile[]>([]);
  const [summary, setSummary] = useState({
    pendingIncoming: 0,
    pendingSent: 0,
    totalConnections: 0,
    discoverCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 240);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("email", profile.email);
    params.set("search", debouncedSearch);
    return params.toString();
  }, [profile.email, debouncedSearch]);

  const loadDashboard = useCallback(async (signal?: AbortSignal, forceFresh = false) => {
    if (!profile.email) {
      setLoading(false);
      setMessage("Please update your profile email to access request queue.");
      return;
    }

    const cacheKey = queryString;
    const cached = forceFresh ? undefined : connectionsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      setIncoming(cached.data.incoming || []);
      setSent(cached.data.sent || []);
      setConnections(cached.data.connections || []);
      setDiscover(cached.data.discover || []);
      setSummary(cached.data.summary);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const response = await fetch(`/api/user/connections?${queryString}${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
        signal,
      });
      const payload = (await response.json()) as ConnectionsApiResponse;

      if (!response.ok) {
        setMessage(payload.message || "Unable to load request queue.");
        return;
      }

      setIncoming(payload.incoming || []);
      setSent(payload.sent || []);
      setConnections(payload.connections || []);
      setDiscover(payload.discover || []);
      setSummary(payload.summary || { pendingIncoming: 0, pendingSent: 0, totalConnections: 0, discoverCount: 0 });
      setMessage("");
      connectionsCache.set(cacheKey, {
        expiresAt: Date.now() + CONNECTIONS_CACHE_TTL_MS,
        data: payload,
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessage("Network error while loading request queue.");
      }
    } finally {
      setLoading(false);
    }
  }, [profile.email, queryString]);

  useEffect(() => {
    const controller = new AbortController();
    void loadDashboard(controller.signal);
    return () => controller.abort();
  }, [loadDashboard]);

  const patchRequest = async (requestId: string, action: "accept" | "decline" | "cancel" | "remove") => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/user/connections/requests/${encodeURIComponent(requestId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: profile.email, action }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to update request.");
        return;
      }

      connectionsCache.clear();
      await loadDashboard(undefined, true);
      setMessage(payload.message || "Request updated.");
    } catch {
      setMessage("Network error while updating request.");
    } finally {
      setActionLoading(false);
    }
  };

  const sendRequest = async (receiverEmail: string) => {
    const requestMessage = window.prompt("Connection request message", "Let us connect through alumni network.") || "";
    if (!requestMessage.trim()) {
      setMessage("Request message is required.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/user/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: profile.email,
          senderName: profile.fullName,
          receiverEmail,
          message: requestMessage,
        }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to send request.");
        return;
      }

      connectionsCache.clear();
      await loadDashboard(undefined, true);
      setTab("sent");
      setMessage(payload.message || "Request sent.");
    } catch {
      setMessage("Network error while sending request.");
    } finally {
      setActionLoading(false);
    }
  };

  const visibleItemsCount =
    tab === "incoming" ? incoming.length : tab === "sent" ? sent.length : tab === "connections" ? connections.length : discover.length;

  if (loading) {
    return <RequestsSkeleton />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Users className="h-3.5 w-3.5" />
          User Request Queue
        </p>
        <h2 className="mt-2 text-2xl font-black">Connections and Request Management</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Incoming requests handle karein, sent requests track karein, aur apne active connections manage karein.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Incoming Requests" value={String(summary.pendingIncoming)} />
          <StatCard label="Sent Pending" value={String(summary.pendingSent)} />
          <StatCard label="My Connections" value={String(summary.totalConnections)} />
          <StatCard label="Discover People" value={String(summary.discoverCount)} />
        </div>

        {message && (
          <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">
            {message}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            <TabButton label="Incoming" active={tab === "incoming"} onClick={() => setTab("incoming")} />
            <TabButton label="Sent" active={tab === "sent"} onClick={() => setTab("sent")} />
            <TabButton label="Connections" active={tab === "connections"} onClick={() => setTab("connections")} />
            <TabButton label="Discover" active={tab === "discover"} onClick={() => setTab("discover")} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search requests and connections"
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-80"
              />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-text-secondary">
              <Filter className="h-3.5 w-3.5" />
              {visibleItemsCount} item(s)
            </span>
          </div>
        </div>

        {tab === "incoming" && (
          <div className="mt-4 grid gap-3">
            {incoming.length === 0 ? (
              <EmptyState text="No incoming requests right now." />
            ) : (
              incoming.map((item) => (
                <article key={item.id} className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-bold text-text-primary">{item.senderName}</p>
                  <p className="text-xs text-text-secondary">{item.senderEmail}</p>
                  <p className="mt-2 text-sm text-text-secondary">{item.message}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => patchRequest(item.id, "accept")}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-70"
                    >
                      <Check className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => patchRequest(item.id, "decline")}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-70"
                    >
                      <X className="h-3.5 w-3.5" /> Decline
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {tab === "sent" && (
          <div className="mt-4 grid gap-3">
            {sent.length === 0 ? (
              <EmptyState text="No sent requests yet." />
            ) : (
              sent.map((item) => (
                <article key={item.id} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{item.receiverName}</p>
                      <p className="text-xs text-text-secondary">{item.receiverEmail}</p>
                    </div>
                    <span className={["rounded-full border px-2.5 py-1 text-[11px] font-semibold", statusChip(item.status)].join(" ")}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{item.message}</p>
                  <p className="mt-2 text-xs text-text-secondary">Updated: {new Date(item.updatedAt).toLocaleString()}</p>
                  {item.status === "Pending" && (
                    <button
                      type="button"
                      onClick={() => patchRequest(item.id, "cancel")}
                      disabled={actionLoading}
                      className="mt-3 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/30 disabled:opacity-70"
                    >
                      <Clock3 className="h-3.5 w-3.5" /> Cancel Request
                    </button>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        {tab === "connections" && (
          <div className="mt-4 grid gap-3">
            {connections.length === 0 ? (
              <EmptyState text="No active connections yet." />
            ) : (
              connections.map((item) => (
                <article key={item.connectionId} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary">{item.role} • {item.company}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      <Handshake className="h-3.5 w-3.5" /> Connected
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                    <span className="rounded-full border border-border bg-card px-2.5 py-1">{item.email}</span>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1">Batch {item.batch}</span>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1">{item.city}</span>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1">Connected: {new Date(item.connectedAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => patchRequest(item.connectionId, "remove")}
                    disabled={actionLoading}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-70"
                  >
                    <X className="h-3.5 w-3.5" /> Remove Connection
                  </button>
                </article>
              ))
            )}
          </div>
        )}

        {tab === "discover" && (
          <div className="mt-4 grid gap-3">
            {discover.length === 0 ? (
              <EmptyState text="No more people to discover right now." />
            ) : (
              discover.map((item) => (
                <article key={item.profileId} className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-bold text-text-primary">{item.fullName}</p>
                  <p className="text-xs text-text-secondary">{item.role} • {item.company}</p>
                  <p className="mt-1 text-xs text-text-secondary">{item.city} • Batch {item.batch}</p>
                  <p className="mt-2 text-sm text-text-secondary">{item.reason}</p>
                  <button
                    type="button"
                    onClick={() => sendRequest(item.email)}
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

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-bold">Quick Request Profile</h3>
        <p className="mt-1 text-xs text-text-secondary">Ye details request actions me use hoti hain.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Your full name"
            value={profile.fullName}
            onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
          />
          <input
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Your email"
            type="email"
            value={profile.email}
            onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value.trim().toLowerCase() }))}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (!profile.email) {
              setMessage("Email is required.");
              return;
            }
            localStorage.setItem(
              "user_profile_draft_v1",
              JSON.stringify({ fullName: profile.fullName, email: profile.email }),
            );
            connectionsCache.clear();
            void loadDashboard(undefined, true);
            setMessage("Request profile updated.");
          }}
          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
        >
          <Send className="h-3.5 w-3.5" /> Save and Refresh Queue
        </button>
      </section>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-primary text-white" : "text-text-secondary hover:text-primary"
      }`}
    >
      {label}
    </button>
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
    <div className="rounded-lg border border-dashed border-border bg-background px-4 py-7 text-center">
      <p className="text-sm font-semibold text-text-primary">Nothing to show</p>
      <p className="mt-1 text-xs text-text-secondary">{text}</p>
    </div>
  );
}
