"use client";
import { useState } from "react";
import { Database, Loader2, X, ShieldAlert, BadgeCheck } from "lucide-react";
import { AdminSettingsState, SettingsStats } from "../settings-types";
import { ToggleRow, SettingsInput, SettingsSelect, StatCard } from "../SettingsUI";

type Props = { settings: AdminSettingsState; update: <K extends keyof AdminSettingsState>(k: K, v: AdminSettingsState[K]) => void; stats: SettingsStats | null };

type UtilityItem = {
  label: string;
  action: string;
};

export default function DataTab({ settings, update, stats }: Props) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [modalReport, setModalReport] = useState<{ title: string; message: string; details?: string; type: "success" | "warning" } | null>(null);

  const utilities: UtilityItem[] = [
    { label: "Export audit logs", action: "export-audit-logs" },
    { label: "Run data integrity check", action: "integrity-check" },
  ];

  const handleRunUtility = async (item: UtilityItem) => {
    setLoadingAction(item.action);
    try {
      const res = await fetch("/api/admin/settings/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: item.action }),
      });

      const data = await res.json();
      if (res.ok) {
        if (item.action === "export-audit-logs") {
          // Construct CSV from the logs data
          const logs = data.logs || [];
          if (logs.length === 0) {
            setModalReport({
              title: item.label,
              message: "Audit logs compiled.",
              details: "No activities logged in the system yet.",
              type: "success"
            });
            return;
          }

          const headers = ["Timestamp", "Action", "Target", "Details"];
          const csvRows = [
            headers.join(","),
            ...logs.map((l: any) => [
              `"${l.timestamp}"`,
              `"${l.action}"`,
              `"${l.target}"`,
              `"${l.details.replace(/"/g, '""')}"`
            ].join(","))
          ];
          const csvContent = csvRows.join("\n");
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `platform-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setModalReport({
            title: item.label,
            message: "Audit log CSV compiled and downloaded.",
            details: `Successfully compiled ${logs.length} system activity logs into CSV file.`,
            type: "success"
          });
        } else {
          setModalReport({
            title: item.label,
            message: data.message,
            details: data.details,
            type: "success"
          });
        }
      } else {
        setModalReport({
          title: item.label,
          message: data.message || "Operation failed to execute.",
          type: "warning"
        });
      }
    } catch {
      setModalReport({
        title: item.label,
        message: "Failed to connect to administrative server.",
        type: "warning"
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-2 relative">
      <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-base font-bold text-text-primary">Backup and Retention</h3>
        <SettingsSelect label="Backup Frequency" value={settings.backupFrequency} onChange={(v) => update("backupFrequency", v as AdminSettingsState["backupFrequency"])}
          options={[{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }]} />
        <SettingsInput label="Retention (days)" value={settings.backupRetentionDays} onChange={(v) => update("backupRetentionDays", v)} />
        <ToggleRow title="Auto archive resolved requests" description="Move resolved requests to archive after threshold." checked={settings.autoArchiveResolvedRequests} onChange={(v) => update("autoArchiveResolvedRequests", v)} />
        <SettingsInput label="Archive after (days)" value={settings.archiveAfterDays} onChange={(v) => update("archiveAfterDays", v)} />
      </article>

      <article className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-base font-bold text-text-primary">Database Overview</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <StatCard label="Total Records" value={String(stats?.data.totalRecords ?? 0)} />
          <StatCard label="Active Tables" value={String(stats?.data.tablesCount ?? 0)} />
          <div className="rounded-xl border border-border bg-background p-3 sm:col-span-2">
            <p className="text-xs text-text-secondary">Last Stats Refresh</p>
            <p className="mt-1 text-sm font-bold text-text-primary">{stats?.data.lastUpdated ? new Date(stats.data.lastUpdated).toLocaleString() : "—"}</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {utilities.map((item) => (
            <button
              key={item.action}
              type="button"
              disabled={loadingAction !== null}
              onClick={() => handleRunUtility(item)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {loadingAction === item.action && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {item.label}
              </span>
              <Database className="h-4 w-4 text-primary shrink-0" />
            </button>
          ))}
        </div>
      </article>

      {/* Data Report Modal */}
      {modalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalReport(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-background text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              {modalReport.type === "success" ? (
                <BadgeCheck className="h-6 w-6 text-emerald-600" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-amber-500" />
              )}
              <h3 className="text-base font-bold text-text-primary">{modalReport.title}</h3>
            </div>

            <p className="text-sm text-text-primary font-medium">{modalReport.message}</p>
            {modalReport.details && (
              <div className="mt-3 bg-background rounded-xl p-3 border border-border text-xs text-text-secondary leading-relaxed font-mono">
                {modalReport.details}
              </div>
            )}

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setModalReport(null)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/95 transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
