import Link from "next/link";
import { ArrowRight, BookOpen, HandHeart, HeartHandshake, ShieldCheck } from "lucide-react";

const impactAreas = [
  {
    title: "Student Scholarships",
    desc: "Support deserving students with financial aid and academic continuity.",
    icon: BookOpen,
  },
  {
    title: "Mentorship Programs",
    desc: "Enable structured mentor-mentee sessions and career guidance resources.",
    icon: HeartHandshake,
  },
  {
    title: "Campus Initiatives",
    desc: "Fund infrastructure, workshops, and innovation-focused community projects.",
    icon: HandHeart,
  },
];

export default function DonatePage() {
  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute -left-12 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <HandHeart className="h-3.5 w-3.5" />
            Give Back
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Contribute to Alumni Impact</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Your contribution helps strengthen scholarships, mentorship, and initiatives for current and future students.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {impactAreas.map(({ title, desc, icon: Icon }) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm text-text-secondary">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-9">
          <h3 className="text-2xl font-black">How to contribute</h3>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-secondary/30 bg-secondary/10 p-4 text-sm text-text-secondary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            This page is ready for your payment integration. You can connect it to Razorpay/Stripe or your preferred donation workflow.
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:border-primary/30"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
