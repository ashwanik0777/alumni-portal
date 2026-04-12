import Link from "next/link";
import { BadgeCheck, FileText, Gavel } from "lucide-react";

const terms = [
  {
    title: "1. Acceptance of Terms",
    text: "By accessing or using the Alumni Portal, you agree to follow these Terms of Service and all applicable laws. If you do not agree, please discontinue use of the platform.",
  },
  {
    title: "2. Account Responsibility",
    text: "You are responsible for maintaining accurate account details and safeguarding your login credentials. Activity performed through your account is considered your responsibility unless reported as unauthorized.",
  },
  {
    title: "3. Community Conduct",
    text: "Members must maintain respectful behavior. Harassment, impersonation, misinformation, spam, or harmful content is prohibited. We reserve the right to moderate and remove content that violates community standards.",
  },
  {
    title: "4. Events and Participation",
    text: "Event schedules, registration limits, and participation rules may change due to logistics or safety requirements. Registered users are expected to follow event-specific instructions and venue guidelines.",
  },
  {
    title: "5. Intellectual Property",
    text: "Portal branding, content design, and platform assets are protected and may not be reused without permission. Users retain ownership of their own submitted content while granting us permission to display it within community features.",
  },
  {
    title: "6. Limitation of Liability",
    text: "The portal is provided on an as-available basis. While we work to maintain reliability, we are not liable for indirect losses, temporary disruptions, or issues caused by third-party services beyond our control.",
  },
  {
    title: "7. Changes to Terms",
    text: "We may revise these terms to reflect updates in policies, legal requirements, or service capabilities. Continued use after updates indicates acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 left-8 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-5">
            <FileText className="h-4 w-4" />
            Legal & Community Guidelines
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Terms of Service</h1>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-3xl">
            These terms define the rules for using Alumni Portal services, including account access,
            community participation, and responsible platform usage.
          </p>
          <p className="mt-4 text-sm text-text-secondary">Effective Date: 11 April 2026</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid gap-5">
          {terms.map((item) => (
            <article key={item.title} className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold mb-3">{item.title}</h2>
              <p className="text-text-secondary leading-relaxed">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-16">
        <div className="rounded-3xl border border-secondary/40 dark:border-primary/40 bg-linear-to-r from-secondary/35 to-secondary/20 dark:from-slate-900 dark:to-blue-950 p-7 sm:p-9 text-text-primary dark:text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-card/70 border border-border px-3 py-1 text-sm font-semibold text-text-primary">
            <BadgeCheck className="h-4 w-4 text-primary" />
            Transparent & Fair
          </p>
          <h3 className="mt-4 text-2xl font-bold">Questions About These Terms?</h3>
          <p className="mt-2  max-w-2xl">
            For any clarification regarding account policies, content moderation, or event participation,
            our support and administrative team is available to help.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:jnvfarrukhabad.alumni@gmail.com"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Contact Administration
            </a>
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-semibold text-text-primary hover:border-primary/30 transition-colors"
            >
              <Gavel className="h-4 w-4 text-primary" />
              Review Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}