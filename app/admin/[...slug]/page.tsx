"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Filter,
  FolderKanban,
  Search,
  XCircle,
} from "lucide-react";

type KPI = { label: string; value: string; trend: string };

type AdminRow = {
  id: string;
  name: string;
  owner: string;
  status: "Pending" | "Approved" | "Rejected" | "Needs Info" | "In Progress" | "Live" | "Draft" | "Review" | "Open" | "Resolved" | "Settled" | "Processing" | "Healthy" | "Improving" | "Watch" | "Allowed" | "Logged" | "Investigating";
  updatedAt: string;
  primaryFilterValue: string;
  secondaryFilterValue: string;
  note: string;
};

type AdminSectionConfig = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  kpis: KPI[];
  actions: string[];
  tableTitle: string;
  rows: AdminRow[];
  primaryFilterLabel: string;
  secondaryFilterLabel: string;
  primaryFilterOptions: string[];
  secondaryFilterOptions: string[];
  pageSize: number;
};

const sectionMeta: Record<string, AdminSectionConfig> = {
  members: {
    title: "Member Management",
    subtitle: "New registrations, profile verification, and approvals are managed from this panel.",
    searchPlaceholder: "Search by member name or team",
    kpis: [
      { label: "Pending Approval", value: "34", trend: "+6 this week" },
      { label: "Approved This Month", value: "286", trend: "+12%" },
      { label: "Rejected / Hold", value: "18", trend: "-3 this week" },
    ],
    actions: ["Bulk Approve", "Export Pending List", "Send Reminder Email"],
    tableTitle: "Registration Approval Queue",
    primaryFilterLabel: "Batch",
    secondaryFilterLabel: "Category",
    primaryFilterOptions: ["All", "2012", "2015", "2018", "2021", "2024"],
    secondaryFilterOptions: ["All", "Student", "Alumni", "Mentor"],
    pageSize: 6,
    rows: [
      { id: "M-101", name: "Ritika Verma", owner: "Admissions Team", status: "Pending", updatedAt: "10 mins ago", primaryFilterValue: "2024", secondaryFilterValue: "Student", note: "Registration completed, docs verified." },
      { id: "M-102", name: "Arjun Singh", owner: "Admin Desk", status: "Approved", updatedAt: "28 mins ago", primaryFilterValue: "2015", secondaryFilterValue: "Alumni", note: "Profile approved with mentor preference." },
      { id: "M-103", name: "Sana Khan", owner: "Community Team", status: "Needs Info", updatedAt: "1 hour ago", primaryFilterValue: "2021", secondaryFilterValue: "Student", note: "Passing certificate pending upload." },
      { id: "M-104", name: "Devansh Tomar", owner: "Admissions Team", status: "Pending", updatedAt: "2 hours ago", primaryFilterValue: "2018", secondaryFilterValue: "Mentor", note: "Requested to join mentorship as volunteer." },
      { id: "M-105", name: "Meenal Sharma", owner: "Admin Desk", status: "Rejected", updatedAt: "Today", primaryFilterValue: "2012", secondaryFilterValue: "Alumni", note: "Duplicate account found." },
      { id: "M-106", name: "Aman Chaturvedi", owner: "Admissions Team", status: "Pending", updatedAt: "Today", primaryFilterValue: "2024", secondaryFilterValue: "Student", note: "Mobile verified, email pending." },
      { id: "M-107", name: "Kriti Maurya", owner: "Community Team", status: "Approved", updatedAt: "Yesterday", primaryFilterValue: "2018", secondaryFilterValue: "Alumni", note: "Approved and added to network circles." },
      { id: "M-108", name: "Rohan Mishra", owner: "Admin Desk", status: "Pending", updatedAt: "Yesterday", primaryFilterValue: "2021", secondaryFilterValue: "Student", note: "Documents uploaded; awaiting final review." },
      { id: "M-109", name: "Tanvi Sethi", owner: "Admissions Team", status: "Needs Info", updatedAt: "2 days ago", primaryFilterValue: "2015", secondaryFilterValue: "Mentor", note: "Need employment proof for mentor access." },
      { id: "M-110", name: "Harshit Gupta", owner: "Admin Desk", status: "Approved", updatedAt: "2 days ago", primaryFilterValue: "2012", secondaryFilterValue: "Alumni", note: "Auto-approved after KYC success." },
      { id: "M-111", name: "Pooja Nair", owner: "Community Team", status: "Pending", updatedAt: "3 days ago", primaryFilterValue: "2018", secondaryFilterValue: "Alumni", note: "Awaiting admin decision." },
      { id: "M-112", name: "Aditya Pratap", owner: "Admissions Team", status: "Pending", updatedAt: "3 days ago", primaryFilterValue: "2024", secondaryFilterValue: "Student", note: "First-time registration request." },
    ],
  },
  programs: {
    title: "Program Management",
    subtitle: "Track mentorship and alumni support program lifecycle.",
    searchPlaceholder: "Search by program or owner",
    kpis: [
      { label: "Active Programs", value: "12", trend: "+2 new" },
      { label: "Mentor Matches", value: "94", trend: "+9 this week" },
      { label: "Completion Rate", value: "76%", trend: "+5%" },
    ],
    actions: ["Launch New Program", "Assign Mentors", "Export Weekly Report"],
    tableTitle: "Program Pipeline",
    primaryFilterLabel: "Track",
    secondaryFilterLabel: "Mode",
    primaryFilterOptions: ["All", "Career", "Leadership", "Academic"],
    secondaryFilterOptions: ["All", "Online", "Hybrid", "Onsite"],
    pageSize: 5,
    rows: [
      { id: "P-301", name: "Career Launchpad", owner: "Mentorship Cell", status: "Live", updatedAt: "Today", primaryFilterValue: "Career", secondaryFilterValue: "Hybrid", note: "Current cohort running with 48 mentees." },
      { id: "P-302", name: "STEM Bridge", owner: "Academic Team", status: "Draft", updatedAt: "Yesterday", primaryFilterValue: "Academic", secondaryFilterValue: "Online", note: "Preparing onboarding content." },
      { id: "P-303", name: "Leadership Sprint", owner: "Operations", status: "Review", updatedAt: "2 days ago", primaryFilterValue: "Leadership", secondaryFilterValue: "Onsite", note: "Needs final budget approval." },
      { id: "P-304", name: "Interview Masterclass", owner: "Career Desk", status: "In Progress", updatedAt: "2 days ago", primaryFilterValue: "Career", secondaryFilterValue: "Online", note: "Session plan is being updated." },
      { id: "P-305", name: "Campus to Corporate", owner: "Mentorship Cell", status: "Live", updatedAt: "3 days ago", primaryFilterValue: "Career", secondaryFilterValue: "Hybrid", note: "Mentor slots filled to 92%." },
      { id: "P-306", name: "Public Speaking Path", owner: "Community Team", status: "Review", updatedAt: "4 days ago", primaryFilterValue: "Leadership", secondaryFilterValue: "Onsite", note: "Venue lock pending." },
      { id: "P-307", name: "Research Readiness", owner: "Academic Team", status: "Draft", updatedAt: "5 days ago", primaryFilterValue: "Academic", secondaryFilterValue: "Online", note: "Waiting for curriculum review." },
    ],
  },
  events: {
    title: "Event Management",
    subtitle: "Manage events, registrations, and engagement updates.",
    searchPlaceholder: "Search by event name",
    kpis: [
      { label: "Upcoming Events", value: "8", trend: "Next 30 days" },
      { label: "Registrations", value: "1,246", trend: "+18%" },
      { label: "Attendance Rate", value: "73%", trend: "+6%" },
    ],
    actions: ["Create Event", "Send Reminder", "Publish Event Report"],
    tableTitle: "Event Operations",
    primaryFilterLabel: "Type",
    secondaryFilterLabel: "Venue",
    primaryFilterOptions: ["All", "Meetup", "Webinar", "Workshop"],
    secondaryFilterOptions: ["All", "Onsite", "Online", "Hybrid"],
    pageSize: 5,
    rows: [
      { id: "E-401", name: "Annual Alumni Meet", owner: "Events Team", status: "Live", updatedAt: "12 mins ago", primaryFilterValue: "Meetup", secondaryFilterValue: "Onsite", note: "Registrations crossing expected target." },
      { id: "E-402", name: "Career Talk", owner: "Placement Cell", status: "In Progress", updatedAt: "2 hours ago", primaryFilterValue: "Webinar", secondaryFilterValue: "Online", note: "Speaker confirmation received." },
      { id: "E-403", name: "Regional Meetup", owner: "Community Desk", status: "Review", updatedAt: "Yesterday", primaryFilterValue: "Meetup", secondaryFilterValue: "Hybrid", note: "Budget under review." },
      { id: "E-404", name: "Startup Basics", owner: "Innovation Team", status: "Draft", updatedAt: "Yesterday", primaryFilterValue: "Workshop", secondaryFilterValue: "Online", note: "Invitation draft prepared." },
      { id: "E-405", name: "Mentor Connect Day", owner: "Mentorship Cell", status: "Live", updatedAt: "2 days ago", primaryFilterValue: "Workshop", secondaryFilterValue: "Onsite", note: "Mentor slots 80% booked." },
      { id: "E-406", name: "Women in Leadership", owner: "Community Team", status: "In Progress", updatedAt: "3 days ago", primaryFilterValue: "Webinar", secondaryFilterValue: "Online", note: "Speaker lineup finalized." },
    ],
  },
  requests: {
    title: "Request Queue",
    subtitle: "Resolve support, escalation, and approval requests efficiently.",
    searchPlaceholder: "Search request type or owner",
    kpis: [
      { label: "Open Requests", value: "57", trend: "-4 today" },
      { label: "Urgent Cases", value: "9", trend: "+2" },
      { label: "Avg Resolution", value: "14h", trend: "-1.5h" },
    ],
    actions: ["Open Priority Queue", "Assign Team", "Close Resolved Batch"],
    tableTitle: "Latest Requests",
    primaryFilterLabel: "Priority",
    secondaryFilterLabel: "Team",
    primaryFilterOptions: ["All", "High", "Medium", "Low"],
    secondaryFilterOptions: ["All", "Support", "Program", "Admin"],
    pageSize: 5,
    rows: [
      { id: "R-501", name: "Profile Correction", owner: "Support Team", status: "Open", updatedAt: "5 mins ago", primaryFilterValue: "High", secondaryFilterValue: "Support", note: "DOB mismatch reported by user." },
      { id: "R-502", name: "Mentorship Re-match", owner: "Program Team", status: "In Progress", updatedAt: "36 mins ago", primaryFilterValue: "Medium", secondaryFilterValue: "Program", note: "Awaiting mentor consent." },
      { id: "R-503", name: "Certificate Issue", owner: "Admin Desk", status: "Resolved", updatedAt: "1 hour ago", primaryFilterValue: "Low", secondaryFilterValue: "Admin", note: "Final certificate sent via email." },
      { id: "R-504", name: "Event Refund", owner: "Support Team", status: "Open", updatedAt: "2 hours ago", primaryFilterValue: "High", secondaryFilterValue: "Support", note: "Payment reversal pending." },
      { id: "R-505", name: "Data Export Access", owner: "Admin Desk", status: "Review", updatedAt: "Today", primaryFilterValue: "Medium", secondaryFilterValue: "Admin", note: "Compliance review required." },
      { id: "R-506", name: "Program Attendance Edit", owner: "Program Team", status: "In Progress", updatedAt: "Today", primaryFilterValue: "Low", secondaryFilterValue: "Program", note: "Attendance logs being verified." },
    ],
  },
  finance: {
    title: "Finance Overview",
    subtitle: "Track donations, payouts, reconciliation, and audit-safe activity.",
    searchPlaceholder: "Search by transaction or team",
    kpis: [
      { label: "This Month Inflow", value: "₹3.8L", trend: "+11%" },
      { label: "Scholarship Payouts", value: "₹1.6L", trend: "+7%" },
      { label: "Pending Reconciliation", value: "6", trend: "-2" },
    ],
    actions: ["Approve Payout Batch", "Download Ledger", "Run Audit Check"],
    tableTitle: "Finance Snapshots",
    primaryFilterLabel: "Type",
    secondaryFilterLabel: "Cycle",
    primaryFilterOptions: ["All", "Donation", "Payout", "Refund"],
    secondaryFilterOptions: ["All", "Weekly", "Monthly", "Quarterly"],
    pageSize: 5,
    rows: [
      { id: "F-601", name: "Scholarship Cycle A", owner: "Finance Team", status: "Settled", updatedAt: "Today", primaryFilterValue: "Payout", secondaryFilterValue: "Monthly", note: "All beneficiary transfers completed." },
      { id: "F-602", name: "Event Sponsorship", owner: "Treasury", status: "Processing", updatedAt: "Yesterday", primaryFilterValue: "Donation", secondaryFilterValue: "Weekly", note: "Two donations awaiting confirmation." },
      { id: "F-603", name: "Donor Refund", owner: "Compliance", status: "Review", updatedAt: "2 days ago", primaryFilterValue: "Refund", secondaryFilterValue: "Monthly", note: "Manual validation in progress." },
      { id: "F-604", name: "Campus Grant Disbursal", owner: "Finance Team", status: "Settled", updatedAt: "3 days ago", primaryFilterValue: "Payout", secondaryFilterValue: "Quarterly", note: "Reconciliation done successfully." },
      { id: "F-605", name: "Emergency Fund", owner: "Treasury", status: "Processing", updatedAt: "4 days ago", primaryFilterValue: "Donation", secondaryFilterValue: "Weekly", note: "Bank callback pending." },
    ],
  },
  analytics: {
    title: "Analytics",
    subtitle: "Understand growth, retention, and conversion patterns.",
    searchPlaceholder: "Search by funnel or team",
    kpis: [
      { label: "Weekly Active Users", value: "1,942", trend: "+3.6%" },
      { label: "Profile Completion", value: "79%", trend: "+2.1%" },
      { label: "Event Conversion", value: "42%", trend: "+5.4%" },
    ],
    actions: ["Open Retention View", "Compare Monthly Trends", "Export CSV"],
    tableTitle: "Top Performing Funnels",
    primaryFilterLabel: "Time Range",
    secondaryFilterLabel: "Channel",
    primaryFilterOptions: ["All", "Last 7 days", "Last 30 days", "Quarter"],
    secondaryFilterOptions: ["All", "Organic", "Referral", "Campaign"],
    pageSize: 5,
    rows: [
      { id: "A-701", name: "Login to Profile Update", owner: "Growth Team", status: "Healthy", updatedAt: "Live", primaryFilterValue: "Last 7 days", secondaryFilterValue: "Organic", note: "Steady conversion growth." },
      { id: "A-702", name: "Event Visit to Register", owner: "Events Team", status: "Improving", updatedAt: "Today", primaryFilterValue: "Last 30 days", secondaryFilterValue: "Campaign", note: "Reminder campaign improved conversion." },
      { id: "A-703", name: "Jobs Visit to Apply", owner: "Career Team", status: "Watch", updatedAt: "Yesterday", primaryFilterValue: "Quarter", secondaryFilterValue: "Referral", note: "Drop seen in weekend traffic." },
      { id: "A-704", name: "Mentorship Page to Request", owner: "Mentorship Cell", status: "Healthy", updatedAt: "Yesterday", primaryFilterValue: "Last 30 days", secondaryFilterValue: "Organic", note: "Consistent week-on-week growth." },
      { id: "A-705", name: "Scholarship View to Apply", owner: "Community Team", status: "Improving", updatedAt: "2 days ago", primaryFilterValue: "Quarter", secondaryFilterValue: "Campaign", note: "Login-gated flow stabilized results." },
    ],
  },
  security: {
    title: "Security Center",
    subtitle: "Access logs, suspicious activity, and policy actions.",
    searchPlaceholder: "Search by activity or source",
    kpis: [
      { label: "Role Conflicts", value: "2", trend: "Needs review" },
      { label: "Failed Logins", value: "14", trend: "Last 24h" },
      { label: "MFA Coverage", value: "68%", trend: "+9%" },
    ],
    actions: ["Review Access Logs", "Force Session Logout", "Rotate Admin Password"],
    tableTitle: "Security Activity",
    primaryFilterLabel: "Risk",
    secondaryFilterLabel: "Source",
    primaryFilterOptions: ["All", "High", "Medium", "Low"],
    secondaryFilterOptions: ["All", "Web", "Mobile", "API"],
    pageSize: 5,
    rows: [
      { id: "S-801", name: "Admin Login Attempt", owner: "Security Bot", status: "Allowed", updatedAt: "3 mins ago", primaryFilterValue: "Low", secondaryFilterValue: "Web", note: "Known trusted device." },
      { id: "S-802", name: "Permission Change", owner: "Super Admin", status: "Logged", updatedAt: "40 mins ago", primaryFilterValue: "Medium", secondaryFilterValue: "Web", note: "Role updated for support user." },
      { id: "S-803", name: "Suspicious IP Flag", owner: "Security Bot", status: "Investigating", updatedAt: "2 hours ago", primaryFilterValue: "High", secondaryFilterValue: "API", note: "Rate limit spike detected." },
      { id: "S-804", name: "Token Refresh Failure", owner: "Security Bot", status: "Review", updatedAt: "Today", primaryFilterValue: "Medium", secondaryFilterValue: "Mobile", note: "Multiple retries from same session." },
      { id: "S-805", name: "Forced Logout", owner: "Ops Team", status: "Logged", updatedAt: "Yesterday", primaryFilterValue: "Low", secondaryFilterValue: "Web", note: "Executed after password reset." },
    ],
  },
};

