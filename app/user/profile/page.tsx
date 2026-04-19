"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Save,
  Sparkles,
  UserCircle2,
} from "lucide-react";

type ProfileType = "student" | "employed";

type ProfileFormState = {
  profileType: ProfileType;
  fullName: string;
  email: string;
  passingYear: string;
  house: string;
  mobile: string;
  fatherName: string;
  city: string;
  state: string;
  country: string;
  bio: string;
  interests: string;
  linkedin: string;
  github: string;
  portfolio: string;
  certifications: string;
  languages: string;
  studentCourse: string;
  studentSpecialization: string;
  studentInstitution: string;
  studentYearOrSemester: string;
  studentExpectedGraduation: string;
  studentCgpa: string;
  studentGoals: string;
  jobTitle: string;
  companyName: string;
  employmentType: string;
  industry: string;
  experienceYears: string;
  workLocation: string;
  keySkills: string;
  achievements: string;
};

const defaultState: ProfileFormState = {
  profileType: "student",
  fullName: "",
  email: "",
  passingYear: "",
  house: "",
  mobile: "",
  fatherName: "",
  city: "",
  state: "",
  country: "India",
  bio: "",
  interests: "",
  linkedin: "",
  github: "",
  portfolio: "",
  certifications: "",
  languages: "",
  studentCourse: "",
  studentSpecialization: "",
  studentInstitution: "",
  studentYearOrSemester: "",
  studentExpectedGraduation: "",
  studentCgpa: "",
  studentGoals: "",
  jobTitle: "",
  companyName: "",
  employmentType: "",
  industry: "",
  experienceYears: "",
  workLocation: "",
  keySkills: "",
  achievements: "",
};

const STORAGE_KEY = "user_profile_draft_v1";

