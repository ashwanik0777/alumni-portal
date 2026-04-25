"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper, Users } from "lucide-react";

type NewsStory = {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  published_at: string;
};

export default function NewsPage() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/news")
      .then(res => res.json())
      .then(data => setStories(data.stories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return dateStr; }
  }

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
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse">
                <div className="h-4 w-24 rounded bg-border/60 mb-3" />
                <div className="h-6 w-3/4 rounded bg-border/60 mb-3" />
                <div className="h-4 w-full rounded bg-border/60 mb-2" />
                <div className="h-4 w-2/3 rounded bg-border/60" />
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-16 text-center">
            <Newspaper className="h-10 w-10 text-text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold">No stories yet</p>
            <p className="mt-1 text-sm text-text-secondary">Check back later for news and updates from the alumni community.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <article key={story.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(story.published_at)}
                </p>
                <h2 className="mt-3 text-xl font-bold leading-tight">{story.title}</h2>
                <p className="mt-2 text-sm text-text-secondary">{story.excerpt}</p>
                <p className="mt-4 text-xs font-semibold text-primary">{story.author}</p>
              </article>
            ))}
          </div>
        )}
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
