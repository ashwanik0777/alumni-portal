"use client";
import { AdminSettingsState, SettingsStats } from "../settings-types";
import { ToggleRow, SettingsInput, SettingsSelect, ProgressBar } from "../SettingsUI";

type Props = { settings: AdminSettingsState; update: <K extends keyof AdminSettingsState>(k: K, v: AdminSettingsState[K]) => void; stats: SettingsStats | null };

export default function WorkflowTab({ settings, update, stats }: Props) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-base font-bold text-text-primary">Approval Workflow</h3>
        <ToggleRow title="Auto approve trusted members" description="Skip manual review for verified trusted profile buckets." checked={settings.memberAutoApproveTrusted} onChange={(v) => update("memberAutoApproveTrusted", v)} />
        <SettingsSelect label="Scholarship Approval Steps" value={settings.scholarshipApprovalSteps} onChange={(v) => update("scholarshipApprovalSteps", v as AdminSettingsState["scholarshipApprovalSteps"])}
          options={[{ value: "one-step", label: "One-step approval" }, { value: "two-step", label: "Two-step approval" }, { value: "three-step", label: "Three-step approval" }]} />
        <SettingsInput label="Request Escalation (hours)" value={settings.requestEscalationHours} onChange={(v) => update("requestEscalationHours", v)} />
        <ToggleRow title="Rejection reason mandatory" description="Force admins to provide rejection reason for every decline." checked={settings.requireRejectionReason} onChange={(v) => update("requireRejectionReason", v)} />
      </article>
      <article className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-base font-bold text-text-primary">Workflow Progress Indicators</h3>
        <div className="mt-3 space-y-3 text-xs">
          <ProgressBar name="Member Verification" value={stats?.workflow.memberVerificationRate ?? 0} />
          <ProgressBar name="Scholarship Active Rate" value={stats?.workflow.scholarshipReviewRate ?? 0} />
          <ProgressBar name="Application Completion" value={stats?.workflow.applicationCompletionRate ?? 0} />
          <ProgressBar name="Program Active Rate" value={stats?.workflow.programActiveRate ?? 0} />
        </div>
      </article>
    </section>
  );
}
