"use client";

import { IndianRupee, Users, Calendar, BookOpen, GraduationCap, Award, Clock3, CheckCircle2, FileCheck } from "lucide-react";

type Overview = {
  totalMembers: number;
  totalEvents: number;
  totalPrograms: number;
  totalScholarships: number;
  activeScholarships: number;
  totalApplications: number;
  pendingApplications: number;
  verifiedApplications: number;
  completedApplications: number;
  totalFundingInr: number;
  disbursedFundingInr: number;
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}

export default function OverviewCards({ data }: { data: Overview }) {
  const cards = [
    { label: "Total Members", value: data.totalMembers, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "Total Events", value: data.totalEvents, icon: Calendar, color: "text-violet-600 bg-violet-50 border-violet-200" },
    { label: "Programs", value: data.totalPrograms, icon: BookOpen, color: "text-teal-600 bg-teal-50 border-teal-200" },
    { label: "Scholarships", value: `${data.activeScholarships} / ${data.totalScholarships}`, icon: Award, color: "text-amber-600 bg-amber-50 border-amber-200", sub: "Active / Total" },
    { label: "Total Funding", value: fmt(data.totalFundingInr), icon: IndianRupee, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "Disbursed", value: fmt(data.disbursedFundingInr), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "Applications", value: data.totalApplications, icon: GraduationCap, color: "text-primary bg-primary/5 border-primary/20" },
    { label: "Pending Review", value: data.pendingApplications, icon: Clock3, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { label: "Verified", value: data.verifiedApplications, icon: FileCheck, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "Completed", value: data.completedApplications, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <article key={c.label} className={`rounded-2xl border p-4 ${c.color}`}>
          <div className="flex items-center gap-2">
            <c.icon className="h-4 w-4" />
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{c.label}</p>
          </div>
          <p className="mt-2 text-xl font-black">{c.value}</p>
          {c.sub && <p className="text-[10px] opacity-70">{c.sub}</p>}
        </article>
      ))}
    </section>
  );
}
