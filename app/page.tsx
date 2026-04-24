"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, Calendar, Briefcase, HandHeart, Quote, MapPin, GraduationCap } from "lucide-react";

type HomeStats = {
  activeAlumni: string;
  mentorSessions: string;
  citiesConnected: string;
  opportunitiesShared: string;
};

type HomeFeedEvent = { title: string; time: string; venue: string; };
export type HomeFeedJob = { title: string; sub: string; meta: string; };
export type HomeFeedMentor = { title: string; sub: string; meta: string; };

type HomeTestimonial = {
  quote: string;
  author: string;
  meta: string;
  company: string;
  outcome: string;
};

type HomeDataPayload = {
  stats: HomeStats;
  events: HomeFeedEvent[];
  jobs: HomeFeedJob[];
  mentors: HomeFeedMentor[];
  testimonials: HomeTestimonial[];
};

export default function Home() {
  const impactRef = useRef<HTMLElement | null>(null);
  const [impactVisible, setImpactVisible] = useState(false);
  const [data, setData] = useState<HomeDataPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch("/api/home");
        if (res.ok) {
          const payload = await res.json();
          setData(payload);
        }
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    const target = impactRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setImpactVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading]); // Re-bind observer after loading finishes

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6 tracking-tight">
            Welcome Home, <span className="text-primary">Alumni</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Reconnect with classmates, expand your professional network, and give back to the community that shaped your journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
            >
              Join the Network
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/directory"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-border bg-card text-text-primary font-semibold hover:border-primary/50 transition-colors shadow-sm"
            >
              Search Directory
            </Link>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Alumni Directory"
              description="Find lost friends and connect with professionals in your field."
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-primary" />}
              title="Events & Reunions"
              description="Stay updated on upcoming campus events, webinars, and reunions."
            />
            <FeatureCard
              icon={<Briefcase className="w-6 h-6 text-primary" />}
              title="Career Opportunities"
              description="Access exclusive job listings and mentorship programs."
            />
            <FeatureCard
              icon={<HandHeart className="w-6 h-6 text-primary" />}
              title="Give Back"
              description="Support the next generation of students through mentorship and giving."
            />
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section ref={impactRef} className="py-14 lg:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-4xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden">
            <div className="absolute -top-16 -right-14 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-14 -left-12 h-44 w-44 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />

            <div className="relative flex items-center justify-between gap-4 mb-8 flex-wrap">
              <div>
                <p className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
                  Community Impact Snapshot
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary">Real growth across the alumni ecosystem</h2>
              </div>
              <p className="text-sm text-text-secondary">Updated for 2026 Alumni Cycle</p>
            </div>

            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-background p-5 animate-pulse">
                    <div className="h-8 w-24 bg-border/50 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-border/50 rounded"></div>
                  </div>
                ))
              ) : (
                [
                  { label: "Active Alumni", value: data?.stats.activeAlumni || "0" },
                  { label: "Mentor Sessions", value: data?.stats.mentorSessions || "0" },
                  { label: "Cities Connected", value: data?.stats.citiesConnected || "0" },
                  { label: "Opportunities Shared", value: data?.stats.opportunitiesShared || "0" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border bg-background p-5 hover:border-primary/35 hover:-translate-y-1 hover:shadow-md transition-all">
                    <p className="text-2xl sm:text-3xl font-black text-primary">
                      <AnimatedImpactValue value={item.value} start={impactVisible} />
                    </p>
                    <p className="text-sm text-text-secondary mt-1">{item.label}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Live Feeds */}
      <section className="py-16 lg:py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              Live Opportunity Streams
            </p>
            <h2 className="text-3xl sm:text-4xl font-black my-8">Explore Events, Find Jobs, Get Mentorship</h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ScrollingFeedBox
              title="Events"
              icon={<Calendar className="w-4 h-4" />}
              link="/events"
              cta="View All Events"
              loading={loading}
              items={(data?.events || []).map((item) => ({
                primary: item.title,
                secondary: item.time,
                tertiary: item.venue,
              }))}
            />

            <ScrollingFeedBox
              title="Jobs"
              icon={<Briefcase className="w-4 h-4" />}
              link="/jobs"
              cta="Browse Jobs"
              loading={loading}
              items={(data?.jobs || []).map((item) => ({
                primary: item.title,
                secondary: item.sub,
                tertiary: item.meta,
              }))}
            />

            <ScrollingFeedBox
              title="Mentorship"
              icon={<Users className="w-4 h-4" />}
              link="/mentorship"
              cta="Join Mentorship"
              loading={loading}
              items={(data?.mentors || []).map((item) => ({
                primary: item.title,
                secondary: item.sub,
                tertiary: item.meta,
              }))}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-4xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              <div className="lg:col-span-4">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <Quote className="w-3.5 h-3.5" />
                  Voices Of Alumni
                </p>
                <h2 className="text-3xl sm:text-4xl font-black mt-4 leading-tight">Real stories with measurable outcomes</h2>
                <p className="mt-3 text-text-secondary leading-relaxed">
                  From mentorship guidance to career referrals, alumni continue to create meaningful progress together.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-2xl font-black text-primary">89%</p>
                    <p className="text-xs text-text-secondary mt-1">Positive outcomes</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-2xl font-black text-primary">{loading ? "..." : (data?.testimonials.length ? "1,300+" : "0")}</p>
                    <p className="text-xs text-text-secondary mt-1">Stories shared</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 grid md:grid-cols-2 gap-5">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <article key={i} className="rounded-2xl border border-border bg-background p-6 animate-pulse">
                      <div className="h-6 w-24 bg-border/50 rounded-full mb-4"></div>
                      <div className="h-4 w-full bg-border/50 rounded mb-2"></div>
                      <div className="h-4 w-3/4 bg-border/50 rounded mb-6"></div>
                      <div className="border-t border-border/80 pt-4 mt-6">
                        <div className="h-4 w-32 bg-border/50 rounded mb-2"></div>
                        <div className="h-3 w-40 bg-border/50 rounded"></div>
                      </div>
                    </article>
                  ))
                ) : (
                  (data?.testimonials || []).map((item) => (
                    <article key={item.author} className="group rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <p className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
                            {item.outcome}
                          </p>
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {item.author.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <Quote className="w-6 h-6 text-secondary mt-4" />
                        <p className="mt-4 text-text-primary leading-relaxed">{item.quote}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-border/80">
                        <p className="font-bold text-primary">{item.author}</p>
                        <p className="text-sm text-text-secondary">{item.meta}</p>
                        <p className="text-xs text-text-secondary mt-1">{item.company}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-primary/20 dark:border-primary/40 bg-linear-to-r from-primary/95 to-primary dark:from-slate-900 dark:to-blue-950 p-8 sm:p-10 lg:p-12 text-white overflow-hidden">
            <div className="absolute -top-16 -right-14 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-secondary/20" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium mb-3">
                  <GraduationCap className="w-4 h-4" />
                  One Community, Many Journeys
                </p>
                <h3 className="text-2xl sm:text-3xl font-black">Find your people, your mentors, your next step.</h3>
                <p className="mt-2 text-white/90 max-w-2xl">
                  Start by creating your profile and exploring the alumni directory to unlock opportunities.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-primary hover:bg-white/90 transition-colors">
                  Create Profile
                </Link>
                <Link href="/directory" className="inline-flex items-center justify-center rounded-xl border border-white/40 px-6 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors">
                  Browse Directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AnimatedImpactValue({ value, start }: { value: string; start: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    const target = Number(value.replace(/[^\d]/g, ""));
    if (Number.isNaN(target)) return;

    const duration = 1400;
    const startTime = performance.now();
    let raf = 0;

    const tick = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);

  const suffix = value.replace(/[\d,]/g, "");
  return `${displayValue.toLocaleString()}${suffix}`;
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition-colors group">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function ScrollingFeedBox({
  title,
  icon,
  link,
  cta,
  loading,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  link: string;
  cta: string;
  loading: boolean;
  items: { primary: string; secondary: string; tertiary: string }[];
}) {
  const mergedItems = [...items, ...items];

  return (
    <article className="rounded-2xl border border-border bg-background p-5 shadow-sm hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          {icon}
          {title}
        </p>
        <Link href={link} className="text-xs font-semibold text-primary hover:underline">
          {cta}
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/60 h-75">
        <div className="absolute inset-x-0 top-0 h-8 bg-linear-to-b from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-background to-transparent z-10 pointer-events-none" />

        <div className="feed-track px-3 py-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-14.5 rounded-lg border border-border bg-background/95 px-3 py-2 mb-2 animate-pulse">
                <div className="h-4 w-3/4 bg-border/50 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-border/50 rounded"></div>
              </div>
            ))
          ) : (
            mergedItems.map((item, index) => (
              <div key={`${title}-${item.primary}-${index}`} className="h-14.5 rounded-lg border border-border bg-background/95 px-3 py-2 mb-2">
                <p className="text-sm font-semibold text-text-primary truncate">{item.primary}</p>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="text-xs text-text-secondary truncate">{item.secondary}</p>
                  <p className="text-[11px] text-text-secondary/90 inline-flex shrink-0 items-center gap-1 text-right">
                    <MapPin className="w-3 h-3" />
                    <span className="max-w-30 truncate">{item.tertiary}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .feed-track {
          animation: feed-scroll 18s linear infinite;
          will-change: transform;
        }

        article:hover .feed-track {
          animation-play-state: paused;
        }

        @keyframes feed-scroll {
          from {
            transform: translateY(0%);
          }
          to {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </article>
  );
}
