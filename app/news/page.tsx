import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper, Sparkles, Users } from "lucide-react";

const featuredStories = [
  {
    title: "From Campus to Startup Founder",
    author: "Ananya Singh, Batch 2014",
    date: "02 Apr 2026",
    excerpt:
      "How a student innovation project became a funded startup creating impact in rural education.",
  },
  {
    title: "Global Reunion 2026 Highlights",
    author: "Alumni Office",
    date: "25 Mar 2026",
    excerpt:
      "A snapshot of key moments, keynote sessions, and milestone announcements from this year\'s reunion.",
  },
  {
    title: "Mentorship Stories That Changed Careers",
    author: "Community Team",
    date: "12 Mar 2026",
    excerpt:
      "Three mentees share how guidance from alumni mentors accelerated their confidence and career growth.",
  },
];

export default function NewsPage() {
  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="absolute right-0 top-1/3 h-60 w-60 rounded-full bg-secondary/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Newspaper className="h-3.5 w-3.5" />
            News and Stories
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Stories from the Alumni Network</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Explore updates, achievements, and real journeys from alumni across industries and locations.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredStories.map((story) => (
            <article key={story.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <CalendarDays className="h-3.5 w-3.5" />
                {story.date}
              </p>
              <h2 className="mt-3 text-xl font-bold leading-tight">{story.title}</h2>
              <p className="mt-2 text-sm text-text-secondary">{story.excerpt}</p>
              <p className="mt-4 text-xs font-semibold text-primary">{story.author}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/20 bg-linear-to-r from-primary/10 via-card to-secondary/10 p-7 sm:p-9">
          <h3 className="text-2xl font-black">Have a story to share?</h3>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Share your achievements, initiatives, or alumni journey and inspire the next generation.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/share-story"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Share Your Story
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary/30"
            >
              <Users className="h-4 w-4" />
              Explore Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
