"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  Circle,
  MessageSquareText,
  Search,
  SendHorizontal,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

type Conversation = {
  id: string;
  name: string;
  role: string;
  online: boolean;
  unread: number;
  lastMessage: string;
  lastTime: string;
};

type MessageStatus = "sending" | "sent" | "delivered";

type ChatMessage = {
  id: string;
  conversationId: string;
  sender: "me" | "them";
  text: string;
  time: string;
  status?: MessageStatus;
};

const seedConversations: Conversation[] = [
  {
    id: "c1",
    name: "Nidhi Sharma",
    role: "Mentor • Product",
    online: true,
    unread: 2,
    lastMessage: "Share your updated roadmap before next session.",
    lastTime: "10:42 AM",
  },
  {
    id: "c2",
    name: "Aman Tiwari",
    role: "Senior Alumni • Engineering",
    online: false,
    unread: 0,
    lastMessage: "Referral thread updated. Please check details.",
    lastTime: "Yesterday",
  },
  {
    id: "c3",
    name: "Career Support Desk",
    role: "Admin Team",
    online: true,
    unread: 1,
    lastMessage: "Your profile verification is in final stage.",
    lastTime: "09:18 AM",
  },
  {
    id: "c4",
    name: "Batch 2020 Circle",
    role: "Peer Group",
    online: true,
    unread: 3,
    lastMessage: "Friday meetup confirmed at 6:30 PM.",
    lastTime: "08:50 AM",
  },
];

const seedMessages: ChatMessage[] = [
  {
    id: "m1",
    conversationId: "c1",
    sender: "them",
    text: "Hi, have you finalized your 90-day goal sheet?",
    time: "10:28 AM",
  },
  {
    id: "m2",
    conversationId: "c1",
    sender: "me",
    text: "Yes, I completed draft v2. Sending it in 20 minutes.",
    time: "10:31 AM",
    status: "delivered",
  },
  {
    id: "m3",
    conversationId: "c1",
    sender: "them",
    text: "Great. Add measurable milestones for each week.",
    time: "10:34 AM",
  },
  {
    id: "m4",
    conversationId: "c3",
    sender: "them",
    text: "Please confirm your graduation year and house details.",
    time: "09:16 AM",
  },
  {
    id: "m5",
    conversationId: "c4",
    sender: "them",
    text: "Anyone joining the alumni networking event this week?",
    time: "08:44 AM",
  },
];

const liveReplies = [
  "Thanks, received. I will review and share feedback.",
  "Looks good from my side. You can proceed.",
  "Can we schedule a quick call tomorrow evening?",
  "Please also update your profile summary once.",
  "Great progress. Keep this momentum going.",
];

