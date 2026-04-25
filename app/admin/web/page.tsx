"use client";

import { useEffect, useState, useCallback } from "react";
import { Globe2, MessageSquareQuote, Newspaper, Plus, Trash2, Users } from "lucide-react";

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

  const [tab, setTab] = useState<"committee" | "testimonials" | "directory" | "news">("committee");
  const [testimonials, setTestimonials] = useState<WebTestimonial[]>(() => isCached ? cachedWebData?.testimonials || [] : []);
  const [committee, setCommittee] = useState<WebCommittee[]>(() => isCached ? cachedWebData?.committee || [] : []);
  const [directory, setDirectory] = useState<any[]>(() => isCached ? cachedDirectoryData?.profiles || [] : []);
  const [news, setNews] = useState<NewsStory[]>(() => isCached ? cachedNewsData || [] : []);
  const [loading, setLoading] = useState(!isCached);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

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
  
  const [newCommittee, setNewCommittee] = useState({ role: "", name: "", batch: "" });
  const [newTestimonial, setNewTestimonial] = useState({ quote: "", author: "", meta: "", company: "", outcome: "" });
  const [newNews, setNewNews] = useState({ title: "", author: "", excerpt: "" });

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
        await loadData();
        setMessage(data.message);
        setShowCommitteeModal(false);
        setShowTestimonialModal(false);
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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-text-primary">Website Management</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Manage the dynamic content shown on the public Homepage and About page.
          </p>
        </div>
        <div className="flex gap-2">
           <button
            onClick={() => setTab("committee")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "committee" ? "border-primary bg-primary text-white" : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <Users className="h-4 w-4" /> Committee
          </button>
          <button
            onClick={() => setTab("testimonials")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "testimonials" ? "border-primary bg-primary text-white" : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <MessageSquareQuote className="h-4 w-4" /> Testimonials
          </button>
          <button
            onClick={() => setTab("directory")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "directory" ? "border-primary bg-primary text-white" : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <Globe2 className="h-4 w-4" /> Directory
          </button>
          <button
            onClick={() => setTab("news")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "news" ? "border-primary bg-primary text-white" : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <Newspaper className="h-4 w-4" /> News
          </button>
        </div>
      </header>

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
                      <button
                        onClick={() => void handleAction("committee", "delete", null, item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
    </div>
  );
}
