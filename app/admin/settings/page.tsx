import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Cog, ShieldCheck, UserCircle2 } from "lucide-react";

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const authUser = cookieStore.get("auth_user")?.value;
  const authRole = cookieStore.get("auth_role")?.value;

  if (authUser !== "active") {
    redirect("/login");
  }

  if (authRole !== "admin") {
    redirect("/user/settings");
  }

  return (
    <section className="mx-auto w-full max-w-5xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
        <Cog className="h-3.5 w-3.5" />
        Admin Settings
      </p>

      <h1 className="mt-4 text-3xl font-black text-text-primary">Operations and Security Settings</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Manage operational preferences, access controls, and administrative security settings.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <UserCircle2 className="h-4 w-4 text-primary" />
            Admin Preferences
          </p>
          <p className="mt-2 text-xs text-text-secondary">Configure dashboard defaults and workflow settings for admin operations.</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Access Security
          </p>
          <p className="mt-2 text-xs text-text-secondary">Review role access, security policies, and audit-related controls.</p>
        </div>
      </div>
    </section>
  );
}
