"use client";
import { KeyRound, Siren } from "lucide-react";
import { AdminSettingsState } from "../settings-types";
import { ToggleRow, SettingsInput } from "../SettingsUI";

type Props = { settings: AdminSettingsState; update: <K extends keyof AdminSettingsState>(k: K, v: AdminSettingsState[K]) => void };

export default function SecurityTab({ settings, update }: Props) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-base font-bold text-text-primary">Security Policies</h3>
        <ToggleRow title="Require MFA for admins" description="Enforce 2FA for every admin account." checked={settings.mfaRequiredForAdmins} onChange={(v) => update("mfaRequiredForAdmins", v)} />
        <SettingsInput label="Password rotation (days)" value={settings.forcePasswordRotationDays} onChange={(v) => update("forcePasswordRotationDays", v)} />
        <SettingsInput label="Session timeout (minutes)" value={settings.sessionTimeoutMinutes} onChange={(v) => update("sessionTimeoutMinutes", v)} />
        <ToggleRow title="Single session per admin" description="Force one active session per admin account." checked={settings.allowSingleSessionOnly} onChange={(v) => update("allowSingleSessionOnly", v)} />
        <ToggleRow title="Enable IP whitelist" description="Restrict admin login to approved IP blocks." checked={settings.ipWhitelistEnabled} onChange={(v) => update("ipWhitelistEnabled", v)} />
      </article>

      <article className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-base font-bold text-text-primary">Security Utilities</h3>
        <div className="mt-3 space-y-2">
          {[
            "Rotate all admin API keys",
            "Force logout all sessions",
            "Run access anomaly scan",
            "Revoke stale tokens",
          ].map((item) => (
            <button
              key={item}
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
            >
              {item}
              <KeyRound className="h-4 w-4 text-primary" />
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">
            <Siren className="h-3.5 w-3.5" />
            Emergency Mode
          </p>
          <p className="mt-1 text-xs text-rose-700">Temporarily lock admin operations during suspected incident.</p>
          <button
            type="button"
            onClick={() => update("maintenanceMode", !settings.maintenanceMode)}
            className="mt-2 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            {settings.maintenanceMode ? "Disable Emergency Lock" : "Enable Emergency Lock"}
          </button>
        </div>
      </article>
    </section>
  );
}
