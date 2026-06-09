"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Ticket,
  Users,
  XCircle,
} from "lucide-react";

type UserEventRow = {
  id: string;
  title: string;
  eventType: string;
  eventDate: string;
  location: string;
  mode: string;
  organizerName: string;
  organizerEmail: string;
  attendeeCount: number;
  goingCount: number;
  myRegistrationStatus?: "Going" | "Interested" | "Cancelled" | null;
};

type UserEventsResponse = {
  rows: UserEventRow[];
  summary: {
    totalEvents: number;
    registeredCount: number;
    upcomingCount: number;
  };
  message?: string;
};

type EventTiming = "upcoming" | "today" | "past";

const userEventsCache = new Map<string, { expiresAt: number; data: UserEventsResponse }>();
const USER_EVENTS_CACHE_TTL_MS = 10_000;

function getEventTiming(eventDate: string): EventTiming {
  const event = new Date(eventDate);
  const now = new Date();

  // Zero out hours for date-only comparison
  event.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  if (event.getTime() > now.getTime()) return "upcoming";
  if (event.getTime() === now.getTime()) return "today";
  return "past";
}

function getTimingBadge(timing: EventTiming) {
  if (timing === "upcoming") {
    return { label: "Upcoming", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }
  if (timing === "today") {
    return { label: "Ongoing Today", className: "border-amber-200 bg-amber-50 text-amber-700" };
  }
  return { label: "Event Ended", className: "border-border bg-background text-text-secondary" };
}

function EventsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="h-5 w-40 rounded bg-border/60" />
        <div className="mt-3 h-6 w-80 max-w-full rounded bg-border/50" />
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="h-80 rounded-xl border border-border bg-card xl:col-span-2" />
        <div className="h-80 rounded-xl border border-border bg-card" />
      </section>
    </div>
  );
}

