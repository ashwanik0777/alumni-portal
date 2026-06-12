"use client";
import { useState } from "react";
import { KeyRound, Siren, Loader2, X, ShieldAlert, BadgeCheck } from "lucide-react";
import { AdminSettingsState } from "../settings-types";
import { ToggleRow, SettingsInput } from "../SettingsUI";

type Props = { settings: AdminSettingsState; update: <K extends keyof AdminSettingsState>(k: K, v: AdminSettingsState[K]) => void };

type UtilityItem = {
  label: string;
  action: string;
};

export default function SecurityTab({ settings, update }: Props) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [modalReport, setModalReport] = useState<{ title: string; message: string; details?: string; type: "success" | "warning" } | null>(null);

  const utilities: UtilityItem[] = [
    { label: "Rotate all admin API keys", action: "rotate-keys" },
    { label: "Force logout all sessions", action: "logout-all-sessions" },
    { label: "Run access anomaly scan", action: "anomaly-scan" },
    { label: "Revoke stale tokens", action: "revoke-stale" },
  ];

  const handleRunUtility = async (item: UtilityItem) => {
    if (item.action === "logout-all-sessions") {
      if (!window.confirm("This will instantly terminate all user sessions. Users will need to log back in. Proceed?")) {
        return;
      }
    }

    setLoadingAction(item.action);
    try {
      const res = await fetch("/api/admin/settings/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: item.action }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalReport({
          title: item.label,
          message: data.message,
          details: data.details,
          type: "success"
        });
      } else {
        setModalReport({
          title: item.label,
          message: data.message || "Operation failed to execute.",
          type: "warning"
        });
      }
    } catch {
      setModalReport({
        title: item.label,
        message: "Failed to connect to administrative server.",
        type: "warning"
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-2 relative">
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
          {utilities.map((item) => (
            <button
              key={item.action}
              type="button"
              disabled={loadingAction !== null}
              onClick={() => handleRunUtility(item)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {loadingAction === item.action && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {item.label}
              </span>
              <KeyRound className="h-4 w-4 text-primary shrink-0" />
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">
            <Siren className="h-3.5 w-3.5" />
            Emergency Lock Mode
          </p>
          <p className="mt-1 text-xs text-rose-700">Temporarily lock admin operations during suspected incident.</p>
          <button
            type="button"
            onClick={() => update("maintenanceMode", !settings.maintenanceMode)}
            className="mt-2 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            {settings.maintenanceMode ? "Disable Emergency Lock" : "Enable Emergency Lock"}
          </button>
        </div>
      </article>

      {/* Security Report Modal */}
      {modalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalReport(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-background text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              {modalReport.type === "success" ? (
                <BadgeCheck className="h-6 w-6 text-emerald-600" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-amber-500" />
              )}
              <h3 className="text-base font-bold text-text-primary">{modalReport.title}</h3>
            </div>

            <p className="text-sm text-text-primary font-medium">{modalReport.message}</p>
            {modalReport.details && (
              <div className="mt-3 bg-background rounded-xl p-3 border border-border text-xs text-text-secondary leading-relaxed font-mono">
                {modalReport.details}
              </div>
            )}

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setModalReport(null)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/95 transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
