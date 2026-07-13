"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Compass,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

type MentorshipApplication = {
  id: string;
  mentee_email: string;
  mentee_name: string;
  mentee_phone: string;
  current_stage: string;
  track: string;
  goal: string;
  urgency: string;
  status: "Pending" | "Assigned" | "Active" | "Completed" | "Closed";
  mentor_email: string | null;
  mentee_started: boolean;
  mentor_started: boolean;
  mentee_completed: boolean;
  mentor_completed: boolean;
  created_at: string;
};

type MentorProfile = {
  id: string;
  email: string;
  full_name: string;
  expertise: string;
  max_mentees: number;
  status: string;
};

type ChatMessage = {
  id: string;
  senderEmail: string;
  message: string;
  createdAt: string;
};

const mentorCache = new Map<string, { expiresAt: number; data: any }>();
const CACHE_TTL = 300_000;

/* ====== Chat Panel Component ====== */
function ChatPanel({ applicationId, userEmail }: { applicationId: string; userEmail: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/mentorship/chat?application_id=${applicationId}&email=${userEmail}`);
      if (res.ok) {
        const data = await res.json();
        if (data.chatEnabled) {
          setMessages(data.messages || []);
        }
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [applicationId, userEmail]);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/user/mentorship/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId, email: userEmail, message: newMsg.trim() }),
      });
      if (res.ok) {
        setNewMsg("");
        await loadMessages();
      }
    } catch { /* silent */ } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="border-t border-border mt-4 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-primary">Mentorship Chat</span>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="h-48 overflow-y-auto rounded-xl border border-border bg-background p-3 space-y-2 mb-3"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 text-text-secondary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-xs text-text-secondary text-center pt-16">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderEmail === userEmail;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    isMe
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-card border border-border text-text-primary rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-text-secondary"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary"
        />
        <button
          onClick={handleSend}
          disabled={!newMsg.trim() || sending}
          className="shrink-0 rounded-xl bg-primary px-3 py-2.5 text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

/* ====== Main Page ====== */
export default function UserMentorDashboard() {
  const [applications, setApplications] = useState<MentorshipApplication[]>([]);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notMentor, setNotMentor] = useState(false);
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());

  const loadData = useCallback(async (forceFresh = false) => {
    const cacheKey = "mentor-dashboard";
    const cached = forceFresh ? undefined : mentorCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      setApplications(cached.data.applications);
      setMentorProfile(cached.data.mentorProfile);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/mentor");
      if (res.status === 403) {
        setNotMentor(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        setMentorProfile(data.mentorProfile || null);
        mentorCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL, data });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("auth_email") || "";
    setUserEmail(email.trim().toLowerCase());
    loadData();
  }, [loadData]);

  const toggleChat = (id: string) => {
    setExpandedChats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAction = async (id: string, action: "start" | "complete") => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/user/mentor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        setMessage(action === "start" ? "Mentorship started!" : "Mentorship marked as completed!");
        loadData(true);
      } else {
        setMessage((await res.json()).message || "Update failed.");
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  if (notMentor) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-8 text-center">
          <ShieldCheck className="h-12 w-12 text-text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Mentor Dashboard</h2>
          <p className="mt-3 text-text-secondary max-w-md mx-auto">
            You are not an approved mentor yet. Apply to become a mentor and start helping students.
          </p>
          <Link
            href="/mentorship"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Apply to be a Mentor
          </Link>
        </section>
      </div>
    );
  }

  const activeCount = applications.filter((a) => ["Assigned", "Active"].includes(a.status)).length;
  const completedCount = applications.filter((a) => a.status === "Completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Mentor Dashboard</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                Role: Approved Mentor
              </span>
              <span className="text-[11px] text-text-secondary">
                — Providing Mentorship to Students (Mentees)
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              You are a verified mentor. Manage your assigned students below.
            </p>
          </div>
        </div>
        {message && (
          <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
            {message}
          </p>
        )}
      </section>

      {/* Stats */}
      {mentorProfile && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Active Students</p>
            <p className="mt-2 text-2xl font-black text-blue-600">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Completed</p>
            <p className="mt-2 text-2xl font-black text-emerald-600">{completedCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Capacity</p>
            <p className="mt-2 text-2xl font-black text-primary">{mentorProfile.max_mentees} max</p>
          </div>
        </section>
      )}

      {/* Mentee List */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Your Assigned Students
        </h3>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-border/40" />)}
          </div>
        ) : applications.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">No students assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <article key={app.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">S</span>
                      {app.mentee_name}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      {app.mentee_email}
                      {app.mentee_phone ? ` • ${app.mentee_phone}` : ""}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Track: <span className="font-semibold">{app.track}</span> • Stage: <span className="font-semibold">{app.current_stage}</span>
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border shrink-0 ${
                    app.status === "Completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                    app.status === "Active" ? "border-blue-200 bg-blue-50 text-blue-700" :
                    app.status === "Closed" ? "border-gray-200 bg-gray-50 text-gray-700" :
                    "border-amber-200 bg-amber-50 text-amber-700"
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-card/50 text-xs">
                  <p><span className="font-semibold">Goal:</span> {app.goal}</p>
                  <p className="mt-1">
                    <span className="font-semibold">Urgency:</span>{" "}
                    <span className={app.urgency.includes("Urgent") ? "text-rose-600 font-bold" : ""}>{app.urgency}</span>
                  </p>
                </div>

                {/* Progress + Actions */}
                {(app.status === "Assigned" || app.status === "Active") && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!app.mentor_started && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleAction(app.id, "start")}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Mark as Started
                      </button>
                    )}
                    {app.mentor_started && !app.mentor_completed && (
                      <button
                        disabled={actionLoading || !(app.mentee_started && app.mentor_started)}
                        onClick={() => handleAction(app.id, "complete")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                )}

                {(app.status === "Assigned" || app.status === "Active") && (
                  <div className="mt-3 text-[11px] flex gap-4 text-text-secondary border-t border-border pt-3">
                    <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> Student Started: {app.mentee_started ? "Yes" : "No"}</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> You Started: {app.mentor_started ? "Yes" : "No"}</span>
                    <span className="flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> Both Complete: {(app.mentee_completed && app.mentor_completed) ? "Yes" : "No"}</span>
                  </div>
                )}

                {/* Chat Toggle */}
                {(app.status === "Assigned" || app.status === "Active") && userEmail && (
                  <>
                    <button
                      onClick={() => toggleChat(app.id)}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {expandedChats.has(app.id) ? "Hide Chat" : "Open Chat"}
                      {expandedChats.has(app.id) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {expandedChats.has(app.id) && (
                      <ChatPanel applicationId={app.id} userEmail={userEmail} />
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
