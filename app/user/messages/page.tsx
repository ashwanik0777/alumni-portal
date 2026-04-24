"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, CheckCheck, Circle, MessageSquareText, RefreshCw, Search, SendHorizontal, Sparkles, Zap } from "lucide-react";

type Conversation = {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
};

type ChatMessage = {
  id: string;
  conversationId: string;
  sender: "me" | "them";
  text: string;
  time: string;
  status: "sending" | "sent" | "delivered";
};

let messagesCache: { data: Conversation[]; expiresAt: number } | null = null;
const MESSAGES_CACHE_TTL_MS = 8_000;

function getStoredUserProfile() {
  if (typeof window === "undefined") return { fullName: "", email: "" };
  try {
    const raw = localStorage.getItem("user_profile_draft_v1");
    if (raw) {
      const p = JSON.parse(raw) as { fullName?: string; email?: string };
      return { fullName: p.fullName?.trim() || "", email: p.email?.trim().toLowerCase() || "" };
    }
  } catch { /* skip */ }
  return { fullName: "Aman Sharma", email: "aman.alumni@jnvportal.in" };
}

function MessagesSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="h-5 w-48 rounded bg-border/60" />
        <div className="mt-3 h-7 w-80 max-w-full rounded bg-border/60" />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`m-${i}`} className="h-16 rounded-lg border border-border bg-background" />
          ))}
        </div>
      </section>
      <section className="grid min-h-140 grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="h-full rounded-xl border border-border bg-card xl:col-span-4" />
        <div className="h-full rounded-xl border border-border bg-card xl:col-span-8" />
      </section>
    </div>
  );
}

export default function UserMessagesPage() {
  const profile = useMemo(() => getStoredUserProfile(), []);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  const loadConversations = useCallback(async (forceFresh = false) => {
    if (!profile.email) { setLoading(false); return; }

    if (!forceFresh && messagesCache && messagesCache.expiresAt > Date.now()) {
      setConversations(messagesCache.data);
      if (!selectedId && messagesCache.data.length > 0) setSelectedId(messagesCache.data[0].id);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/user/messages?email=${encodeURIComponent(profile.email)}`);
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations || []);
        messagesCache = { data: data.conversations || [], expiresAt: Date.now() + MESSAGES_CACHE_TTL_MS };
        if (!selectedId && data.conversations?.length > 0) setSelectedId(data.conversations[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [profile.email, selectedId]);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/user/messages?email=${encodeURIComponent(profile.email)}&conversationId=${encodeURIComponent(convId)}`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    }
  }, [profile.email]);

  const markRead = useCallback(async (convId: string) => {
    try {
      await fetch("/api/user/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read", conversationId: convId }),
      });
      setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, unreadCount: 0 } : c));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { void loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (selectedId) {
      void loadMessages(selectedId);
      const conv = conversations.find(c => c.id === selectedId);
      if (conv && conv.unreadCount > 0) void markRead(selectedId);
    }
  }, [selectedId, loadMessages, markRead, conversations]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedId || isSending) return;

    setIsSending(true);
    const tempId = `temp-${Date.now()}`;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    setMessages((prev) => [...prev, { id: tempId, conversationId: selectedId, sender: "me", text, time, status: "sending" }]);
    setDraft("");

    try {
      const res = await fetch("/api/user/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, text }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => prev.map((m) => m.id === tempId ? data.message : m));
        setConversations((prev) => prev.map((c) => c.id === selectedId ? { ...c, lastMessage: text, lastTime: time, unreadCount: 0 } : c));
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) || null,
    [conversations, selectedId],
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((item) => {
      const txt = `${item.name} ${item.role} ${item.lastMessage}`.toLowerCase();
      return txt.includes(search.toLowerCase());
    });
  }, [conversations, search]);

  const totalUnread = useMemo(() => conversations.reduce((acc, item) => acc + item.unreadCount, 0), [conversations]);
  const onlineCount = useMemo(() => conversations.filter((item) => item.isOnline).length, [conversations]);

  if (loading) return <MessagesSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Real-Time Messaging Hub
            </p>
            <h2 className="mt-2 text-2xl font-black">Fast conversations for mentors, alumni, and admin</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Optimized chat-style interface with live database updates and unread tracking.
            </p>
          </div>
          <button
            onClick={() => { messagesCache = null; void loadConversations(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/30"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Sync
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Active Chats" value={String(conversations.length)} />
          <StatCard label="Unread Messages" value={String(totalUnread)} />
          <StatCard label="Online Contacts" value={String(onlineCount)} />
          <StatCard label="Database Sync" value="Active" />
        </div>
      </section>

      <section className="grid min-h-140 grid-cols-1 gap-4 xl:grid-cols-12">
        <aside className="rounded-xl border border-border bg-card p-4 xl:col-span-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="mt-3 space-y-2">
            {filteredConversations.length === 0 ? (
              <p className="py-4 text-center text-xs text-text-secondary">No conversations found.</p>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                    selectedId === conv.id ? "border-primary/30 bg-primary/5" : "border-border bg-background hover:border-primary/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{conv.name}</p>
                      <p className="text-xs text-text-secondary">{conv.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-text-secondary">{conv.lastTime}</p>
                      {conv.unreadCount > 0 && (
                        <span className="mt-1 inline-flex rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs text-text-secondary">{conv.lastMessage}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <article className="flex flex-col rounded-xl border border-border bg-card xl:col-span-8">
          {selectedConversation ? (
            <>
              <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
                <div>
                  <p className="text-sm font-bold text-text-primary">{selectedConversation.name}</p>
                  <p className="text-xs text-text-secondary">{selectedConversation.role}</p>
                </div>
                <p className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  selectedConversation.isOnline ? "border-primary/20 bg-primary/5 text-primary" : "border-border bg-background text-text-secondary"
                }`}>
                  <Zap className="h-3.5 w-3.5" />
                  {selectedConversation.isOnline ? "Online" : "Away"}
                </p>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-background/60 px-4 py-4 sm:px-5">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.sender === "me" ? "bg-primary text-white" : "border border-border bg-card text-text-primary"}`}>
                      <p>{msg.text}</p>
                      <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${msg.sender === "me" ? "text-white/80" : "text-text-secondary"}`}>
                        <span>{msg.time}</span>
                        {msg.sender === "me" && msg.status && <MessageStatusIcon status={msg.status} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <footer className="border-t border-border px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleSend(); } }}
                    placeholder="Type your message and press Enter"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={isSending || !draft.trim()}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <div className="max-w-xs">
                <MessageSquareText className="mx-auto h-10 w-10 text-border" />
                <p className="mt-4 text-sm font-semibold text-text-primary">No Conversation Selected</p>
                <p className="mt-1 text-xs text-text-secondary">Choose a conversation from the sidebar to view messages or start chatting.</p>
              </div>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-background px-3 py-3">
      <p className="text-xl font-black text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </article>
  );
}

function MessageStatusIcon({ status }: { status: ChatMessage["status"] }) {
  if (status === "sending") return <Circle className="h-3 w-3" />;
  if (status === "sent") return <Check className="h-3 w-3" />;
  return <CheckCheck className="h-3 w-3" />;
}
