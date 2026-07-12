import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { postgresPool } from "@/lib/postgres";
import { verifyPassword, hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  const email = request.cookies.get("auth_email")?.value?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: "User email not found in session." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current and new passwords are required." }, { status: 400 });
    }

    // Fetch user from auth_accounts
    const userRes = await postgresPool.query(
      `SELECT password_hash FROM auth_accounts WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (userRes.rowCount === 0) {
      return NextResponse.json({ message: "User account not found." }, { status: 404 });
    }

    const { password_hash } = userRes.rows[0];

    // Verify current password
    const isValid = verifyPassword(currentPassword, password_hash);
    if (!isValid) {
      return NextResponse.json({ message: "Incorrect current password." }, { status: 400 });
    }

    // Hash and save new password
    const newHash = hashPassword(newPassword);
    await postgresPool.query(
      `UPDATE auth_accounts SET password_hash = $1, updated_at = NOW() WHERE email = $2`,
      [newHash, email]
    );

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ message: "Failed to update password." }, { status: 500 });
  }
}
