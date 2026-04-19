import Link from "next/link";
import {
  Award,
  BadgeCheck,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  HandHeart,
  IndianRupee,
  Quote,
  Star,
  Users,
} from "lucide-react";

const runningScholarships = [
  {
    name: "Merit Excellence Scholarship",
    provider: "Aman Tiwari (Batch 2008)",
    support: "Up to INR 60,000 per student per year",
    eligibility: "Class 11-12 students with strong academic consistency",
    window: "Applications open: 15 April to 30 May",
  },
  {
    name: "STEM Future Grant",
    provider: "Nidhi Sharma (Batch 2011)",
    support: "One-time grant for coaching, books, and exam fees",
    eligibility: "Students preparing for engineering and science entrance exams",
    window: "Applications open: 1 May to 20 June",
  },
  {
    name: "Girls Higher Education Fund",
    provider: "Ruchi Verma (Batch 2006)",
    support: "Annual support for college admission and first-year expenses",
    eligibility: "Girls from low-income families with confirmed admission",
    window: "Applications open: 5 June to 10 July",
  },
];

const recipients = [
  {
    student: "Riya S. (Public Consent Shared)",
    scholarship: "Merit Excellence Scholarship",
    year: "2025",
    provider: "Aman Tiwari",
    amount: "INR 50,000",
  },
  {
    student: "Arjun K. (Public Consent Shared)",
    scholarship: "STEM Future Grant",
    year: "2025",
    provider: "Nidhi Sharma",
    amount: "INR 35,000",
  },
  {
    student: "Pooja M. (Public Consent Shared)",
    scholarship: "Girls Higher Education Fund",
    year: "2024",
    provider: "Ruchi Verma",
    amount: "INR 70,000",
  },
];

const testimonials = [
  {
    quote:
      "The scholarship reduced my financial stress. I could focus on exams and secure admission in my preferred college.",
    author: "Riya S., Scholarship Recipient",
  },
  {
    quote:
      "I received support at the right time. The alumni mentors also guided me during entrance preparation.",
    author: "Arjun K., Scholarship Recipient",
  },
  {
    quote:
      "This support helped my family continue my education journey without interruption.",
    author: "Pooja M., Scholarship Recipient",
  },
];

const providers = [
  "Aman Tiwari (Batch 2008)",
  "Nidhi Sharma (Batch 2011)",
  "Ruchi Verma (Batch 2006)",
  "Rajat Singh (Batch 2009)",
  "Megha Chauhan (Batch 2013)",
];

