"use client";
import { AdminSettingsState } from "../settings-types";
import { ToggleRow, StatCard } from "../SettingsUI";

type Props = { settings: AdminSettingsState; update: <K extends keyof AdminSettingsState>(k: K, v: AdminSettingsState[K]) => void };

export default function NotificationsTab({ settings, update }: Props) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-base font-bold text-text-primary">Notification Rules</h3>
        <ToggleRow title="Send approval emails" description="Send email on approval/rejection decisions." checked={settings.sendApprovalEmails} onChange={(v) => update("sendApprovalEmails", v)} />
        <ToggleRow title="Send daily digest" description="Send daily summary to admin and operations teams." checked={settings.sendDailyDigest} onChange={(v) => update("sendDailyDigest", v)} />
        <ToggleRow title="Critical alerts" description="Instant alerts for downtime, policy breach, and suspicious activity." checked={settings.sendCriticalAlerts} onChange={(v) => update("sendCriticalAlerts", v)} />
        <ToggleRow title="SMS for high priority" description="Send SMS for urgent requests and emergency scholarships." checked={settings.sendSmsForHighPriority} onChange={(v) => update("sendSmsForHighPriority", v)} />
      </article>
      <article className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-base font-bold text-text-primary">Notification Configuration Status</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <StatCard label="Approval Emails" value={settings.sendApprovalEmails ? "Enabled" : "Disabled"} />
          <StatCard label="Daily Digest" value={settings.sendDailyDigest ? "Enabled" : "Disabled"} />
          <StatCard label="Critical Alerts" value={settings.sendCriticalAlerts ? "Active" : "Inactive"} />
          <StatCard label="SMS Priority" value={settings.sendSmsForHighPriority ? "Active" : "Inactive"} />
        </div>
      </article>
    </section>
  );
}
