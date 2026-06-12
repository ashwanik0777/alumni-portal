import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { ensureSecurityTables, createSession } from "@/lib/user-security";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; code?: string };
    const email = (body.email || "").trim().toLowerCase();
    const code = (body.code || "").trim();

    if (!email || !code) {
      return NextResponse.json({ message: "Email and code are required." }, { status: 400 });
    }

    await ensureSecurityTables();

    const result = await postgresPool.query<{
      email: string;
      first_name: string;
      roles: string[];
      must_set_password: boolean;
      two_factor_otp: string | null;
      two_factor_otp_expiry: Date | null;
    }>(
      `SELECT email, first_name, roles, must_set_password, two_factor_otp, two_factor_otp_expiry
       FROM auth_accounts
       WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 401 });
    }

    const account = result.rows[0];

    if (!account.two_factor_otp || account.two_factor_otp !== code) {
      return NextResponse.json({ message: "Invalid verification code." }, { status: 401 });
    }

    if (!account.two_factor_otp_expiry || new Date() > account.two_factor_otp_expiry) {
      return NextResponse.json({ message: "Verification code has expired." }, { status: 401 });
    }

    // Clear OTP
    await postgresPool.query(
      `UPDATE auth_accounts 
       SET two_factor_otp = NULL, two_factor_otp_expiry = NULL 
       WHERE email = $1`,
      [account.email]
    );

    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || (request as any).ip || "127.0.0.1";
    const authToken = await createSession(account.email, userAgent, ipAddress);

    const allowedRoles = account.roles.filter((role) => role === "admin" || role === "user");

    return NextResponse.json({
      message: "2FA code verified successfully.",
      authToken,
      user: {
        email: account.email,
        firstName: account.first_name,
        roles: allowedRoles,
        mustSetPassword: account.must_set_password || false,
      },
    });
  } catch (error) {
    console.error("verify-2fa error:", error);
    return NextResponse.json({ message: "Unable to verify code at this time." }, { status: 500 });
  }
}
