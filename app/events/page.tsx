"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, MapPin, Search, Sparkles, Ticket, Users } from "lucide-react";

type PublicEvent = {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  location: string;
  mode: string;
  organizer_name: string;
  attendee_count: number;
  going_count: number;
  submitted_at: string;
};

type Pagination = { page: number; pageSize: number; total: number; totalPages: number };
type TimelineItem = { id: string; month: string; milestone: string };


export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 12, total: 0, totalPages: 0 });
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, mode: modeFilter, page: String(page) });
      const res = await fetch(`/api/public/events?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setPagination(data.pagination);
        if (data.modes?.length) setModes(data.modes);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [search, modeFilter, page]);

  useEffect(() => {
    void loadEvents();
    // Load timeline
    fetch("/api/public/event-timeline")
      .then(r => r.json())
      .then(d => setTimeline(d.timeline || []))
      .catch(() => {});
  }, [loadEvents]);

  const handleRegister = async (eventId: string) => {
    setRegisteringId(eventId);
    setMessage("");

    // Get email from cookie
    const cookieEmail = document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith("auth_user="))?.split("=")[1];
    if (!cookieEmail) {
      router.push("/login?redirect=/events");
      setRegisteringId(null);
      return;
    }

    const decodedEmail = decodeURIComponent(cookieEmail);

    try {
      const res = await fetch("/api/user/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, attendeeName: decodedEmail.split("@")[0], attendeeEmail: decodedEmail }),
      });

      if (res.status === 401) {
        router.push("/login?redirect=/events");
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setMessage("Successfully registered for the event!");
        loadEvents();
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setRegisteringId(null);
    }
  };

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch { return dateStr; }
  }

  return (
    <div className="bg-background text-text-primary">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-16 right-0 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-5">
            <Sparkles className="h-4 w-4" />
            Events & Reunions
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-3xl">
            Reconnect, Celebrate, and Build What&apos;s Next Together
          </h1>
          <p className="mt-5 text-lg text-text-secondary max-w-2xl leading-relaxed">
            Join curated alumni gatherings, learning summits, and milestone reunions designed to create
            memories, mentorship, and meaningful opportunities.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a href="#events-list" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
              Browse Events <Ticket className="h-4 w-4" />
            </a>
            <Link href="/directory" className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-text-primary hover:border-primary/30 transition-colors">
              Find Batchmates
            </Link>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-7 relative">
              <Search className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search events by name, location..." className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary" />
            </div>
            <div className="lg:col-span-3">
              <select value={modeFilter} onChange={(e) => { setModeFilter(e.target.value); setPage(1); }} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary">
                <option value="All">All Modes</option>
                {modes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="lg:col-span-2 text-center text-sm text-text-secondary flex items-center justify-center">
              {pagination.total} event{pagination.total !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>
      </section>

      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">{message}</div>
        </div>
      )}

      {/* Events Grid */}
      <section id="events-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-16">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse">
                <div className="h-5 w-20 rounded bg-border/60 mb-4" />
                <div className="h-6 w-3/4 rounded bg-border/60 mb-4" />
                <div className="space-y-2"><div className="h-4 w-1/2 rounded bg-border/60" /><div className="h-4 w-2/3 rounded bg-border/60" /></div>
                <div className="h-10 w-full rounded-xl bg-border/60 mt-6" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-16 text-center">
            <CalendarDays className="h-10 w-10 text-text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold">No events found</p>
            <p className="mt-1 text-sm text-text-secondary">Check back later for upcoming alumni gatherings.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-7">
              <h2 className="text-2xl sm:text-3xl font-bold">Upcoming Events</h2>
              <span className="text-sm text-text-secondary">Showing {events.length} of {pagination.total}</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <article key={event.id} className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-text-primary">{event.mode}</span>
                    <span className="text-xs text-primary font-semibold">{event.event_type}</span>
                  </div>

                  <h3 className="text-xl font-bold leading-snug mb-4">{event.title}</h3>

                  <div className="space-y-3 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{event.going_count} going • {event.attendee_count} interested</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRegister(event.id)}
                    disabled={registeringId === event.id}
                    className="mt-6 w-full rounded-xl border border-primary/30 bg-primary/5 py-2.5 text-sm font-semibold text-primary group-hover:bg-primary group-hover:text-white transition-colors disabled:opacity-50"
                  >
                    {registeringId === event.id ? "Registering..." : "Register Now"}
                  </button>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${p === page ? "bg-primary text-white" : "border border-border bg-background text-text-secondary hover:text-primary"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Timeline Section */}
      <section className="border-y border-border bg-card/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-5 rounded-2xl border border-border bg-background p-6 sm:p-7 shadow-sm">
            <p className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">Roadmap 2026</p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 mb-3">Reunion Journey Timeline</h2>
            <p className="text-text-secondary leading-relaxed">
              A year-long calendar to help each chapter host meaningful interactions, celebrate milestones, and create impact.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-2xl font-black text-primary">5+</p>
                <p className="text-xs text-text-secondary mt-1">City chapters</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-2xl font-black text-primary">3</p>
                <p className="text-xs text-text-secondary mt-1">Major milestones</p>
              </div>
            </div>
          </div>
          <ol className="lg:col-span-7 relative space-y-5 pl-8 sm:pl-10">
            <div className="absolute left-3.5 sm:left-4 top-2 bottom-2 w-px bg-primary/25" />
            {timeline.map((item, index) => (
              <li key={item.month} className="relative rounded-2xl border border-border bg-background p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="absolute -left-8 sm:-left-10 top-6 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold ring-4 ring-card">{index + 1}</span>
                <p className="text-sm font-semibold text-primary tracking-wide">{item.month}</p>
                <p className="mt-1.5 text-text-primary leading-relaxed">{item.milestone}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="rounded-3xl border border-primary/20 dark:border-primary/40 bg-linear-to-r from-primary/95 to-primary dark:from-slate-900 dark:to-blue-950 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -left-12 -bottom-16 h-52 w-52 rounded-full bg-secondary/20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mb-3">
                <Users className="h-4 w-4" /> Alumni Community First
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold">Planning a Batch Reunion?</h3>
              <p className="mt-2 text-white/90 max-w-2xl">
                We help with communication templates, venue coordination, and registration support so your reunion feels smooth and memorable.
              </p>
            </div>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-primary hover:bg-white/90 transition-colors">
              Request Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
