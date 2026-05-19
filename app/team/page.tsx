"use client";

import React, { useEffect, useState } from "react";
import { Github, Linkedin, Code, Coffee, Heart } from "lucide-react";
import Link from "next/link";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  batch: string;
  bio: string;
  image: string;
  github: string;
  linkedin: string;
};

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/team")
      .then(res => res.json())
      .then(data => setTeam(data.team || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6 text-primary">
            <Code className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Meet the Builders
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            The passionate minds behind the Alumni Portal, working to connect our community through technology.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto justify-center">
          {loading ? (
            [1, 2].map(i => (
              <div key={i} className="bg-card rounded-2xl p-8 border border-border animate-pulse flex flex-col items-center">
                <div className="w-32 h-32 mb-6 rounded-full bg-border/60" />
                <div className="h-6 w-40 rounded bg-border/60 mb-2" />
                <div className="h-4 w-32 rounded bg-border/60 mb-4" />
                <div className="h-4 w-48 rounded bg-border/60" />
              </div>
            ))
          ) : team.map((dev) => (
            <div
              key={dev.id}
              className="group bg-card rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
            >
              {dev.image && (
                <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                  <img src={dev.image} alt={dev.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-2xl font-bold text-text-primary mb-1">{dev.name}</h3>
              <p className="text-secondary font-medium text-sm mb-2 uppercase tracking-wider">{dev.role}</p>
              {dev.batch && (
                <div className="inline-block bg-accent/10 px-3 py-1 rounded-full text-xs font-semibold text-accent mb-4">
                  Batch of {dev.batch}
                </div>
              )}
              <p className="text-text-secondary mb-6 leading-relaxed">&quot;{dev.bio}&quot;</p>
              <div className="flex items-center gap-4 mt-auto">
                {dev.github && (
                  <Link href={dev.github} target="_blank" className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-full transition-all">
                    <Github className="w-5 h-5" />
                  </Link>
                )}
                {dev.linkedin && (
                  <Link href={dev.linkedin} target="_blank" className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-full transition-all">
                    <Linkedin className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          ))}

          {/* Join the team card */}
          <div className="group bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-dashed border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center text-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <Coffee className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Join the Initiative</h3>
            <p className="text-text-secondary mb-8">
              Are you a developer, designer, or creator? We&apos;d love to have you on board to make this portal even better.
            </p>
            <Link href="/contact" className="px-6 py-3 bg-white dark:bg-card text-primary font-semibold rounded-xl shadow-sm hover:shadow-md border border-border transition-all flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" /> Get Involved
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
