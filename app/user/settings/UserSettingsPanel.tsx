"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Eye,
  Globe,
  Lock,
  Palette,
  Save,
  ShieldCheck,
  Trash2,
  UserCircle2,
} from "lucide-react";

type SettingsState = {
  profileVisibility: "everyone" | "alumni-only" | "connections-only";
  showEmail: boolean;
  showMobile: boolean;
  showCurrentRole: boolean;
  darkMode: boolean;
  compactMode: boolean;
  emailUpdates: boolean;
  smsAlerts: boolean;
  mentorshipNotifications: boolean;
  jobsNotifications: boolean;
  eventsNotifications: boolean;
  messageNotifications: boolean;
  weeklyDigest: boolean;
  language: "english";
  timezone: string;
};

const defaultSettings: SettingsState = {
  profileVisibility: "alumni-only",
  showEmail: false,
  showMobile: false,
  showCurrentRole: true,
  darkMode: false,
  compactMode: true,
  emailUpdates: true,
  smsAlerts: false,
  mentorshipNotifications: true,
  jobsNotifications: true,
  eventsNotifications: true,
  messageNotifications: true,
  weeklyDigest: true,
  language: "english",
  timezone: "Asia/Kolkata",
};

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background px-3 py-3">
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-border"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function UserSettingsPanel() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [status, setStatus] = useState("");

  const update = <K extends keyof SettingsState>(field: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setStatus("");
  };

  const saveChanges = () => {
    setStatus("Settings saved successfully. Backend sync will be connected next.");
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              User Settings Center
            </p>
            <h2 className="mt-2 text-2xl font-black">Account Customization and Controls</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Customize visibility, notifications, appearance, and account security in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={saveChanges}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Save All Changes
          </button>
        </div>

        {!!status && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {status}
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-4">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-text-primary">
            <Eye className="h-4 w-4 text-primary" />
            Profile Visibility
          </p>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Who can view your profile</span>
              <select
                value={settings.profileVisibility}
                onChange={(event) => update("profileVisibility", event.target.value as SettingsState["profileVisibility"])}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="everyone">Everyone in platform</option>
                <option value="alumni-only">Alumni only</option>
                <option value="connections-only">Connections only</option>
              </select>
            </label>

            <ToggleRow
              title="Show Email Address"
              description="Allow others to view your email on public profile card."
              checked={settings.showEmail}
              onChange={(value) => update("showEmail", value)}
            />
            <ToggleRow
              title="Show Mobile Number"
              description="Display mobile number to verified alumni only."
              checked={settings.showMobile}
              onChange={(value) => update("showMobile", value)}
            />
            <ToggleRow
              title="Show Current Role"
              description="Highlight your current role/company in directory.
"
              checked={settings.showCurrentRole}
              onChange={(value) => update("showCurrentRole", value)}
            />
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-text-primary">
            <Bell className="h-4 w-4 text-primary" />
            Notifications and Alerts
          </p>
          <div className="mt-3 space-y-3">
            <ToggleRow
              title="Email Updates"
              description="Receive important account and community updates via email."
              checked={settings.emailUpdates}
              onChange={(value) => update("emailUpdates", value)}
            />
            <ToggleRow
              title="SMS Alerts"
              description="Get urgent event or security alerts over SMS."
              checked={settings.smsAlerts}
              onChange={(value) => update("smsAlerts", value)}
            />
            <ToggleRow
              title="Mentorship Notifications"
              description="Session reminders, mentor responses, and schedule updates."
              checked={settings.mentorshipNotifications}
              onChange={(value) => update("mentorshipNotifications", value)}
            />
            <ToggleRow
              title="Jobs Notifications"
              description="New role matches, referral updates, and application changes."
              checked={settings.jobsNotifications}
              onChange={(value) => update("jobsNotifications", value)}
            />
            <ToggleRow
              title="Events Notifications"
              description="Event announcements and registration confirmations."
              checked={settings.eventsNotifications}
              onChange={(value) => update("eventsNotifications", value)}
            />
            <ToggleRow
              title="Messages Notifications"
              description="Real-time message and unread conversation alerts."
              checked={settings.messageNotifications}
              onChange={(value) => update("messageNotifications", value)}
            />
            <ToggleRow
              title="Weekly Digest"
              description="Summary of jobs, mentorship, events, and network updates."
              checked={settings.weeklyDigest}
              onChange={(value) => update("weeklyDigest", value)}
            />
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-4">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-text-primary">
            <Palette className="h-4 w-4 text-primary" />
            App Appearance
          </p>
          <div className="mt-3 space-y-3">
            <ToggleRow
              title="Dark Theme"
              description="Use dark mode in user dashboard experience."
              checked={settings.darkMode}
              onChange={(value) => update("darkMode", value)}
            />
            <ToggleRow
              title="Compact Layout"
              description="Use tighter spacing for denser information view."
              checked={settings.compactMode}
              onChange={(value) => update("compactMode", value)}
            />
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Language</span>
              <select
                value={settings.language}
                onChange={(event) => update("language", event.target.value as SettingsState["language"])}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="english">English</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Timezone</span>
              <select
                value={settings.timezone}
                onChange={(event) => update("timezone", event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </label>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-text-primary">
            <Lock className="h-4 w-4 text-primary" />
            Security and Account Actions
          </p>
          <div className="mt-3 space-y-2">
            {[
              "Change password",
              "Enable two-factor authentication",
              "Manage active sessions",
              "Download account data",
              "Manage blocked users",
            ].map((item) => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/35"
              >
                {item}
                <UserCircle2 className="h-4 w-4 text-primary" />
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-600">Danger Zone</p>
            <p className="mt-1 text-xs text-red-700">Deactivate account or request permanent deletion from this section.</p>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Deactivate Account
            </button>
          </div>

          <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-text-secondary">
            <p className="inline-flex items-center gap-1 font-semibold text-text-primary">
              <Globe className="h-3.5 w-3.5 text-primary" />
              Latest Technology Note
            </p>
            <p className="mt-1">
              This settings UI is structured for fast API integration with real-time preference sync in future backend phase.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
