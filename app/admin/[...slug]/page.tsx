import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";

const sectionMeta: Record<string, { title: string; subtitle: string }> = {
  members: {
    title: "Member Management",
    subtitle: "Review member status, profile quality, and verification progress.",
  },
  programs: {
    title: "Program Management",
    subtitle: "Track mentorship and alumni support programs from one place.",
  },
  events: {
    title: "Event Management",
    subtitle: "Plan events, manage registrations, and monitor attendance trends.",
  },
  requests: {
    title: "Request Queue",
    subtitle: "Handle approvals, escalations, and pending support requests.",
  },
  finance: {
    title: "Finance Overview",
    subtitle: "Monitor donations, payouts, and monthly financial summaries.",
  },
  analytics: {
    title: "Analytics",
    subtitle: "View conversion metrics, retention trends, and user behavior.",
  },
  security: {
    title: "Security Center",
    subtitle: "Review roles, permissions, and sign-in activity securely.",
  },
  settings: {
    title: "System Settings",
    subtitle: "Update dashboard preferences and platform-level configuration.",
  },
};

export default async function AdminSectionPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0] || "members";
  const info = sectionMeta[key] || {
    title: "Admin Section",
    subtitle: "This section is ready for your business logic and API integration.",
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
            <FolderKanban className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-black">{info.title}</h2>
            <p className="mt-1 text-sm text-text-secondary">{info.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Overview", "Pending Tasks", "Data Table", "Recent Updates", "Role Access", "Automation"].map((card) => (
          <article key={card} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-base font-bold">{card}</h3>
            <p className="mt-2 text-sm text-text-secondary">
              This block is a placeholder for live data. Connect API and database here.
            </p>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Configure
              <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </section>

      <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        Back to admin dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