export default function ScholarshipsPage() {
  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-14 left-6 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
            <Award className="h-4 w-4" />
            Scholarships
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl">
            Scholarships by Alumni for Student Growth and Equal Opportunity
          </h1>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-3xl">
            Explore running scholarships, see approved public recipient stories, and submit requests.
            This page only shows information that is approved for public display.
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-black text-primary">3</p>
              <p className="text-xs text-text-secondary mt-1">Running scholarships</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-black text-primary">120+</p>
              <p className="text-xs text-text-secondary mt-1">Students supported</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-black text-primary">INR 22L+</p>
              <p className="text-xs text-text-secondary mt-1">Total support mobilized</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-black text-primary">5+</p>
              <p className="text-xs text-text-secondary mt-1">Active alumni providers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Running Scholarships</h2>
          <span className="text-sm text-text-secondary">Open for applications</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {runningScholarships.map((item) => (
            <article key={item.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Running
                </span>
                <IndianRupee className="h-4 w-4 text-primary" />
              </div>

              <h3 className="text-xl font-bold leading-snug">{item.name}</h3>
              <p className="mt-2 text-sm text-text-secondary">Provided by {item.provider}</p>

              <div className="mt-5 space-y-3 text-sm">
                <p className="inline-flex items-start gap-2 text-text-secondary">
                  <HandHeart className="h-4 w-4 text-primary mt-0.5" />
                  <span>{item.support}</span>
                </p>
                <p className="inline-flex items-start gap-2 text-text-secondary">
                  <GraduationCap className="h-4 w-4 text-primary mt-0.5" />
                  <span>{item.eligibility}</span>
                </p>
                <p className="inline-flex items-start gap-2 text-text-secondary">
                  <CalendarClock className="h-4 w-4 text-primary mt-0.5" />
                  <span>{item.window}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Public Recipient Highlights</h2>
            <span className="text-sm text-text-secondary">Only consented public profiles are shown</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="min-w-full text-sm">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Student</th>
                  <th className="text-left px-4 py-3 font-semibold">Scholarship</th>
                  <th className="text-left px-4 py-3 font-semibold">Year</th>
                  <th className="text-left px-4 py-3 font-semibold">Provider</th>
                  <th className="text-left px-4 py-3 font-semibold">Support</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((row) => (
                  <tr key={`${row.student}-${row.year}`} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{row.student}</td>
                    <td className="px-4 py-3">{row.scholarship}</td>
                    <td className="px-4 py-3">{row.year}</td>
                    <td className="px-4 py-3">{row.provider}</td>
                    <td className="px-4 py-3">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.author} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Quote className="h-5 w-5 text-primary" />
              <p className="mt-3 text-text-secondary leading-relaxed">{item.quote}</p>
              <p className="mt-4 text-sm font-semibold text-text-primary">{item.author}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
          <h2 className="text-2xl font-bold">Active Alumni Providers</h2>
          <p className="mt-2 text-text-secondary">These alumni are currently sponsoring scholarships in approved cycles.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {providers.map((name) => (
              <span key={name} className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-sm text-text-primary">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm">
            <h3 className="text-xl font-bold">Alumni Scholarship Contribution Form</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Alumni can submit new scholarship details here. After verification, approved public details are listed on this page.
            </p>

            <form className="mt-5 space-y-3">
              <input className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" placeholder="Full name" />
              <input className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" placeholder="Batch year" />
              <input className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" placeholder="Email address" type="email" />
              <input className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" placeholder="Scholarship title" />
              <input className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" placeholder="Support amount and model" />
              <textarea className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" rows={4} placeholder="Eligibility and key criteria" />
              <label className="flex items-start gap-2 text-xs text-text-secondary">
                <input type="checkbox" className="mt-0.5" />
                I confirm that submitted details can be reviewed by the alumni scholarship committee.
              </label>
              <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
                <ClipboardList className="h-4 w-4" />
                Submit Contribution
              </button>
            </form>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm">
            <h3 className="text-xl font-bold">Student Scholarship Application Form</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Students can apply for running scholarships. Personal data is reviewed privately and not shown publicly without consent.
            </p>

            <form className="mt-5 space-y-3">
              <input className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" placeholder="Student full name" />
              <input className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" placeholder="Current class or course" />
              <input className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" placeholder="Email address" type="email" />
              <input className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" placeholder="Phone number" />
              <select className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary">
                <option>Select scholarship</option>
                {runningScholarships.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
              <textarea className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" rows={4} placeholder="Why are you applying? (short statement)" />
              <label className="flex items-start gap-2 text-xs text-text-secondary">
                <input type="checkbox" className="mt-0.5" />
                I agree to share my details with the scholarship review committee for evaluation.
              </label>
              <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
                <Users className="h-4 w-4" />
                Submit Application
              </button>
            </form>
          </article>
        </div>

        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm text-text-secondary">
          <p className="font-semibold text-text-primary inline-flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Public Information Policy
          </p>
          <p className="mt-1.5">
            Only approved scholarship information, alumni provider names, and student records with explicit public consent are shown on this page.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/directory" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text-primary hover:border-primary/30">
            Explore Directory
          </Link>
          <Link href="/events" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text-primary hover:border-primary/30">
            View Events
          </Link>
        </div>
      </section>
    </div>
  );
}
