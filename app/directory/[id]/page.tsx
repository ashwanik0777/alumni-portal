import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, GraduationCap, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import { alumniProfiles } from "../data";

export default async function AlumniProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = alumniProfiles.find((item) => item.id === id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 left-8 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-8 right-0 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <Link href="/directory" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
            Back to Directory
          </Link>

          <div className="mt-5 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black">{profile.name}</h1>
                <p className="mt-2 text-text-secondary">Batch of {profile.batch}</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-6 w-6" />
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <p className="inline-flex items-center gap-2 text-text-primary font-semibold">
                <Briefcase className="h-4 w-4 text-primary" />
                {profile.role} at {profile.company}
              </p>
              <p className="inline-flex items-center gap-2 text-text-secondary">
                <MapPin className="h-4 w-4 text-primary" />
                {profile.location}
              </p>
              <p className="inline-flex items-start gap-2 text-text-secondary">
                <Star className="h-4 w-4 text-primary mt-0.5" />
                <span>{profile.expertise}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold">About</h2>
            <p className="mt-3 text-text-secondary leading-relaxed">{profile.about}</p>
            <h3 className="mt-5 text-base font-bold">Community Contribution</h3>
            <p className="mt-2 text-text-secondary leading-relaxed">{profile.contribution}</p>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold">Achievements</h2>
            <ul className="mt-3 space-y-2 text-text-secondary">
              {profile.achievements.map((item) => (
                <li key={item} className="inline-flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <article className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold">Mentorship Areas</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.mentorshipAreas.map((item) => (
              <span key={item} className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-sm text-text-primary">
                {item}
              </span>
            ))}
          </div>
        </article>

        <article className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm text-text-secondary">
          <p className="font-semibold text-text-primary inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Public Profile Policy
          </p>
          <p className="mt-2">{profile.contactPolicy}</p>
        </article>
      </section>
    </div>
  );
}
