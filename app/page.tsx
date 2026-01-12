"use client";

import Link from "next/link";
import { ArrowRight, Users, Calendar, Briefcase, HandHeart } from "lucide-react";

export default function Home() {
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
    </div>
  );
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
