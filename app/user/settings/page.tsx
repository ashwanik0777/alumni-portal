import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserSettingsPanel from "./UserSettingsPanel";

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

  return <UserSettingsPanel />;
}
