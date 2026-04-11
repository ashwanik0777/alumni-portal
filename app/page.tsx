"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, Calendar, Briefcase, HandHeart, Star, Quote, MapPin, GraduationCap } from "lucide-react";

const impactStats = [
  { label: "Active Alumni", value: "4,200+" },
  { label: "Mentor Sessions", value: "1,300+" },
  { label: "Cities Connected", value: "28" },
  { label: "Opportunities Shared", value: "950+" },
];

const spotlight = [
  {
    title: "Career Circles",
    desc: "Small-group sessions for career planning, interview preparation, and industry transitions.",
    href: "/mentorship",
    cta: "Explore Mentorship",
    eyebrow: "Guided Growth",
    stat: "1:1 + Peer Learning",
  },
  {
    title: "Chapter Reunions",
    desc: "City chapters host structured meetups to strengthen alumni bonds and community collaboration.",
    href: "/events",
    cta: "View Events",
    eyebrow: "Community Momentum",
    stat: "28 Cities Active",
  },
  {
    title: "Alumni Job Board",
    desc: "Curated opportunities from trusted alumni networks, founders, and hiring partners.",
    href: "/jobs",
    cta: "Browse Jobs",
    eyebrow: "Career Advantage",
    stat: "Fresh Roles Weekly",
  },
];

const testimonials = [
  {
    quote: "I reconnected with my batchmates after 9 years and found my current role through the alumni network.",
    author: "Ritika Singh",
    meta: "Batch 2014, Product Manager",
  },
  {
    quote: "The mentorship program gave me clarity, confidence, and direct guidance from seniors in my target domain.",
    author: "Nitin Raj",
    meta: "Batch 2020, Software Engineer",
  },
];

export default function Home() {
  const impactRef = useRef<HTMLElement | null>(null);
  const [impactVisible, setImpactVisible] = useState(false);

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
  }, []);

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
              {impactStats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-background p-5 hover:border-primary/35 hover:-translate-y-1 hover:shadow-md transition-all">
                  <p className="text-2xl sm:text-3xl font-black text-primary">
                    <AnimatedImpactValue value={item.value} start={impactVisible} />
                  </p>
                  <p className="text-sm text-text-secondary mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight */}
      <section className="py-16 lg:py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 lg:mb-12 grid lg:grid-cols-12 gap-5 lg:gap-8 items-end">
            <div className="lg:col-span-8">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Star className="w-4 h-4" />
                What You Can Do Here
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-4 leading-tight">
                Built For Real Outcomes,
                <span className="block text-primary">Not Just Static Profiles</span>
              </h2>
            </div>
            <p className="lg:col-span-4 text-text-secondary leading-relaxed lg:pb-1">
              Every experience below is designed to help alumni grow faster through mentorship,
              opportunities, and meaningful community collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-6 gap-5">
            {spotlight.map((item, index) => (
              <article
                key={item.title}
                className={`group relative rounded-3xl border border-border bg-background p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden ${
                  index === 0 ? "md:col-span-2 xl:col-span-3" : "xl:col-span-3"
                }`}
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative">
                  <p className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                    {item.eyebrow}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary mt-4">{item.title}</h3>
                  <p className="text-text-secondary mt-3 leading-relaxed">{item.desc}</p>

                  <div className="mt-5 pt-4 border-t border-border/80 flex items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm font-semibold text-text-primary">{item.stat}</span>
                    <Link href={item.href} className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                      {item.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">Voices Of Alumni</p>
              <h2 className="text-3xl sm:text-4xl font-black mt-3">Real stories from our network</h2>
              <p className="mt-3 text-text-secondary leading-relaxed">
                From mentorship to referrals and reunion friendships, alumni continue to create meaningful outcomes together.
              </p>
            </div>

            <div className="lg:col-span-8 grid md:grid-cols-2 gap-5">
              {testimonials.map((item) => (
                <article key={item.author} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <Quote className="w-6 h-6 text-secondary" />
                  <p className="mt-4 text-text-primary leading-relaxed">{item.quote}</p>
                  <p className="mt-5 font-bold text-primary">{item.author}</p>
                  <p className="text-sm text-text-secondary">{item.meta}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-20">
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
