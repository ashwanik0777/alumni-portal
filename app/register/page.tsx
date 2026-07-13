"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Calendar, GraduationCap, Mail, ShieldCheck, Sparkles, UserPlus, Users } from "lucide-react";

const benefits = [
  "Access verified alumni profiles and reconnect with your batch.",
  "Get invitations for reunions, chapter events, and career sessions.",
  "Receive mentorship and job opportunities from trusted alumni circles.",
  "Contribute as a mentor, speaker, chapter lead, or community volunteer.",
];

const steps = [
  {
    title: "Create Your Profile",
    detail: "Add your education, work details, and interests so alumni can discover you.",
  },
  {
    title: "Verification Review",
    detail: "Our team verifies your request to keep the alumni network authentic and secure.",
  },
  {
    title: "Join The Community",
    detail: "Start connecting, attending events, and participating in meaningful initiatives.",
  },
];

const currentYear = new Date().getFullYear();
const passingYears = Array.from({ length: currentYear - 1986 + 1 }, (_, index) => String(currentYear - index));

const houseOptions = ["Arawali", "Neelgiri", "Shiwalik", "Udayagiri"];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpMessageType, setOtpMessageType] = useState<"success" | "error" | "info">("info");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitMessageType, setSubmitMessageType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationId, setVerificationId] = useState("");

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setOtpMessage("Please enter your email address first.");
      setOtpMessageType("error");
      return;
    }

    setIsSendingOtp(true);
    setOtpMessage("");
    setIsOtpVerified(false);

    try {
      const response = await fetch("/api/auth/register/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpMessage(data.message || "Failed to send OTP. Please try again.");
        setOtpMessageType("error");
        return;
      }

      setVerificationId(data.verificationId);
      setIsOtpSent(true);
      setOtpMessage("OTP sent to your email. Please check your inbox.");
      setOtpMessageType("success");
    } catch {
      setOtpMessage("Unable to send OTP. Please check your connection and try again.");
      setOtpMessageType("error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpSent) {
      setOtpMessage("Please send OTP first.");
      setOtpMessageType("error");
      return;
    }

    if (!otp.trim()) {
      setOtpMessage("Please enter the OTP code.");
      setOtpMessageType("error");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpMessage("");

    try {
      const response = await fetch("/api/auth/register/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          verificationId,
          otpCode: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.verified) {
        setIsOtpVerified(false);
        setOtpMessage(data.message || "Invalid OTP. Please try again.");
        setOtpMessageType("error");
        return;
      }

      setIsOtpVerified(true);
      setOtpMessage("Email verified successfully.");
      setOtpMessageType("success");
    } catch {
      setOtpMessage("Unable to verify OTP. Please try again.");
      setOtpMessageType("error");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isOtpVerified) {
      setSubmitMessage("Please verify your email with OTP before submitting.");
      setSubmitMessageType("error");
      return;
    }

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      fullName: String(formData.get("fullName") || "").trim(),
      email: email.trim().toLowerCase(),
      passingYear: String(formData.get("passingYear") || "").trim(),
      house: String(formData.get("house") || "").trim(),
      mobile: String(formData.get("mobile") || "").trim(),
      fatherName: String(formData.get("fatherName") || "").trim(),
      verificationId,
    };

    const missingFields: string[] = [];
    if (!payload.fullName) missingFields.push("Full Name");
    if (!payload.email) missingFields.push("Email");
    if (!payload.passingYear) missingFields.push("Passing Year");
    if (!payload.house) missingFields.push("House");
    if (!payload.mobile) missingFields.push("Mobile Number");
    if (!payload.fatherName) missingFields.push("Father's Name");

    if (missingFields.length > 0) {
      setSubmitMessage(`Please fill all required details before submitting. Missing: ${missingFields.join(", ")}`);
      setSubmitMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        // Safe fallback for HTML error pages
      }

      if (!response.ok) {
        setSubmitMessage(data.message || `Registration failed (Status ${response.status}). Please try again.`);
        setSubmitMessageType("error");
        return;
      }

      formElement.reset();
      setEmail("");
      setOtp("");
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtpMessage("");
      setVerificationId("");
      setSubmitMessage("Registration submitted successfully! You will receive a confirmation email shortly. Admin will review and approve your membership.");
      setSubmitMessageType("success");
    } catch (err) {
      console.error("Registration submit client error:", err);
      setSubmitMessage("Unable to submit registration. Please check your connection and try again.");
      setSubmitMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const otpMsgColor =
    otpMessageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : otpMessageType === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-border bg-background text-text-secondary";

  const submitMsgColor =
    submitMessageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-14 -left-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-8 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
            <UserPlus className="h-4 w-4" />
            Alumni Registration
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl">
            Join A Trusted Alumni Network Built For Lifelong Connection
          </h1>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-2xl">
            Complete your registration to unlock networking, mentorship, events, and opportunities curated
            for the JNV Farrukhabad alumni community.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="#registration-form"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              Start Registration
            </a>
            <Link
              href="/directory"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-text-primary hover:border-primary/30 transition-colors"
            >
              Explore Directory
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Why Register</h2>
            <p className="text-text-secondary leading-relaxed">
              Registration gives you full access to a meaningful network built around support, growth,
              collaboration, and shared identity.
            </p>
            <div className="space-y-3 pt-1">
              {benefits.map((item) => (
                <div key={item} className="rounded-xl border border-border bg-card p-4 text-sm text-text-secondary leading-relaxed">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary mr-2 align-middle">
                    <BadgeCheck className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div id="registration-form" className="lg:col-span-8 rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Registration Form</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold">Create Your Alumni Profile</h3>

            <form onSubmit={handleSubmit} className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label>
                <span className="mb-1.5 block text-sm font-medium">Full Name</span>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary"
                  required
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium">Email Address</span>
                <div className="relative">
                  <Mail className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary"
                    required
                    disabled={isOtpVerified}
                  />
                </div>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium">Batch / Passing Year</span>
                <div className="relative">
                  <Calendar className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                  <select
                    name="passingYear"
                    defaultValue=""
                    className="w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-text-primary outline-none focus:border-primary"
                    required
                  >
                    <option value="" disabled>
                      Select passing year
                    </option>
                    {passingYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium">House</span>
                <select
                  name="house"
                  defaultValue=""
                  className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary"
                  required
                >
                  <option value="" disabled>
                    Select house
                  </option>
                  {houseOptions.map((house) => (
                    <option key={house} value={house}>
                      {house}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium">Mobile Number</span>
                <input
                  name="mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary"
                  required
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-medium">Father's Name</span>
                <input
                  name="fatherName"
                  type="text"
                  placeholder="Enter father's name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary"
                  required
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium">Email OTP Verification</span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter 6-digit OTP"
                    disabled={isOtpVerified}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary sm:w-96 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || isOtpVerified}
                    className="inline-flex min-w-32 items-center justify-center whitespace-nowrap rounded-xl border border-primary/40 bg-transparent px-5 py-3 text-sm font-semibold leading-none text-primary hover:border-primary/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingOtp ? "Sending..." : isOtpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || isOtpVerified}
                    className="inline-flex min-w-32 items-center justify-center whitespace-nowrap rounded-xl border border-primary/40 bg-transparent px-5 py-3 text-sm font-semibold leading-none text-primary hover:border-primary/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingOtp ? "Verifying..." : isOtpVerified ? "✓ Verified" : "Verify OTP"}
                  </button>
                </div>
              </label>

              {!!otpMessage && (
                <div className={`sm:col-span-2 rounded-xl border px-4 py-3 text-sm ${otpMsgColor}`}>
                  {otpMessage}
                </div>
              )}

              <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">

                <button
                  type="submit"
                  disabled={!isOtpVerified || isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>

              {!!submitMessage && (
                <div className={`sm:col-span-2 rounded-xl border px-4 py-3 text-sm ${submitMsgColor}`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 grid lg:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <p className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold mb-4">
                {index + 1}
              </p>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="rounded-3xl border border-primary/20 dark:border-primary/40 bg-linear-to-r from-primary/95 to-primary dark:from-slate-900 dark:to-blue-950 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -left-12 -bottom-16 h-52 w-52 rounded-full bg-secondary/20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mb-3">
                <Users className="h-4 w-4" />
                Community Verified
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold">Already Registered?</h3>
              <p className="mt-2 text-white/90 max-w-2xl">
                Sign in to update your profile, respond to invitations, and engage with alumni opportunities.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-primary hover:bg-white/90 transition-colors"
            >
              Go To Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
