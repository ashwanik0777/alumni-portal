"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
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
  X,
} from "lucide-react";

type ModalType = "none" | "alumni" | "student";

type Recipient = {
  student: string;
  slug: string;
  scholarship: string;
  year: string;
  provider: string;
  amount: string;
};

type Testimonial = {
  quote: string;
  student: string;
  slug: string;
  note: string;
};

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

const recipients: Recipient[] = [
  {
    student: "Aditi Verma (Public Consent Shared)",
    slug: "aditi-verma",
    scholarship: "Merit Excellence Scholarship",
    year: "2025",
    provider: "Aman Tiwari",
    amount: "INR 50,000",
  },
  {
    student: "Rohit Mishra (Public Consent Shared)",
    slug: "rohit-mishra",
    scholarship: "STEM Future Grant",
    year: "2025",
    provider: "Nidhi Sharma",
    amount: "INR 35,000",
  },
  {
    student: "Nidhi Chauhan (Public Consent Shared)",
    slug: "nidhi-chauhan",
    scholarship: "Girls Higher Education Fund",
    year: "2024",
    provider: "Ruchi Verma",
    amount: "INR 70,000",
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      "The scholarship reduced my financial stress. I could focus on exams and secure admission in my preferred college.",
    student: "Aditi Verma",
    slug: "aditi-verma",
    note: "Scholarship Recipient",
  },
  {
    quote:
      "I received support at the right time. The alumni mentors also guided me during entrance preparation.",
    student: "Rohit Mishra",
    slug: "rohit-mishra",
    note: "Scholarship Recipient",
  },
  {
    quote:
      "This support helped my family continue my education journey without interruption.",
    student: "Nidhi Chauhan",
    slug: "nidhi-chauhan",
    note: "Scholarship Recipient",
  },
  {
    quote:
      "The process was transparent and simple. I got both financial support and academic direction.",
    student: "Sneha Dubey",
    slug: "sneha-dubey",
    note: "Scholarship Recipient",
  },
  {
    quote:
      "I felt supported by the alumni network. The scholarship gave me confidence to continue higher studies.",
    student: "Kunal Saxena",
    slug: "kunal-saxena",
    note: "Scholarship Recipient",
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
  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [itemsPerView, setItemsPerView] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gateMessage, setGateMessage] = useState("");
  const [profilePrefill, setProfilePrefill] = useState({
    fullName: "",
    email: "",
    mobile: "",
    currentCourse: "",
  });
  const testimonialsTrackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const authUser = localStorage.getItem("auth_user") === "active";
    setIsAuthenticated(authUser);

    const saved = localStorage.getItem("user_profile_draft_v1");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Record<string, string>;
      setProfilePrefill({
        fullName: parsed.fullName || "",
        email: parsed.email || "",
        mobile: parsed.mobile || "",
        currentCourse: parsed.studentCourse || parsed.currentCourse || parsed.jobTitle || "",
      });
    } catch {
      // Keep manual form entry if profile draft is not available.
    }
  }, []);

  const openModalWithAuth = (type: Exclude<ModalType, "none">) => {
    if (!isAuthenticated) {
      setGateMessage("Please login first. Scholarship forms are available only for logged-in users.");
      return;
    }
    setGateMessage("");
    setActiveModal(type);
  };

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const getWrappedIndex = (index: number) => {
    const total = testimonials.length;
    return (index + total) % total;
  };

  const handleNext = () => {
    setSlideDirection("next");
    setActiveIndex((prev) => getWrappedIndex(prev + 1));
  };

  const handlePrev = () => {
    setSlideDirection("prev");
    setActiveIndex((prev) => getWrappedIndex(prev - 1));
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      handleNext();
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const visibleTestimonials = useMemo(() => {
    if (itemsPerView === 1) {
      return [testimonials[activeIndex]];
    }

    if (itemsPerView === 2) {
      return [
        testimonials[getWrappedIndex(activeIndex)],
        testimonials[getWrappedIndex(activeIndex + 1)],
      ];
    }

    return [
      testimonials[getWrappedIndex(activeIndex - 1)],
      testimonials[getWrappedIndex(activeIndex)],
      testimonials[getWrappedIndex(activeIndex + 1)],
    ];
  }, [activeIndex, itemsPerView]);

  useEffect(() => {
    const node = testimonialsTrackRef.current;
    if (!node) {
      return;
    }

    const startX = slideDirection === "next" ? 36 : -36;
    node.animate(
      [
        {
          opacity: 0,
          transform: `translateX(${startX}px) scale(0.98)`,
        },
        {
          opacity: 1,
          transform: "translateX(0) scale(1)",
        },
      ],
      {
        duration: 520,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );
  }, [activeIndex, slideDirection, itemsPerView]);

  return (
    <div className="bg-background text-text-primary">
      {activeModal !== "none" && (
        <div className="fixed inset-0 z-80 bg-black/50 p-4 sm:p-6">
          <div className="mx-auto h-full w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold">
                  {activeModal === "alumni" ? "Alumni Scholarship Contribution Form" : "Student Scholarship Application Form"}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {activeModal === "alumni"
                    ? "Submit scholarship details for review. Approved public details are shown on this page."
                    : "Apply to running scholarships. Personal details are reviewed privately."}
                </p>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary hover:text-primary"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {activeModal === "alumni" ? (
              <form className="space-y-3">
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
            ) : (
              <form className="space-y-3">
                <input
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                  placeholder="Student full name"
                  defaultValue={profilePrefill.fullName}
                  readOnly={Boolean(profilePrefill.fullName)}
                />
                <input
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                  placeholder="Current class or course"
                  defaultValue={profilePrefill.currentCourse}
                  readOnly={Boolean(profilePrefill.currentCourse)}
                />
                <input
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                  placeholder="Email address"
                  type="email"
                  defaultValue={profilePrefill.email}
                  readOnly={Boolean(profilePrefill.email)}
                />
                <input
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                  placeholder="Phone number"
                  defaultValue={profilePrefill.mobile}
                  readOnly={Boolean(profilePrefill.mobile)}
                />
                <select className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary">
                  <option>Select scholarship</option>
                  {runningScholarships.map((item) => (
                    <option key={item.name}>{item.name}</option>
                  ))}
                </select>
                <textarea className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary" rows={4} placeholder="Why are you applying? (short statement)" />
                <p className="text-xs text-text-secondary">
                  Basic information is auto-filled from your profile when available.
                </p>
                <label className="flex items-start gap-2 text-xs text-text-secondary">
                  <input type="checkbox" className="mt-0.5" />
                  I agree to share my details with the scholarship review committee for evaluation.
                </label>
                <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
                  <Users className="h-4 w-4" />
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
                  <tr key={`${row.slug}-${row.year}`} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/directory/${row.slug}`} className="text-primary hover:underline font-medium">
                        {row.student}
                      </Link>
                    </td>
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
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Student Testimonial Stories</h2>
        </div>

        <div className="flex items-center gap-3 lg:gap-5 mt-16">
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-text-secondary shadow-sm transition hover:-translate-y-0.5 hover:text-primary hover:shadow-md"
            aria-label="Previous testimonials"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div ref={testimonialsTrackRef} className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {visibleTestimonials.map((item, index) => {
              const isCenterCard = itemsPerView === 3 && index === 1;
              return (
                <article
                  key={`${item.slug}-${activeIndex}-${index}`}
                  className={`rounded-2xl border p-5 transition-all duration-500 ${
                    isCenterCard
                      ? "scale-100 border-primary/30 bg-card shadow-xl lg:scale-[1.06]"
                      : "border-border bg-card/80 shadow-md lg:scale-95"
                  }`}
                >
                  <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                    <Quote className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-text-secondary">{item.quote}</p>
                  <Link href={`/directory/${item.slug}`} className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                    {item.student}
                  </Link>
                  <p className="mt-1 text-xs text-text-secondary">{item.note}</p>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-text-secondary shadow-sm transition hover:-translate-y-0.5 hover:text-primary hover:shadow-md"
            aria-label="Next testimonials"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
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
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h3 className="text-2xl font-bold">Scholarship Actions</h3>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openModalWithAuth("alumni")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              <ClipboardList className="h-4 w-4" />
              Open Alumni Contribution Form
            </button>
            <button
              type="button"
              onClick={() => openModalWithAuth("student")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-text-primary hover:border-primary/30"
            >
              <Users className="h-4 w-4" />
              Open Student Application Form
            </button>
          </div>

          {gateMessage && (
            <p className="mt-3 text-sm text-amber-700">
              {gateMessage} <Link href="/login" className="font-semibold text-primary hover:underline">Go to Login</Link>
            </p>
          )}
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
