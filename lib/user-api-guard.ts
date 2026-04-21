import { NextRequest, NextResponse } from "next/server";

export function requireUserApiAccess(request: NextRequest) {
  const authUser = request.cookies.get("auth_user")?.value;
  const authRole = request.cookies.get("auth_role")?.value;

  if (authUser !== "active" || authRole !== "user") {
    return NextResponse.json({ message: "User authentication required." }, { status: 401 });
  }

  return null;
}
