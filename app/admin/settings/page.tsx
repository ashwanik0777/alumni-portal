import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSettingsPanel from "./AdminSettingsPanel";

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

  return <AdminSettingsPanel />;
}
