import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/user-security";

export async function requireUserApiAccess(request: NextRequest) {
  const authUser = request.cookies.get("auth_user")?.value;
  const authRole = request.cookies.get("auth_role")?.value;
  const authEmail = request.cookies.get("auth_email")?.value;
  const authToken = request.cookies.get("auth_token")?.value;

  if (authUser !== "active" || authRole !== "user" || !authEmail) {
    return NextResponse.json({ message: "User authentication required." }, { status: 401 });
  }

  if (!authToken) {
    return NextResponse.json({ message: "Session token required." }, { status: 401 });
  }

  const isValid = await validateSession(authEmail, authToken);
  if (!isValid) {
    return NextResponse.json({ message: "Session is invalid or has expired." }, { status: 401 });
  }

  return null;
}

