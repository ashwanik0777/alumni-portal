"use client";
import { useCallback, useEffect, useState } from "react";
import { Eye, X, CheckCircle2, Clock3, FileCheck, ExternalLink } from "lucide-react";

type Application = {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  fullName: string;
  email: string;
  mobile: string;
  passingYear: string;
  currentCourse: string;
  currentYear: string;
  percentage: string;
  annualIncome: string;
  statement: string;
  documentLinks: string[];
  status: "Pending" | "Verified" | "Completed";
  adminNotes: string | null;
  completedAt: string | null;
  appliedAt: string;
  updatedAt: string;
};

type Props = {
  scholarshipId?: string;
  onMessage: (msg: string) => void;
};

function statusBadge(s: string) {
  if (s === "Completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (s === "Verified") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function ApplicationsList({ scholarshipId, onMessage }: Props) {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (scholarshipId) params.set("scholarshipId", scholarshipId);
      if (statusFilter !== "All") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/scholarships/applications?${params}`);
      const data = await res.json();
      if (res.ok) setApps(data.rows || []);
    } catch { onMessage("Failed to load applications."); }
    finally { setLoading(false); }
  }, [scholarshipId, statusFilter, onMessage]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (appId: string, status: "Verified" | "Completed", notes?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/scholarships/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      const data = await res.json();
      if (!res.ok) { onMessage(data.message || "Error"); return; }
      onMessage(`Application ${status === "Verified" ? "verified" : "marked complete"} successfully.`);
      setSelectedApp(null);
      load();
    } catch { onMessage("Network error."); }
    finally { setActionLoading(false); }
  };

  if (loading) return <p className="text-sm text-text-secondary py-4">Loading applications...</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-bold">Student Applications</h3>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
          <option>All</option>
          <option>Pending</option>
          <option>Verified</option>
          <option>Completed</option>
        </select>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-text-secondary">No applications found.</div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <article key={app.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{app.fullName}</h4>
                  <p className="text-xs text-text-secondary">{app.email} • {app.mobile}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Applied for: <span className="font-semibold text-text-primary">{app.scholarshipName}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusBadge(app.status)}`}>
                    {app.status === "Completed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : app.status === "Verified" ? <FileCheck className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                    {app.status}
                  </span>
                  <button onClick={() => setSelectedApp(app)} className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-text-secondary sm:grid-cols-4">
                <p><span className="font-semibold text-text-primary">Course:</span> {app.currentCourse}</p>
                <p><span className="font-semibold text-text-primary">Year:</span> {app.currentYear}</p>
                <p><span className="font-semibold text-text-primary">%:</span> {app.percentage}%</p>
                <p><span className="font-semibold text-text-primary">Income:</span> ₹{app.annualIncome}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Profile View Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Applicant Profile</h3>
              <button onClick={() => setSelectedApp(null)} className="rounded-lg border border-border p-1.5 text-text-secondary hover:text-primary"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3 text-sm">
              <DetailRow label="Full Name" value={selectedApp.fullName} />
              <DetailRow label="Email" value={selectedApp.email} />
              <DetailRow label="Mobile" value={selectedApp.mobile} />
              <DetailRow label="Scholarship" value={selectedApp.scholarshipName} />
              <DetailRow label="Course" value={selectedApp.currentCourse} />
              <DetailRow label="Year" value={selectedApp.currentYear} />
              <DetailRow label="Percentage" value={`${selectedApp.percentage}%`} />
              <DetailRow label="Passing Year" value={selectedApp.passingYear} />
              <DetailRow label="Annual Income" value={`₹${selectedApp.annualIncome}`} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Statement of Purpose</p>
                <p className="rounded-lg border border-border bg-background p-3 text-xs text-text-secondary">{selectedApp.statement}</p>
              </div>

              {/* Document Links */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Documents</p>
                {selectedApp.documentLinks.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedApp.documentLinks.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-primary hover:bg-primary/5">
                        <ExternalLink className="h-3.5 w-3.5" /> {link.length > 50 ? link.slice(0, 50) + "..." : link}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary italic">No documents uploaded yet.</p>
                )}
              </div>

              {selectedApp.adminNotes && <DetailRow label="Admin Notes" value={selectedApp.adminNotes} />}
              {selectedApp.completedAt && <DetailRow label="Completed At" value={new Date(selectedApp.completedAt).toLocaleString()} />}

              <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                {selectedApp.status === "Pending" && (
                  <button onClick={() => updateStatus(selectedApp.id, "Verified")} disabled={actionLoading}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-60">
                    {actionLoading ? "..." : "✓ Mark Verified"}
                  </button>
                )}
                {(selectedApp.status === "Pending" || selectedApp.status === "Verified") && (
                  <button onClick={() => {
                    const notes = window.prompt("Admin notes (optional)") || "";
                    updateStatus(selectedApp.id, "Completed", notes);
                  }} disabled={actionLoading}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60">
                    {actionLoading ? "..." : "✓ Mark Completed (Money Disbursed)"}
                  </button>
                )}
                {selectedApp.status === "Completed" && (
                  <p className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Scholarship Completed & Disbursed
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
      <p className="text-sm text-text-primary text-right">{value}</p>
    </div>
  );
}
