import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Cog, ShieldCheck, UserCircle2 } from "lucide-react";

export default async function UserSettingsPage() {
  const cookieStore = await cookies();
  const authUser = cookieStore.get("auth_user")?.value;
  const authRole = cookieStore.get("auth_role")?.value;

  if (authUser !== "active") {
    redirect("/login");
  }

  if (authRole === "admin") {
    redirect("/admin/settings");
  }

  return (
    <section className="mx-auto w-full max-w-7xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
        <Cog className="h-3.5 w-3.5" />
        User Settings
      </p>

      <h1 className="mt-4 text-3xl font-black text-text-primary">Profile and Account Settings</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Manage your user account details, privacy preferences, and security controls.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <UserCircle2 className="h-4 w-4 text-primary" />
            Profile Preferences
          </p>
          <p className="mt-2 text-xs text-text-secondary">Control your profile visibility and personal information display.</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Security Controls
          </p>
          <p className="mt-2 text-xs text-text-secondary">Review login security and protect your account sessions.</p>
        </div>
      </div>
    </section>
  );
}
