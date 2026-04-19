import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const authUser = cookieStore.get("auth_user")?.value;
  const authRole = cookieStore.get("auth_role")?.value;

  if (authUser !== "active") {
    redirect("/login");
  }

  redirect(authRole === "admin" ? "/admin/settings" : "/user/settings");
}
