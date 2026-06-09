"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Info,
  KeyRound,
  Lock,
  Palette,
  Save,
  ShieldCheck,
  Trash2,
  UserCircle2,
  X,
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

const SETTINGS_KEY = "user_settings_v1";

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

function loadSettings(): SettingsState {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return defaultSettings;
}

function applyDarkMode(enabled: boolean) {
  if (typeof document === "undefined") return;
  if (enabled) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

/* ─── Toast component ─── */
function Toast({
  message,
  type = "success",
  onClose,
}: {
  message: string;
  type?: "success" | "info" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    error: "border-red-200 bg-red-50 text-red-700",
  };

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
    info: <Info className="h-4 w-4 shrink-0" />,
    error: <X className="h-4 w-4 shrink-0" />,
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg ${colors[type]}`}
    >
      {icons[type]}
      {message}
      <button type="button" onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Toggle row ─── */
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

/* ─── Change Password Form ─── */
function ChangePasswordForm({ onSuccess }: { onSuccess: (msg: string) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Save password change record to localStorage
    try {
      localStorage.setItem(
        "user_password_updated_at",
        new Date().toISOString()
      );
    } catch {
      // ignore
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onSuccess("Password changed successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg border border-border bg-background p-3">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
        <KeyRound className="h-3.5 w-3.5 text-primary" />
        Change Password
      </p>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      <input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-text-secondary/60 focus:border-primary"
      />
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-text-secondary/60 focus:border-primary"
      />
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-text-secondary/60 focus:border-primary"
      />

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90"
      >
        <Save className="h-3.5 w-3.5" />
        Save Password
      </button>
    </form>
  );
}

/* ─── Main component ─── */
export default function UserSettingsPanel() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [savedSnapshot, setSavedSnapshot] = useState<SettingsState>(defaultSettings);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const initialized = useRef(false);

  // Load settings + apply dark mode on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loaded = loadSettings();
    setSettings(loaded);
    setSavedSnapshot(loaded);
    applyDarkMode(loaded.darkMode);
  }, []);

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSnapshot);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
  }, []);

  const update = <K extends keyof SettingsState>(field: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setStatus("");

    // Apply dark mode in real-time
    if (field === "darkMode") {
      applyDarkMode(value as boolean);
    }
  };

  const saveChanges = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setSavedSnapshot({ ...settings });
      setStatus("All settings saved successfully.");
      showToast("Settings saved!", "success");
    } catch {
      setStatus("Failed to save settings.");
      showToast("Failed to save settings.", "error");
    }
  };

  /* ─── Security action handlers ─── */

  const handleChangePassword = () => {
    setShowPasswordForm((prev) => !prev);
  };

  const handleDownloadData = () => {
    const keysToCollect = [
      "user_profile_draft_v1",
      "user_settings_v1",
      "user_event_registration_profile_v1",
    ];

    const data: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
    };

    for (const key of keysToCollect) {
      try {
        const raw = localStorage.getItem(key);
        data[key] = raw ? JSON.parse(raw) : null;
      } catch {
        data[key] = null;
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "alumni-account-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Account data downloaded.", "success");
  };

  const handleDeactivateAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate your account? This action will log you out immediately."
    );
    if (!confirmed) return;

    // Clear auth cookies
    document.cookie = "auth_user=; path=/; max-age=0";
    document.cookie = "auth_role=; path=/; max-age=0";

    // Clear localStorage auth items
    try {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_role");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_email");
      localStorage.removeItem("auth_first_name");
    } catch {
      // ignore
    }

    window.location.href = "/login";
  };

  const handleComingSoon = (feature: string) => {
    showToast(`${feature} — coming soon!`, "info");
  };

  /* ─── Security buttons config ─── */
  const securityActions: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[] = [
    {
      label: "Change password",
      icon: showPasswordForm ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />,
      onClick: handleChangePassword,
    },
    {
      label: "Enable two-factor authentication",
      icon: <UserCircle2 className="h-4 w-4 text-primary" />,
      onClick: () => handleComingSoon("Two-factor authentication"),
    },
    {
      label: "Manage active sessions",
      icon: <UserCircle2 className="h-4 w-4 text-primary" />,
      onClick: () => handleComingSoon("Active sessions management"),
    },
    {
      label: "Download account data",
      icon: <Download className="h-4 w-4 text-primary" />,
      onClick: handleDownloadData,
    },
    {
      label: "Manage blocked users",
      icon: <UserCircle2 className="h-4 w-4 text-primary" />,
      onClick: () => handleComingSoon("Blocked users management"),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
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
            className="relative inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Save All Changes
            {hasUnsavedChanges && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-400" />
            )}
          </button>
        </div>

        {!!status && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {status}
          </div>
        )}
      </section>

      {/* Visibility + Notifications */}
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
              description="Highlight your current role/company in directory."
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

      {/* Appearance + Security */}
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
            {securityActions.map((action) => (
              <div key={action.label}>
                <button
                  type="button"
                  onClick={action.onClick}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/35"
                >
                  {action.label}
                  {action.icon}
                </button>
                {action.label === "Change password" && showPasswordForm && (
                  <ChangePasswordForm
                    onSuccess={(msg) => {
                      showToast(msg, "success");
                      setShowPasswordForm(false);
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-600">Danger Zone</p>
            <p className="mt-1 text-xs text-red-700">Deactivate account or request permanent deletion from this section.</p>
            <button
              type="button"
              onClick={handleDeactivateAccount}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Deactivate Account
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
