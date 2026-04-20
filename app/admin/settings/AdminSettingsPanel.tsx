"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  Database,
  Download,
  KeyRound,
  RefreshCw,
  Save,
  Server,
  Shield,
  ShieldCheck,
  Siren,
  Users,
  Workflow,
} from "lucide-react";

type SettingsTab = "general" | "access" | "workflow" | "notifications" | "security" | "data" | "integrations";

type AdminSettingsState = {
  institutionName: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  locale: string;
  defaultLanding: "overview" | "requests" | "scholarships" | "analytics";
  allowRoleEdits: boolean;
  allowSelfRoleUpgrade: boolean;
  requireAdminApprovalForRoleChange: boolean;
  maxAdminSeats: string;
  memberAutoApproveTrusted: boolean;
  scholarshipApprovalSteps: "one-step" | "two-step" | "three-step";
  requestEscalationHours: string;
  requireRejectionReason: boolean;
  sendApprovalEmails: boolean;
  sendDailyDigest: boolean;
  sendCriticalAlerts: boolean;
  sendSmsForHighPriority: boolean;
  mfaRequiredForAdmins: boolean;
  forcePasswordRotationDays: string;
  sessionTimeoutMinutes: string;
  allowSingleSessionOnly: boolean;
  ipWhitelistEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  backupRetentionDays: string;
  autoArchiveResolvedRequests: boolean;
  archiveAfterDays: string;
  apiRateLimitPerMinute: string;
  enableWebhookEvents: boolean;
  enableSlackIntegration: boolean;
  enableEmailProvider: boolean;
  maintenanceMode: boolean;
};

const defaultSettings: AdminSettingsState = {
  institutionName: "JNV Alumni Portal",
  supportEmail: "admin@jnvportal.in",
  supportPhone: "+91-90000-12345",
  timezone: "Asia/Kolkata",
  locale: "en-IN",
  defaultLanding: "overview",
  allowRoleEdits: true,
  allowSelfRoleUpgrade: false,
  requireAdminApprovalForRoleChange: true,
  maxAdminSeats: "15",
  memberAutoApproveTrusted: false,
  scholarshipApprovalSteps: "two-step",
  requestEscalationHours: "12",
  requireRejectionReason: true,
  sendApprovalEmails: true,
  sendDailyDigest: true,
  sendCriticalAlerts: true,
  sendSmsForHighPriority: false,
  mfaRequiredForAdmins: true,
  forcePasswordRotationDays: "90",
  sessionTimeoutMinutes: "45",
  allowSingleSessionOnly: false,
  ipWhitelistEnabled: false,
  backupFrequency: "daily",
  backupRetentionDays: "30",
  autoArchiveResolvedRequests: true,
  archiveAfterDays: "14",
  apiRateLimitPerMinute: "600",
  enableWebhookEvents: true,
  enableSlackIntegration: false,
  enableEmailProvider: true,
  maintenanceMode: false,
};

