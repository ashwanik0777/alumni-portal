"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, CheckCheck, Circle, MessageSquareText, RefreshCw, Search, SendHorizontal, Sparkles, Zap } from "lucide-react";

type Conversation = {
  id: string; // participant's email
  name: string;
  role: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
};

type ChatMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  createdAt: string; // ISO string
  isEdited: boolean;
  status: "sent" | "delivered";
};

let messagesCache: { data: Conversation[]; expiresAt: number } | null = null;
const MESSAGES_CACHE_TTL_MS = 3_000;

function getStoredUserProfile() {
  if (typeof window === "undefined") return { fullName: "", email: "" };
  try {
    const authEmail = localStorage.getItem("auth_email");
    const authName = localStorage.getItem("auth_first_name");
    
    const raw = localStorage.getItem("user_profile_draft_v1");
    if (raw) {
      const p = JSON.parse(raw) as { fullName?: string; email?: string };
      return {
        fullName: p.fullName?.trim() || authName || "Alumni",
        email: p.email?.trim().toLowerCase() || authEmail || "",
      };
    }
    if (authEmail) {
      return { fullName: authName || "Alumni", email: authEmail };
    }
  } catch { /* skip */ }
  return { fullName: "Alumni", email: "" };
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

  // Edit Message States
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const loadConversations = useCallback(async (forceFresh = false) => {
    if (!profile.email) { setLoading(false); return; }

    if (!forceFresh && messagesCache && messagesCache.expiresAt > Date.now()) {
      setConversations(messagesCache.data);
      if (!selectedId && messagesCache.data.length > 0) setSelectedId(messagesCache.data[0].id);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/user/messages`);
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
      const res = await fetch(`/api/user/messages?conversationId=${encodeURIComponent(convId)}`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

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

  // Polling loop for real-time updates
  useEffect(() => {
    loadConversations(true);

    const interval = setInterval(() => {
      loadConversations(false);
      if (selectedId) {
        loadMessages(selectedId);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedId, loadConversations, loadMessages]);

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
    
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: "me",
        text,
        time,
        createdAt: new Date().toISOString(),
        isEdited: false,
        status: "sent",
      },
    ]);
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

  const handleClearChat = async () => {
    if (!selectedId) return;
    const confirmed = window.confirm("Are you sure you want to clear this chat? This will only remove messages from your dashboard.");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/user/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear", conversationId: selectedId }),
      });
      if (res.ok) {
        setMessages([]);
        void loadConversations(true);
      }
    } catch (e) {
      console.error("Failed to clear chat:", e);
    }
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch("/api/user/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", messageId: msgId, text: editingText }),
      });
      if (res.ok) {
        setEditingMessageId(null);
        if (selectedId) void loadMessages(selectedId);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to edit message.");
      }
    } catch (e) {
      console.error("Failed to edit message:", e);
    }
  };

  const canEdit = (createdAtStr: string) => {
    try {
      const created = new Date(createdAtStr).getTime();
      return Date.now() - created < 5 * 60 * 1000;
    } catch {
      return false;
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
            <h2 className="mt-2 text-2xl font-black">Chat with your connected Alumni</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Real-time secure chat system, message editing within 5 minutes, and local chat clearance.
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
              <p className="py-4 text-center text-xs text-text-secondary">No connected conversations found.</p>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearChat}
                    className="rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 hover:text-red-700 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors"
                  >
                    Clear Chat
                  </button>
                  <p className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold ${
                    selectedConversation.isOnline ? "border-primary/20 bg-primary/5 text-primary" : "border-border bg-background text-text-secondary"
                  }`}>
                    <Zap className="h-3.5 w-3.5" />
                    {selectedConversation.isOnline ? "Online" : "Away"}
                  </p>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-background/60 px-4 py-4 sm:px-5">
                {messages.length === 0 ? (
                  <p className="text-xs text-text-secondary text-center py-10">No messages yet. Send a message to start chatting!</p>
                ) : (
                  messages.map((msg) => {
                    const isEditing = editingMessageId === msg.id;
                    return (
                      <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                        {isEditing ? (
                          <div className="max-w-[75%] rounded-2xl bg-primary text-white px-3.5 py-2.5 text-sm shadow-md">
                            <input
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  void handleSaveEdit(msg.id);
                                } else if (e.key === "Escape") {
                                  setEditingMessageId(null);
                                }
                              }}
                              className="w-full rounded border border-white/20 bg-black/20 px-2 py-1 text-sm text-white outline-none focus:border-white"
                              autoFocus
                            />
                            <div className="mt-1.5 flex justify-end gap-3 text-xs">
                              <button onClick={() => setEditingMessageId(null)} className="opacity-80 hover:opacity-100">Cancel</button>
                              <button onClick={() => void handleSaveEdit(msg.id)} className="font-bold hover:underline">Save</button>
                            </div>
                          </div>
                        ) : (
                          <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm relative group ${
                            msg.sender === "me" ? "bg-primary text-white" : "border border-border bg-card text-text-primary"
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            <div className={`mt-1.5 flex items-center justify-end gap-1.5 text-[9px] ${
                              msg.sender === "me" ? "text-white/70" : "text-text-secondary"
                            }`}>
                              {msg.isEdited && <span className="italic opacity-85">(edited)</span>}
                              <span>{msg.time}</span>
                              {msg.sender === "me" && msg.status && <MessageStatusIcon status={msg.status} />}
                              
                              {msg.sender === "me" && canEdit(msg.createdAt) && (
                                <button
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setEditingText(msg.text);
                                  }}
                                  className="ml-2 font-bold underline opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
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
  if (status === "sent") return <Check className="h-3 w-3" />;
  return <CheckCheck className="h-3 w-3" />;
}
