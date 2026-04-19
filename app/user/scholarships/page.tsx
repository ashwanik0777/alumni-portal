"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  IndianRupee,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

type Scholarship = {
  id: string;
  title: string;
  provider: string;
  amount: string;
  seats: number;
  deadline: string;
  minPercentage: number;
  allowedCourses: string[];
  eligibleYears: string[];
  notes: string;
};

type ScholarshipForm = {
  scholarshipId: string;
  fullName: string;
  email: string;
  mobile: string;
  passingYear: string;
  currentCourse: string;
  currentYear: string;
  percentage: string;
  annualIncome: string;
  statement: string;
  documentsReady: boolean;
  consent: boolean;
};

const publishedScholarships: Scholarship[] = [
  {
    id: "merit-2026",
    title: "Merit Excellence Scholarship 2026",
    provider: "Admin Published • Alumni Scholarship Cell",
    amount: "INR 60,000 / year",
    seats: 40,
    deadline: "15 Jun 2026",
    minPercentage: 75,
    allowedCourses: ["B.Tech", "B.Sc", "BCA", "BA", "B.Com"],
    eligibleYears: ["1", "2", "3"],
    notes: "Students must maintain attendance above 75% and submit progress reports each semester.",
  },
  {
    id: "girls-higher-ed-2026",
    title: "Girls Higher Education Support",
    provider: "Admin Published • Women Alumni Chapter",
    amount: "INR 80,000 one-time grant",
    seats: 25,
    deadline: "01 Jul 2026",
    minPercentage: 70,
    allowedCourses: ["B.Tech", "B.Sc", "BA", "B.Com", "MBA"],
    eligibleYears: ["1", "2"],
    notes: "Priority for first-generation college learners from lower income families.",
  },
  {
    id: "stem-future-2026",
    title: "STEM Future Grant",
    provider: "Admin Published • STEM Alumni Circle",
    amount: "INR 50,000 / year",
    seats: 30,
    deadline: "25 Jun 2026",
    minPercentage: 78,
    allowedCourses: ["B.Tech", "B.Sc", "BCA"],
    eligibleYears: ["1", "2", "3", "4"],
    notes: "Open for students in STEM tracks with strong academic performance.",
  },
];

const initialForm: ScholarshipForm = {
  scholarshipId: publishedScholarships[0].id,
  fullName: "",
  email: "",
  mobile: "",
  passingYear: "",
  currentCourse: "",
  currentYear: "",
  percentage: "",
  annualIncome: "",
  statement: "",
  documentsReady: false,
  consent: false,
};