const tabMeta: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "General", icon: BadgeCheck },
  { id: "access", label: "Access Control", icon: Users },
  { id: "workflow", label: "Workflow", icon: Workflow },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Data & Backup", icon: Database },
  { id: "integrations", label: "Integrations", icon: Server },
];

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
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background px-3 py-3">
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

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState<AdminSettingsState>(defaultSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const update = <K extends keyof AdminSettingsState>(field: K, value: AdminSettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setStatusMessage("");
  };

  const settingsHealth = useMemo(() => {
    const criticalChecks = [
      settings.mfaRequiredForAdmins,
      Number(settings.forcePasswordRotationDays) <= 120,
      Number(settings.sessionTimeoutMinutes) <= 60,
      settings.sendCriticalAlerts,
      settings.enableEmailProvider,
      settings.backupFrequency !== "monthly",
    ];
    const score = Math.round((criticalChecks.filter(Boolean).length / criticalChecks.length) * 100);
    return score;
  }, [settings]);

  useEffect(() => {
    let isCancelled = false;

    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings", { cache: "no-store" });
        if (!response.ok) return;

        const payload = (await response.json()) as { settings?: Partial<AdminSettingsState> | null };
        if (!payload.settings || isCancelled) return;

        setSettings((prev) => ({ ...prev, ...payload.settings }));
      } catch {
        if (!isCancelled) {
          setStatusMessage("Could not load saved settings from server. Default values are shown.");
        }
      } finally {
        if (!isCancelled) {
          setIsInitialLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isCancelled = true;
    };
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        setStatusMessage("Save failed. Please check admin access and try again.");
        return;
      }

      setStatusMessage("All admin settings saved successfully to backend.");
    } catch {
      setStatusMessage("Network error while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setStatusMessage("Settings reset to default values.");
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `admin-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setStatusMessage("Settings exported as JSON.");
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="h-5 w-48 rounded bg-border/60" />
          <div className="mt-3 h-8 w-80 rounded bg-border/60" />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`settings-tab-loading-${i}`} className="h-9 rounded-xl bg-border/50" />
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`settings-left-loading-${i}`} className="h-11 rounded-xl bg-border/50" />
            ))}
          </article>
          <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`settings-right-loading-${i}`} className="h-11 rounded-xl bg-border/50" />
            ))}
          </article>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Settings Control Center
            </p>
            <h2 className="mt-2 text-2xl font-black text-text-primary">Operations, Security, and Platform Governance</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Configure all core administrative behavior from one place: access, workflows, alerts, security, backups, and integrations.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background px-4 py-3 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Settings Health</p>
            <p className="mt-1 text-2xl font-black text-text-primary">{settingsHealth}%</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveSettings}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save All"}
          </button>
          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
          >
            <RefreshCw className="h-4 w-4" /> Reset Default
          </button>
          <button
            type="button"
            onClick={exportSettings}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
          >
            <Download className="h-4 w-4" /> Export JSON
          </button>
        </div>

        {statusMessage && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {statusMessage}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {tabMeta.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold",
                activeTab === tab.id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background text-text-primary hover:border-primary/30 hover:text-primary",
              ].join(" ")}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "general" && (
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-base font-bold text-text-primary">Institution Profile</h3>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Institution Name</span>
                <input
                  value={settings.institutionName}
                  onChange={(event) => update("institutionName", event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Support Email</span>
                <input
                  value={settings.supportEmail}
                  onChange={(event) => update("supportEmail", event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Support Phone</span>
                <input
                  value={settings.supportPhone}
                  onChange={(event) => update("supportPhone", event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-base font-bold text-text-primary">Regional Defaults</h3>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Timezone</span>
                <select
                  value={settings.timezone}
                  onChange={(event) => update("timezone", event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Locale</span>
                <select
                  value={settings.locale}
                  onChange={(event) => update("locale", event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="en-IN">English (India)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Default Admin Landing</span>
                <select
                  value={settings.defaultLanding}
                  onChange={(event) => update("defaultLanding", event.target.value as AdminSettingsState["defaultLanding"])}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="overview">Overview</option>
                  <option value="requests">Requests</option>
                  <option value="scholarships">Scholarships</option>
                  <option value="analytics">Analytics</option>
                </select>
              </label>
            </div>
          </article>
        </section>
      )}

      {activeTab === "access" && (
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-base font-bold text-text-primary">Role Governance</h3>
            <ToggleRow
              title="Allow role edits"
              description="Super admins can update user/admin roles from dashboard."
              checked={settings.allowRoleEdits}
              onChange={(value) => update("allowRoleEdits", value)}
            />
            <ToggleRow
              title="Allow self role upgrade"
              description="Permit users to request/trigger role upgrade by themselves."
              checked={settings.allowSelfRoleUpgrade}
              onChange={(value) => update("allowSelfRoleUpgrade", value)}
            />
            <ToggleRow
              title="Require approval for role change"
              description="Every role change requires admin review and approval."
              checked={settings.requireAdminApprovalForRoleChange}
              onChange={(value) => update("requireAdminApprovalForRoleChange", value)}
            />
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Max Admin Seats</span>
              <input
                value={settings.maxAdminSeats}
                onChange={(event) => update("maxAdminSeats", event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-base font-bold text-text-primary">Access Snapshot</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { label: "Active Admins", value: "11" },
                { label: "Pending Role Requests", value: "6" },
                { label: "Restricted Accounts", value: "4" },
                { label: "Policy Violations", value: "1" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xs text-text-secondary">{item.label}</p>
                  <p className="mt-1 text-xl font-black text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === "workflow" && (
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-base font-bold text-text-primary">Approval Workflow</h3>
            <ToggleRow
              title="Auto approve trusted members"
              description="Skip manual review for verified trusted profile buckets."
              checked={settings.memberAutoApproveTrusted}
              onChange={(value) => update("memberAutoApproveTrusted", value)}
            />
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Scholarship Approval Steps</span>
              <select
                value={settings.scholarshipApprovalSteps}
                onChange={(event) => update("scholarshipApprovalSteps", event.target.value as AdminSettingsState["scholarshipApprovalSteps"])}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="one-step">One-step approval</option>
                <option value="two-step">Two-step approval</option>
                <option value="three-step">Three-step approval</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Request Escalation (hours)</span>
              <input
                value={settings.requestEscalationHours}
                onChange={(event) => update("requestEscalationHours", event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <ToggleRow
              title="Rejection reason mandatory"
              description="Force admins to provide rejection reason for every decline."
              checked={settings.requireRejectionReason}
              onChange={(value) => update("requireRejectionReason", value)}
            />
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-base font-bold text-text-primary">Workflow Progress Indicators</h3>
            <div className="mt-3 space-y-3 text-xs">
              {[
                { name: "Member Verification", value: 84 },
                { name: "Scholarship Reviews", value: 66 },
                { name: "Request Resolution", value: 72 },
                { name: "Program Launch Readiness", value: 58 },
              ].map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-text-primary">{item.name}</span>
                    <span className="text-text-secondary">{item.value}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-background">
                    <div className="h-2.5 rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === "notifications" && (
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-base font-bold text-text-primary">Notification Rules</h3>
            <ToggleRow
              title="Send approval emails"
              description="Send email on approval/rejection decisions."
              checked={settings.sendApprovalEmails}
              onChange={(value) => update("sendApprovalEmails", value)}
            />
            <ToggleRow
              title="Send daily digest"
              description="Send daily summary to admin and operations teams."
              checked={settings.sendDailyDigest}
              onChange={(value) => update("sendDailyDigest", value)}
            />
            <ToggleRow
              title="Critical alerts"
              description="Instant alerts for downtime, policy breach, and suspicious activity."
              checked={settings.sendCriticalAlerts}
              onChange={(value) => update("sendCriticalAlerts", value)}
            />
            <ToggleRow
              title="SMS for high priority"
              description="Send SMS for urgent requests and emergency scholarships."
              checked={settings.sendSmsForHighPriority}
              onChange={(value) => update("sendSmsForHighPriority", value)}
            />
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-base font-bold text-text-primary">Recent Notification Health</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { label: "Email Delivery", value: "98.4%" },
                { label: "SMS Delivery", value: "94.1%" },
                { label: "Digest Open Rate", value: "51%" },
                { label: "Critical Alert SLA", value: "2m" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xs text-text-secondary">{item.label}</p>
                  <p className="mt-1 text-xl font-black text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === "security" && (
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-base font-bold text-text-primary">Security Policies</h3>
            <ToggleRow
              title="Require MFA for admins"
              description="Enforce 2FA for every admin account."
              checked={settings.mfaRequiredForAdmins}
              onChange={(value) => update("mfaRequiredForAdmins", value)}
            />
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Password rotation (days)</span>
              <input
                value={settings.forcePasswordRotationDays}
                onChange={(event) => update("forcePasswordRotationDays", event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Session timeout (minutes)</span>
              <input
                value={settings.sessionTimeoutMinutes}
                onChange={(event) => update("sessionTimeoutMinutes", event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <ToggleRow
              title="Single session per admin"
              description="Force one active session per admin account."
              checked={settings.allowSingleSessionOnly}
              onChange={(value) => update("allowSingleSessionOnly", value)}
            />
            <ToggleRow
              title="Enable IP whitelist"
              description="Restrict admin login to approved IP blocks."
              checked={settings.ipWhitelistEnabled}
              onChange={(value) => update("ipWhitelistEnabled", value)}
            />
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
      )}

      {activeTab === "data" && (
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-base font-bold text-text-primary">Backup and Retention</h3>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Backup Frequency</span>
              <select
                value={settings.backupFrequency}
                onChange={(event) => update("backupFrequency", event.target.value as AdminSettingsState["backupFrequency"])}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Retention (days)</span>
              <input
                value={settings.backupRetentionDays}
                onChange={(event) => update("backupRetentionDays", event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <ToggleRow
              title="Auto archive resolved requests"
              description="Move resolved requests to archive after threshold.
"
              checked={settings.autoArchiveResolvedRequests}
              onChange={(value) => update("autoArchiveResolvedRequests", value)}
            />
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Archive after (days)</span>
              <input
                value={settings.archiveAfterDays}
                onChange={(event) => update("archiveAfterDays", event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-base font-bold text-text-primary">Data Operations</h3>
            <div className="mt-3 space-y-2">
              {[
                "Create on-demand backup",
                "Run data integrity check",
                "Export audit logs",
                "Purge expired archives",
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
      )}

      {activeTab === "integrations" && (
        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-base font-bold text-text-primary">Integration Controls</h3>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">API Rate Limit (per minute)</span>
              <input
                value={settings.apiRateLimitPerMinute}
                onChange={(event) => update("apiRateLimitPerMinute", event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <ToggleRow
              title="Enable webhook events"
              description="Emit webhook events for approvals, updates, and alerts."
              checked={settings.enableWebhookEvents}
              onChange={(value) => update("enableWebhookEvents", value)}
            />
            <ToggleRow
              title="Enable Slack integration"
              description="Send critical activity to team Slack channels."
              checked={settings.enableSlackIntegration}
              onChange={(value) => update("enableSlackIntegration", value)}
            />
            <ToggleRow
              title="Enable email provider"
              description="Use connected SMTP provider for platform notifications."
              checked={settings.enableEmailProvider}
              onChange={(value) => update("enableEmailProvider", value)}
            />
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-base font-bold text-text-primary">Integration Health</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { label: "Webhook Status", value: settings.enableWebhookEvents ? "Active" : "Disabled" },
                { label: "Slack Bridge", value: settings.enableSlackIntegration ? "Connected" : "Not connected" },
                { label: "Email Provider", value: settings.enableEmailProvider ? "Healthy" : "Disabled" },
                { label: "Rate Limit", value: `${settings.apiRateLimitPerMinute}/min` },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xs text-text-secondary">{item.label}</p>
                  <p className="mt-1 text-sm font-bold text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}
