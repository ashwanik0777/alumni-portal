"use client";
import { AdminSettingsState, SettingsStats } from "../settings-types";
import { ToggleRow, SettingsInput, StatCard } from "../SettingsUI";

type Props = { settings: AdminSettingsState; update: <K extends keyof AdminSettingsState>(k: K, v: AdminSettingsState[K]) => void; stats: SettingsStats | null };

export default function AccessTab({ settings, update, stats }: Props) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-base font-bold text-text-primary">Role Governance</h3>
        <ToggleRow title="Allow role edits" description="Super admins can update user/admin roles from dashboard." checked={settings.allowRoleEdits} onChange={(v) => update("allowRoleEdits", v)} />
        <ToggleRow title="Allow self role upgrade" description="Permit users to request/trigger role upgrade by themselves." checked={settings.allowSelfRoleUpgrade} onChange={(v) => update("allowSelfRoleUpgrade", v)} />
        <ToggleRow title="Require approval for role change" description="Every role change requires admin review and approval." checked={settings.requireAdminApprovalForRoleChange} onChange={(v) => update("requireAdminApprovalForRoleChange", v)} />
        <SettingsInput label="Max Admin Seats" value={settings.maxAdminSeats} onChange={(v) => update("maxAdminSeats", v)} />
      </article>
      <article className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-base font-bold text-text-primary">Access Snapshot</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <StatCard label="Active Admins" value={String(stats?.access.totalAdmins ?? 0)} />
          <StatCard label="Total Members" value={String(stats?.access.totalMembers ?? 0)} />
          <StatCard label="Pending Members" value={String(stats?.access.pendingMembers ?? 0)} />
          <StatCard label="Rejected Members" value={String(stats?.access.rejectedMembers ?? 0)} />
        </div>
      </article>
    </section>
  );
}
