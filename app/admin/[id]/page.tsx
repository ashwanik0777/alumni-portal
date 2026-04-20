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
type FinanceActionView = "none" | "payout" | "ledger" | "audit";

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
const FRONTEND_EMAIL_OUTBOX_KEY = "admin_email_outbox_v1";
const FIRST_LOGIN_USERS_KEY = "pending_first_login_users_v1";

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
      if (action === "Approve Payout Batch") {
        setFinanceActionView("payout");
        const payoutCandidates = rows
          .filter((row) => row.primaryFilterValue === "Payout" && (row.status === "Processing" || row.status === "Review"))
          .map((row) => row.id);
        setSelectedFinanceBatchIds(payoutCandidates);
        if (payoutCandidates.length === 0) {
          setFinanceActionMessage("No payout items are pending approval right now.");
          return;
        }
        setFinanceActionMessage(`Selected ${payoutCandidates.length} payout record(s) for approval batch.`);
        return;
      }

      if (action === "Download Ledger") {
        setFinanceActionView("ledger");
        exportFinanceLedger(rows, "full");
        return;
      }

      if (action === "Run Audit Check") {
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
                  note: "Audit check flagged this entry for manual verification.",
                }
              : row,
          ),
        );
        setFinanceActionMessage(`Audit check complete. ${flaggedIds.length} record(s) moved to review.`);
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
    () => rows.filter((row) => row.primaryFilterValue === "Payout" && (row.status === "Processing" || row.status === "Review")),
    [rows],
  );

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
              note: "Approved in payout batch and marked settled.",
            }
          : row,
      ),
    );
    setFinanceActionMessage(`Approved payout batch for ${selectedFinanceBatchIds.length} record(s).`);
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
    anchor.download = `finance-ledger-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setFinanceActionMessage(`Finance ledger downloaded (${sourceRows.length} row(s), ${scope} scope).`);
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
                      Mark Settled
                    </button>
                  )}

                  {row.status !== "Review" && (
                    <button
                      onClick={() => updateFinanceRowStatus(row.id, "Review")}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      Flag Review
                    </button>
                  )}

                  {row.status !== "Processing" && (
                    <button
                      onClick={() => updateFinanceRowStatus(row.id, "Processing")}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                    >
                      Move To Processing
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

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
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
                <p className="text-sm font-bold text-text-primary">Finance Action Workspace</p>
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

              {financeActionView === "payout" && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Pending Payout Approvals</p>
                      <p className="mt-1 text-xl font-black text-text-primary">{financePayoutCandidates.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Selected In Batch</p>
                      <p className="mt-1 text-xl font-black text-text-primary">{selectedFinanceBatchIds.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-3">
                      <p className="text-xs text-text-secondary">Settled Entries</p>
                      <p className="mt-1 text-xl font-black text-text-primary">{rows.filter((row) => row.status === "Settled").length}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {financePayoutCandidates.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border bg-card p-3 text-sm text-text-secondary">
                        No payout entries are waiting for batch approval.
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
                      Approve Selected Batch
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
                    Ledger export supports current filters so finance team can quickly share payout-only, donation-only, or cycle-specific reports.
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
                    <p className="text-xs text-text-secondary">Processing Entries</p>
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

          {key === "finance" && (
            <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-text-secondary">
              Use payout batch approvals, ledger exports, and audit checks from Quick Actions. Finance cards support instant status controls for daily reconciliation work.
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