export default function UserMessagesPage() {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [selectedId, setSelectedId] = useState<string>(seedConversations[0].id);
  const [typingConversationId, setTypingConversationId] = useState<string | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) || conversations[0],
    [conversations, selectedId],
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((item) => {
      const text = `${item.name} ${item.role} ${item.lastMessage}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [conversations, search]);

  const selectedMessages = useMemo(() => {
    return messages.filter((msg) => msg.conversationId === selectedConversation.id);
  }, [messages, selectedConversation.id]);

  const totalUnread = useMemo(
    () => conversations.reduce((acc, item) => acc + item.unread, 0),
    [conversations],
  );

  const onlineCount = useMemo(
    () => conversations.filter((item) => item.online).length,
    [conversations],
  );

  const nowTime = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    const interval = window.setInterval(() => {
      const target = seedConversations[Math.floor(Math.random() * seedConversations.length)];
      const incoming = liveReplies[Math.floor(Math.random() * liveReplies.length)];
      setTypingConversationId(target.id);

      window.setTimeout(() => {
        const time = nowTime();
        const message: ChatMessage = {
          id: `live-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          conversationId: target.id,
          sender: "them",
          text: incoming,
          time,
        };

        setMessages((prev) => [...prev, message]);
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== target.id) return conv;
            return {
              ...conv,
              lastMessage: incoming,
              lastTime: time,
              unread: target.id === selectedId ? 0 : conv.unread + 1,
            };
          }),
        );
        setTypingConversationId((prev) => (prev === target.id ? null : prev));
      }, 1400);
    }, 12000);

    return () => window.clearInterval(interval);
  }, [selectedId]);

  useEffect(() => {
    setConversations((prev) =>
      prev.map((item) => (item.id === selectedId ? { ...item, unread: 0 } : item)),
    );
  }, [selectedId]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    const sendingId = `me-${Date.now()}`;
    const time = nowTime();
    const sendingMessage: ChatMessage = {
      id: sendingId,
      conversationId: selectedConversation.id,
      sender: "me",
      text,
      time,
      status: "sending",
    };

    setDraft("");
    setMessages((prev) => [...prev, sendingMessage]);
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: text, lastTime: time, unread: 0 }
          : conv,
      ),
    );

    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === sendingId ? { ...msg, status: "sent" } : msg)),
      );
    }, 500);

    window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === sendingId ? { ...msg, status: "delivered" } : msg)),
      );
    }, 1000);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Real-Time Messaging Hub
        </p>
        <h2 className="mt-2 text-2xl font-black">Fast conversations for mentors, alumni, and admin</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Optimized chat-style interface with live updates, unread tracking, and instant message delivery states.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Active Chats" value={String(conversations.length)} />
          <StatCard label="Unread" value={String(totalUnread)} />
          <StatCard label="Online Now" value={String(onlineCount)} />
          <StatCard label="Realtime Sync" value="Live" />
        </div>
      </section>

      <section className="grid min-h-140 grid-cols-1 gap-4 xl:grid-cols-12">
        <aside className="rounded-xl border border-border bg-card p-4 xl:col-span-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="mt-3 space-y-2">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setSelectedId(conv.id)}
                className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                  selectedId === conv.id
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-background hover:border-primary/25"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{conv.name}</p>
                    <p className="text-xs text-text-secondary">{conv.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-text-secondary">{conv.lastTime}</p>
                    {conv.unread > 0 && (
                      <span className="mt-1 inline-flex rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 line-clamp-1 text-xs text-text-secondary">{conv.lastMessage}</p>
              </button>
            ))}
          </div>
        </aside>

        <article className="flex flex-col rounded-xl border border-border bg-card xl:col-span-8">
          <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
            <div>
              <p className="text-sm font-bold text-text-primary">{selectedConversation.name}</p>
              <p className="text-xs text-text-secondary">{selectedConversation.role}</p>
            </div>
            <p className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <Zap className="h-3.5 w-3.5" />
              {selectedConversation.online ? "Online" : "Away"}
            </p>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-background/60 px-4 py-4 sm:px-5">
            {selectedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.sender === "me"
                      ? "bg-primary text-white"
                      : "border border-border bg-card text-text-primary"
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      msg.sender === "me" ? "text-white/80" : "text-text-secondary"
                    }`}
                  >
                    <span>{msg.time}</span>
                    {msg.sender === "me" && msg.status && <MessageStatusIcon status={msg.status} />}
                  </div>
                </div>
              </div>
            ))}

            {typingConversationId === selectedConversation.id && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-text-secondary">
                  <Circle className="h-2 w-2 animate-pulse fill-current" />
                  <Circle className="h-2 w-2 animate-pulse fill-current" />
                  <Circle className="h-2 w-2 animate-pulse fill-current" />
                  typing...
                </div>
              </div>
            )}
          </div>

          <footer className="border-t border-border px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message and press Enter"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleSend}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90"
                aria-label="Send message"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
          </footer>
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

function MessageStatusIcon({ status }: { status: MessageStatus }) {
  if (status === "sending") {
    return <Circle className="h-3 w-3" />;
  }

  if (status === "sent") {
    return <Check className="h-3 w-3" />;
  }

  return <CheckCheck className="h-3 w-3" />;
}
