import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";

type AdminSectionConfig = {
  title: string;
  subtitle: string;
  kpis: Array<{ label: string; value: string; trend: string }>;
  actions: string[];
  tableTitle: string;
  rows: Array<{ name: string; owner: string; status: string; updatedAt: string }>;
};

const sectionMeta: Record<string, AdminSectionConfig> = {
  members: {
    title: "Member Management",
    subtitle: "Review member status, profile quality, and verification progress.",
    kpis: [
      { label: "Pending Verification", value: "34", trend: "+6 this week" },
      { label: "Approved This Month", value: "286", trend: "+12%" },
      { label: "Profile Completion", value: "81%", trend: "+4%" },
    ],
    actions: ["Approve New Profiles", "Request Missing Documents", "Bulk Tag Members"],
    tableTitle: "Latest Member Reviews",
    rows: [
      { name: "Ritika Verma", owner: "Admissions Team", status: "Pending", updatedAt: "10 mins ago" },
      { name: "Arjun Singh", owner: "Admin Desk", status: "Approved", updatedAt: "28 mins ago" },
      { name: "Sana Khan", owner: "Community Team", status: "Needs Update", updatedAt: "1 hour ago" },
    ],
  },
  programs: {
    title: "Program Management",
    subtitle: "Track mentorship and alumni support programs from one place.",
    kpis: [
      { label: "Active Programs", value: "12", trend: "+2 new" },
      { label: "Mentor Matches", value: "94", trend: "+9 this week" },
      { label: "Completion Rate", value: "76%", trend: "+5%" },
    ],
    actions: ["Launch New Program", "Assign Mentors", "Export Weekly Report"],
    tableTitle: "Program Pipeline",
    rows: [
      { name: "Career Launchpad", owner: "Mentorship Cell", status: "Active", updatedAt: "Today" },
      { name: "STEM Bridge", owner: "Academic Team", status: "Draft", updatedAt: "Yesterday" },
      { name: "Leadership Sprint", owner: "Operations", status: "Review", updatedAt: "2 days ago" },
    ],
  },
  events: {
    title: "Event Management",
    subtitle: "Plan events, manage registrations, and monitor attendance trends.",
    kpis: [
      { label: "Upcoming Events", value: "8", trend: "Next 30 days" },
      { label: "Registrations", value: "1,246", trend: "+18%" },
      { label: "Attendance Rate", value: "73%", trend: "+6%" },
    ],
    actions: ["Create Event", "Send Reminder", "Publish Event Report"],
    tableTitle: "Event Operations",
    rows: [
      { name: "Annual Alumni Meet", owner: "Events Team", status: "Live", updatedAt: "12 mins ago" },
      { name: "Career Talk", owner: "Placement Cell", status: "Scheduled", updatedAt: "2 hours ago" },
      { name: "Regional Meetup", owner: "Community Desk", status: "Planning", updatedAt: "Yesterday" },
    ],
  },
  requests: {
    title: "Request Queue",
    subtitle: "Handle approvals, escalations, and pending support requests.",
    kpis: [
      { label: "Open Requests", value: "57", trend: "-4 today" },
      { label: "Urgent Cases", value: "9", trend: "+2" },
      { label: "Avg Resolution", value: "14h", trend: "-1.5h" },
    ],
    actions: ["Open Priority Queue", "Assign Team", "Close Resolved Batch"],
    tableTitle: "Latest Requests",
    rows: [
      { name: "Profile Correction", owner: "Support Team", status: "Open", updatedAt: "5 mins ago" },
      { name: "Mentorship Re-match", owner: "Program Team", status: "In Progress", updatedAt: "36 mins ago" },
      { name: "Certificate Issue", owner: "Admin Desk", status: "Resolved", updatedAt: "1 hour ago" },
    ],
  },
  finance: {
    title: "Finance Overview",
    subtitle: "Monitor donations, payouts, and monthly financial summaries.",
    kpis: [
      { label: "This Month Inflow", value: "₹3.8L", trend: "+11%" },
      { label: "Scholarship Payouts", value: "₹1.6L", trend: "+7%" },
      { label: "Pending Reconciliation", value: "6", trend: "-2" },
    ],
    actions: ["Approve Payout Batch", "Download Ledger", "Run Audit Check"],
    tableTitle: "Finance Snapshots",
    rows: [
      { name: "Scholarship Cycle A", owner: "Finance Team", status: "Settled", updatedAt: "Today" },
      { name: "Event Sponsorship", owner: "Treasury", status: "Processing", updatedAt: "Yesterday" },
      { name: "Donor Refund", owner: "Compliance", status: "Review", updatedAt: "2 days ago" },
    ],
  },
  analytics: {
    title: "Analytics",
    subtitle: "View conversion metrics, retention trends, and user behavior.",
    kpis: [
      { label: "Weekly Active Users", value: "1,942", trend: "+3.6%" },
      { label: "Profile Completion", value: "79%", trend: "+2.1%" },
      { label: "Event Conversion", value: "42%", trend: "+5.4%" },
    ],
    actions: ["Open Retention View", "Compare Monthly Trends", "Export CSV"],
    tableTitle: "Top Performing Funnels",
    rows: [
      { name: "Login to Profile Update", owner: "Growth Team", status: "Healthy", updatedAt: "Live" },
      { name: "Event Visit to Register", owner: "Events Team", status: "Improving", updatedAt: "Today" },
      { name: "Jobs Visit to Apply", owner: "Career Team", status: "Watch", updatedAt: "Yesterday" },
    ],
  },
  security: {
    title: "Security Center",
    subtitle: "Review roles, permissions, and sign-in activity securely.",
    kpis: [
      { label: "Role Conflicts", value: "2", trend: "Needs review" },
      { label: "Failed Logins", value: "14", trend: "Last 24h" },
      { label: "MFA Coverage", value: "68%", trend: "+9%" },
    ],
    actions: ["Review Access Logs", "Force Session Logout", "Rotate Admin Password"],
    tableTitle: "Security Activity",
    rows: [
      { name: "Admin Login Attempt", owner: "Security Bot", status: "Allowed", updatedAt: "3 mins ago" },
      { name: "Permission Change", owner: "Super Admin", status: "Logged", updatedAt: "40 mins ago" },
      { name: "Suspicious IP Flag", owner: "Security Bot", status: "Investigating", updatedAt: "2 hours ago" },
    ],
  },
  settings: {
    title: "System Settings",
    subtitle: "Update dashboard preferences and platform-level configuration.",
    kpis: [
      { label: "Config Profiles", value: "5", trend: "2 active" },
      { label: "Pending Changes", value: "3", trend: "Awaiting publish" },
      { label: "Last Backup", value: "02:10 AM", trend: "Successful" },
    ],
    actions: ["Open Global Config", "Publish Pending Settings", "Download Backup"],
    tableTitle: "Recent Config Updates",
    rows: [
      { name: "Mail Template Update", owner: "Ops Team", status: "Draft", updatedAt: "Today" },
      { name: "Role Policy Rules", owner: "Super Admin", status: "Published", updatedAt: "Yesterday" },
      { name: "Dashboard Defaults", owner: "Admin Desk", status: "Review", updatedAt: "2 days ago" },
    ],
  },
};

