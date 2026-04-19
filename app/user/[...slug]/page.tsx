import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";

const sectionMeta: Record<string, { title: string; subtitle: string }> = {
  profile: {
    title: "My Profile",
    subtitle: "Manage your public profile, bio, achievements, and contact preferences.",
  },
  network: {
    title: "My Network",
    subtitle: "View alumni connections, follow requests, and active community contacts.",
  },
  mentorship: {
    title: "Mentorship",
    subtitle: "Track mentor requests, session history, and current learning goals.",
  },
  jobs: {
    title: "Jobs",
    subtitle: "Explore matched opportunities and manage your applications.",
  },
  events: {
    title: "Events",
    subtitle: "See upcoming events, your registrations, and participation status.",
  },
  messages: {
    title: "Messages",
    subtitle: "Check communication updates from mentors, alumni, and admin.",
  },
  settings: {
    title: "Settings",
    subtitle: "Control account preferences, privacy options, and notifications.",
  },
};

export default async function UserSectionPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0] || "profile";
  const info = sectionMeta[key] || {
    title: "User Section",
    subtitle: "This section is ready for live data integration.",
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
            <FolderOpen className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-black">{info.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{info.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Profile Card", "Progress", "Recommendations", "Recent Updates", "Action Panel", "Connections"].map((card) => (
          <article key={card} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-base font-bold">{card}</h3>
            <p className="mt-2 text-sm text-text-secondary">Place API driven user data in this card block.</p>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Open
              <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </section>

      <Link href="/user" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        Back to user dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