const defaultSection: AdminSectionConfig = {
  title: "Admin Section",
  subtitle: "This section is ready for business rules and API integration.",
  searchPlaceholder: "Search records",
  kpis: [
    { label: "Items", value: "0", trend: "No data" },
    { label: "Updates", value: "0", trend: "No data" },
    { label: "Status", value: "Draft", trend: "Configure" },
  ],
  actions: ["Configure Section", "Connect API", "Add Data Source"],
  tableTitle: "Section Data",
  primaryFilterLabel: "Group",
  secondaryFilterLabel: "Type",
  primaryFilterOptions: ["All"],
  secondaryFilterOptions: ["All"],
  pageSize: 5,
  rows: [
    {
      id: "N-000",
      name: "No records",
      owner: "System",
      status: "Review",
      updatedAt: "-",
      primaryFilterValue: "All",
      secondaryFilterValue: "All",
      note: "Add records to activate this section.",
    },
  ],
};

const MEMBER_REGISTRATION_STORAGE_KEY = "admin_member_registrations_v1";

type PendingMemberRegistration = {
  id: string;
  fullName: string;
  email: string;
  passingYear: string;
  house: string;
  mobile: string;
  fatherName: string;
  status: "Pending" | "Approved" | "Rejected" | "Needs Info";
  submittedAt: string;
};

