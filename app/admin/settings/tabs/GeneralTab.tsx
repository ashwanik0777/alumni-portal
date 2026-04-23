"use client";
import { AdminSettingsState } from "../settings-types";
import { SettingsInput, SettingsSelect } from "../SettingsUI";

type Props = { settings: AdminSettingsState; update: <K extends keyof AdminSettingsState>(k: K, v: AdminSettingsState[K]) => void };

export default function GeneralTab({ settings, update }: Props) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-base font-bold text-text-primary">Institution Profile</h3>
        <div className="mt-3 space-y-3">
          <SettingsInput label="Institution Name" value={settings.institutionName} onChange={(v) => update("institutionName", v)} />
          <SettingsInput label="Support Email" value={settings.supportEmail} onChange={(v) => update("supportEmail", v)} />
          <SettingsInput label="Support Phone" value={settings.supportPhone} onChange={(v) => update("supportPhone", v)} />
        </div>
      </article>
      <article className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-base font-bold text-text-primary">Regional Defaults</h3>
        <div className="mt-3 space-y-3">
          <SettingsSelect label="Timezone" value={settings.timezone} onChange={(v) => update("timezone", v)}
            options={[{ value: "Asia/Kolkata", label: "Asia/Kolkata" }, { value: "Asia/Dubai", label: "Asia/Dubai" }, { value: "Europe/London", label: "Europe/London" }, { value: "America/New_York", label: "America/New_York" }]} />
          <SettingsSelect label="Locale" value={settings.locale} onChange={(v) => update("locale", v)}
            options={[{ value: "en-IN", label: "English (India)" }, { value: "en-US", label: "English (US)" }]} />
          <SettingsSelect label="Default Admin Landing" value={settings.defaultLanding} onChange={(v) => update("defaultLanding", v as AdminSettingsState["defaultLanding"])}
            options={[{ value: "overview", label: "Overview" }, { value: "requests", label: "Requests" }, { value: "scholarships", label: "Scholarships" }, { value: "analytics", label: "Analytics" }]} />
        </div>
      </article>
    </section>
  );
}
