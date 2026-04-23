"use client";
import { Database } from "lucide-react";
import { AdminSettingsState, SettingsStats } from "../settings-types";
import { ToggleRow, SettingsInput, SettingsSelect, StatCard } from "../SettingsUI";

type Props = { settings: AdminSettingsState; update: <K extends keyof AdminSettingsState>(k: K, v: AdminSettingsState[K]) => void; stats: SettingsStats | null };

export default function DataTab({ settings, update, stats }: Props) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
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
          {[
            "Export audit logs",
            "Run data integrity check",
          ].map((item) => (
            <button
              key={item}
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
            >
              {item}
              <Database className="h-4 w-4 text-primary" />
            </button>
          ))}
        </div>
      </article>
    </section>
  );
}