export default function UserProfilePage() {
  const [form, setForm] = useState<ProfileFormState>(defaultState);
  const [mounted, setMounted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [includeOptionalDetails, setIncludeOptionalDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<ProfileFormState>;
      setForm((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Keep default values if parsing fails.
    }
  }, []);

  const requiredCommonFields: Array<keyof ProfileFormState> = [
    "fullName",
    "email",
    "passingYear",
    "house",
    "mobile",
    "fatherName",
    "city",
    "state",
    "country",
    "bio",
    "interests",
  ];

  const requiredStudentFields: Array<keyof ProfileFormState> = [
    "studentCourse",
    "studentSpecialization",
    "studentInstitution",
    "studentYearOrSemester",
    "studentExpectedGraduation",
    "studentGoals",
  ];

  const requiredEmployedFields: Array<keyof ProfileFormState> = [
    "jobTitle",
    "companyName",
    "employmentType",
    "industry",
    "experienceYears",
    "workLocation",
    "keySkills",
  ];

  const activeRequiredFields = useMemo(() => {
    return form.profileType === "student"
      ? [...requiredCommonFields, ...requiredStudentFields]
      : [...requiredCommonFields, ...requiredEmployedFields];
  }, [form.profileType]);

  const completedCount = useMemo(() => {
    return activeRequiredFields.filter((field) => String(form[field]).trim().length > 0).length;
  }, [activeRequiredFields, form]);

  const completionPercent = Math.round((completedCount / activeRequiredFields.length) * 100);

  const updateField = <K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setStatusMessage("Draft saved successfully.");
  };

  const handleSubmitProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (completionPercent < 100) {
      setStatusMessage("Please complete all required profile fields before submitting.");
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setStatusMessage("Profile submitted successfully. Backend integration will be connected next.");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Dynamic Profile Builder
            </p>
            <h2 className="mt-2 text-xl font-black sm:text-2xl">Complete Your Alumni Profile</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Fill basic details first, then choose student or employed profile type.
            </p>
          </div>

          <div className="min-w-48 rounded-xl border border-border bg-background p-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Profile Completion</p>
            <p className="mt-1 text-2xl font-black text-primary">{completionPercent}%</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-border">
              <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              {completedCount} / {activeRequiredFields.length} required fields completed
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmitProfile} className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-4.5 sm:p-5">
          <h3 className="text-lg font-bold">Common Profile Details</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField label="Full Name" value={form.fullName} onChange={(value) => updateField("fullName", value)} required />
            <InputField label="Email Address" type="email" value={form.email} onChange={(value) => updateField("email", value)} required />
            <InputField label="Batch / Passing Year" value={form.passingYear} onChange={(value) => updateField("passingYear", value)} required />
            <InputField label="House" value={form.house} onChange={(value) => updateField("house", value)} required />
            <InputField label="Mobile Number" value={form.mobile} onChange={(value) => updateField("mobile", value)} required />
            <InputField label="Father's Name" value={form.fatherName} onChange={(value) => updateField("fatherName", value)} required />
            <InputField label="City" value={form.city} onChange={(value) => updateField("city", value)} required />
            <InputField label="State" value={form.state} onChange={(value) => updateField("state", value)} required />
            <InputField label="Country" value={form.country} onChange={(value) => updateField("country", value)} required />
            <TextAreaField
              className="sm:col-span-2"
              label="Short Bio"
              value={form.bio}
              onChange={(value) => updateField("bio", value)}
              required
            />
            <TextAreaField
              className="sm:col-span-2"
              label="Areas of Interest"
              value={form.interests}
              onChange={(value) => updateField("interests", value)}
              required
            />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4.5 sm:p-5">
          <h3 className="text-base font-bold">Are you a student or employed professional?</h3>
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-text-primary">
              <input
                type="radio"
                name="profileType"
                checked={form.profileType === "student"}
                onChange={() => updateField("profileType", "student")}
                className="h-4 w-4 accent-primary"
              />
              <GraduationCap className="h-4 w-4 text-primary" />
              Student
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-text-primary">
              <input
                type="radio"
                name="profileType"
                checked={form.profileType === "employed"}
                onChange={() => updateField("profileType", "employed")}
                className="h-4 w-4 accent-primary"
              />
              <Briefcase className="h-4 w-4 text-primary" />
              Employed
            </label>
          </div>
        </section>

        {form.profileType === "student" ? (
          <section className="rounded-xl border border-border bg-card p-4.5 sm:p-5">
            <h3 className="text-base font-bold">Academic Details (Student)</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField label="Current Course" value={form.studentCourse} onChange={(value) => updateField("studentCourse", value)} required />
              <InputField label="Specialization / Stream" value={form.studentSpecialization} onChange={(value) => updateField("studentSpecialization", value)} required />
              <InputField label="Institution Name" value={form.studentInstitution} onChange={(value) => updateField("studentInstitution", value)} required />
              <InputField label="Current Year / Semester" value={form.studentYearOrSemester} onChange={(value) => updateField("studentYearOrSemester", value)} required />
              <InputField label="Expected Graduation Year" value={form.studentExpectedGraduation} onChange={(value) => updateField("studentExpectedGraduation", value)} required />
              <InputField label="CGPA / Percentage (Optional)" value={form.studentCgpa} onChange={(value) => updateField("studentCgpa", value)} />
              <TextAreaField
                className="sm:col-span-2"
                label="Career or Higher Education Goals"
                value={form.studentGoals}
                onChange={(value) => updateField("studentGoals", value)}
                required
              />
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-border bg-card p-4.5 sm:p-5">
            <h3 className="text-base font-bold">Professional Details (Employed)</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField label="Current Job Title" value={form.jobTitle} onChange={(value) => updateField("jobTitle", value)} required />
              <InputField label="Company Name" value={form.companyName} onChange={(value) => updateField("companyName", value)} required />
              <InputField label="Employment Type" value={form.employmentType} onChange={(value) => updateField("employmentType", value)} required />
              <InputField label="Industry" value={form.industry} onChange={(value) => updateField("industry", value)} required />
              <InputField label="Total Experience (Years)" value={form.experienceYears} onChange={(value) => updateField("experienceYears", value)} required />
              <InputField label="Work Location" value={form.workLocation} onChange={(value) => updateField("workLocation", value)} required />
              <TextAreaField
                className="sm:col-span-2"
                label="Core Skills"
                value={form.keySkills}
                onChange={(value) => updateField("keySkills", value)}
                required
              />
              <TextAreaField
                className="sm:col-span-2"
                label="Key Achievements (Optional)"
                value={form.achievements}
                onChange={(value) => updateField("achievements", value)}
              />
            </div>
          </section>
        )}

        <section className="rounded-xl border border-border bg-card p-4.5 sm:p-5">
          <h3 className="text-base font-bold">Would you like to add more profile details now?</h3>
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-text-primary">
              <input
                type="radio"
                name="includeOptional"
                checked={includeOptionalDetails}
                onChange={() => setIncludeOptionalDetails(true)}
                className="h-4 w-4 accent-primary"
              />
              Yes, add more details
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-text-primary">
              <input
                type="radio"
                name="includeOptional"
                checked={!includeOptionalDetails}
                onChange={() => setIncludeOptionalDetails(false)}
                className="h-4 w-4 accent-primary"
              />
              No, I will update later
            </label>
          </div>

          {includeOptionalDetails && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField label="LinkedIn Profile (Optional)" value={form.linkedin} onChange={(value) => updateField("linkedin", value)} />
              <InputField label="GitHub Profile (Optional)" value={form.github} onChange={(value) => updateField("github", value)} />
              <InputField label="Portfolio Website (Optional)" value={form.portfolio} onChange={(value) => updateField("portfolio", value)} />
              <InputField label="Languages Known (Optional)" value={form.languages} onChange={(value) => updateField("languages", value)} />
              <TextAreaField
                className="sm:col-span-2"
                label="Certifications / Courses (Optional)"
                value={form.certifications}
                onChange={(value) => updateField("certifications", value)}
              />
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-4.5 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-xs text-text-secondary">
              <BadgeCheck className="h-4 w-4 text-primary" />
              Complete Your Profile to Unlock More Benefits.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-text-primary hover:border-primary/35"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
              >
                <UserCircle2 className="h-4 w-4" />
                Submit Profile
              </button>
            </div>
          </div>

          {!!statusMessage && (
            <div className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-secondary">
              {statusMessage}
            </div>
          )}
        </section>
      </form>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
        {required ? " *" : ""}
      </span>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
      />
    </label>
  );
}