export default function UserScholarshipsPage() {
  const [form, setForm] = useState<ScholarshipForm>(initialForm);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user_profile_draft_v1");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Record<string, string>;
      setForm((prev) => ({
        ...prev,
        fullName: parsed.fullName || prev.fullName,
        email: parsed.email || prev.email,
        mobile: parsed.mobile || prev.mobile,
        passingYear: parsed.passingYear || prev.passingYear,
        currentCourse:
          parsed.studentCourse || parsed.currentCourse || parsed.jobTitle || prev.currentCourse,
        currentYear: parsed.studentYearOrSemester || prev.currentYear,
      }));
    } catch {
      // Keep manual input flow if profile draft is not parseable.
    }
  }, []);

  const selectedScholarship = useMemo(
    () => publishedScholarships.find((item) => item.id === form.scholarshipId) || publishedScholarships[0],
    [form.scholarshipId],
  );

  const percentageValue = Number(form.percentage || "0");
  const courseEligible =
    form.currentCourse.trim().length > 0 &&
    selectedScholarship.allowedCourses
      .map((item) => item.toLowerCase())
      .includes(form.currentCourse.trim().toLowerCase());
  const yearEligible = selectedScholarship.eligibleYears.includes(form.currentYear.trim());
  const marksEligible = percentageValue >= selectedScholarship.minPercentage;

  const eligibilityPass = courseEligible && yearEligible && marksEligible;

  const requiredFieldsFilled =
    form.fullName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.mobile.trim().length > 0 &&
    form.passingYear.trim().length > 0 &&
    form.currentCourse.trim().length > 0 &&
    form.currentYear.trim().length > 0 &&
    form.percentage.trim().length > 0 &&
    form.annualIncome.trim().length > 0 &&
    form.statement.trim().length > 20 &&
    form.documentsReady &&
    form.consent;

  const canSubmit = eligibilityPass && requiredFieldsFilled;

  const autofilledBasicFields: Array<{ label: string; key: keyof ScholarshipForm }> = [
    { label: "Full Name", key: "fullName" },
    { label: "Email Address", key: "email" },
    { label: "Mobile Number", key: "mobile" },
    { label: "Batch / Passing Year", key: "passingYear" },
    { label: "Current Course", key: "currentCourse" },
  ];

  const missingBasicKeys = autofilledBasicFields
    .map((item) => item.key)
    .filter((key) => String(form[key]).trim().length === 0);

  const updateField = <K extends keyof ScholarshipForm>(field: K, value: ScholarshipForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStatusMessage("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!eligibilityPass) {
      setStatusMessage("You are not eligible for this scholarship based on current criteria.");
      return;
    }

    if (!requiredFieldsFilled) {
      setStatusMessage("Please complete all required information and confirmations before submitting.");
      return;
    }

    setStatusMessage("Scholarship application submitted successfully. Admin review will happen after document verification.");
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Award className="h-3.5 w-3.5" />
          User Scholarship Portal
        </p>
        <h2 className="mt-2 text-2xl font-black">Applications are open for selected scholarships</h2>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Published Scholarships" value={String(publishedScholarships.length)} />
          <MetricCard label="Open Seats" value={String(publishedScholarships.reduce((acc, item) => acc + item.seats, 0))} />
          <MetricCard label="Min Eligibility" value={`${selectedScholarship.minPercentage}%`} />
          <MetricCard label="Application Mode" value="Criteria Based" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold">Admin Published Scholarships</h3>
            <span className="text-xs text-text-secondary">Read-only list for users</span>
          </div>

          <div className="grid gap-3">
            {publishedScholarships.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField("scholarshipId", item.id)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  form.scholarshipId === item.id
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-background hover:border-primary/20"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{item.title}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{item.provider}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {item.amount}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <CalendarDays className="h-3.5 w-3.5" /> Deadline: {item.deadline}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <UserCheck className="h-3.5 w-3.5" /> Seats: {item.seats}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold">Eligibility Checker</h3>
          <div className="mt-3 space-y-2">
            <CheckItem
              label={`Minimum marks ${selectedScholarship.minPercentage}%`}
              pass={marksEligible}
            />
            <CheckItem
              label={`Course in: ${selectedScholarship.allowedCourses.join(", ")}`}
              pass={courseEligible}
            />
            <CheckItem
              label={`Current year in: ${selectedScholarship.eligibleYears.join(", ")}`}
              pass={yearEligible}
            />
            <CheckItem
              label="Required documents and consent completed"
              pass={form.documentsReady && form.consent}
            />
          </div>

          <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <FileText className="h-3.5 w-3.5" />
              Criteria Note
            </p>
            <p className="mt-1 text-xs text-text-secondary">{selectedScholarship.notes}</p>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h3 className="text-sm font-bold">Scholarship Application Form</h3>

        <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {autofilledBasicFields
            .filter((item) => !missingBasicKeys.includes(item.key))
            .map((item) => (
              <ReadonlyField key={item.key} label={item.label} value={String(form[item.key])} />
            ))}

          {missingBasicKeys.includes("fullName") && (
            <InputField label="Full Name" value={form.fullName} onChange={(value) => updateField("fullName", value)} required />
          )}
          {missingBasicKeys.includes("email") && (
            <InputField label="Email Address" value={form.email} onChange={(value) => updateField("email", value)} required type="email" />
          )}
          {missingBasicKeys.includes("mobile") && (
            <InputField label="Mobile Number" value={form.mobile} onChange={(value) => updateField("mobile", value)} required />
          )}
          {missingBasicKeys.includes("passingYear") && (
            <InputField label="Batch / Passing Year" value={form.passingYear} onChange={(value) => updateField("passingYear", value)} required />
          )}
          {missingBasicKeys.includes("currentCourse") && (
            <InputField label="Current Course" value={form.currentCourse} onChange={(value) => updateField("currentCourse", value)} required placeholder="Example: B.Tech" />
          )}

          <InputField label="Current Year" value={form.currentYear} onChange={(value) => updateField("currentYear", value)} required placeholder="1 / 2 / 3 / 4" />
          <InputField label="Latest Percentage" value={form.percentage} onChange={(value) => updateField("percentage", value)} required placeholder="Example: 82" />
          <InputField label="Annual Family Income (INR)" value={form.annualIncome} onChange={(value) => updateField("annualIncome", value)} required />

          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
              Statement of Purpose *
            </span>
            <textarea
              rows={3}
              value={form.statement}
              onChange={(event) => updateField("statement", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="Write why you are applying and how scholarship support will help your academic goals."
            />
          </label>

          <label className="sm:col-span-2 inline-flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.documentsReady}
              onChange={(event) => updateField("documentsReady", event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            I confirm I can provide all required documents (marksheet, ID, income proof) during admin verification.
          </label>

          <label className="sm:col-span-2 inline-flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) => updateField("consent", event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            I agree that incorrect information can lead to rejection and admin has final decision authority.
          </label>

          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-xs text-text-secondary">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Submit is enabled only when eligibility criteria and required details are complete.
            </p>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <GraduationCap className="h-4 w-4" />
              Submit Scholarship Application
            </button>
          </div>

          {!!statusMessage && (
            <div className="sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-secondary">
              {statusMessage}
            </div>
          )}

          {!eligibilityPass && (
            <div className="sm:col-span-2 inline-flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              You currently do not meet one or more criteria for this scholarship. Update details or select another scholarship.
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-background px-3 py-3">
      <p className="text-xl font-black text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </article>
  );
}

function CheckItem({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-xs">
      <p className="text-text-secondary">{label}</p>
      <span className={`inline-flex items-center gap-1 font-semibold ${pass ? "text-emerald-600" : "text-amber-600"}`}>
        {pass ? <CheckCircle2 className="h-3.5 w-3.5" /> : <BadgeCheck className="h-3.5 w-3.5" />}
        {pass ? "Pass" : "Pending"}
      </span>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
        {label}
      </span>
      <input
        value={value}
        readOnly
        className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-text-primary outline-none"
      />
    </label>
  );
}
