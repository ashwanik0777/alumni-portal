import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Cog, ShieldCheck, UserCircle2 } from "lucide-react";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const authUser = cookieStore.get("auth_user")?.value;
  const authRole = cookieStore.get("auth_role")?.value;

  if (authUser !== "active") {
    redirect("/login");
  }

  const dashboardHref = authRole === "admin" ? "/admin" : "/user";

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-text-primary sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Cog className="h-3.5 w-3.5" />
          Account Settings
        </p>

        <h1 className="mt-4 text-3xl font-black">Profile and Account Settings</h1>
        <p className="mt-2 text-sm text-text-secondary">
          More advanced settings will be added here soon. Your account session is active and protected.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
              <UserCircle2 className="h-4 w-4 text-primary" />
              Account Info
            </p>
            <p className="mt-2 text-xs text-text-secondary">Update your profile details and visibility preferences.</p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Security
            </p>
            <p className="mt-2 text-xs text-text-secondary">Manage password updates and session security controls.</p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href={dashboardHref}
            className="inline-flex items-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-text-primary hover:border-primary/35"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
