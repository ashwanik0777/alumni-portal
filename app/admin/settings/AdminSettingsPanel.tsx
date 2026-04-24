"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  Database,
  Download,
  RefreshCw,
  Save,
  Server,
  Shield,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

import { AdminSettingsState, SettingsStats, defaultSettings } from "./settings-types";
import GeneralTab from "./tabs/GeneralTab";
import AccessTab from "./tabs/AccessTab";
import WorkflowTab from "./tabs/WorkflowTab";
import NotificationsTab from "./tabs/NotificationsTab";
import SecurityTab from "./tabs/SecurityTab";
import DataTab from "./tabs/DataTab";
import IntegrationsTab from "./tabs/IntegrationsTab";

type SettingsTab = "general" | "access" | "workflow" | "notifications" | "security" | "data" | "integrations";

const tabMeta: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "General", icon: BadgeCheck },
  { id: "access", label: "Access Control", icon: Users },
  { id: "workflow", label: "Workflow", icon: Workflow },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Data & Backup", icon: Database },
  { id: "integrations", label: "Integrations", icon: Server },
];

let cachedSettingsPayload: Partial<AdminSettingsState> | null = null;
let cachedSettingsStats: SettingsStats | null = null;
let settingsCacheTime = 0;
const SETTINGS_CACHE_TTL_MS = 300_000; // 5 min

export default function AdminSettingsPanel() {
  const isCached = Date.now() - settingsCacheTime < SETTINGS_CACHE_TTL_MS;

  const [settings, setSettings] = useState<AdminSettingsState>(() => isCached && cachedSettingsPayload ? { ...defaultSettings, ...cachedSettingsPayload } : defaultSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!isCached);
  const [stats, setStats] = useState<SettingsStats | null>(() => isCached ? cachedSettingsStats : null);

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
    if (isCached) return;

    let isCancelled = false;

    const loadSettings = async () => {
      setIsInitialLoading(true);
      try {
        const [settingsRes, statsRes] = await Promise.all([
          fetch("/api/admin/settings", { cache: "no-store" }),
          fetch("/api/admin/settings/stats", { cache: "no-store" }),
        ]);

        if (settingsRes.ok) {
          const payload = (await settingsRes.json()) as { settings?: Partial<AdminSettingsState> | null };
          if (payload.settings && !isCancelled) {
            cachedSettingsPayload = payload.settings;
            setSettings((prev) => ({ ...prev, ...payload.settings }));
          }
        }

        if (statsRes.ok && !isCancelled) {
          const statsPayload = await statsRes.json();
          cachedSettingsStats = statsPayload;
          setStats(statsPayload);
        }
        settingsCacheTime = Date.now();
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
  }, [isCached]);

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

  const renderActiveTab = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab settings={settings} update={update} />;
      case "access":
        return <AccessTab settings={settings} update={update} stats={stats} />;
      case "workflow":
        return <WorkflowTab settings={settings} update={update} stats={stats} />;
      case "notifications":
        return <NotificationsTab settings={settings} update={update} />;
      case "security":
        return <SecurityTab settings={settings} update={update} />;
      case "data":
        return <DataTab settings={settings} update={update} stats={stats} />;
      case "integrations":
        return <IntegrationsTab settings={settings} update={update} />;
      default:
        return null;
    }
  };

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

      {renderActiveTab()}
    </div>
  );
}