export default async function AdminSectionPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0] || "members";
  const info = sectionMeta[key] || {
    title: "Admin Section",
    subtitle: "This section is ready for your business logic and API integration.",
    kpis: [
      { label: "Items", value: "0", trend: "No data" },
      { label: "Updates", value: "0", trend: "No data" },
      { label: "Status", value: "Draft", trend: "Configure" },
    ],
    actions: ["Configure Section", "Connect API", "Add Data Source"],
    tableTitle: "Section Data",
    rows: [
      { name: "No records", owner: "System", status: "Pending", updatedAt: "-" },
    ],
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {info.kpis.map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{item.label}</p>
            <p className="mt-2 text-2xl font-black text-text-primary">{item.value}</p>
            <p className="mt-1 text-xs font-semibold text-primary">{item.trend}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{info.tableTitle}</h3>
            <button className="text-sm font-semibold text-primary hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {info.rows.map((row) => (
              <div key={`${row.name}-${row.updatedAt}`} className="rounded-xl border border-border bg-background p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary">{row.name}</p>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-text-secondary">
                    {row.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                  <p>Owner: {row.owner}</p>
                  <p>Updated: {row.updatedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <p className="mt-1 text-sm text-text-secondary">Run common {info.title.toLowerCase()} operations quickly.</p>
          <div className="mt-4 space-y-2">
            {info.actions.map((action) => (
              <button
                key={action}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
              >
                {action}
                <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        </article>
      </section>

      <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        Back to admin dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