export default function UserEventsPage() {
  const [rows, setRows] = useState<UserEventRow[]>([]);
  const [summary, setSummary] = useState({ totalEvents: 0, registeredCount: 0, upcomingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "error" | "success">("info");

  const [profile, setProfile] = useState({
    attendeeName: "Aman Sharma",
    attendeeEmail: "aman.alumni@jnvportal.in",
    attendeeMobile: "",
  });

  useEffect(() => {
    const loggedInEmail = localStorage.getItem("auth_email") || "aman.alumni@jnvportal.in";
    const loggedInName = localStorage.getItem("auth_first_name") || "Aman Sharma";
    
    setProfile((p) => ({
      ...p,
      attendeeEmail: loggedInEmail,
      attendeeName: loggedInName,
    }));

    // Fetch the actual profile from DB
    fetch(`/api/user/profile?email=${encodeURIComponent(loggedInEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile({
            attendeeName: data.profile.fullName || loggedInName,
            attendeeEmail: loggedInEmail,
            attendeeMobile: data.profile.mobile || "",
          });
        } else {
          // If no DB profile, try to load from draft profile or registration data
          let resolvedName = loggedInName;
          let resolvedMobile = "";

          try {
            const draft = localStorage.getItem("user_profile_draft_v1");
            if (draft) {
              const parsed = JSON.parse(draft);
              if (parsed?.fullName) resolvedName = parsed.fullName;
              if (parsed?.mobile) resolvedMobile = parsed.mobile;
            }
          } catch {}

          if (resolvedName === "Aman Sharma") {
            try {
              const regRaw = localStorage.getItem("admin_member_registrations_v1");
              if (regRaw) {
                const regs = JSON.parse(regRaw);
                const match = regs.find((r: any) => r.email?.trim().toLowerCase() === loggedInEmail.trim().toLowerCase());
                if (match) {
                  if (match.fullName) resolvedName = match.fullName;
                  if (match.mobile) resolvedMobile = match.mobile;
                }
              }
            } catch {}
          }

          setProfile({
            attendeeName: resolvedName,
            attendeeEmail: loggedInEmail,
            attendeeMobile: resolvedMobile,
          });
        }
      })
      .catch(() => {
        // network error or offline, check draft
        try {
          const draft = localStorage.getItem("user_profile_draft_v1");
          if (draft) {
            const parsed = JSON.parse(draft);
            setProfile((p) => ({
              ...p,
              attendeeName: parsed.fullName || p.attendeeName,
              attendeeMobile: parsed.mobile || p.attendeeMobile,
            }));
          }
        } catch {}
      });
  }, []);

  const cacheKey = useMemo(() => profile.attendeeEmail.trim().toLowerCase(), [profile.attendeeEmail]);

  const showMessage = (text: string, type: "info" | "error" | "success" = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const loadEvents = async (forceFresh = false) => {
    if (!cacheKey) {
      setRows([]);
      setSummary({ totalEvents: 0, registeredCount: 0, upcomingCount: 0 });
      setLoading(false);
      return;
    }

    const cached = forceFresh ? undefined : userEventsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      setRows(cached.data.rows || []);
      setSummary(cached.data.summary || { totalEvents: 0, registeredCount: 0, upcomingCount: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading((prev) => prev || rows.length === 0);
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const response = await fetch(`/api/user/events?email=${encodeURIComponent(cacheKey)}${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
      });
      const payload = (await response.json()) as UserEventsResponse;
      if (!response.ok) {
        showMessage(payload.message || "Unable to load events.", "error");
        return;
      }

      userEventsCache.set(cacheKey, {
        expiresAt: Date.now() + USER_EVENTS_CACHE_TTL_MS,
        data: payload,
      });

      setRows(payload.rows || []);
      setSummary(payload.summary || { totalEvents: 0, registeredCount: 0, upcomingCount: 0 });
      setMessage("");
    } catch {
      showMessage("Network error while loading events.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, [cacheKey]);



  const registerForEvent = async (eventId: string) => {
    const attendeeName = profile.attendeeName.trim();
    const attendeeEmail = profile.attendeeEmail.trim().toLowerCase();
    if (!attendeeName || !attendeeEmail) {
      showMessage("Please set your name and email before registering.", "error");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/user/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          attendeeName,
          attendeeEmail,
          attendeeMobile: profile.attendeeMobile,
        }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        showMessage(payload.message || "Unable to register for event.", "error");
        return;
      }

      userEventsCache.clear();
      await loadEvents(true);
      showMessage("Registered successfully! You are marked as Going.", "success");
    } catch {
      showMessage("Network error while registering.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelRegistration = async (eventId: string) => {
    const attendeeEmail = profile.attendeeEmail.trim().toLowerCase();
    if (!attendeeEmail) {
      showMessage("Email is required to cancel registration.", "error");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/user/events/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, attendeeEmail }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        showMessage(payload.message || "Unable to cancel registration.", "error");
        return;
      }

      userEventsCache.clear();
      await loadEvents(true);
      showMessage("Registration cancelled for this event.", "success");
    } catch {
      showMessage("Network error while cancelling registration.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Split events into upcoming vs past/ongoing
  const upcomingEvents = rows.filter((e) => getEventTiming(e.eventDate) === "upcoming");
  const pastAndOngoingEvents = rows.filter((e) => getEventTiming(e.eventDate) !== "upcoming");
  const myRegisteredEvents = rows.filter((item) => item.myRegistrationStatus === "Going");

  if (loading) {
    return <EventsSkeleton />;
  }

  const messageColorClass =
    messageType === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : messageType === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-primary/20 bg-primary/5 text-text-secondary";

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <CalendarDays className="h-3.5 w-3.5" />
              My Events Dashboard
            </p>
            <h2 className="mt-2 text-2xl font-black">Plan, register, and track alumni events</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Register for upcoming events instantly. Past and ongoing events are view-only.
            </p>
          </div>
          <button
            onClick={() => { userEventsCache.clear(); void loadEvents(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/30 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {message && (
          <p className={`mt-3 rounded-lg border px-3 py-2 text-xs font-medium ${messageColorClass}`}>
            {message}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Upcoming Events" value={String(summary.upcomingCount)} />
          <MetricCard label="Registered" value={String(summary.registeredCount)} />
          <MetricCard label="Available Events" value={String(summary.totalEvents)} />
          <MetricCard label="My Registrations" value={String(myRegisteredEvents.length)} />
        </div>
      </section>



      {/* Events Grid */}
      <section className="grid gap-4 xl:grid-cols-3">
        {/* Main Event Lists */}
        <article className="rounded-xl border border-border bg-card p-4 xl:col-span-2 space-y-6">
          {/* Upcoming Events Section */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-bold">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                Upcoming Events
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {upcomingEvents.length}
                </span>
              </h3>
            </div>

            <div className="grid gap-3">
              {upcomingEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-text-secondary">
                  No upcoming events available right now.
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    timing="upcoming"
                    actionLoading={actionLoading}
                    onRegister={() => void registerForEvent(event.id)}
                    onCancel={() => void cancelRegistration(event.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Past & Ongoing Events Section */}
          {pastAndOngoingEvents.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="inline-flex items-center gap-2 text-sm font-bold">
                  <Clock3 className="h-4 w-4 text-text-secondary" />
                  Past &amp; Ongoing Events
                  <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                    {pastAndOngoingEvents.length}
                  </span>
                </h3>
              </div>

              <div className="grid gap-3">
                {pastAndOngoingEvents.map((event) => {
                  const timing = getEventTiming(event.eventDate);
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      timing={timing}
                      actionLoading={actionLoading}
                      onRegister={() => {}}
                      onCancel={() => {}}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </article>

        {/* My Registered Events Sidebar */}
        <article className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold">My Registered Events</h3>
          <div className="mt-3 space-y-2">
            {myRegisteredEvents.map((item) => {
              const timing = getEventTiming(item.eventDate);
              const badge = getTimingBadge(timing);
              return (
                <div key={item.id} className="rounded-lg border border-border bg-background px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-text-primary">{item.title}</p>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-text-secondary">{new Date(item.eventDate).toLocaleDateString()} • {item.location}</p>
                  {timing === "upcoming" && (
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> You can cancel before it starts
                    </p>
                  )}
                  {(timing === "today" || timing === "past") && (
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary">
                      <AlertCircle className="h-3 w-3" /> Cancellation locked
                    </p>
                  )}
                </div>
              );
            })}
            {myRegisteredEvents.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-background px-3 py-4 text-center text-xs text-text-secondary">
                You are not registered for any event yet.
              </div>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Ticket className="h-3.5 w-3.5" /> Registration Rules
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-text-secondary">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                Registration available only for upcoming events
              </li>
              <li className="flex items-start gap-1.5">
                <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-rose-500" />
                Cannot register for ongoing or past events
              </li>
              <li className="flex items-start gap-1.5">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                Cancel before event starts — locked after
              </li>
            </ul>
          </div>
        </article>
      </section>
    </div>
  );
}

function EventCard({
  event,
  timing,
  actionLoading,
  onRegister,
  onCancel,
}: {
  event: UserEventRow;
  timing: EventTiming;
  actionLoading: boolean;
  onRegister: () => void;
  onCancel: () => void;
}) {
  const badge = getTimingBadge(timing);
  const isRegistered = event.myRegistrationStatus === "Going";
  const canRegister = timing === "upcoming" && !isRegistered;
  const canCancel = timing === "upcoming" && isRegistered;

  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-text-primary">{event.title}</p>
          <p className="mt-0.5 text-xs text-text-secondary">{event.eventType} • {event.mode}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isRegistered && (
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              ✓ Registered
            </span>
          )}
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
          <CalendarDays className="h-3.5 w-3.5" /> {new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
          <MapPin className="h-3.5 w-3.5" /> {event.location}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
          <Users className="h-3.5 w-3.5" /> {event.goingCount} going
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {canRegister && (
          <button
            onClick={onRegister}
            disabled={actionLoading}
            className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-70 transition-colors"
          >
            Register Now
          </button>
        )}

        {canCancel && (
          <button
            onClick={onCancel}
            disabled={actionLoading}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-70 transition-colors"
          >
            Cancel Registration
          </button>
        )}

        {timing !== "upcoming" && isRegistered && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {timing === "today" ? "Registered — Event is live" : "Attended"}
          </span>
        )}

        {timing !== "upcoming" && !isRegistered && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-text-secondary">
            <XCircle className="h-3.5 w-3.5" />
            {timing === "today" ? "Ongoing — Registration closed" : "Event ended"}
          </span>
        )}
      </div>
    </article>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-background px-3 py-3">
      <p className="text-xl font-black text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </article>
  );
}
