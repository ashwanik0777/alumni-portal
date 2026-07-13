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
  UserX,
  Smartphone,
  Laptop,
  Shield,
  ShieldAlert,
  Loader2,
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        try {
          localStorage.setItem("user_password_updated_at", new Date().toISOString());
        } catch {}
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onSuccess("Password changed successfully!");
      } else {
        setError(data.message || "Failed to change password.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
      >
        <Save className="h-3.5 w-3.5" />
        {isSubmitting ? "Saving..." : "Save Password"}
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

  const [show2faModal, setShow2faModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const [securityData, setSecurityData] = useState<{
    twoFactorEnabled: boolean;
    activeSessions: any[];
    blockedUsers: any[];
  }>({
    twoFactorEnabled: false,
    activeSessions: [],
    blockedUsers: [],
  });
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  const [verificationStep, setVerificationStep] = useState<"request" | "verify">("request");
  const [verificationCode, setVerificationCode] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const [emailToBlock, setEmailToBlock] = useState("");
  const [blockError, setBlockError] = useState("");
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  const fetchSecurityData = async () => {
    setLoadingSecurity(true);
    try {
      const res = await fetch("/api/user/settings/security");
      if (res.ok) {
        const data = await res.json();
        setSecurityData(data);
      }
    } catch (err) {
      console.error("Failed to load security settings:", err);
    } finally {
      setLoadingSecurity(false);
    }
  };

  const handleRequest2FA = async () => {
    setModalSubmitting(true);
    setModalError("");
    try {
      const res = await fetch("/api/user/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-2fa" }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationStep("verify");
      } else {
        setModalError(data.message || "Failed to send verification code.");
      }
    } catch {
      setModalError("Network error. Please try again.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleConfirm2FA = async () => {
    setModalSubmitting(true);
    setModalError("");
    try {
      const res = await fetch("/api/user/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm-2fa", code: verificationCode }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Two-factor authentication enabled successfully!", "success");
        setShow2faModal(false);
        fetchSecurityData();
      } else {
        setModalError(data.message || "Failed to confirm code.");
      }
    } catch {
      setModalError("Network error. Please try again.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDisable2FA = async () => {
    setModalSubmitting(true);
    setModalError("");
    try {
      const res = await fetch("/api/user/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable-2fa" }),
      });
      if (res.ok) {
        showToast("Two-factor authentication disabled.", "success");
        setShow2faModal(false);
        fetchSecurityData();
      } else {
        const data = await res.json();
        setModalError(data.message || "Failed to disable 2FA.");
      }
    } catch {
      setModalError("Network error. Please try again.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/user/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke-session", sessionId }),
      });
      if (res.ok) {
        showToast("Session revoked.", "success");
        fetchSecurityData();
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to revoke session.", "error");
      }
    } catch {
      showToast("Network error. Failed to revoke session.", "error");
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!window.confirm("This will log you out of all devices, including this one. Do you want to continue?")) {
      return;
    }
    try {
      const res = await fetch("/api/user/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke-all-sessions" }),
      });
      if (res.ok) {
        showToast("All sessions revoked. Redirecting to login...", "success");
        setTimeout(() => {
          document.cookie = "auth_user=; path=/; max-age=0";
          document.cookie = "auth_role=; path=/; max-age=0";
          document.cookie = "auth_email=; path=/; max-age=0";
          document.cookie = "auth_token=; path=/; max-age=0";
          localStorage.clear();
          window.location.href = "/login";
        }, 1000);
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to revoke sessions.", "error");
      }
    } catch {
      showToast("Network error. Failed to revoke sessions.", "error");
    }
  };

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToBlock?.trim()) return;

    setBlockSubmitting(true);
    setBlockError("");
    try {
      const res = await fetch("/api/user/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block", blockedEmail: emailToBlock }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Blocked user: ${emailToBlock}`, "success");
        setEmailToBlock("");
        fetchSecurityData();
      } else {
        setBlockError(data.message || "Failed to block user.");
      }
    } catch {
      setBlockError("Network error. Please try again.");
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleUnblockUser = async (blockedEmail: string) => {
    try {
      const res = await fetch("/api/user/settings/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unblock", blockedEmail }),
      });
      if (res.ok) {
        showToast(`Unblocked user: ${blockedEmail}`, "success");
        fetchSecurityData();
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to unblock user.", "error");
      }
    } catch {
      showToast("Network error. Failed to unblock user.", "error");
    }
  };

  // Load settings + apply dark mode on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load from localStorage first (for quick UX)
    const loaded = loadSettings();
    setSettings(loaded);
    setSavedSnapshot(loaded);
    applyDarkMode(loaded.darkMode);

    // Fetch from database to sync
    fetch("/api/user/settings")
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data && data.settings) {
          const synced = { ...data.settings, darkMode: false, smsAlerts: false };
          setSettings(synced);
          setSavedSnapshot(synced);
          applyDarkMode(false);
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(synced));
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
      });

    // Fetch Security Data
    fetchSecurityData();
  }, []);

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSnapshot);

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
  }, []);

  const update = <K extends keyof SettingsState>(field: K, value: SettingsState[K]) => {
    if ((field === "darkMode" || field === "smsAlerts") && value === true) {
      showToast("Coming soon!", "info");
      return;
    }
    setSettings((prev) => ({ ...prev, [field]: value }));
    setStatus("");

    // Apply dark mode in real-time
    if (field === "darkMode") {
      applyDarkMode(value as boolean);
    }
  };

  const saveChanges = async () => {
    const safeSettings = { ...settings, darkMode: false, smsAlerts: false };
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: safeSettings }),
      });
      if (res.ok) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(safeSettings));
        setSavedSnapshot({ ...safeSettings });
        setStatus("All settings saved successfully.");
        showToast("Settings saved!", "success");
      } else {
        const errData = await res.json();
        setStatus(errData.message || "Failed to save settings.");
        showToast(errData.message || "Failed to save settings.", "error");
      }
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
    document.cookie = "auth_email=; path=/; max-age=0";

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
      label: securityData.twoFactorEnabled ? "Disable two-factor authentication" : "Enable two-factor authentication",
      icon: <Shield className="h-4 w-4 text-primary" />,
      onClick: () => {
        setVerificationStep("request");
        setVerificationCode("");
        setModalError("");
        setShow2faModal(true);
      },
    },
    {
      label: "Manage active sessions",
      icon: <Laptop className="h-4 w-4 text-primary" />,
      onClick: () => {
        fetchSecurityData();
        setShowSessionsModal(true);
      },
    },
    {
      label: "Download account data",
      icon: <Download className="h-4 w-4 text-primary" />,
      onClick: handleDownloadData,
    },
    {
      label: "Manage blocked users",
      icon: <UserX className="h-4 w-4 text-primary" />,
      onClick: () => {
        fetchSecurityData();
        setShowBlockedModal(true);
      },
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

      {/* 2FA MODAL */}
      {show2faModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShow2faModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-background text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-primary">
              <Shield className="h-6 w-6" />
              <h3 className="text-lg font-bold">Two-Factor Authentication</h3>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {modalError}
              </div>
            )}

            {securityData.twoFactorEnabled ? (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Two-factor authentication is currently <span className="text-emerald-600 font-bold">enabled</span>.
                  You will be prompted for a verification code sent to your email during login.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShow2faModal(false)}
                    className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisable2FA}
                    disabled={modalSubmitting}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {modalSubmitting ? "Disabling..." : "Disable 2FA"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {verificationStep === "request" ? (
                  <>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Protect your account by adding an extra layer of security. We will send a 6-digit OTP verification code to your email when you sign in.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShow2faModal(false)}
                        className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-background transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRequest2FA}
                        disabled={modalSubmitting}
                        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/95 disabled:opacity-50 transition-colors"
                      >
                        {modalSubmitting ? "Sending..." : "Setup Email 2FA"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-text-secondary">
                      A verification code was sent to your email. Enter it below to enable 2FA.
                    </p>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-center text-xl font-bold tracking-[0.2em] rounded-xl border border-border bg-background py-2 text-text-primary outline-none focus:border-primary"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setVerificationStep("request")}
                        className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-background transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleConfirm2FA}
                        disabled={modalSubmitting || verificationCode.length !== 6}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        {modalSubmitting ? "Verifying..." : "Confirm & Enable"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SESSIONS MODAL */}
      {showSessionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSessionsModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-background text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-primary">
              <Laptop className="h-6 w-6" />
              <h3 className="text-lg font-bold">Manage Active Sessions</h3>
            </div>

            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              These are the devices currently logged into your account. You can revoke any session to sign out of that device.
            </p>

            {loadingSecurity ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {securityData.activeSessions.length === 0 ? (
                  <p className="text-xs text-text-secondary text-center py-4">No active sessions found.</p>
                ) : (
                  securityData.activeSessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/10 text-primary">
                          {session.os === "iOS" || session.os === "Android" ? (
                            <Smartphone className="h-4 w-4" />
                          ) : (
                            <Laptop className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            {session.browser} on {session.os}
                          </p>
                          <p className="text-xs text-text-secondary">
                            IP: {session.ipAddress} • Active: {new Date(session.lastActive).toLocaleDateString()} {new Date(session.lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          {session.isCurrent && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                              Current Session
                            </span>
                          )}
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2.5 py-1.5 rounded-lg transition-colors border border-red-200/50"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-between items-center gap-2 mt-6 pt-4 border-t border-border">
              <button
                onClick={handleRevokeAllSessions}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Log out from all devices
              </button>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/95 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCKED USERS MODAL */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowBlockedModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-background text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-primary">
              <UserX className="h-6 w-6" />
              <h3 className="text-lg font-bold">Manage Blocked Users</h3>
            </div>

            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
              Blocked users cannot send you connection requests, message you, or see your activity status.
            </p>

            {/* Block Form */}
            <form onSubmit={handleBlockUser} className="mb-5 space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email address to block"
                  value={emailToBlock}
                  onChange={(e) => setEmailToBlock(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary text-text-primary placeholder:text-text-secondary/60"
                  required
                />
                <button
                  type="submit"
                  disabled={blockSubmitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {blockSubmitting ? "Blocking..." : "Block"}
                </button>
              </div>
              {blockError && (
                <p className="text-xs font-semibold text-red-600">{blockError}</p>
              )}
            </form>

            {loadingSecurity ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {securityData.blockedUsers.length === 0 ? (
                  <p className="text-xs text-text-secondary text-center py-4">No blocked users yet.</p>
                ) : (
                  securityData.blockedUsers.map((user: any) => (
                    <div
                      key={user.blocked_email}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border bg-background"
                    >
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {user.full_name || "Alumni Member"}
                        </p>
                        <p className="text-xs text-text-secondary">{user.blocked_email}</p>
                      </div>
                      <button
                        onClick={() => handleUnblockUser(user.blocked_email)}
                        className="text-xs font-semibold text-primary hover:underline px-2 py-1"
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setShowBlockedModal(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/95 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
