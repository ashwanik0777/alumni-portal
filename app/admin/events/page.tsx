"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, Filter, MapPin, Search, Users } from "lucide-react";

type EventRow = {
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
  updatedAt: string;
};

type EventAttendee = {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeMobile: string | null;
  registrationStatus: "Going" | "Interested" | "Cancelled";
  registeredAt: string;
};

type EventsApiResponse = {
  rows: EventRow[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  summary: {
    totalRegistrations?: number;
    upcomingCount?: number;
  };
  message?: string;
};

type EventAttendeesResponse = {
  rows: EventAttendee[];
  message?: string;
};

const eventsResponseCache = new Map<string, { expiresAt: number; data: EventsApiResponse }>();
const attendeesCache = new Map<string, { expiresAt: number; data: EventAttendee[] }>();
const EVENTS_CLIENT_CACHE_TTL_MS = 12_000;
const ATTENDEES_CLIENT_CACHE_TTL_MS = 10_000;

function EventsSkeleton() {
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

export default function AdminEventsPage() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState("");
  const [attendeesByEvent, setAttendeesByEvent] = useState<Record<string, EventAttendee[]>>({});
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    eventType: "",
    eventDate: "",
    location: "",
    mode: "",
    organizerName: "",
    organizerEmail: "",
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("search", search);
    params.set("year", yearFilter);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("status", "All");
    return params.toString();
  }, [search, yearFilter, page, pageSize]);

  const loadEvents = async (signal?: AbortSignal, forceFresh = false) => {
    const cacheKey = queryString;
    const cached = forceFresh ? undefined : eventsResponseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      setRows(cached.data.rows || []);
      setTotalPages(cached.data.pagination?.totalPages || 1);
      setTotal(cached.data.pagination?.total || 0);
      setRegistrationsCount(cached.data.summary?.totalRegistrations || 0);
      setUpcomingCount(cached.data.summary?.upcomingCount || 0);
      setLoading(false);
      return;
    }

    try {
      setLoading((prev) => prev || rows.length === 0);
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const response = await fetch(`/api/admin/events?${queryString}${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
        signal,
      });
      const payload = (await response.json()) as EventsApiResponse;

      if (!response.ok) {
        setMessage(payload.message || "Unable to load events.");
        return;
      }

      setRows(payload.rows || []);
      setTotalPages(payload.pagination?.totalPages || 1);
      setTotal(payload.pagination?.total || 0);
      setRegistrationsCount(payload.summary?.totalRegistrations || 0);
      setUpcomingCount(payload.summary?.upcomingCount || 0);
      eventsResponseCache.set(cacheKey, {
        expiresAt: Date.now() + EVENTS_CLIENT_CACHE_TTL_MS,
        data: payload,
      });
      setMessage("");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessage("Network error while loading events.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAttendees = async (eventId: string, forceFresh = false) => {
    const cached = forceFresh ? undefined : attendeesCache.get(eventId);
    if (cached && cached.expiresAt > Date.now()) {
      setAttendeesByEvent((prev) => ({ ...prev, [eventId]: cached.data }));
      return;
    }

    setAttendeesLoading(true);
    try {
      const refreshParam = forceFresh ? `?_=${Date.now()}` : "";
      const response = await fetch(`/api/admin/events/${eventId}/attendees${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
      });
      const payload = (await response.json()) as EventAttendeesResponse;
      if (!response.ok) {
        setMessage(payload.message || "Unable to load attendees.");
        return;
      }

      const rowsData = payload.rows || [];
      attendeesCache.set(eventId, {
        expiresAt: Date.now() + ATTENDEES_CLIENT_CACHE_TTL_MS,
        data: rowsData,
      });
      setAttendeesByEvent((prev) => ({ ...prev, [eventId]: rowsData }));
    } catch {
      setMessage("Network error while loading attendees.");
    } finally {
      setAttendeesLoading(false);
    }
  };

  const toggleEventDetails = async (eventId: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId("");
      return;
    }

    setExpandedEventId(eventId);
    await loadAttendees(eventId);
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadEvents(controller.signal);
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [queryString]);

  const createEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(payload.message || "Unable to create event.");
        return;
      }

      setNewEvent({
        title: "",
        eventType: "",
        eventDate: "",
        location: "",
        mode: "",
        organizerName: "",
        organizerEmail: "",
      });
      eventsResponseCache.clear();
      attendeesCache.clear();
      await loadEvents(undefined, true);
      setMessage("Event created successfully.");
    } catch {
      setMessage("Network error while creating event.");
    } finally {
      setActionLoading(false);
    }
  };

  const exportEventsCsv = () => {
    if (rows.length === 0) {
      setMessage("No events to export.");
      return;
    }

    const header = "ID,Title,Type,Date,Location,Mode,Organizer,Organizer Email,Attendees,Going,Updated At";
    const lines = rows.map((row) =>
      [
        row.id,
        row.title,
        row.eventType,
        row.eventDate,
        row.location,
        row.mode,
        row.organizerName,
        row.organizerEmail,
        row.attendeeCount,
        row.goingCount,
        new Date(row.updatedAt).toLocaleString(),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );

    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `events-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const exportAttendeesCsv = (eventId: string) => {
    const attendees = attendeesByEvent[eventId] || [];
    if (attendees.length === 0) {
      setMessage("No attendees to export for this event.");
      return;
    }

    const header = "Name,Email,Mobile,Status,Registered At";
    const lines = attendees.map((row) =>
      [
        row.attendeeName,
        row.attendeeEmail,
        row.attendeeMobile || "",
        row.registrationStatus,
        new Date(row.registeredAt).toLocaleString(),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );

    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `event-attendees-${eventId}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <EventsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Events Management</h2>
            <p className="mt-2 text-sm text-text-secondary">Create events and track exactly who is coming from user dashboards.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateEvent((prev) => !prev)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
          >
            {showCreateEvent ? "Close Create Event" : "Create New Event"}
          </button>
        </div>
        {message && <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{message}</p>}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Total Events</p>
          <p className="mt-2 text-2xl font-black text-text-primary">{total}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Total Registrations</p>
          <p className="mt-2 text-2xl font-black text-text-primary">{registrationsCount}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Upcoming Events</p>
          <p className="mt-2 text-2xl font-black text-text-primary">{upcomingCount}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">Filters and Actions</h3>
          <button
            onClick={exportEventsCsv}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
          >
            <Download className="h-3.5 w-3.5" /> Export Events
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="md:col-span-3">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, organizer, email, location"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
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

      {showCreateEvent && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Create New Event</h3>
          <form onSubmit={createEvent} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Event Title" value={newEvent.title} onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Event Type" value={newEvent.eventType} onChange={(e) => setNewEvent((p) => ({ ...p, eventType: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" type="date" placeholder="Event Date" value={newEvent.eventDate} onChange={(e) => setNewEvent((p) => ({ ...p, eventDate: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent((p) => ({ ...p, location: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Mode (Online/Offline/Hybrid)" value={newEvent.mode} onChange={(e) => setNewEvent((p) => ({ ...p, mode: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="Organizer Name" value={newEvent.organizerName} onChange={(e) => setNewEvent((p) => ({ ...p, organizerName: e.target.value }))} required />
            <input className="rounded-xl border border-border bg-background px-3 py-2 text-sm md:col-span-2" placeholder="Organizer Email" type="email" value={newEvent.organizerEmail} onChange={(e) => setNewEvent((p) => ({ ...p, organizerEmail: e.target.value }))} required />

            <div className="md:col-span-3 flex justify-end">
              <button type="submit" disabled={actionLoading} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-70">
                Add Event
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Event Details and Attendees</h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-text-secondary">
            <Filter className="h-3.5 w-3.5" /> {total} events
          </span>
        </div>

        <div className="space-y-3">
          {rows.map((row) => {
            const attendees = attendeesByEvent[row.id] || [];
            const expanded = expandedEventId === row.id;

            return (
              <article key={row.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-text-primary">{row.title}</p>
                    <p className="text-xs text-text-secondary">{row.id} • {row.eventType} • {row.mode}</p>
                  </div>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {row.goingCount} Going / {row.attendeeCount} Registered
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {new Date(row.eventDate).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1">
                    <MapPin className="h-3.5 w-3.5" /> {row.location}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1">
                    <Users className="h-3.5 w-3.5" /> Organizer: {row.organizerName}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => void toggleEventDetails(row.id)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35"
                  >
                    {expanded ? "Hide Attendees" : "View Attendees"}
                  </button>
                  <button
                    onClick={() => exportAttendeesCsv(row.id)}
                    className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                  >
                    Export Attendees
                  </button>
                </div>

                {expanded && (
                  <div className="mt-3 rounded-xl border border-border bg-card p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">Attendees</p>

                    {attendeesLoading && attendees.length === 0 ? (
                      <div className="mt-3 h-14 animate-pulse rounded-lg bg-border/50" />
                    ) : attendees.length === 0 ? (
                      <p className="mt-2 text-xs text-text-secondary">No attendees yet. Once users register from dashboard, list will appear here.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {attendees.map((person) => (
                          <div key={person.id} className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
                            <p className="font-semibold text-text-primary">{person.attendeeName}</p>
                            <p className="text-text-secondary">{person.attendeeEmail}{person.attendeeMobile ? ` • ${person.attendeeMobile}` : ""}</p>
                            <p className="mt-0.5 text-text-secondary">{person.registrationStatus} • {new Date(person.registeredAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {rows.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-text-secondary">
              No events found for selected filters.
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
