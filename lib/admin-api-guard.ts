import { NextRequest, NextResponse } from "next/server";

export function requireAdminApiAccess(request: NextRequest) {
  const authUser = request.cookies.get("auth_user")?.value;
  const authRole = request.cookies.get("auth_role")?.value;

  if (authUser !== "active" || authRole !== "admin") {
    return NextResponse.json({ message: "Admin authentication required." }, { status: 401 });
  }

  return null;
}
