"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin, Ticket, Users } from "lucide-react";

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

const userEventsCache = new Map<string, { expiresAt: number; data: UserEventsResponse }>();
const USER_EVENTS_CACHE_TTL_MS = 10_000;

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

  const [profile, setProfile] = useState({
    attendeeName: "Aman Sharma",
    attendeeEmail: "aman.alumni@jnvportal.in",
    attendeeMobile: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("user_event_registration_profile_v1");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as typeof profile;
      if (parsed.attendeeName && parsed.attendeeEmail) {
        setProfile(parsed);
      }
    } catch {
      // ignore malformed local cache
    }
  }, []);

  const cacheKey = useMemo(() => profile.attendeeEmail.trim().toLowerCase(), [profile.attendeeEmail]);

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
        setMessage(payload.message || "Unable to load events.");
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
      setMessage("Network error while loading events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, [cacheKey]);

  const saveProfile = () => {
    const email = profile.attendeeEmail.trim().toLowerCase();
    const name = profile.attendeeName.trim();
    if (!name || !email) {
      setMessage("Name and email are required.");
      return;
    }

    const normalized = { ...profile, attendeeEmail: email, attendeeName: name };
    setProfile(normalized);
    localStorage.setItem("user_event_registration_profile_v1", JSON.stringify(normalized));
    setMessage("Event profile updated.");
    userEventsCache.clear();
    void loadEvents(true);
  };

  const registerForEvent = async (eventId: string) => {
    const attendeeName = profile.attendeeName.trim();
    const attendeeEmail = profile.attendeeEmail.trim().toLowerCase();
    if (!attendeeName || !attendeeEmail) {
      setMessage("Please set your name and email before registering.");
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
        setMessage(payload.message || "Unable to register for event.");
        return;
      }

      userEventsCache.clear();
      await loadEvents(true);
      setMessage("Registered successfully. You are marked as Going.");
    } catch {
      setMessage("Network error while registering.");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelRegistration = async (eventId: string) => {
    const attendeeEmail = profile.attendeeEmail.trim().toLowerCase();
    if (!attendeeEmail) {
      setMessage("Email is required to cancel registration.");
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
        setMessage(payload.message || "Unable to cancel registration.");
        return;
      }

      userEventsCache.clear();
      await loadEvents(true);
      setMessage("Registration cancelled for this event.");
    } catch {
      setMessage("Network error while cancelling registration.");
    } finally {
      setActionLoading(false);
    }
  };

  const myRegisteredEvents = rows.filter((item) => item.myRegistrationStatus === "Going");

  if (loading) {
    return <EventsSkeleton />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <CalendarDays className="h-3.5 w-3.5" />
          My Events Dashboard
        </p>
        <h2 className="mt-2 text-2xl font-black">Plan, register, and track alumni events</h2>
        <p className="mt-1 text-sm text-text-secondary">Register instantly after login and let admins monitor attendees in real time.</p>
        {message && <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{message}</p>}

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Upcoming Events" value={String(summary.upcomingCount)} />
          <MetricCard label="Registered" value={String(summary.registeredCount)} />
          <MetricCard label="Available Events" value={String(summary.totalEvents)} />
          <MetricCard label="My Registrations" value={String(myRegisteredEvents.length)} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-bold">Registration Profile</h3>
        <p className="mt-1 text-xs text-text-secondary">Ye details event registration me use hongi.</p>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Your Name" value={profile.attendeeName} onChange={(e) => setProfile((p) => ({ ...p, attendeeName: e.target.value }))} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Your Email" type="email" value={profile.attendeeEmail} onChange={(e) => setProfile((p) => ({ ...p, attendeeEmail: e.target.value }))} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Mobile (optional)" value={profile.attendeeMobile} onChange={(e) => setProfile((p) => ({ ...p, attendeeMobile: e.target.value }))} />
        </div>

        <div className="mt-3 flex justify-end">
          <button onClick={saveProfile} className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20">
            Save Profile
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold">Available Events</h3>
            <button onClick={() => void loadEvents(true)} className="text-xs font-semibold text-primary hover:underline">Refresh</button>
          </div>

          <div className="grid gap-3">
            {rows.map((event) => (
              <article key={event.id} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{event.title}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{event.eventType} • {event.mode}</p>
                  </div>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {event.myRegistrationStatus === "Going" ? "Registered" : "Open"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <Clock3 className="h-3.5 w-3.5" /> {event.mode}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <MapPin className="h-3.5 w-3.5" /> {event.location}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <Users className="h-3.5 w-3.5" /> {event.goingCount} going
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {event.myRegistrationStatus === "Going" ? (
                    <button
                      onClick={() => void cancelRegistration(event.id)}
                      disabled={actionLoading}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-70"
                    >
                      Cancel Registration
                    </button>
                  ) : (
                    <button
                      onClick={() => void registerForEvent(event.id)}
                      disabled={actionLoading}
                      className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-70"
                    >
                      Register Now
                    </button>
                  )}
                </div>
              </article>
            ))}

            {rows.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-text-secondary">
                No events available right now.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold">My Registered Events</h3>
          <div className="mt-3 space-y-2">
            {myRegisteredEvents.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-background px-3 py-2.5">
                <p className="text-xs font-semibold text-text-primary">{item.title}</p>
                <p className="mt-1 text-[11px] text-text-secondary">{new Date(item.eventDate).toLocaleDateString()} • {item.location}</p>
              </div>
            ))}
            {myRegisteredEvents.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-background px-3 py-4 text-center text-xs text-text-secondary">
                You are not registered for any event yet.
              </div>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Ticket className="h-3.5 w-3.5" /> Event Reminder
            </p>
            <p className="mt-1 text-xs text-text-secondary">Registration ke baad admin ko attendee list me aapka naam live dikhega.</p>
          </div>
        </article>
      </section>
    </div>
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