function getMemberRowsWithRegistrations(baseRows: AdminRow[]) {
  const raw = localStorage.getItem(MEMBER_REGISTRATION_STORAGE_KEY);
  if (!raw) return baseRows;

  try {
    const parsed = JSON.parse(raw) as PendingMemberRegistration[];
    const dynamicRows: AdminRow[] = parsed.map((item) => ({
      id: item.id,
      name: item.fullName,
      owner: "New Registration",
      status: item.status,
      updatedAt: "Just now",
      primaryFilterValue: item.passingYear,
      secondaryFilterValue: "Student",
      note: `${item.house} house • ${item.mobile} • ${item.email}`,
    }));

    const existingIds = new Set(dynamicRows.map((row) => row.id));
    const staticRows = baseRows.filter((row) => !existingIds.has(row.id));
    return [...dynamicRows, ...staticRows];
  } catch {
    return baseRows;
  }
}

function statusChip(status: AdminRow["status"]) {
  if (status === "Approved" || status === "Live" || status === "Resolved" || status === "Settled" || status === "Healthy" || status === "Allowed" || status === "Logged") {
    return "border-emerald-300 bg-emerald-50 text-emerald-700";
  }
  if (status === "Pending" || status === "In Progress" || status === "Processing" || status === "Improving" || status === "Needs Info") {
    return "border-amber-300 bg-amber-50 text-amber-700";
  }
  if (status === "Rejected" || status === "Watch" || status === "Investigating") {
    return "border-rose-300 bg-rose-50 text-rose-700";
  }
  return "border-border bg-card text-text-secondary";
}

