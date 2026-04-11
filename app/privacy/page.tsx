import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect details you provide while registering, including your name, batch year, contact information, professional details, and alumni interests. We may also collect technical usage data like browser type, device metadata, and anonymized analytics to improve platform performance.",
  },
  {
    title: "2. How We Use Information",
    body: "Your information is used to manage your account, connect you with fellow alumni, personalize opportunities, send event updates, and improve community engagement features. We do not sell personal information to third parties.",
  },
  {
    title: "3. Data Sharing",
    body: "We only share data when necessary for trusted operational services (such as email or hosting providers), legal compliance, or explicit alumni community interactions that you initiate. All service providers are expected to follow strong data protection standards.",
  },
  {
    title: "4. Data Security",
    body: "We implement administrative, technical, and organizational safeguards to protect your data from unauthorized access, alteration, or misuse. While no platform can guarantee absolute security, we continuously improve our controls and monitoring practices.",
  },
  {
    title: "5. Your Controls",
    body: "You can request profile corrections, update communication preferences, or ask for account deletion through support. Certain records may be retained when required for legal, security, or operational obligations.",
  },
  {
    title: "6. Policy Updates",
    body: "This Privacy Policy may be updated periodically. Material changes will be communicated through the portal or email notifications, and the revised effective date will be updated on this page.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 left-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-8 right-0 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-5">
            <ShieldCheck className="h-4 w-4" />
            Privacy First
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Privacy Policy</h1>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-3xl">
            Your trust is central to our alumni community. This policy explains what we collect, why we
            collect it, and how we protect your personal information.
          </p>
          <p className="mt-4 text-sm text-text-secondary">Effective Date: 11 April 2026</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid gap-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm">
              <h2 className="text-xl font-bold mb-3">{section.title}</h2>
              <p className="text-text-secondary leading-relaxed">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-16">
        <div className="rounded-3xl border border-primary/20 bg-linear-to-r from-primary to-primary/90 p-7 sm:p-9 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mb-3">
                <LockKeyhole className="h-4 w-4" />
                Need Help With Privacy?
              </p>
              <h3 className="text-2xl font-bold">Contact Our Support Team</h3>
              <p className="text-white/90 mt-1">For data access, correction, or deletion requests, write to us anytime.</p>
            </div>
            <a
              href="mailto:alumnijnvfarrukhaad@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-primary hover:bg-white/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email Support
            </a>
          </div>
          <div className="mt-5 text-sm text-white/85">
            You can also review our <Link href="/terms" className="font-semibold underline decoration-white/60">Terms of Service</Link> for usage rules.
          </div>
        </div>
      </section>
    </div>
  );
}