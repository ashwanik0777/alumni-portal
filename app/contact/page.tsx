import Link from "next/link";
import { Clock3, LifeBuoy, Mail, MapPin, MessageSquareText, Phone, Send, ShieldCheck } from "lucide-react";

const supportChannels = [
  {
    icon: Mail,
    title: "Email Support",
    detail: "jnvfarrukhabad.alumni@gmail.com",
    note: "Best for detailed requests and document sharing",
  },
  {
    icon: Phone,
    title: "Help Desk",
    detail: "+91 90000 00000",
    note: "Mon - Sat, 10:00 AM to 6:00 PM",
  },
  {
    icon: MapPin,
    title: "Office Location",
    detail: "JNV Farrukhabad, Uttar Pradesh",
    note: "For official coordination and event meetings",
  },
];

const sla = [
  { label: "General Query", value: "Within 24 Hours" },
  { label: "Event Coordination", value: "Within 12 Hours" },
  { label: "Urgent Alumni Request", value: "Within 4 Hours" },
];

export default function ContactPage() {
  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-14 -left-14 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-8 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
            <LifeBuoy className="h-4 w-4" />
            Alumni Support Desk
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-3xl">
            Request Support For Events, Reunions, and Community Initiatives
          </h1>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-2xl">
            Tell us your requirement and our team will assist with planning, communication, registrations,
            and execution support so your alumni initiative runs smoothly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:jnvfarrukhabad.alumni@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Contact by Email
            </a>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-text-primary hover:border-primary/30 transition-colors"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {supportChannels.map((channel) => (
            <article key={channel.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <channel.icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold">{channel.title}</h2>
              <p className="mt-2 text-text-primary font-medium">{channel.detail}</p>
              <p className="mt-1.5 text-sm text-text-secondary">{channel.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4 space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-text-primary">
              <Clock3 className="h-4 w-4 text-primary" />
              Response SLA
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold">We respond fast and clearly</h3>
            <p className="text-text-secondary leading-relaxed">
              Our coordination desk follows structured timelines so alumni events and requests stay on track.
            </p>
            <div className="space-y-3 pt-2">
              {sla.map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-sm text-text-secondary">{item.label}</p>
                  <p className="text-lg font-bold text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 rounded-2xl border border-border bg-background p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-primary mb-2">
              <MessageSquareText className="h-5 w-5" />
              <span className="text-sm font-semibold">Support Request Form</span>
            </div>
            <h3 className="text-2xl font-bold">Share your request details</h3>
            <p className="mt-2 text-text-secondary">
              Fill in the details below and our team will get back with the next steps.
            </p>

            <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="sm:col-span-1">
                <span className="mb-1.5 block text-sm font-medium text-text-primary">Full Name</span>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary placeholder:text-text-secondary/70 outline-none focus:border-primary"
                />
              </label>

              <label className="sm:col-span-1">
                <span className="mb-1.5 block text-sm font-medium text-text-primary">Email Address</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary placeholder:text-text-secondary/70 outline-none focus:border-primary"
                />
              </label>

              <label className="sm:col-span-1">
                <span className="mb-1.5 block text-sm font-medium text-text-primary">Batch / Passing Year</span>
                <input
                  type="text"
                  placeholder="e.g. 2014"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary placeholder:text-text-secondary/70 outline-none focus:border-primary"
                />
              </label>

              <label className="sm:col-span-1">
                <span className="mb-1.5 block text-sm font-medium text-text-primary">Support Type</span>
                <select className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-primary">
                  <option>Event Planning</option>
                  <option>Reunion Coordination</option>
                  <option>Registration Help</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-text-primary">Message</span>
                <textarea
                  rows={5}
                  placeholder="Describe what support you need"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary placeholder:text-text-secondary/70 outline-none focus:border-primary resize-y"
                />
              </label>

              <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <p className="inline-flex items-center gap-2 text-xs text-text-secondary">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Your details are used only for support coordination.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  Submit Request
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}