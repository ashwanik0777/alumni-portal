import Link from "next/link";
import { Briefcase, Filter, GraduationCap, MapPin, Search, Star, Users } from "lucide-react";
import { alumniProfiles } from "./data";

const filters = ["All", "Engineering", "Product", "Design", "Data", "Founders", "Mentors"];

export default function DirectoryPage() {
  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-14 left-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-8 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
            <Users className="h-4 w-4" />
            Alumni Directory
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-3xl">
            Discover Alumni By Batch, Domain, and Location
          </h1>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-2xl">
            Search verified alumni profiles, reconnect with classmates, and build professional relationships
            that grow your career and community impact.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <Search className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, company, expertise..."
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary"
              />
            </div>
            <div className="lg:col-span-3">
              <select className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary">
                <option>All Batches</option>
                <option>2010 - 2013</option>
                <option>2014 - 2017</option>
                <option>2018 - 2022</option>
              </select>
            </div>
            <div className="lg:col-span-3">
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white hover:bg-primary/90 transition-colors">
                <Filter className="h-4 w-4" />
                Apply Filters
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((item, index) => (
              <button
                key={item}
                className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                  index === 0
                    ? "bg-primary text-white border-primary"
                    : "bg-background text-text-secondary border-border hover:border-primary/30 hover:text-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Alumni Profiles</h2>
          <p className="text-sm text-text-secondary">Showing {alumniProfiles.length} members</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {alumniProfiles.map((person) => (
            <article
              key={person.slug}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold">{person.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">Batch of {person.batch}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <p className="inline-flex items-center gap-2 text-text-primary font-medium">
                  <Briefcase className="h-4 w-4 text-primary" />
                  {person.role} at {person.company}
                </p>
                <p className="inline-flex items-center gap-2 text-text-secondary">
                  <MapPin className="h-4 w-4 text-primary" />
                  {person.location}
                </p>
                <p className="inline-flex items-start gap-2 text-text-secondary">
                  <Star className="h-4 w-4 text-primary mt-0.5" />
                  <span>{person.expertise}</span>
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <Link
                  href={`/directory/${person.slug}`}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-text-primary hover:border-primary/30 transition-colors"
                >
                  View Profile
                </Link>
                <button className="rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                  Connect
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20">
        <div className="rounded-3xl border border-primary/20 dark:border-primary/40 bg-linear-to-r from-primary/95 to-primary dark:from-slate-900 dark:to-blue-950 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -left-12 -bottom-16 h-52 w-52 rounded-full bg-secondary/20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mb-3">
                <Users className="h-4 w-4" />
                Expand Your Network
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold">Not listed yet in the directory?</h3>
              <p className="mt-2 text-white/90 max-w-2xl">
                Create your profile and help juniors, peers, and chapter leads find and collaborate with you.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-primary hover:bg-white/90 transition-colors"
            >
              Join Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
