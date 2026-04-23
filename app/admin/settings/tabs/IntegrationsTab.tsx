"use client";
import { AdminSettingsState } from "../settings-types";
import { ToggleRow, SettingsInput, StatCard } from "../SettingsUI";

type Props = { settings: AdminSettingsState; update: <K extends keyof AdminSettingsState>(k: K, v: AdminSettingsState[K]) => void };

export default function IntegrationsTab({ settings, update }: Props) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-base font-bold text-text-primary">Integration Controls</h3>
        <SettingsInput label="API Rate Limit (per minute)" value={settings.apiRateLimitPerMinute} onChange={(v) => update("apiRateLimitPerMinute", v)} />
        <ToggleRow title="Enable webhook events" description="Emit webhook events for approvals, updates, and alerts." checked={settings.enableWebhookEvents} onChange={(v) => update("enableWebhookEvents", v)} />
        <ToggleRow title="Enable Slack integration" description="Send critical activity to team Slack channels." checked={settings.enableSlackIntegration} onChange={(v) => update("enableSlackIntegration", v)} />
        <ToggleRow title="Enable email provider" description="Use connected SMTP provider for platform notifications." checked={settings.enableEmailProvider} onChange={(v) => update("enableEmailProvider", v)} />
      </article>

      <article className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-base font-bold text-text-primary">Integration Health</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <StatCard label="Webhook Status" value={settings.enableWebhookEvents ? "Active" : "Disabled"} />
          <StatCard label="Slack Bridge" value={settings.enableSlackIntegration ? "Connected" : "Not connected"} />
          <StatCard label="Email Provider" value={settings.enableEmailProvider ? "Healthy" : "Disabled"} />
          <StatCard label="Rate Limit" value={`${settings.apiRateLimitPerMinute}/min`} />
        </div>
      </article>
    </section>
  );
}
