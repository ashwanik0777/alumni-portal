import Link from "next/link";
import { ArrowRight, PenSquare, Sparkles } from "lucide-react";

export default function ShareStoryPage() {
  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <PenSquare className="h-3.5 w-3.5" />
            Share Your Story
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Inspire the Alumni Community</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Submit your journey, achievements, or lessons learned so others can learn, connect, and grow.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-2xl font-black">Story Submission</h2>
          <p className="mt-2 text-sm text-text-secondary">Share concise and meaningful details. Our team will review before publishing.</p>

          <form className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-1">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Full Name</span>
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block sm:col-span-1">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Batch Year</span>
              <input
                type="text"
                placeholder="e.g., 2018"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Story Title</span>
              <input
                type="text"
                placeholder="A short title for your story"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Your Story</span>
              <textarea
                rows={6}
                placeholder="Write your story here..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Submit Story
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:border-primary/30"
              >
                <Sparkles className="h-4 w-4" />
                View Published Stories
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
