"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Filter,
  Handshake,
  Mail,
  MapPin,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";

type NetworkCategory = "mentor" | "peer" | "senior";
type NetworkItem = {
  id: number;
  name: string;
  role: string;
  company: string;
  batch: string;
  city: string;
  category: NetworkCategory;
  tags: string[];
};

type RequestItem = {
  id: number;
  name: string;
  message: string;
  relation: string;
};

type DiscoverItem = {
  id: number;
  name: string;
  role: string;
  reason: string;
  city: string;
};

const connectionsSeed: NetworkItem[] = [
  {
    id: 1,
    name: "Aman Tiwari",
    role: "Senior Software Engineer",
    company: "CloudSprint",
    batch: "2012",
    city: "Bengaluru",
    category: "senior",
    tags: ["Referrals", "Backend", "Mentorship"],
  },
  {
    id: 2,
    name: "Nidhi Sharma",
    role: "Product Manager",
    company: "InsightGrid",
    batch: "2015",
    city: "Pune",
    category: "mentor",
    tags: ["Product", "Career Growth"],
  },
  {
    id: 3,
    name: "Rohit Mishra",
    role: "Data Analyst",
    company: "ScaleBridge",
    batch: "2020",
    city: "Delhi",
    category: "peer",
    tags: ["Data", "Analytics"],
  },
  {
    id: 4,
    name: "Megha Chauhan",
    role: "UX Designer",
    company: "BlueOrbit",
    batch: "2017",
    city: "Hyderabad",
    category: "mentor",
    tags: ["Design", "Portfolio Review"],
  },
];

const requestSeed: RequestItem[] = [
  {
    id: 1,
    name: "Karan Verma",
    relation: "Batch 2019",
    message: "Hi, I am from your city chapter and would like to connect.",
  },
  {
    id: 2,
    name: "Riya Dubey",
    relation: "Mentorship Aspirant",
    message: "I saw your profile in product track and want to learn from your journey.",
  },
];

const discoverSeed: DiscoverItem[] = [
  {
    id: 1,
    name: "Prateek Singh",
    role: "SDE-2, NovaStack",
    reason: "Works in your target domain: Backend Engineering",
    city: "Noida",
  },
  {
    id: 2,
    name: "Sneha Rai",
    role: "Business Analyst, Zenith",
    reason: "Same batch cluster and active in alumni events",
    city: "Lucknow",
  },
  {
    id: 3,
    name: "Shubham Joshi",
    role: "ML Engineer, Vertex AI",
    reason: "Shared interest: Data and AI mentoring",
    city: "Gurugram",
  },
];

export default function UserNetworkPage() {
  const [tab, setTab] = useState<"connections" | "requests" | "discover">("connections");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | NetworkCategory>("all");
  const [requests, setRequests] = useState<RequestItem[]>(requestSeed);
  const [discover, setDiscover] = useState<DiscoverItem[]>(discoverSeed);

  const filteredConnections = useMemo(() => {
    return connectionsSeed.filter((item) => {
      const inFilter = filter === "all" ? true : item.category === filter;
      const inSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase()) ||
        item.city.toLowerCase().includes(search.toLowerCase());
      return inFilter && inSearch;
    });
  }, [filter, search]);

  const acceptRequest = (id: number) => {
    setRequests((prev) => prev.filter((item) => item.id !== id));
  };

  const declineRequest = (id: number) => {
    setRequests((prev) => prev.filter((item) => item.id !== id));
  };

  const sendConnect = (id: number) => {
    setDiscover((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Users className="h-3.5 w-3.5" />
          My Network
        </p>
        <h2 className="mt-2 text-2xl font-black">Grow your alumni circle with purpose</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Manage connections, respond to requests, and discover people aligned to your goals.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total Connections" value="132" />
          <StatCard label="Mentors Connected" value="18" />
          <StatCard label="Pending Requests" value={String(requests.length)} />
          <StatCard label="New Suggestions" value={String(discover.length)} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-xl border border-border bg-background p-1">
            {[
              { key: "connections", label: "Connections" },
              { key: "requests", label: "Requests" },
              { key: "discover", label: "Discover" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key as "connections" | "requests" | "discover")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  tab === item.key ? "bg-primary text-white" : "text-text-secondary hover:text-primary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "connections" && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search people, role, company"
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-72"
                />
              </div>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value as "all" | NetworkCategory)}
                  className="w-full appearance-none rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-sm outline-none focus:border-primary sm:w-44"
                >
                  <option value="all">All Categories</option>
                  <option value="mentor">Mentors</option>
                  <option value="peer">Peers</option>
                  <option value="senior">Seniors</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {tab === "connections" && (
          <div className="mt-4 grid gap-3">
            {filteredConnections.length === 0 ? (
              <EmptyState text="No connections matched your search/filter." />
            ) : (
              filteredConnections.map((item) => (
                <article key={item.id} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary">{item.role} at {item.company}</p>
                    </div>
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary capitalize">
                      {item.category}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                      <Clock3 className="h-3.5 w-3.5" /> Batch {item.batch}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                      <MapPin className="h-3.5 w-3.5" /> {item.city}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                      <Handshake className="h-3.5 w-3.5" /> {item.tags.join(" • ")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35">View Profile</button>
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35">Message</button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {tab === "requests" && (
          <div className="mt-4 grid gap-3">
            {requests.length === 0 ? (
              <EmptyState text="No pending requests right now." />
            ) : (
              requests.map((item) => (
                <article key={item.id} className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{item.relation}</p>
                  <p className="mt-2 text-sm text-text-secondary">{item.message}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => acceptRequest(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => declineRequest(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <X className="h-3.5 w-3.5" /> Decline
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {tab === "discover" && (
          <div className="mt-4 grid gap-3">
            {discover.length === 0 ? (
              <EmptyState text="No more suggestions right now. Check again later." />
            ) : (
              discover.map((item) => (
                <article key={item.id} className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{item.role}</p>
                  <p className="mt-2 text-sm text-text-secondary">{item.reason}</p>
                  <p className="mt-1 text-xs text-text-secondary">{item.city}</p>
                  <button
                    type="button"
                    onClick={() => sendConnect(item.id)}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Send Connection Request
                  </button>
                </article>
              ))
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-4 xl:col-span-2">
          <h3 className="text-sm font-bold">Active Circles and Groups</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              "Batch 2020 Career Circle",
              "Data Science Alumni Group",
              "Product and Design Network",
              "Startup Founders Community",
            ].map((group) => (
              <div key={group} className="rounded-lg border border-border bg-background px-3 py-2.5">
                <p className="text-sm font-semibold text-text-primary">{group}</p>
                <p className="text-xs text-text-secondary">Open discussions and monthly interaction sessions.</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold">Quick Actions</h3>
          <div className="mt-3 space-y-2">
            {[
              "Invite batchmates",
              "Post a networking request",
              "Share your mentorship availability",
              "Send message to all accepted connections",
            ].map((action) => (
              <button
                key={action}
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/35"
              >
                {action}
                <Mail className="h-3.5 w-3.5 text-primary" />
              </button>
            ))}
          </div>
        </article>
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
