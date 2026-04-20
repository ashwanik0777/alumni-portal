"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BadgeCheck,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Download,
  Filter,
  FolderKanban,
  Printer,
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
  memberDetails?: {
    fullName: string;
    email: string;
    passingYear: string;
    house: string;
    mobile: string;
    fatherName: string;
  };
  rejectionReason?: string;
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

type ProgramActionView = "none" | "launch" | "assign" | "report";
type RequestActionView = "none" | "priority" | "assign" | "close";
type FinanceActionView = "none" | "create" | "mapping" | "payout" | "ledger" | "audit";
type AnalyticsActionView = "none" | "pattern" | "funnel" | "channel";
type AnalyticsDateRange = "7d" | "30d" | "90d" | "custom";

type ScholarshipFundingMapping = {
  id: string;
  donorName: string;
  scholarshipName: string;
  amount: number;
  cycle: "Monthly" | "Quarterly" | "Annual" | "One Time";
  status: "Committed" | "Transferred";
  note: string;
  updatedAt: string;
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
    actions: ["Bulk Approve", "Export Pending List", "Send Reminder Email", "View Approved List"],
    tableTitle: "Registration Approval Queue",
    primaryFilterLabel: "Batch",
    secondaryFilterLabel: "Category",
    primaryFilterOptions: ["All", "2012", "2015", "2018", "2021", "2024"],
    secondaryFilterOptions: ["All", "Student", "Alumni", "Mentor"],
    pageSize: 6,
    rows: [
      {
        id: "M-101",
        name: "Ritika Verma",
        owner: "Admissions Team",
        status: "Pending",
        updatedAt: "10 mins ago",
        primaryFilterValue: "2024",
        secondaryFilterValue: "Student",
        note: "Registration completed, docs verified.",
        memberDetails: {
          fullName: "Ritika Verma",
          email: "ritika.verma@example.com",
          passingYear: "2024",
          house: "Arawali",
          mobile: "9876500123",
          fatherName: "Suresh Verma",
        },
      },
      {
        id: "M-102",
        name: "Arjun Singh",
        owner: "Admin Desk",
        status: "Approved",
        updatedAt: "28 mins ago",
        primaryFilterValue: "2015",
        secondaryFilterValue: "Alumni",
        note: "Profile approved with mentor preference.",
        memberDetails: {
          fullName: "Arjun Singh",
          email: "arjun.singh@example.com",
          passingYear: "2015",
          house: "Neelgiri",
          mobile: "9876500456",
          fatherName: "Mahesh Singh",
        },
      },
      {
        id: "M-103",
        name: "Sana Khan",
        owner: "Community Team",
        status: "Needs Info",
        updatedAt: "1 hour ago",
        primaryFilterValue: "2021",
        secondaryFilterValue: "Student",
        note: "Passing certificate pending upload.",
        memberDetails: {
          fullName: "Sana Khan",
          email: "sana.khan@example.com",
          passingYear: "2021",
          house: "Shiwalik",
          mobile: "9876500789",
          fatherName: "Irfan Khan",
        },
      },
      { id: "M-104", name: "Devansh Tomar", owner: "Admissions Team", status: "Pending", updatedAt: "2 hours ago", primaryFilterValue: "2018", secondaryFilterValue: "Mentor", note: "Requested to join mentorship as volunteer." },
      {
        id: "M-105",
        name: "Meenal Sharma",
        owner: "Admin Desk",
        status: "Rejected",
        updatedAt: "Today",
        primaryFilterValue: "2012",
        secondaryFilterValue: "Alumni",
        note: "Duplicate account found.",
        rejectionReason: "Duplicate profile detected against already approved member ID.",
      },
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
    title: "Scholarship Management",
    subtitle: "Manage scholarship programs, verification, payment release, and compliance from one panel.",
    searchPlaceholder: "Search by scholarship, owner, or record id",
    kpis: [
      { label: "Active Scholarships", value: "9", trend: "+2 this month" },
      { label: "Verified Applications", value: "124", trend: "+18 this week" },
      { label: "Pending Payments", value: "11", trend: "-3" },
    ],
    actions: ["Create Scholarship", "Manage Donor Mapping", "Approve Scholarship Payment Batch", "Export Scholarship Ledger", "Run Eligibility Audit"],
    tableTitle: "Scholarship Operations Queue",
    primaryFilterLabel: "Category",
    secondaryFilterLabel: "Cycle",
    primaryFilterOptions: ["All", "Merit", "Need Based", "Payment", "Emergency"],
    secondaryFilterOptions: ["All", "Monthly", "Quarterly", "Annual"],
    pageSize: 5,
    rows: [
      { id: "SC-801", name: "Merit Excellence 2026", owner: "Scholarship Desk", status: "Processing", updatedAt: "10 mins ago", primaryFilterValue: "Merit", secondaryFilterValue: "Annual", note: "42 applications received, 18 verified." },
      { id: "SC-802", name: "Need Support Cycle Q2", owner: "Finance Team", status: "Review", updatedAt: "1 hour ago", primaryFilterValue: "Need Based", secondaryFilterValue: "Quarterly", note: "Family income documents under manual check." },
      { id: "SC-803", name: "Girls STEM Booster", owner: "Scholarship Desk", status: "Settled", updatedAt: "Today", primaryFilterValue: "Payment", secondaryFilterValue: "Monthly", note: "Current month scholarship payment completed for all approved students." },
      { id: "SC-804", name: "Emergency Relief Fund", owner: "Compliance", status: "Processing", updatedAt: "Yesterday", primaryFilterValue: "Emergency", secondaryFilterValue: "Monthly", note: "Priority verification due to urgent requests." },
      { id: "SC-805", name: "Rural Scholars Program", owner: "Finance Team", status: "Review", updatedAt: "2 days ago", primaryFilterValue: "Payment", secondaryFilterValue: "Quarterly", note: "Bank account validation pending for 6 students." },
    ],
  },
  analytics: {
    title: "Analytics Intelligence Center",
    subtitle: "Visualize patterns, growth, conversions, and channel quality in one place.",
    searchPlaceholder: "Search by funnel or team",
    kpis: [
      { label: "Weekly Active Users", value: "1,942", trend: "+3.6%" },
      { label: "Profile Completion", value: "79%", trend: "+2.1%" },
      { label: "Event Conversion", value: "42%", trend: "+5.4%" },
    ],
    actions: ["Open Pattern Studio", "View Drop-off Funnel", "Export Analytics CSV"],
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
const FRONTEND_EMAIL_OUTBOX_KEY = "admin_email_outbox_v1";
const FIRST_LOGIN_USERS_KEY = "pending_first_login_users_v1";

const defaultScholarshipFundingMap: ScholarshipFundingMapping[] = [
  {
    id: "MAP-901",
    donorName: "Aditi Sharma",
    scholarshipName: "Merit Excellence 2026",
    amount: 150000,
    cycle: "Annual",
    status: "Committed",
    note: "Support for top-performing batch toppers.",
    updatedAt: "Today",
  },
  {
    id: "MAP-902",
    donorName: "Rohit Gupta",
    scholarshipName: "Girls STEM Booster",
    amount: 80000,
    cycle: "Quarterly",
    status: "Transferred",
    note: "Q2 transfer completed for selected recipients.",
    updatedAt: "Yesterday",
  },
  {
    id: "MAP-903",
    donorName: "Nikhil Jain",
    scholarshipName: "Emergency Relief Fund",
    amount: 50000,
    cycle: "One Time",
    status: "Committed",
    note: "Emergency fund reserved for urgent requests.",
    updatedAt: "2 days ago",
  },
];

type PendingMemberRegistration = {
  id: string;
  fullName: string;
  email: string;
  passingYear: string;
  house: string;
  mobile: string;
  fatherName: string;
  status: "Pending" | "Approved" | "Rejected" | "Needs Info";
  rejectionReason?: string;
  submittedAt: string;
};

type FrontendEmailEvent = {
  id: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string;
};

type PendingFirstLoginUser = {
  email: string;
  role: "user";
  firstName: string;
  tempPassword: string;
  currentPassword: string;
  mustSetPassword: boolean;
  createdAt: string;
};

function createTempPassword() {
  const seed = Math.random().toString(36).slice(-5).toUpperCase();
  return `Temp@${seed}9`;
}

function pushFrontendEmail(event: Omit<FrontendEmailEvent, "id" | "createdAt">) {
  const raw = localStorage.getItem(FRONTEND_EMAIL_OUTBOX_KEY);
  const existing = raw ? (JSON.parse(raw) as FrontendEmailEvent[]) : [];
  const payload: FrontendEmailEvent = {
    id: `MAIL-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...event,
  };
  localStorage.setItem(FRONTEND_EMAIL_OUTBOX_KEY, JSON.stringify([payload, ...existing].slice(0, 50)));
}

function saveFirstLoginUser(payload: PendingFirstLoginUser) {
  const raw = localStorage.getItem(FIRST_LOGIN_USERS_KEY);
  const existing = raw ? (JSON.parse(raw) as PendingFirstLoginUser[]) : [];
  const withoutSameEmail = existing.filter((item) => item.email !== payload.email);
  localStorage.setItem(FIRST_LOGIN_USERS_KEY, JSON.stringify([payload, ...withoutSameEmail]));
}

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
      memberDetails: {
        fullName: item.fullName,
        email: item.email,
        passingYear: item.passingYear,
        house: item.house,
        mobile: item.mobile,
        fatherName: item.fatherName,
      },
      rejectionReason: item.rejectionReason,
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
  const params = useParams<{ id?: string }>();
  const key = params?.id || "members";

  const info = sectionMeta[key] || defaultSection;

  const [rows, setRows] = useState<AdminRow[]>(info.rows);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [primaryFilter, setPrimaryFilter] = useState("All");
  const [secondaryFilter, setSecondaryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectingRowId, setRejectingRowId] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [showApprovedView, setShowApprovedView] = useState(false);
  const [approvedSortField, setApprovedSortField] = useState<"name" | "batch" | "updatedAt">("name");
  const [approvedSortDirection, setApprovedSortDirection] = useState<"asc" | "desc">("asc");
  const [programActionView, setProgramActionView] = useState<ProgramActionView>("none");
  const [programActionMessage, setProgramActionMessage] = useState("");
  const [selectedProgramForMentor, setSelectedProgramForMentor] = useState("");
  const [selectedMentors, setSelectedMentors] = useState<string[]>([]);
  const [requestActionView, setRequestActionView] = useState<RequestActionView>("none");
  const [requestActionMessage, setRequestActionMessage] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [requestAssignTeam, setRequestAssignTeam] = useState("");
  const [requestAssignNote, setRequestAssignNote] = useState("");
  const [financeActionView, setFinanceActionView] = useState<FinanceActionView>("none");
  const [financeActionMessage, setFinanceActionMessage] = useState("");
  const [selectedFinanceBatchIds, setSelectedFinanceBatchIds] = useState<string[]>([]);
  const [scholarshipFundingMap, setScholarshipFundingMap] = useState<ScholarshipFundingMapping[]>(defaultScholarshipFundingMap);
  const [analyticsActionView, setAnalyticsActionView] = useState<AnalyticsActionView>("none");
  const [analyticsActionMessage, setAnalyticsActionMessage] = useState("");
  const [analyticsDateRange, setAnalyticsDateRange] = useState<AnalyticsDateRange>("30d");
  const [analyticsCustomFrom, setAnalyticsCustomFrom] = useState("");
  const [analyticsCustomTo, setAnalyticsCustomTo] = useState("");

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
    setRejectingRowId(null);
    setRejectReasonText("");
    setActionMessage("");
    setShowApprovedView(false);
    setApprovedSortField("name");
    setApprovedSortDirection("asc");
    setProgramActionView("none");
    setProgramActionMessage("");
    setSelectedProgramForMentor("");
    setSelectedMentors([]);
    setRequestActionView("none");
    setRequestActionMessage("");
    setSelectedRequestId("");
    setRequestAssignTeam("");
    setRequestAssignNote("");
    setFinanceActionView("none");
    setFinanceActionMessage("");
    setSelectedFinanceBatchIds([]);
    setScholarshipFundingMap(defaultScholarshipFundingMap);
    setAnalyticsActionView("none");
    setAnalyticsActionMessage("");
    setAnalyticsDateRange("30d");
    setAnalyticsCustomFrom("");
    setAnalyticsCustomTo("");
  }, [key, info.rows]);

  const availableStatuses = useMemo(() => ["All", ...new Set(rows.map((row) => row.status))], [rows]);

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

  const approvedRows = useMemo(() => {
    const approvedOnly = rows.filter((row) => row.status === "Approved");
    const sorted = [...approvedOnly].sort((a, b) => {
      if (approvedSortField === "batch") {
        const first = Number(a.memberDetails?.passingYear || a.primaryFilterValue || 0);
        const second = Number(b.memberDetails?.passingYear || b.primaryFilterValue || 0);
        return approvedSortDirection === "asc" ? first - second : second - first;
      }
      const first = approvedSortField === "updatedAt" ? a.updatedAt : a.name.toLowerCase();
      const second = approvedSortField === "updatedAt" ? b.updatedAt : b.name.toLowerCase();
      if (first < second) return approvedSortDirection === "asc" ? -1 : 1;
      if (first > second) return approvedSortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [approvedSortDirection, approvedSortField, rows]);

  const handleApprovalAction = (rowId: string, nextStatus: "Approved" | "Rejected", rejectionReason?: string) => {
    const targetRow = rows.find((row) => row.id === rowId);
    if (!targetRow) return;

    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          status: nextStatus,
          updatedAt: "Just now",
          rejectionReason: nextStatus === "Rejected" ? rejectionReason || "Rejected by admin." : undefined,
          note:
            nextStatus === "Approved"
              ? "Registration approved by admin."
              : "Registration rejected after verification review.",
        };
      }),
    );

    const recipientEmail = targetRow.memberDetails?.email;

    if (nextStatus === "Approved" && recipientEmail) {
      const generatedPassword = createTempPassword();
      saveFirstLoginUser({
        email: recipientEmail.toLowerCase(),
        role: "user",
        firstName: (targetRow.memberDetails?.fullName || targetRow.name).split(" ")[0] || "Alumni",
        tempPassword: generatedPassword,
        currentPassword: generatedPassword,
        mustSetPassword: true,
        createdAt: new Date().toISOString(),
      });

      pushFrontendEmail({
        to: recipientEmail,
        subject: "Alumni Portal Registration Approved",
        body: `Your registration is approved. Login email: ${recipientEmail}. Temporary password: ${generatedPassword}. On first login, you must set a new password.`,
      });

      setActionMessage(`Approved. Frontend email prepared for ${recipientEmail} with temporary password.`);
    }

    if (nextStatus === "Rejected" && recipientEmail) {
      pushFrontendEmail({
        to: recipientEmail,
        subject: "Alumni Portal Registration Rejected",
        body: `Your registration was rejected. Reason: ${rejectionReason || "Rejected by admin."}`,
      });

      setActionMessage(`Rejected. Frontend email prepared for ${recipientEmail} with rejection reason.`);
    }

    if (key === "members") {
      const raw = localStorage.getItem(MEMBER_REGISTRATION_STORAGE_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as PendingMemberRegistration[];
        const updated = parsed.map((item) =>
          item.id === rowId ? { ...item, status: nextStatus, rejectionReason: nextStatus === "Rejected" ? rejectionReason || "Rejected by admin." : undefined } : item,
        );
        localStorage.setItem(MEMBER_REGISTRATION_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage parse errors and keep UI state intact.
      }
    }
  };

  const handleQuickAction = (action: string) => {
    if (key === "programs") {
      if (action === "Launch New Program") {
        setProgramActionView("launch");
        setProgramActionMessage("Fill details and create a new program draft.");
        return;
      }

      if (action === "Assign Mentors") {
        setProgramActionView("assign");
        setProgramActionMessage("Choose a program and assign mentors.");
        return;
      }

      if (action === "Export Weekly Report") {
        setProgramActionView("report");
        setProgramActionMessage("Weekly report preview is ready. Export or print it.");
        return;
      }
    }

    if (key === "requests") {
      if (action === "Open Priority Queue") {
        setRequestActionView("priority");
        setStatusFilter("Open");
        setPrimaryFilter("High");
        setCurrentPage(1);
        setRequestActionMessage("Priority queue opened: showing high priority open requests.");
        return;
      }

      if (action === "Assign Team") {
        setRequestActionView("assign");
        setRequestActionMessage("Select a request and assign it to the appropriate team.");
        return;
      }

      if (action === "Close Resolved Batch") {
        setRequestActionView("close");
        const resolvedIds = rows.filter((row) => row.status === "Resolved").map((row) => row.id);
        if (resolvedIds.length === 0) {
          setRequestActionMessage("No resolved requests found to close in batch.");
          return;
        }
        setRows((prev) =>
          prev.map((row) =>
            resolvedIds.includes(row.id)
              ? { ...row, updatedAt: "Just now", note: "Resolved request archived in closure batch." }
              : row,
          ),
        );
        setRequestActionMessage(`Closed and archived ${resolvedIds.length} resolved request(s).`);
        return;
      }
    }

    if (key === "finance") {
      if (action === "Create Scholarship") {
        setFinanceActionView("create");
        setFinanceActionMessage("Fill details below to create a new scholarship record.");
        return;
      }

      if (action === "Manage Donor Mapping") {
        setFinanceActionView("mapping");
        setFinanceActionMessage("Manage donor-to-scholarship mapping with committed amounts.");
        return;
      }

      if (action === "Approve Scholarship Payment Batch") {
        setFinanceActionView("payout");
        const payoutCandidates = rows
          .filter((row) => row.primaryFilterValue === "Payment" && (row.status === "Processing" || row.status === "Review"))
          .map((row) => row.id);
        setSelectedFinanceBatchIds(payoutCandidates);
        if (payoutCandidates.length === 0) {
          setFinanceActionMessage("No scholarship payment items are pending approval right now.");
          return;
        }
        setFinanceActionMessage(`Selected ${payoutCandidates.length} scholarship payment record(s) for approval batch.`);
        return;
      }

      if (action === "Export Scholarship Ledger") {
        setFinanceActionView("ledger");
        exportFinanceLedger(rows, "full");
        return;
      }

      if (action === "Run Eligibility Audit") {
        setFinanceActionView("audit");
        const flaggedIds = rows
          .filter((row) => row.status === "Processing" || row.status === "Review")
          .map((row) => row.id);
        if (flaggedIds.length === 0) {
          setFinanceActionMessage("Audit check complete. No records were flagged.");
          return;
        }

        setRows((prev) =>
          prev.map((row) =>
            flaggedIds.includes(row.id)
              ? {
                  ...row,
                  status: "Review",
                  owner: "Compliance",
                  updatedAt: "Just now",
                  note: "Eligibility audit flagged this record for manual verification.",
                }
              : row,
          ),
        );
        setFinanceActionMessage(`Eligibility audit complete. ${flaggedIds.length} record(s) moved to review.`);
        return;
      }
    }

    if (key === "analytics") {
      if (action === "Open Pattern Studio") {
        setAnalyticsActionView("pattern");
        setAnalyticsActionMessage("Pattern studio loaded: retention, session depth, and behavior clusters are highlighted.");
        setStatusFilter("All");
        setPrimaryFilter("Last 30 days");
        setSecondaryFilter("All");
        setCurrentPage(1);
        return;
      }

      if (action === "View Drop-off Funnel") {
        setAnalyticsActionView("funnel");
        setAnalyticsActionMessage("Drop-off funnel loaded: identify where users leave the flow.");
        return;
      }

      if (action === "Export Analytics CSV") {
        setAnalyticsActionView("channel");
        exportAnalyticsCsv(filteredRows.length > 0 ? filteredRows : rows);
        return;
      }
    }

    if (key !== "members") {
      setActionMessage(`${action} is prepared for this section. Backend/API connection can be added next.`);
      return;
    }

    if (action === "View Approved List") {
      setShowApprovedView(true);
      setActionMessage("Opened approved members sub-view.");
      return;
    }

    if (action === "Bulk Approve") {
      const pendingIds = rows.filter((row) => row.status === "Pending").map((row) => row.id);
      if (pendingIds.length === 0) {
        setActionMessage("No pending registrations available for bulk approval.");
        return;
      }

      setRows((prev) =>
        prev.map((row) =>
          pendingIds.includes(row.id)
            ? { ...row, status: "Approved", updatedAt: "Just now", note: "Approved in bulk by admin.", rejectionReason: undefined }
            : row,
        ),
      );

      const raw = localStorage.getItem(MEMBER_REGISTRATION_STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PendingMemberRegistration[];
          const updated = parsed.map((item) =>
            pendingIds.includes(item.id) ? { ...item, status: "Approved", rejectionReason: undefined } : item,
          );
          localStorage.setItem(MEMBER_REGISTRATION_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Keep UI update even if storage parsing fails.
        }
      }

      setActionMessage(`${pendingIds.length} pending registrations approved.`);
      return;
    }

    if (action === "Export Pending List") {
      const pendingRows = rows.filter((row) => row.status === "Pending");
      if (pendingRows.length === 0) {
        setActionMessage("No pending records to export.");
        return;
      }

      const csvHeader = "ID,Full Name,Email,Batch/Passing Year,House,Mobile,Father's Name,Status,Updated At";
      const csvRows = pendingRows.map((row) => {
        const details = row.memberDetails;
        return [
          row.id,
          details?.fullName || row.name,
          details?.email || "N/A",
          details?.passingYear || row.primaryFilterValue,
          details?.house || "N/A",
          details?.mobile || "N/A",
          details?.fatherName || "N/A",
          row.status,
          row.updatedAt,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",");
      });

      const blob = new Blob([[csvHeader, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `pending-members-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      setActionMessage(`Pending list exported successfully (${pendingRows.length} records).`);
      return;
    }

    if (action === "Send Reminder Email") {
      const pendingCount = rows.filter((row) => row.status === "Pending").length;
      setActionMessage(`Reminder workflow triggered for ${pendingCount} pending member(s).`);
      return;
    }

    setActionMessage(`${action} completed.`);
  };

  const exportApprovedList = () => {
    if (approvedRows.length === 0) {
      setActionMessage("No approved records available to export.");
      return;
    }

    const csvHeader = "ID,Full Name,Email,Batch/Passing Year,House,Mobile,Father's Name,Updated At";
    const csvRows = approvedRows.map((row) => {
      const details = row.memberDetails;
      return [
        row.id,
        details?.fullName || row.name,
        details?.email || "N/A",
        details?.passingYear || row.primaryFilterValue,
        details?.house || "N/A",
        details?.mobile || "N/A",
        details?.fatherName || "N/A",
        row.updatedAt,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",");
    });

    const blob = new Blob([[csvHeader, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `approved-members-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setActionMessage(`Approved list exported successfully (${approvedRows.length} records).`);
  };

  const printApprovedList = () => {
    if (approvedRows.length === 0) {
      setActionMessage("No approved records available to print.");
      return;
    }
    window.print();
  };

  const updateApprovedSort = (field: "name" | "batch" | "updatedAt") => {
    if (approvedSortField === field) {
      setApprovedSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setApprovedSortField(field);
    setApprovedSortDirection("asc");
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

  const mentorPool = [
    "Ritika Verma",
    "Arjun Singh",
    "Sana Khan",
    "Kriti Maurya",
    "Harshit Gupta",
    "Neha Dwivedi",
  ];

  const assignMentorsToProgram = () => {
    if (!selectedProgramForMentor) {
      setProgramActionMessage("Please select a program first.");
      return;
    }
    if (selectedMentors.length === 0) {
      setProgramActionMessage("Please select at least one mentor.");
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === selectedProgramForMentor
          ? {
              ...row,
              status: row.status === "Draft" ? "In Progress" : row.status,
              updatedAt: "Just now",
              note: `Mentors assigned: ${selectedMentors.join(", ")}.`,
            }
          : row,
      ),
    );
    setProgramActionMessage(`Mentors assigned successfully to ${selectedProgramForMentor}.`);
    setSelectedMentors([]);
  };

  const exportProgramWeeklyReport = () => {
    const header = "Program ID,Program Name,Track,Mode,Status,Updated At,Note";
    const content = rows.map((row) => [row.id, row.name, row.primaryFilterValue, row.secondaryFilterValue, row.status, row.updatedAt, row.note]);
    const csvRows = content.map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
    const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `program-weekly-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setProgramActionMessage("Weekly report exported successfully.");
  };

  const printProgramWeeklyReport = () => {
    window.print();
  };

  const requestTeams = ["Support", "Program", "Admin", "Compliance", "Operations"];

  const assignRequestToTeam = () => {
    if (!selectedRequestId) {
      setRequestActionMessage("Please select a request first.");
      return;
    }
    if (!requestAssignTeam) {
      setRequestActionMessage("Please select a team for assignment.");
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === selectedRequestId
          ? {
              ...row,
              owner: `${requestAssignTeam} Team`,
              status: row.status === "Open" || row.status === "Review" ? "In Progress" : row.status,
              secondaryFilterValue: requestAssignTeam,
              updatedAt: "Just now",
              note: requestAssignNote.trim()
                ? `Assigned to ${requestAssignTeam} Team. Note: ${requestAssignNote.trim()}`
                : `Assigned to ${requestAssignTeam} Team for handling.`,
            }
          : row,
      ),
    );

    setRequestActionMessage(`Request ${selectedRequestId} assigned to ${requestAssignTeam} Team.`);
    setRequestAssignNote("");
  };

  const updateRequestStatus = (rowId: string, nextStatus: "In Progress" | "Resolved" | "Review") => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              status: nextStatus,
              updatedAt: "Just now",
              note:
                nextStatus === "Resolved"
                  ? "Request resolved and marked complete by admin."
                  : nextStatus === "Review"
                    ? "Request escalated for review."
                    : "Request accepted and moved to in-progress queue.",
            }
          : row,
      ),
    );
    setActionMessage(`Request ${rowId} updated to ${nextStatus}.`);
  };

  const financePayoutCandidates = useMemo(
    () => rows.filter((row) => row.primaryFilterValue === "Payment" && (row.status === "Processing" || row.status === "Review")),
    [rows],
  );

  const totalCommittedFunding = useMemo(
    () => scholarshipFundingMap.reduce((sum, item) => sum + item.amount, 0),
    [scholarshipFundingMap],
  );

  const totalTransferredFunding = useMemo(
    () => scholarshipFundingMap.filter((item) => item.status === "Transferred").reduce((sum, item) => sum + item.amount, 0),
    [scholarshipFundingMap],
  );

  const fundingByScholarship = useMemo(() => {
    const map = new Map<string, number>();
    scholarshipFundingMap.forEach((item) => {
      map.set(item.scholarshipName, (map.get(item.scholarshipName) || 0) + item.amount);
    });
    return map;
  }, [scholarshipFundingMap]);

  const createScholarshipRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const owner = String(form.get("owner") || "").trim();
    const category = String(form.get("category") || "").trim();
    const cycle = String(form.get("cycle") || "").trim();
    const note = String(form.get("note") || "").trim();

    if (!name || !owner || !category || !cycle) {
      setFinanceActionMessage("Please fill all required scholarship fields.");
      return;
    }

    const generatedId = `SC-${Math.floor(Date.now() / 1000).toString().slice(-4)}`;
    setRows((prev) => [
      {
        id: generatedId,
        name,
        owner,
        status: "Processing",
        updatedAt: "Just now",
        primaryFilterValue: category,
        secondaryFilterValue: cycle,
        note: note || "New scholarship created from admin quick actions.",
      },
      ...prev,
    ]);

    setFinanceActionMessage(`Scholarship ${name} created successfully with id ${generatedId}.`);
    event.currentTarget.reset();
  };

  const addDonorScholarshipMapping = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const donorName = String(form.get("donorName") || "").trim();
    const scholarshipName = String(form.get("scholarshipName") || "").trim();
    const amountValue = String(form.get("amount") || "").trim();
    const cycle = String(form.get("cycle") || "").trim() as ScholarshipFundingMapping["cycle"];
    const note = String(form.get("note") || "").trim();

    const amount = Number(amountValue);
    if (!donorName || !scholarshipName || !cycle || Number.isNaN(amount) || amount <= 0) {
      setFinanceActionMessage("Please enter donor, scholarship, cycle, and valid amount.");
      return;
    }

    const generatedId = `MAP-${Math.floor(Date.now() / 1000).toString().slice(-4)}`;
    setScholarshipFundingMap((prev) => [
      {
        id: generatedId,
        donorName,
        scholarshipName,
        amount,
        cycle,
        status: "Committed",
        note: note || "New donor commitment added.",
        updatedAt: "Just now",
      },
      ...prev,
    ]);

    setFinanceActionMessage(`Mapping created: ${donorName} committed ₹${amount.toLocaleString("en-IN")} for ${scholarshipName}.`);
    event.currentTarget.reset();
  };

  const updateMappingStatus = (mappingId: string, nextStatus: ScholarshipFundingMapping["status"]) => {
    setScholarshipFundingMap((prev) =>
      prev.map((item) =>
        item.id === mappingId
          ? {
              ...item,
              status: nextStatus,
              updatedAt: "Just now",
              note: nextStatus === "Transferred" ? "Amount transferred and logged." : item.note,
            }
          : item,
      ),
    );
    setFinanceActionMessage(`Donor mapping ${mappingId} marked as ${nextStatus}.`);
  };

  const toggleFinanceBatchSelection = (rowId: string) => {
    setSelectedFinanceBatchIds((prev) => (prev.includes(rowId) ? prev.filter((item) => item !== rowId) : [...prev, rowId]));
  };

  const approveSelectedPayoutBatch = () => {
    if (selectedFinanceBatchIds.length === 0) {
      setFinanceActionMessage("Please select at least one payout record.");
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        selectedFinanceBatchIds.includes(row.id)
          ? {
              ...row,
              status: "Settled",
              updatedAt: "Just now",
              note: "Approved in scholarship payment batch and marked settled.",
            }
          : row,
      ),
    );
    setFinanceActionMessage(`Approved scholarship payment batch for ${selectedFinanceBatchIds.length} record(s).`);
    setSelectedFinanceBatchIds([]);
  };

  const exportFinanceLedger = (sourceRows: AdminRow[], scope: "full" | "filtered") => {
    const header = "Record ID,Entry Name,Owner,Type,Cycle,Status,Updated At,Note";
    const csvRows = sourceRows.map((row) =>
      [row.id, row.name, row.owner, row.primaryFilterValue, row.secondaryFilterValue, row.status, row.updatedAt, row.note]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `scholarship-ledger-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setFinanceActionMessage(`Scholarship ledger downloaded (${sourceRows.length} row(s), ${scope} scope).`);
  };

  const updateFinanceRowStatus = (rowId: string, nextStatus: "Settled" | "Processing" | "Review") => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              status: nextStatus,
              updatedAt: "Just now",
              note:
                nextStatus === "Settled"
                  ? "Transaction confirmed and settled."
                  : nextStatus === "Review"
                    ? "Entry moved to compliance review."
                    : "Entry moved back to processing queue.",
            }
          : row,
      ),
    );
    setActionMessage(`Finance entry ${rowId} updated to ${nextStatus}.`);
  };

  const exportAnalyticsCsv = (sourceRows: AdminRow[]) => {
    const header = "Funnel ID,Funnel Name,Owner,Status,Time Range,Channel,Updated At,Insight";
    const csvRows = sourceRows.map((row) =>
      [row.id, row.name, row.owner, row.status, row.primaryFilterValue, row.secondaryFilterValue, row.updatedAt, row.note]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `analytics-insights-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setAnalyticsActionMessage(`Analytics CSV exported (${sourceRows.length} row(s)).`);
  };

  const analyticsRangeData = useMemo(
    () => ({
      "7d": {
        traffic: [
          { day: "Mon", visits: 820, active: 430 },
          { day: "Tue", visits: 910, active: 472 },
          { day: "Wed", visits: 980, active: 520 },
          { day: "Thu", visits: 1080, active: 566 },
          { day: "Fri", visits: 1190, active: 612 },
          { day: "Sat", visits: 1010, active: 534 },
          { day: "Sun", visits: 940, active: 501 },
        ],
        channels: [
          { channel: "Organic", value: 39, color: "#0f766e" },
          { channel: "Referral", value: 24, color: "#2563eb" },
          { channel: "Campaign", value: 25, color: "#d97706" },
          { channel: "Direct", value: 12, color: "#7c3aed" },
        ],
        funnel: [
          { step: "Landing Visit", count: 100, note: "Base traffic" },
          { step: "Account Login", count: 76, note: "24% drop" },
          { step: "Profile View", count: 61, note: "15% drop" },
          { step: "Action Intent", count: 47, note: "14% drop" },
          { step: "Final Submit", count: 34, note: "13% drop" },
        ],
      },
      "30d": {
        traffic: [
          { day: "W1", visits: 5120, active: 2450 },
          { day: "W2", visits: 5480, active: 2610 },
          { day: "W3", visits: 5890, active: 2790 },
          { day: "W4", visits: 6210, active: 2960 },
        ],
        channels: [
          { channel: "Organic", value: 41, color: "#0f766e" },
          { channel: "Referral", value: 22, color: "#2563eb" },
          { channel: "Campaign", value: 27, color: "#d97706" },
          { channel: "Direct", value: 10, color: "#7c3aed" },
        ],
        funnel: [
          { step: "Landing Visit", count: 100, note: "Base traffic" },
          { step: "Account Login", count: 74, note: "26% drop" },
          { step: "Profile View", count: 58, note: "16% drop" },
          { step: "Action Intent", count: 44, note: "14% drop" },
          { step: "Final Submit", count: 31, note: "13% drop" },
        ],
      },
      "90d": {
        traffic: [
          { day: "M1", visits: 18400, active: 9020 },
          { day: "M2", visits: 19650, active: 9510 },
          { day: "M3", visits: 20920, active: 10180 },
        ],
        channels: [
          { channel: "Organic", value: 44, color: "#0f766e" },
          { channel: "Referral", value: 19, color: "#2563eb" },
          { channel: "Campaign", value: 29, color: "#d97706" },
          { channel: "Direct", value: 8, color: "#7c3aed" },
        ],
        funnel: [
          { step: "Landing Visit", count: 100, note: "Base traffic" },
          { step: "Account Login", count: 72, note: "28% drop" },
          { step: "Profile View", count: 54, note: "18% drop" },
          { step: "Action Intent", count: 39, note: "15% drop" },
          { step: "Final Submit", count: 27, note: "12% drop" },
        ],
      },
    }),
    [],
  );

  const customWindowDays = useMemo(() => {
    if (analyticsDateRange !== "custom" || !analyticsCustomFrom || !analyticsCustomTo) return 30;
    const from = new Date(analyticsCustomFrom);
    const to = new Date(analyticsCustomTo);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return 30;
    return Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }, [analyticsCustomFrom, analyticsCustomTo, analyticsDateRange]);

  const analyticsRangeKey = useMemo<"7d" | "30d" | "90d">(() => {
    if (analyticsDateRange !== "custom") return analyticsDateRange;
    if (customWindowDays <= 14) return "7d";
    if (customWindowDays <= 45) return "30d";
    return "90d";
  }, [analyticsDateRange, customWindowDays]);

  const analyticsRangeMultiplier = useMemo(() => {
    if (analyticsDateRange !== "custom") return 1;
    return Math.min(3, Math.max(0.4, customWindowDays / 30));
  }, [analyticsDateRange, customWindowDays]);

  const analyticsTrafficTrend = useMemo(() => {
    const source = analyticsRangeData[analyticsRangeKey].traffic;
    if (analyticsDateRange !== "custom") return source;
    return source.map((item) => ({
      ...item,
      visits: Math.round(item.visits * analyticsRangeMultiplier),
      active: Math.round(item.active * analyticsRangeMultiplier),
    }));
  }, [analyticsDateRange, analyticsRangeData, analyticsRangeKey, analyticsRangeMultiplier]);

  const analyticsChannelMix = useMemo(() => analyticsRangeData[analyticsRangeKey].channels, [analyticsRangeData, analyticsRangeKey]);

  const analyticsFunnel = useMemo(() => analyticsRangeData[analyticsRangeKey].funnel, [analyticsRangeData, analyticsRangeKey]);

  const analyticsHeatmapRows = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];
  const analyticsHeatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const analyticsHeatmapValues = [
    [28, 24, 26, 29, 31, 22, 20],
    [36, 34, 32, 37, 40, 27, 25],
    [52, 49, 55, 58, 63, 42, 38],
    [61, 59, 64, 68, 72, 51, 46],
    [66, 62, 69, 74, 79, 57, 50],
    [44, 41, 46, 48, 54, 39, 33],
  ];

  const analyticsPatterns = useMemo(() => {
    const base = [
      "Referral users complete profile faster than campaign users.",
      "Scholarship application intent peaks on Thu evening.",
      "Event conversion drops when reminders are delayed.",
      "Jobs page has high revisit but lower final submit.",
    ];

    if (analyticsDateRange === "custom") {
      return [
        `Custom window active for ${customWindowDays} day(s).`,
        ...base,
      ];
    }
    return base;
  }, [analyticsDateRange, customWindowDays]);

  const analyticsRangeLabel = analyticsDateRange === "custom" ? `Custom (${customWindowDays}d)` : analyticsDateRange.toUpperCase();

  const analyticsBoardScale = useMemo(() => {
    if (analyticsDateRange === "custom") return analyticsRangeMultiplier;
    if (analyticsRangeKey === "7d") return 0.92;
    if (analyticsRangeKey === "90d") return 1.08;
    return 1;
  }, [analyticsDateRange, analyticsRangeKey, analyticsRangeMultiplier]);

  const analyticsSectionHealth = useMemo(
    () =>
      [
        { name: "Home", value: 92, color: "bg-emerald-500" },
        { name: "Directory", value: 78, color: "bg-sky-500" },
        { name: "Jobs", value: 61, color: "bg-amber-500" },
        { name: "Scholarships", value: 73, color: "bg-violet-500" },
        { name: "Mentorship", value: 85, color: "bg-primary" },
      ].map((item) => ({ ...item, value: Math.min(99, Math.max(35, Math.round(item.value * analyticsBoardScale))) })),
    [analyticsBoardScale],
  );

  const analyticsGoalProgress = useMemo(
    () =>
      [
        { goal: "Profile Completion", done: 79, target: 90 },
        { goal: "Event Registration", done: 42, target: 55 },
        { goal: "Mentorship Request", done: 64, target: 70 },
        { goal: "Scholarship Apply", done: 58, target: 68 },
      ].map((item) => ({ ...item, done: Math.min(98, Math.max(18, Math.round(item.done * analyticsBoardScale))) })),
    [analyticsBoardScale],
  );

  const analyticsEngagementSeries = useMemo(
    () =>
      [
        { name: "Login", value: 88 },
        { name: "Profile Update", value: 64 },
        { name: "Event Register", value: 42 },
        { name: "Mentorship Request", value: 57 },
        { name: "Scholarship Apply", value: 51 },
        { name: "Job Apply", value: 37 },
      ].map((item) => ({ ...item, value: Math.min(99, Math.max(12, Math.round(item.value * analyticsBoardScale))) })),
    [analyticsBoardScale],
  );

  const trafficPolyline = useMemo(() => {
    const maxValue = Math.max(...analyticsTrafficTrend.map((item) => item.visits));
    return analyticsTrafficTrend
      .map((item, index) => {
        const x = (index / (analyticsTrafficTrend.length - 1)) * 100;
        const y = 100 - (item.visits / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [analyticsTrafficTrend]);

  const activePolyline = useMemo(() => {
    const maxValue = Math.max(...analyticsTrafficTrend.map((item) => item.visits));
    return analyticsTrafficTrend
      .map((item, index) => {
        const x = (index / (analyticsTrafficTrend.length - 1)) * 100;
        const y = 100 - (item.active / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [analyticsTrafficTrend]);

  const channelPieGradient = useMemo(() => {
    let cursor = 0;
    const pieces = analyticsChannelMix.map((item) => {
      const start = cursor;
      cursor += item.value;
      return `${item.color} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${pieces.join(",")})`;
  }, [analyticsChannelMix]);

  const heatValueClass = (value: number) => {
    if (value >= 70) return "bg-emerald-600 text-white";
    if (value >= 55) return "bg-emerald-500 text-white";
    if (value >= 40) return "bg-emerald-200 text-emerald-900";
    return "bg-emerald-50 text-emerald-700";
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

      {key === "analytics" && (
        <section className="space-y-4">
          <article className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-text-primary">Date Range Filter</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  { label: "7D", value: "7d" },
                  { label: "30D", value: "30d" },
                  { label: "90D", value: "90d" },
                  { label: "Custom", value: "custom" },
                ] as const).map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setAnalyticsDateRange(item.value)}
                    className={[
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold",
                      analyticsDateRange === item.value
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-text-primary hover:border-primary/30 hover:text-primary",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {analyticsDateRange === "custom" && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label>
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">From Date</span>
                  <input
                    type="date"
                    value={analyticsCustomFrom}
                    onChange={(event) => setAnalyticsCustomFrom(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">To Date</span>
                  <input
                    type="date"
                    value={analyticsCustomTo}
                    onChange={(event) => setAnalyticsCustomTo(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                  />
                </label>
 <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Applied Window
                <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-secondary">
                  <p className="mt-1">{customWindowDays} day(s)</p>
                </div>
                </span>
              </div>
              
            )}
          </article>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <article className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-text-primary">Website Traffic Pattern Graph</h3>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-text-secondary">{analyticsRangeLabel} trend</span>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-background p-3">
                <svg viewBox="0 0 100 100" className="h-56 w-full">
                  <polyline points="0,100 100,100" fill="none" stroke="#e5e7eb" strokeWidth="0.8" />
                  <polyline points={trafficPolyline} fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" />
                  <polyline points={activePolyline} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-border bg-background px-2.5 py-1 font-semibold text-text-secondary">Visits: Teal line</span>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 font-semibold text-text-secondary">Active users: Amber line</span>
                {analyticsTrafficTrend.map((point) => (
                  <span key={`trend-${point.day}`} className="rounded-full border border-border bg-background px-2.5 py-1 text-text-secondary">
                    {point.day}: {point.visits}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-base font-black text-text-primary">Traffic Channel Pie Chart</h3>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-36 w-36 rounded-full border border-border" style={{ background: channelPieGradient }} />
                <div className="space-y-2 text-xs">
                  {analyticsChannelMix.map((item) => (
                    <div key={item.channel} className="flex items-center gap-2 text-text-secondary">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-text-primary">{item.channel}</span>
                      <span>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-text-secondary">Organic leads volume, while campaign is strong but needs better retention after first session.</p>
            </article>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <article className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
              <h3 className="text-base font-black text-text-primary">User Journey Drop-off Funnel</h3>
              <div className="mt-4 space-y-3">
                {analyticsFunnel.map((step) => (
                  <div key={step.step}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary">{step.step}</span>
                      <span className="text-text-secondary">{step.count}% • {step.note}</span>
                    </div>
                    <div className="h-3 rounded-full bg-background">
                      <div className="h-3 rounded-full bg-linear-to-r from-primary to-secondary" style={{ width: `${step.count}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-base font-black text-text-primary">Pattern Alerts</h3>
              <div className="mt-3 space-y-2">
                {analyticsPatterns.map((pattern) => (
                  <div key={pattern} className="rounded-xl border border-border bg-background p-3 text-xs text-text-secondary">
                    {pattern}
                  </div>
                ))}
              </div>
            </article>
          </div>

          <article className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-base font-black text-text-primary">Weekly Activity Heatmap</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-1 text-center text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left text-text-secondary">Time</th>
                    {analyticsHeatmapDays.map((day) => (
                      <th key={day} className="px-2 py-1 text-text-secondary">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analyticsHeatmapRows.map((slot, rowIndex) => (
                    <tr key={slot}>
                      <td className="px-2 py-1 text-left font-semibold text-text-secondary">{slot}</td>
                      {analyticsHeatmapValues[rowIndex].map((value, cellIndex) => (
                        <td key={`${slot}-${analyticsHeatmapDays[cellIndex]}`} className={`rounded-md px-2 py-1 font-semibold ${heatValueClass(value)}`}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {key !== "analytics" && (
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

        {actionMessage && (
          <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-sm text-text-secondary">
            {actionMessage}
          </div>
        )}

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
          {key === "members" && showApprovedView ? (
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-text-primary">Approved Members List</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowApprovedView(false)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                  >
                    Back To Queue
                  </button>
                  <button
                    onClick={exportApprovedList}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                  >
                    <Download className="h-3.5 w-3.5" /> Export
                  </button>
                  <button
                    onClick={printApprovedList}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead>
                    <tr>
                      <SortableHeader label="Full Name" onClick={() => updateApprovedSort("name")} active={approvedSortField === "name"} direction={approvedSortDirection} />
                      <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Email</th>
                      <SortableHeader label="Batch" onClick={() => updateApprovedSort("batch")} active={approvedSortField === "batch"} direction={approvedSortDirection} />
                      <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">House</th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Mobile</th>
                      <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Father's Name</th>
                      <SortableHeader label="Updated" onClick={() => updateApprovedSort("updatedAt")} active={approvedSortField === "updatedAt"} direction={approvedSortDirection} />
                    </tr>
                  </thead>
                  <tbody>
                    {approvedRows.map((row) => (
                      <tr key={`approved-${row.id}`}>
                        <td className="border-b border-border/70 px-3 py-2 font-semibold text-text-primary">{row.memberDetails?.fullName || row.name}</td>
                        <td className="border-b border-border/70 px-3 py-2 text-text-secondary">{row.memberDetails?.email || "N/A"}</td>
                        <td className="border-b border-border/70 px-3 py-2 text-text-secondary">{row.memberDetails?.passingYear || row.primaryFilterValue}</td>
                        <td className="border-b border-border/70 px-3 py-2 text-text-secondary">{row.memberDetails?.house || "N/A"}</td>
                        <td className="border-b border-border/70 px-3 py-2 text-text-secondary">{row.memberDetails?.mobile || "N/A"}</td>
                        <td className="border-b border-border/70 px-3 py-2 text-text-secondary">{row.memberDetails?.fatherName || "N/A"}</td>
                        <td className="border-b border-border/70 px-3 py-2 text-text-secondary">{row.updatedAt}</td>
                      </tr>
                    ))}
                    {approvedRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-sm text-text-secondary">
                          No approved members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : paginatedRows.map((row) => (
            <article key={row.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-text-primary">
                    {key === "members" ? `Full Name: ${row.memberDetails?.fullName || row.name}` : row.name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {row.id} • Owner: {row.owner}
                  </p>
                </div>

                <span className={["inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", statusChip(row.status)].join(" ")}>
                  {statusIcon(row.status)}
                  {row.status}
                </span>
              </div>

              

              {key === "members" && row.memberDetails && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">Email: {row.memberDetails.email}</span>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">Batch: {row.memberDetails.passingYear}</span>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">House: {row.memberDetails.house}</span>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">Mobile Number: {row.memberDetails.mobile}</span>
                  <span className="rounded-full border border-border bg-card px-2.5 py-1">Father's Name: {row.memberDetails.fatherName}</span>
                   <span className="rounded-full border border-border bg-card px-2.5 py-1">Updated: {row.updatedAt}</span>
                </div>
              )}

              <p className="mt-3 text-sm text-text-secondary">{row.note}</p>

              {key === "finance" && (
                <p className="mt-2 text-xs font-semibold text-text-secondary">
                  Mapped Funding: ₹{(fundingByScholarship.get(row.name) || 0).toLocaleString("en-IN")}
                </p>
              )}

              {key === "requests" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(row.status === "Open" || row.status === "Review") && (
                    <button
                      onClick={() => updateRequestStatus(row.id, "In Progress")}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                    >
                      Start Processing
                    </button>
                  )}

                  {row.status !== "Resolved" && (
                    <button
                      onClick={() => updateRequestStatus(row.id, "Resolved")}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {row.status !== "Review" && (
                    <button
                      onClick={() => updateRequestStatus(row.id, "Review")}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      Escalate Review
                    </button>
                  )}
                </div>
              )}

              {key === "finance" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {row.status !== "Settled" && (
                    <button
                      onClick={() => updateFinanceRowStatus(row.id, "Settled")}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Approve Payment
                    </button>
                  )}

                  {row.status !== "Review" && (
                    <button
                      onClick={() => updateFinanceRowStatus(row.id, "Review")}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      Flag Eligibility Review
                    </button>
                  )}

                  {row.status !== "Processing" && (
                    <button
                      onClick={() => updateFinanceRowStatus(row.id, "Processing")}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                    >
                      Move To Verification
                    </button>
                  )}
                </div>
              )}

              {key === "members" && row.status === "Rejected" && row.rejectionReason && (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <span className="font-semibold">Rejection Reason:</span> {row.rejectionReason}
                </div>
              )}

              {key === "members" && row.status === "Pending" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApprovalAction(row.id, "Approved")}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                  >
                    Approve Registration
                  </button>
                  <button
                    onClick={() => {
                      setRejectingRowId(row.id);
                      setRejectReasonText("");
                    }}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Reject
                  </button>
                </div>
              )}

              {key === "members" && rejectingRowId === row.id && (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">
                      Reason For Rejection (Required)
                    </span>
                    <textarea
                      value={rejectReasonText}
                      onChange={(event) => setRejectReasonText(event.target.value)}
                      rows={3}
                      placeholder="Write why this application is being rejected..."
                      className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-rose-400"
                    />
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const reason = rejectReasonText.trim();
                        if (!reason) {
                          setActionMessage("Please enter rejection reason before rejecting application.");
                          return;
                        }
                        handleApprovalAction(row.id, "Rejected", reason);
                        setRejectingRowId(null);
                        setRejectReasonText("");
                        setActionMessage("Application rejected with reason.");
                      }}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => {
                        setRejectingRowId(null);
                        setRejectReasonText("");
                      }}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}

          {!showApprovedView && paginatedRows.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
              <p className="text-sm font-semibold text-text-primary">No records found for selected filters.</p>
              <p className="mt-1 text-xs text-text-secondary">Try changing filters or clearing search.</p>
            </div>
          )}
        </div>

        {!showApprovedView && (
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
        )}
      </section>
      )}

      {key === "analytics" ? (
        <section className="grid grid-cols-1 gap-4">
          <article className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-bold">Full Website Analysis Board</h3>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-text-secondary">Range: {analyticsRangeLabel}</span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">Everything is visualized here so you can monitor growth, risk, and conversion without leaving this page.</p>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background p-4 xl:col-span-2">
                <p className="text-sm font-bold text-text-primary">Section Performance Comparison</p>
                <div className="mt-3 space-y-3 text-xs">
                  {analyticsSectionHealth.map((item) => (
                    <div key={item.name}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-semibold text-text-primary">{item.name}</span>
                        <span className="text-text-secondary">{item.value}% health</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-card">
                        <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-bold text-text-primary">Conversion Goal Progress</p>
                <div className="mt-3 space-y-3 text-xs">
                  {analyticsGoalProgress.map((item) => (
                    <div key={item.goal} className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary">{item.goal}</span>
                        <span className="text-text-secondary">{item.done}% / {item.target}%</span>
                      </div>
                      <div className="mt-2 h-2.5 rounded-full bg-background">
                        <div className="h-2.5 rounded-full bg-linear-to-r from-secondary to-primary" style={{ width: `${item.done}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-bold text-text-primary">Device Distribution Pie View</p>
                <div className="mt-3 flex items-center gap-4">
                  <div
                    className="h-36 w-36 rounded-full border border-border"
                    style={{ background: "conic-gradient(#0f766e 0% 54%, #2563eb 54% 82%, #d97706 82% 94%, #7c3aed 94% 100%)" }}
                  />
                  <div className="space-y-2 text-xs text-text-secondary">
                    <p><span className="font-semibold text-text-primary">Mobile</span> 54%</p>
                    <p><span className="font-semibold text-text-primary">Desktop</span> 28%</p>
                    <p><span className="font-semibold text-text-primary">Tablet</span> 12%</p>
                    <p><span className="font-semibold text-text-primary">Other</span> 6%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-bold text-text-primary">Action-wise Engagement Chart</p>
                <div className="mt-3 space-y-2 text-xs">
                  {analyticsEngagementSeries.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-28 shrink-0 font-semibold text-text-primary">{item.name}</div>
                      <div className="h-2.5 flex-1 rounded-full bg-card">
                        <div className="h-2.5 rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                      </div>
                      <div className="w-10 text-right text-text-secondary">{item.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </section>
      ) : (
      <section className={key === "finance" ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 gap-4 lg:grid-cols-3"}>
        <article className={key === "finance" ? "rounded-2xl border border-border bg-card p-5" : "rounded-2xl border border-border bg-card p-5 lg:col-span-2"}>
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <p className="mt-1 text-sm text-text-secondary">Section-specific shortcuts to speed up daily operations.</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {info.actions.map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
              >
                {action}
                <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </div>

          {key === "programs" && (
            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-text-primary">Program Action Workspace</p>
                <button
                  onClick={() => {
                    setProgramActionView("none");
                    setProgramActionMessage("");
                    setSelectedProgramForMentor("");
                    setSelectedMentors([]);
                  }}
                  className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-text-secondary hover:border-primary/30 hover:text-primary"
                >
                  Reset Panel
                </button>
              </div>

              {programActionMessage && (
                <p className="mt-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{programActionMessage}</p>
              )}

              {programActionView === "launch" && (
                <form
                  className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const name = String(form.get("name") || "").trim();
                    const track = String(form.get("track") || "").trim();
                    const mode = String(form.get("mode") || "").trim();
                    const owner = String(form.get("owner") || "").trim();
                    const goal = String(form.get("goal") || "").trim();

                    if (!name || !track || !mode || !owner) {
                      setProgramActionMessage("Please fill all required fields.");
                      return;
                    }

                    const generatedId = `P-${Math.floor(Date.now() / 1000).toString().slice(-4)}`;
                    setRows((prev) => [
                      {
                        id: generatedId,
                        name,
                        owner,
                        status: "Draft",
                        updatedAt: "Just now",
                        primaryFilterValue: track,
                        secondaryFilterValue: mode,
                        note: goal || "New program draft created from Quick Actions.",
                      },
                      ...prev,
                    ]);
                    setProgramActionMessage(`Program ${name} created as draft.`);
                    (event.currentTarget as HTMLFormElement).reset();
                  }}
                >
                  <InputField label="Program Name" name="name" placeholder="Example: Data Science Sprint" required />
                  <InputField label="Owner Team" name="owner" placeholder="Example: Mentorship Cell" required />

                  <SelectField
                    label="Track"
                    name="track"
                    options={info.primaryFilterOptions.filter((item) => item !== "All")}
                    required
                  />

                  <SelectField
                    label="Mode"
                    name="mode"
                    options={info.secondaryFilterOptions.filter((item) => item !== "All")}
                    required
                  />

                  <label className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Program Goal</span>
                    <textarea
                      name="goal"
                      rows={3}
                      placeholder="Write a short goal and scope"
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    />
                  </label>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      Create Program
                    </button>
                  </div>
                </form>
              )}

              {programActionView === "assign" && (
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Select Program</span>
                    <select
                      value={selectedProgramForMentor}
                      onChange={(event) => setSelectedProgramForMentor(event.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    >
                      <option value="">Choose program</option>
                      {rows.map((row) => (
                        <option key={`assign-${row.id}`} value={row.id}>
                          {row.id} - {row.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Mentor Pool</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {mentorPool.map((mentor) => (
                        <label key={mentor} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-text-primary">
                          <input
                            type="checkbox"
                            checked={selectedMentors.includes(mentor)}
                            onChange={(event) => {
                              if (event.target.checked) {
                                setSelectedMentors((prev) => [...prev, mentor]);
                                return;
                              }
                              setSelectedMentors((prev) => prev.filter((item) => item !== mentor));
                            }}
                          />
                          {mentor}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={assignMentorsToProgram}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      Save Mentor Assignment
                    </button>
                  </div>
                </div>
              )}

              {programActionView === "report" && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Total Programs</p>
                      <p className="mt-1 text-xl font-black text-text-primary">{rows.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Live / In Progress</p>
                      <p className="mt-1 text-xl font-black text-text-primary">
                        {rows.filter((row) => row.status === "Live" || row.status === "In Progress").length}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Draft / Review</p>
                      <p className="mt-1 text-xl font-black text-text-primary">
                        {rows.filter((row) => row.status === "Draft" || row.status === "Review").length}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="bg-card">
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Program</th>
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Track</th>
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Mode</th>
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Status</th>
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={`weekly-${row.id}`}>
                            <td className="border-b border-border/60 px-3 py-2 text-text-primary">{row.name}</td>
                            <td className="border-b border-border/60 px-3 py-2 text-text-secondary">{row.primaryFilterValue}</td>
                            <td className="border-b border-border/60 px-3 py-2 text-text-secondary">{row.secondaryFilterValue}</td>
                            <td className="border-b border-border/60 px-3 py-2 text-text-secondary">{row.status}</td>
                            <td className="border-b border-border/60 px-3 py-2 text-text-secondary">{row.updatedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={exportProgramWeeklyReport}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                    >
                      <Download className="h-4 w-4" /> Download CSV
                    </button>
                    <button
                      onClick={printProgramWeeklyReport}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                    >
                      <Printer className="h-4 w-4" /> Print Summary
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {key === "requests" && (
            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-text-primary">Request Action Workspace</p>
                <button
                  onClick={() => {
                    setRequestActionView("none");
                    setRequestActionMessage("");
                    setSelectedRequestId("");
                    setRequestAssignTeam("");
                    setRequestAssignNote("");
                  }}
                  className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-text-secondary hover:border-primary/30 hover:text-primary"
                >
                  Reset Panel
                </button>
              </div>

              {requestActionMessage && (
                <p className="mt-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{requestActionMessage}</p>
              )}

              {requestActionView === "priority" && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-xs text-text-secondary">Open Requests</p>
                    <p className="mt-1 text-xl font-black text-text-primary">{rows.filter((row) => row.status === "Open").length}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-xs text-text-secondary">High Priority</p>
                    <p className="mt-1 text-xl font-black text-text-primary">{rows.filter((row) => row.primaryFilterValue === "High").length}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-xs text-text-secondary">In Progress</p>
                    <p className="mt-1 text-xl font-black text-text-primary">{rows.filter((row) => row.status === "In Progress").length}</p>
                  </div>
                </div>
              )}

              {requestActionView === "assign" && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Request</span>
                    <select
                      value={selectedRequestId}
                      onChange={(event) => setSelectedRequestId(event.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    >
                      <option value="">Select request</option>
                      {rows.map((row) => (
                        <option key={`request-assign-${row.id}`} value={row.id}>
                          {row.id} - {row.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Assign Team</span>
                    <select
                      value={requestAssignTeam}
                      onChange={(event) => setRequestAssignTeam(event.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    >
                      <option value="">Select team</option>
                      {requestTeams.map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Assignment Note (Optional)</span>
                    <textarea
                      value={requestAssignNote}
                      onChange={(event) => setRequestAssignNote(event.target.value)}
                      rows={3}
                      placeholder="Add context for assigned team"
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    />
                  </label>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      onClick={assignRequestToTeam}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      Assign Request
                    </button>
                  </div>
                </div>
              )}

              {requestActionView === "close" && (
                <div className="mt-3 rounded-xl border border-border bg-card p-3 text-sm text-text-secondary">
                  Resolved batch close operation complete. You can now filter by status <span className="font-semibold text-text-primary">Resolved</span> to review archived entries.
                </div>
              )}
            </div>
          )}

          {key === "finance" && (
            <div className="mt-4 rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-text-primary">Scholarship Action Workspace</p>
                <button
                  onClick={() => {
                    setFinanceActionView("none");
                    setFinanceActionMessage("");
                    setSelectedFinanceBatchIds([]);
                  }}
                  className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-text-secondary hover:border-primary/30 hover:text-primary"
                >
                  Reset Panel
                </button>
              </div>

              {financeActionMessage && (
                <p className="mt-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{financeActionMessage}</p>
              )}

              {financeActionView === "mapping" && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Donor Mappings</p>
                      <p className="mt-1 text-xl font-black text-text-primary">{scholarshipFundingMap.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Total Committed</p>
                      <p className="mt-1 text-xl font-black text-text-primary">₹{totalCommittedFunding.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Total Transferred</p>
                      <p className="mt-1 text-xl font-black text-text-primary">₹{totalTransferredFunding.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={addDonorScholarshipMapping}>
                    <InputField label="Donor Name" name="donorName" placeholder="Example: Vikram Joshi" required />

                    <label>
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Scholarship</span>
                      <select
                        name="scholarshipName"
                        required
                        defaultValue=""
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                      >
                        <option value="" disabled>
                          Select scholarship
                        </option>
                        {rows.map((row) => (
                          <option key={`mapping-sch-${row.id}`} value={row.name}>
                            {row.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <InputField label="Amount (INR)" name="amount" placeholder="Example: 75000" required />

                    <SelectField label="Commitment Cycle" name="cycle" options={["Monthly", "Quarterly", "Annual", "One Time"]} required />

                    <label className="sm:col-span-2">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Mapping Note</span>
                      <textarea
                        name="note"
                        rows={2}
                        placeholder="Mention donor intent, tranche plan, or verification notes"
                        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                      />
                    </label>

                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                      >
                        Save Donor Mapping
                      </button>
                    </div>
                  </form>

                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="bg-card">
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Donor</th>
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Scholarship</th>
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Amount</th>
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Cycle</th>
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Status</th>
                          <th className="border-b border-border px-3 py-2 font-semibold text-text-secondary">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scholarshipFundingMap.map((item) => (
                          <tr key={item.id}>
                            <td className="border-b border-border/60 px-3 py-2 text-text-primary">{item.donorName}</td>
                            <td className="border-b border-border/60 px-3 py-2 text-text-secondary">{item.scholarshipName}</td>
                            <td className="border-b border-border/60 px-3 py-2 text-text-secondary">₹{item.amount.toLocaleString("en-IN")}</td>
                            <td className="border-b border-border/60 px-3 py-2 text-text-secondary">{item.cycle}</td>
                            <td className="border-b border-border/60 px-3 py-2 text-text-secondary">{item.status}</td>
                            <td className="border-b border-border/60 px-3 py-2">
                              {item.status !== "Transferred" ? (
                                <button
                                  onClick={() => updateMappingStatus(item.id, "Transferred")}
                                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                >
                                  Mark Transferred
                                </button>
                              ) : (
                                <span className="text-xs font-semibold text-emerald-700">Completed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {financeActionView === "create" && (
                <form className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={createScholarshipRecord}>
                  <InputField label="Scholarship Name" name="name" placeholder="Example: Merit Plus 2026" required />
                  <InputField label="Owner Team" name="owner" placeholder="Example: Scholarship Desk" required />

                  <SelectField
                    label="Category"
                    name="category"
                    options={info.primaryFilterOptions.filter((item) => item !== "All")}
                    required
                  />

                  <SelectField
                    label="Cycle"
                    name="cycle"
                    options={info.secondaryFilterOptions.filter((item) => item !== "All")}
                    required
                  />

                  <label className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Scholarship Note</span>
                    <textarea
                      name="note"
                      rows={3}
                      placeholder="Add eligibility, fund source, and processing remarks"
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    />
                  </label>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      Create Scholarship
                    </button>
                  </div>
                </form>
              )}

              {financeActionView === "payout" && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">Simple meaning:</span> Scholarship Payment means scholarship amount transfer to student account.
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Pending Scholarship Payments</p>
                      <p className="mt-1 text-xl font-black text-text-primary">{financePayoutCandidates.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Selected In Batch</p>
                      <p className="mt-1 text-xl font-black text-text-primary">{selectedFinanceBatchIds.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Payments Completed</p>
                      <p className="mt-1 text-xl font-black text-text-primary">{rows.filter((row) => row.status === "Settled").length}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {financePayoutCandidates.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border bg-card p-3 text-sm text-text-secondary">
                        No scholarship payment entries are waiting for batch approval.
                      </div>
                    )}

                    {financePayoutCandidates.map((row) => (
                      <label key={`finance-batch-${row.id}`} className="flex items-start gap-2 rounded-xl border border-border bg-card px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedFinanceBatchIds.includes(row.id)}
                          onChange={() => toggleFinanceBatchSelection(row.id)}
                        />
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            {row.id} - {row.name}
                          </p>
                          <p className="text-xs text-text-secondary">{row.note}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={approveSelectedPayoutBatch}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      Approve Selected Payment Batch
                    </button>
                  </div>
                </div>
              )}

              {financeActionView === "ledger" && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      onClick={() => exportFinanceLedger(rows, "full")}
                      className="inline-flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                    >
                      Download Full Ledger
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => exportFinanceLedger(filteredRows, "filtered")}
                      className="inline-flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
                    >
                      Download Filtered Ledger
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Ledger export supports current filters so scholarship team can quickly share category-wise and cycle-wise reports.
                  </p>
                </div>
              )}

              {financeActionView === "audit" && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-xs text-text-secondary">Entries In Review</p>
                    <p className="mt-1 text-xl font-black text-text-primary">{rows.filter((row) => row.status === "Review").length}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-xs text-text-secondary">Verification In Progress</p>
                    <p className="mt-1 text-xl font-black text-text-primary">{rows.filter((row) => row.status === "Processing").length}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-xs text-text-secondary">Audit Safe (Settled)</p>
                    <p className="mt-1 text-xl font-black text-text-primary">{rows.filter((row) => row.status === "Settled").length}</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </article>

        {key !== "finance" && key !== "analytics" && (
        <article className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Management Notes</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Keep all approvals and operations in this workspace. Filters and pagination are tailored to each admin section.
          </p>
          {key === "members" && (
            <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-text-secondary">
              New user registrations appear in <span className="font-semibold text-text-primary">Pending</span>. Use
              <span className="font-semibold text-text-primary"> Approve / Reject</span> buttons to complete approval workflow.
            </p>
          )}

          {key === "requests" && (
            <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-text-secondary">
              Use quick actions to open priority queue, assign request owners, and close resolved batches. Each request card also supports direct lifecycle actions.
            </p>
          )}

        </article>
        )}
      </section>
      )}
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

function InputField({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SortableHeader({
  label,
  onClick,
  active,
  direction,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  direction: "asc" | "desc";
}) {
  return (
    <th className="border-b border-border px-3 py-2 text-left font-semibold text-text-secondary">
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-primary">
        {label}
        <ArrowUpDown className={["h-3.5 w-3.5", active ? "text-primary" : "text-text-secondary"].join(" ")} />
        {active && <span className="text-[10px] uppercase">{direction}</span>}
      </button>
    </th>
  );
}