function statusIcon(status: AdminRow["status"]) {
  if (status === "Approved" || status === "Live" || status === "Resolved" || status === "Settled" || status === "Healthy" || status === "Allowed" || status === "Logged") {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (status === "Pending" || status === "In Progress" || status === "Processing" || status === "Improving" || status === "Needs Info") {
    return <Clock3 className="h-4 w-4" />;
  }
  if (status === "Rejected" || status === "Watch" || status === "Investigating") {
    return <XCircle className="h-4 w-4" />;
  }
  return <CircleHelp className="h-4 w-4" />;
}

export default function AdminSectionPage() {
  const params = useParams<{ slug?: string[] }>();
  const slug = params?.slug || [];
  const key = slug[0] || "members";

  const info = sectionMeta[key] || defaultSection;

  const [rows, setRows] = useState<AdminRow[]>(info.rows);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [primaryFilter, setPrimaryFilter] = useState("All");
  const [secondaryFilter, setSecondaryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (key === "members") {
      setRows(getMemberRowsWithRegistrations(info.rows));
    } else {
      setRows(info.rows);
    }
    setSearchTerm("");
    setStatusFilter("All");
    setPrimaryFilter("All");
    setSecondaryFilter("All");
    setCurrentPage(1);
  }, [key, info.rows]);

  const availableStatuses = useMemo(() => ["All", ...new Set(info.rows.map((row) => row.status))], [info.rows]);

  const filteredRows = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return rows.filter((row) => {
      const searchMatch =
        normalized.length === 0 ||
        row.name.toLowerCase().includes(normalized) ||
        row.owner.toLowerCase().includes(normalized) ||
        row.id.toLowerCase().includes(normalized);
      const statusMatch = statusFilter === "All" || row.status === statusFilter;
      const primaryMatch = primaryFilter === "All" || row.primaryFilterValue === primaryFilter;
      const secondaryMatch = secondaryFilter === "All" || row.secondaryFilterValue === secondaryFilter;
      return searchMatch && statusMatch && primaryMatch && secondaryMatch;
    });
  }, [primaryFilter, rows, searchTerm, secondaryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / info.pageSize));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * info.pageSize;
    return filteredRows.slice(start, start + info.pageSize);
  }, [currentPage, filteredRows, info.pageSize, totalPages]);

  const handleApprovalAction = (rowId: string, nextStatus: "Approved" | "Rejected" | "Needs Info") => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          status: nextStatus,
          updatedAt: "Just now",
          note:
            nextStatus === "Approved"
              ? "Registration approved by admin."
              : nextStatus === "Rejected"
                ? "Registration rejected after verification review."
                : "Requested additional details from applicant.",
        };
      }),
    );

    if (key === "members") {
      const raw = localStorage.getItem(MEMBER_REGISTRATION_STORAGE_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as PendingMemberRegistration[];
        const updated = parsed.map((item) => (item.id === rowId ? { ...item, status: nextStatus } : item));
        localStorage.setItem(MEMBER_REGISTRATION_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage parse errors and keep UI state intact.
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPrimaryFilter("All");
    setSecondaryFilter("All");
    setCurrentPage(1);
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-primary/20 bg-primary/10 blur-xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full border border-secondary/20 bg-secondary/10 blur-xl" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
              <FolderKanban className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black">{info.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-text-secondary">{info.subtitle}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary">
            <BadgeCheck className="h-4 w-4 text-primary" />
            Live admin controls enabled
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

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold">{info.tableTitle}</h3>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary/30 hover:text-primary"
          >
            <Filter className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="xl:col-span-2">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder={info.searchPlaceholder}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
          </label>

          <SelectFilter
            label="Status"
            value={statusFilter}
            options={availableStatuses}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          />

          <SelectFilter
            label={info.primaryFilterLabel}
            value={primaryFilter}
            options={info.primaryFilterOptions}
            onChange={(value) => {
              setPrimaryFilter(value);
              setCurrentPage(1);
            }}
          />

          <SelectFilter
            label={info.secondaryFilterLabel}
            value={secondaryFilter}
            options={info.secondaryFilterOptions}
            onChange={(value) => {
              setSecondaryFilter(value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          {paginatedRows.map((row) => (
            <article key={row.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-text-primary">{row.name}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {row.id} • Owner: {row.owner}
                  </p>
                </div>

                <span className={["inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", statusChip(row.status)].join(" ")}>
                  {statusIcon(row.status)}
                  {row.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                <span className="rounded-full border border-border bg-card px-2.5 py-1">{info.primaryFilterLabel}: {row.primaryFilterValue}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1">{info.secondaryFilterLabel}: {row.secondaryFilterValue}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1">Updated: {row.updatedAt}</span>
              </div>

              <p className="mt-3 text-sm text-text-secondary">{row.note}</p>

              {key === "members" && row.status === "Pending" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApprovalAction(row.id, "Approved")}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                  >
                    Approve Registration
                  </button>
                  <button
                    onClick={() => handleApprovalAction(row.id, "Needs Info")}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                  >
                    Request More Info
                  </button>
                  <button
                    onClick={() => handleApprovalAction(row.id, "Rejected")}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}

          {paginatedRows.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
              <p className="text-sm font-semibold text-text-primary">No records found for selected filters.</p>
              <p className="mt-1 text-xs text-text-secondary">Try changing filters or clearing search.</p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-text-secondary">
            Showing {paginatedRows.length === 0 ? 0 : (currentPage - 1) * info.pageSize + 1}-
            {Math.min(currentPage * info.pageSize, filteredRows.length)} of {filteredRows.length} records
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={[
                  "h-8 w-8 rounded-lg border text-xs font-bold",
                  page === currentPage
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-text-primary hover:border-primary/30 hover:text-primary",
                ].join(" ")}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <p className="mt-1 text-sm text-text-secondary">Section-specific shortcuts to speed up daily operations.</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {info.actions.map((action) => (
              <button
                key={action}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
              >
                {action}
                <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Management Notes</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Keep all approvals and operations in this workspace. Filters and pagination are tailored to each admin section.
          </p>
          {key === "members" && (
            <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-text-secondary">
              New user registrations appear in <span className="font-semibold text-text-primary">Pending</span>. Use
              <span className="font-semibold text-text-primary"> Approve / Request More Info / Reject</span> buttons to complete approval workflow.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
