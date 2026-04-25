"use client";

import { useEffect, useState, useCallback } from "react";
import { Globe2, MessageSquareQuote, Newspaper, Pencil, Phone, Plus, Trash2, Users, UserPlus } from "lucide-react";

type WebTestimonial = {
  id: string;
  quote: string;
  author: string;
  meta: string;
  company: string;
  outcome: string;
  isActive: boolean;
};

type WebCommittee = {
  id: string;
  role: string;
  name: string;
  batch: string;
  sortOrder: number;
  isActive: boolean;
};

type NewsStory = {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  is_active: boolean;
  published_at: string;
};

let cachedWebData: any = null;
let cachedDirectoryData: any = null;
let cachedNewsData: NewsStory[] | null = null;
let webCacheTime = 0;
const WEB_CACHE_TTL_MS = 300_000; // 5 min

export default function AdminWebPage() {
  const isCached = Date.now() - webCacheTime < WEB_CACHE_TTL_MS;

  const [tab, setTab] = useState<"committee" | "testimonials" | "directory" | "news" | "team" | "contacts">("committee");
  const [testimonials, setTestimonials] = useState<WebTestimonial[]>(() => isCached ? cachedWebData?.testimonials || [] : []);
  const [committee, setCommittee] = useState<WebCommittee[]>(() => isCached ? cachedWebData?.committee || [] : []);
  const [directory, setDirectory] = useState<any[]>(() => isCached ? cachedDirectoryData?.profiles || [] : []);
  const [news, setNews] = useState<NewsStory[]>(() => isCached ? cachedNewsData || [] : []);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isCached);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Edit modal states
  const [editingCommittee, setEditingCommittee] = useState<WebCommittee | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<WebTestimonial | null>(null);
  const [editingNews, setEditingNews] = useState<NewsStory | null>(null);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [editingContact, setEditingContact] = useState<any | null>(null);

  const loadData = useCallback(async (forceFresh = false) => {
    if (!forceFresh && isCached) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/web");
      const dirRes = await fetch("/api/directory");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
        setCommittee(data.committee || []);
        cachedWebData = data;
      } else {
        setMessage("Failed to load website data.");
      }
      
      if (dirRes.ok) {
        const dirData = await dirRes.json();
        setDirectory(dirData.profiles || []);
        cachedDirectoryData = dirData;
      }

      // Fetch news
      const newsRes = await fetch("/api/admin/web/news");
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData.stories || []);
        cachedNewsData = newsData.stories || [];
      }

      // Fetch team
      const teamRes = await fetch("/api/admin/web/team");
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData.team || []);
      }

      // Fetch contacts
      const contactsRes = await fetch("/api/admin/web/contacts");
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.contacts || []);
      }

      webCacheTime = Date.now();
    } catch {
      setMessage("Network error loading data.");
    } finally {
      setLoading(false);
    }
  }, [isCached]);

  useEffect(() => { void loadData(); }, [loadData]);

  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const [newCommittee, setNewCommittee] = useState({ role: "", name: "", batch: "" });
  const [newTestimonial, setNewTestimonial] = useState({ quote: "", author: "", meta: "", company: "", outcome: "" });
  const [newNews, setNewNews] = useState({ title: "", author: "", excerpt: "" });
  const [newTeam, setNewTeam] = useState({ name: "", role: "", batch: "", bio: "", image: "", github: "", linkedin: "" });
  const [newContact, setNewContact] = useState({ channel_type: "email", title: "", detail: "", note: "" });

  const handleAction = async (type: string, action: string, payload?: any, id?: string, isActive?: boolean) => {
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action, payload, id, isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadData(true);
        setMessage(data.message);
        setShowCommitteeModal(false);
        setShowTestimonialModal(false);
        setEditingCommittee(null);
        setEditingTestimonial(null);
        setNewCommittee({ role: "", name: "", batch: "" });
        setNewTestimonial({ quote: "", author: "", meta: "", company: "", outcome: "" });
      } else {
        setMessage(data.message || "Action failed");
      }
    } catch {
      setMessage("Network error during action.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-2xl bg-border/50"></div>
        <div className="h-64 rounded-2xl bg-border/50"></div>
      </div>
    );
  }

  const tabs = [
    { key: "committee" as const, label: "Committee", icon: Users },
    { key: "testimonials" as const, label: "Testimonials", icon: MessageSquareQuote },
    { key: "directory" as const, label: "Directory", icon: Globe2 },
    { key: "news" as const, label: "News", icon: Newspaper },
    { key: "team" as const, label: "Team", icon: UserPlus },
    { key: "contacts" as const, label: "Contacts", icon: Phone },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-black text-text-primary">Website Management</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Manage the dynamic content shown on the public Homepage and About page.
        </p>
      </header>

      {/* Tab Navigation */}
      <nav className="rounded-2xl border border-border bg-card p-2 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                tab === t.key
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-text-secondary hover:bg-background hover:text-text-primary"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {message && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          {message}
        </div>
      )}

      {tab === "committee" && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Executive Committee (About Page)</h3>
            <button
              onClick={() => setShowCommitteeModal(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> Add Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="pb-3 pr-4 font-semibold">Name</th>
                  <th className="pb-3 pr-4 font-semibold">Role</th>
                  <th className="pb-3 pr-4 font-semibold">Batch</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {committee.map((item) => (
                  <tr key={item.id} className="hover:bg-background/50 transition-colors">
                    <td className="py-3 pr-4 font-bold text-text-primary">{item.name}</td>
                    <td className="py-3 pr-4 text-text-secondary">{item.role}</td>
                    <td className="py-3 pr-4 text-text-secondary">{item.batch}</td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => void handleAction("committee", "toggle", null, item.id, !item.isActive)}
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-card text-text-secondary border border-border"
                        }`}
                      >
                        {item.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => setEditingCommittee({ ...item })}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                          title="Edit Member"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => void handleAction("committee", "delete", null, item.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete Member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {committee.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-secondary">No committee members added.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "testimonials" && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Alumni Testimonials (Home Page)</h3>
            <button
              onClick={() => setShowTestimonialModal(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> Add Story
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((t) => (
              <article key={t.id} className="rounded-xl border border-border bg-background p-5 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setEditingTestimonial({ ...t })}
                    className="text-text-secondary hover:text-primary"
                    title="Edit Testimonial"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => void handleAction("testimonial", "toggle", null, t.id, !t.isActive)}
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      t.isActive ? "bg-emerald-50 text-emerald-700" : "bg-card text-text-secondary border border-border"
                    }`}
                  >
                    {t.isActive ? "Active" : "Hidden"}
                  </button>
                  <button
                    onClick={() => void handleAction("testimonial", "delete", null, t.id)}
                    className="text-text-secondary hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[11px] font-bold text-primary uppercase mb-2">{t.outcome}</p>
                <p className="text-sm italic text-text-primary pr-12 line-clamp-3">"{t.quote}"</p>
                <div className="mt-4 pt-3 border-t border-border/60">
                  <p className="text-sm font-bold">{t.author}</p>
                  <p className="text-xs text-text-secondary">{t.meta}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{t.company}</p>
                </div>
              </article>
            ))}
            {testimonials.length === 0 && (
              <p className="py-8 text-center text-text-secondary col-span-2">No testimonials added.</p>
            )}
          </div>
        </section>
      )}
      {tab === "directory" && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Alumni Directory (Public Profile Overview)</h3>
            <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-text-secondary">
              Total Profiles: {directory.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="pb-3 pr-4 font-semibold">Name</th>
                  <th className="pb-3 pr-4 font-semibold">Email</th>
                  <th className="pb-3 pr-4 font-semibold">Batch</th>
                  <th className="pb-3 pr-4 font-semibold">Role & Company</th>
                  <th className="pb-3 pr-4 font-semibold">Location</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {directory.map((item) => (
                  <tr key={item.id} className="hover:bg-background/50 transition-colors">
                    <td className="py-3 pr-4 font-bold text-text-primary">{item.name}</td>
                    <td className="py-3 pr-4 text-text-secondary">{item.email}</td>
                    <td className="py-3 pr-4 text-text-secondary">{item.batch}</td>
                    <td className="py-3 pr-4 text-text-secondary">{item.role} at {item.company}</td>
                    <td className="py-3 pr-4 text-text-secondary">{item.location}</td>
                    <td className="py-3 text-right">
                      <a
                        href={`/directory/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg border border-border px-3 py-1 text-xs font-semibold hover:border-primary/50 hover:text-primary"
                      >
                        View Profile
                      </a>
                    </td>
                  </tr>
                ))}
                {directory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-secondary">No directory profiles found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}


      {/* Modals */}
      {showCommitteeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Add Committee Member</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Name</label>
                <input
                  type="text"
                  value={newCommittee.name}
                  onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="e.g. Sh. Ashwani Dixit"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Role</label>
                <input
                  type="text"
                  value={newCommittee.role}
                  onChange={(e) => setNewCommittee({ ...newCommittee, role: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="e.g. Joint Secretary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Batch</label>
                <input
                  type="text"
                  value={newCommittee.batch}
                  onChange={(e) => setNewCommittee({ ...newCommittee, batch: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="e.g. 2011"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCommitteeModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || !newCommittee.name || !newCommittee.role}
                onClick={() => void handleAction("committee", "create", newCommittee)}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                Save Member
              </button>
            </div>
          </div>
        </div>
      )}

      {showTestimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Add Alumni Testimonial</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Quote (Testimonial Text)</label>
                <textarea
                  rows={3}
                  value={newTestimonial.quote}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Author Name</label>
                  <input
                    type="text"
                    value={newTestimonial.author}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, author: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Outcome Category</label>
                  <input
                    type="text"
                    value={newTestimonial.outcome}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, outcome: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="e.g. Career Transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Meta (Batch & Role)</label>
                  <input
                    type="text"
                    value={newTestimonial.meta}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, meta: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="e.g. Batch 2014, Product Manager"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-secondary">Company/Location</label>
                  <input
                    type="text"
                    value={newTestimonial.company}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowTestimonialModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || !newTestimonial.quote || !newTestimonial.author}
                onClick={() => void handleAction("testimonial", "create", newTestimonial)}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                Save Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== NEWS TAB ===== */}
      {tab === "news" && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">News & Stories</h3>
            <button
              onClick={() => setShowNewsModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Add Story
            </button>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No news stories</p>
              <p className="text-sm">Add stories that will appear on the public News page.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {news.map(story => (
                <div key={story.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary">{story.title}</p>
                    <p className="text-sm text-text-secondary mt-1">{story.excerpt}</p>
                    <p className="text-xs text-primary font-semibold mt-2">{story.author}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => setEditingNews({ ...story })}
                      className="rounded-lg border border-border bg-background p-1.5 text-text-secondary hover:border-primary/50 hover:text-primary"
                      title="Edit Story"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={async () => {
                        setActionLoading(true);
                        try {
                          await fetch("/api/admin/web/news", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: story.id, isActive: !story.is_active }) });
                          cachedNewsData = null; webCacheTime = 0;
                          await loadData(true);
                        } finally { setActionLoading(false); }
                      }}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold border ${
                        story.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-card text-text-secondary"
                      }`}
                    >
                      {story.is_active ? "Active" : "Hidden"}
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={async () => {
                        if (!confirm("Delete this story?")) return;
                        setActionLoading(true);
                        try {
                          await fetch("/api/admin/web/news", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: story.id }) });
                          cachedNewsData = null; webCacheTime = 0;
                          await loadData(true);
                        } finally { setActionLoading(false); }
                      }}
                      className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== ADD NEWS MODAL ===== */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Add News Story</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input value={newNews.title} onChange={e => setNewNews(n => ({...n, title: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Story title" />
              </div>
              <div>
                <label className="text-sm font-medium">Author</label>
                <input value={newNews.author} onChange={e => setNewNews(n => ({...n, author: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Author name" />
              </div>
              <div>
                <label className="text-sm font-medium">Excerpt / Summary</label>
                <textarea rows={3} value={newNews.excerpt} onChange={e => setNewNews(n => ({...n, excerpt: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary resize-y" placeholder="Brief summary of the story..." />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowNewsModal(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background">Cancel</button>
              <button
                disabled={actionLoading || !newNews.title || !newNews.author || !newNews.excerpt}
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    const res = await fetch("/api/admin/web/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newNews) });
                    if (res.ok) {
                      setShowNewsModal(false);
                      setNewNews({ title: "", author: "", excerpt: "" });
                      cachedNewsData = null; webCacheTime = 0;
                      await loadData(true);
                      setMessage("News story added successfully.");
                    }
                  } finally { setActionLoading(false); }
                }}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                Publish Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TEAM TAB ===== */}
      {tab === "team" && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Team / Builders Page</h3>
            <button onClick={() => setShowTeamModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Member
            </button>
          </div>
          {teamMembers.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <UserPlus className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No team members</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-3">
                    {m.image && <img src={m.image} alt={m.name} className="h-10 w-10 rounded-full object-cover" />}
                    <div>
                      <p className="font-bold text-text-primary">{m.name}</p>
                      <p className="text-xs text-text-secondary">{m.role} {m.batch && `• Batch ${m.batch}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={actionLoading} onClick={() => setEditingTeam({ ...m })} className="rounded-lg border border-border bg-background p-1.5 text-text-secondary hover:border-primary/50 hover:text-primary" title="Edit Member">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button disabled={actionLoading} onClick={async () => { setActionLoading(true); try { await fetch("/api/admin/web/team", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ id: m.id, isActive: !m.is_active }) }); webCacheTime = 0; await loadData(true); } finally { setActionLoading(false); } }} className={`rounded-lg px-3 py-1 text-xs font-semibold border ${m.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-card text-text-secondary"}`}>
                      {m.is_active ? "Active" : "Hidden"}
                    </button>
                    <button disabled={actionLoading} onClick={async () => { if (!confirm("Delete?")) return; setActionLoading(true); try { await fetch("/api/admin/web/team", { method: "DELETE", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ id: m.id }) }); webCacheTime = 0; await loadData(true); } finally { setActionLoading(false); } }} className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== CONTACTS TAB ===== */}
      {tab === "contacts" && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Contact Channels (Contact Page)</h3>
            <button onClick={() => setShowContactModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Channel
            </button>
          </div>
          {contacts.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <Phone className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No contact channels</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c: any) => (
                <div key={c.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-4">
                  <div>
                    <p className="font-bold text-text-primary">{c.title}</p>
                    <p className="text-sm text-text-secondary">{c.detail}</p>
                    <p className="text-xs text-text-secondary mt-1">{c.note}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={actionLoading} onClick={() => setEditingContact({ ...c })} className="rounded-lg border border-border bg-background p-1.5 text-text-secondary hover:border-primary/50 hover:text-primary" title="Edit Contact">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button disabled={actionLoading} onClick={async () => { setActionLoading(true); try { await fetch("/api/admin/web/contacts", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ id: c.id, isActive: !c.is_active }) }); webCacheTime = 0; await loadData(true); } finally { setActionLoading(false); } }} className={`rounded-lg px-3 py-1 text-xs font-semibold border ${c.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-card text-text-secondary"}`}>
                      {c.is_active ? "Active" : "Hidden"}
                    </button>
                    <button disabled={actionLoading} onClick={async () => { if (!confirm("Delete?")) return; setActionLoading(true); try { await fetch("/api/admin/web/contacts", { method: "DELETE", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ id: c.id }) }); webCacheTime = 0; await loadData(true); } finally { setActionLoading(false); } }} className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== ADD TEAM MODAL ===== */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add Team Member</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Name</label><input value={newTeam.name} onChange={e => setNewTeam(t => ({...t, name: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
                <div><label className="text-sm font-medium">Role</label><input value={newTeam.role} onChange={e => setNewTeam(t => ({...t, role: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Batch</label><input value={newTeam.batch} onChange={e => setNewTeam(t => ({...t, batch: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
                <div><label className="text-sm font-medium">Image URL</label><input value={newTeam.image} onChange={e => setNewTeam(t => ({...t, image: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              </div>
              <div><label className="text-sm font-medium">Bio</label><textarea rows={2} value={newTeam.bio} onChange={e => setNewTeam(t => ({...t, bio: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary resize-y" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">GitHub</label><input value={newTeam.github} onChange={e => setNewTeam(t => ({...t, github: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
                <div><label className="text-sm font-medium">LinkedIn</label><input value={newTeam.linkedin} onChange={e => setNewTeam(t => ({...t, linkedin: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowTeamModal(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background">Cancel</button>
              <button disabled={actionLoading || !newTeam.name || !newTeam.role} onClick={async () => { setActionLoading(true); try { const r = await fetch("/api/admin/web/team", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(newTeam) }); if (r.ok) { setShowTeamModal(false); setNewTeam({ name:"", role:"", batch:"", bio:"", image:"", github:"", linkedin:"" }); webCacheTime = 0; await loadData(true); setMessage("Team member added."); } } finally { setActionLoading(false); } }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD CONTACT MODAL ===== */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Add Contact Channel</h3>
            <div className="space-y-3">
              <div><label className="text-sm font-medium">Type</label>
                <select value={newContact.channel_type} onChange={e => setNewContact(c => ({...c, channel_type: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="email">Email</option><option value="phone">Phone</option><option value="address">Address</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">Title</label><input value={newContact.title} onChange={e => setNewContact(c => ({...c, title: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="e.g. Email Support" /></div>
              <div><label className="text-sm font-medium">Detail</label><input value={newContact.detail} onChange={e => setNewContact(c => ({...c, detail: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="e.g. support@example.com" /></div>
              <div><label className="text-sm font-medium">Note</label><input value={newContact.note} onChange={e => setNewContact(c => ({...c, note: e.target.value}))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="e.g. Mon-Sat 10AM-6PM" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowContactModal(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background">Cancel</button>
              <button disabled={actionLoading || !newContact.title || !newContact.detail} onClick={async () => { setActionLoading(true); try { const r = await fetch("/api/admin/web/contacts", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(newContact) }); if (r.ok) { setShowContactModal(false); setNewContact({ channel_type:"email", title:"", detail:"", note:"" }); webCacheTime = 0; await loadData(true); setMessage("Contact channel added."); } } finally { setActionLoading(false); } }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
      {/* ===== EDIT COMMITTEE MODAL ===== */}
      {editingCommittee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Edit Committee Member</h3>
            <div className="space-y-4">
              <div><label className="mb-1.5 block text-xs font-semibold text-text-secondary">Name</label><input type="text" value={editingCommittee.name} onChange={(e) => setEditingCommittee({ ...editingCommittee, name: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1.5 block text-xs font-semibold text-text-secondary">Role</label><input type="text" value={editingCommittee.role} onChange={(e) => setEditingCommittee({ ...editingCommittee, role: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1.5 block text-xs font-semibold text-text-secondary">Batch</label><input type="text" value={editingCommittee.batch} onChange={(e) => setEditingCommittee({ ...editingCommittee, batch: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingCommittee(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background">Cancel</button>
              <button disabled={actionLoading || !editingCommittee.name || !editingCommittee.role} onClick={() => void handleAction("committee", "update", { name: editingCommittee.name, role: editingCommittee.role, batch: editingCommittee.batch }, editingCommittee.id)} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT TESTIMONIAL MODAL ===== */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Edit Testimonial</h3>
            <div className="space-y-4">
              <div><label className="mb-1.5 block text-xs font-semibold text-text-secondary">Quote</label><textarea rows={3} value={editingTestimonial.quote} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1.5 block text-xs font-semibold text-text-secondary">Author</label><input type="text" value={editingTestimonial.author} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, author: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-text-secondary">Outcome</label><input type="text" value={editingTestimonial.outcome} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, outcome: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1.5 block text-xs font-semibold text-text-secondary">Meta</label><input type="text" value={editingTestimonial.meta} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, meta: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-text-secondary">Company</label><input type="text" value={editingTestimonial.company} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingTestimonial(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background">Cancel</button>
              <button disabled={actionLoading || !editingTestimonial.quote || !editingTestimonial.author} onClick={() => void handleAction("testimonial", "update", { quote: editingTestimonial.quote, author: editingTestimonial.author, meta: editingTestimonial.meta, company: editingTestimonial.company, outcome: editingTestimonial.outcome }, editingTestimonial.id)} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT NEWS MODAL ===== */}
      {editingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Edit News Story</h3>
            <div className="space-y-3">
              <div><label className="text-sm font-medium">Title</label><input value={editingNews.title} onChange={e => setEditingNews({ ...editingNews, title: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="text-sm font-medium">Author</label><input value={editingNews.author} onChange={e => setEditingNews({ ...editingNews, author: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="text-sm font-medium">Excerpt</label><textarea rows={3} value={editingNews.excerpt} onChange={e => setEditingNews({ ...editingNews, excerpt: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary resize-y" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingNews(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background">Cancel</button>
              <button disabled={actionLoading || !editingNews.title || !editingNews.author || !editingNews.excerpt} onClick={async () => { setActionLoading(true); try { const r = await fetch("/api/admin/web/news", { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ id: editingNews.id, title: editingNews.title, author: editingNews.author, excerpt: editingNews.excerpt }) }); if (r.ok) { setEditingNews(null); cachedNewsData = null; webCacheTime = 0; await loadData(true); setMessage("News story updated."); } } finally { setActionLoading(false); } }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT TEAM MODAL ===== */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Team Member</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Name</label><input value={editingTeam.name} onChange={e => setEditingTeam({...editingTeam, name: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
                <div><label className="text-sm font-medium">Role</label><input value={editingTeam.role} onChange={e => setEditingTeam({...editingTeam, role: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Batch</label><input value={editingTeam.batch || ""} onChange={e => setEditingTeam({...editingTeam, batch: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
                <div><label className="text-sm font-medium">Image URL</label><input value={editingTeam.image || ""} onChange={e => setEditingTeam({...editingTeam, image: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              </div>
              <div><label className="text-sm font-medium">Bio</label><textarea rows={2} value={editingTeam.bio || ""} onChange={e => setEditingTeam({...editingTeam, bio: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary resize-y" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">GitHub</label><input value={editingTeam.github || ""} onChange={e => setEditingTeam({...editingTeam, github: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
                <div><label className="text-sm font-medium">LinkedIn</label><input value={editingTeam.linkedin || ""} onChange={e => setEditingTeam({...editingTeam, linkedin: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingTeam(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background">Cancel</button>
              <button disabled={actionLoading || !editingTeam.name || !editingTeam.role} onClick={async () => { setActionLoading(true); try { const r = await fetch("/api/admin/web/team", { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(editingTeam) }); if (r.ok) { setEditingTeam(null); webCacheTime = 0; await loadData(true); setMessage("Team member updated."); } } finally { setActionLoading(false); } }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT CONTACT MODAL ===== */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Edit Contact Channel</h3>
            <div className="space-y-3">
              <div><label className="text-sm font-medium">Type</label>
                <select value={editingContact.channel_type} onChange={e => setEditingContact({...editingContact, channel_type: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="email">Email</option><option value="phone">Phone</option><option value="address">Address</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">Title</label><input value={editingContact.title} onChange={e => setEditingContact({...editingContact, title: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="text-sm font-medium">Detail</label><input value={editingContact.detail} onChange={e => setEditingContact({...editingContact, detail: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="text-sm font-medium">Note</label><input value={editingContact.note || ""} onChange={e => setEditingContact({...editingContact, note: e.target.value})} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingContact(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-background">Cancel</button>
              <button disabled={actionLoading || !editingContact.title || !editingContact.detail} onClick={async () => { setActionLoading(true); try { const r = await fetch("/api/admin/web/contacts", { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(editingContact) }); if (r.ok) { setEditingContact(null); webCacheTime = 0; await loadData(true); setMessage("Contact updated."); } } finally { setActionLoading(false); } }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
