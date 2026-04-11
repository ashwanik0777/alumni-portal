import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Sparkles, Ticket, Users } from "lucide-react";

const featuredEvents = [
  {
    title: "Annual Grand Alumni Meet 2026",
    date: "30 Jun 2026",
    time: "5:00 PM - 10:00 PM",
    venue: "School Main Auditorium, Farrukhabad",
    type: "On Campus",
    seats: "120 seats left",
  },
  {
    title: "Tech & Leadership Summit",
    date: "12 Jul 2026",
    time: "11:00 AM - 3:00 PM",
    venue: "Virtual + Delhi Chapter Hub",
    type: "Hybrid",
    seats: "85 seats left",
  },
  {
    title: "Batch 2016 - 10 Year Reunion",
    date: "25 Aug 2026",
    time: "6:30 PM - 9:30 PM",
    venue: "Lucknow Alumni Club",
    type: "In Person",
    seats: "52 seats left",
  },
];

const timeline = [
  {
    month: "May 2026",
    milestone: "Regional chapter meetups begin in 5 cities",
  },
  {
    month: "July 2026",
    milestone: "Mentor matchmaking sessions and career circles",
  },
  {
    month: "September 2026",
    milestone: "Campus impact day and scholarship fundraiser",
  },
];

export default function EventsPage() {
  return (
    <div className="bg-background text-text-primary">
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
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              Reserve Your Spot
              <Ticket className="h-4 w-4" />
            </Link>
            <Link
              href="/directory"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-text-primary hover:border-primary/30 transition-colors"
            >
              Find Batchmates
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="flex items-center justify-between gap-4 mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Gatherings</h2>
          <span className="text-sm text-text-secondary">Limited seats per event</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredEvents.map((event) => (
            <article
              key={event.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-text-primary">
                  {event.type}
                </span>
                <span className="text-xs text-primary font-semibold">{event.seats}</span>
              </div>

              <h3 className="text-xl font-bold leading-snug mb-4">{event.title}</h3>

              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{event.venue}</span>
                </div>
              </div>

              <button className="mt-6 w-full rounded-xl border border-primary/30 bg-primary/5 py-2.5 text-sm font-semibold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                Get Invite
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-5 rounded-2xl border border-border bg-background p-6 sm:p-7 shadow-sm">
            <p className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
              Roadmap 2026
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 mb-3">Reunion Journey Timeline</h2>
            <p className="text-text-secondary leading-relaxed">
              A year-long calendar to help each chapter host meaningful interactions, celebrate milestones,
              and create impact for current students and fellow alumni.
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
                <span className="absolute -left-8 sm:-left-10 top-6 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold ring-4 ring-card">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold text-primary tracking-wide">{item.month}</p>
                <p className="mt-1.5 text-text-primary leading-relaxed">{item.milestone}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="rounded-3xl border border-primary/20 bg-linear-to-r from-primary/95 to-primary p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -left-12 -bottom-16 h-52 w-52 rounded-full bg-secondary/20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mb-3">
                <Users className="h-4 w-4" />
                Alumni Community First
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold">Planning a Batch Reunion?</h3>
              <p className="mt-2 text-white/90 max-w-2xl">
                We help with communication templates, venue coordination, and registration support so your
                reunion feels smooth and memorable.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-primary hover:bg-white/90 transition-colors"
            >
              Request Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
