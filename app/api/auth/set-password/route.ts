import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { hashPassword } from "@/lib/password";
import { sendMail, passwordChangedConfirmationTemplate } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const email = (body.email || "").trim().toLowerCase();
    const newPassword = body.newPassword || "";
    const confirmPassword = body.confirmPassword || "";

    if (!email || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match." }, { status: 400 });
    }

    // Check if the account exists and must_set_password is true
    const accountResult = await postgresPool.query<{ email: string; must_set_password: boolean }>(
      `SELECT email, must_set_password FROM auth_accounts WHERE email = $1 LIMIT 1`,
      [email],
    );

    if (accountResult.rowCount === 0) {
      return NextResponse.json({ message: "Account not found." }, { status: 400 });
    }

    const account = accountResult.rows[0];

    if (!account.must_set_password) {
      return NextResponse.json({ message: "Password change not required for this account." }, { status: 400 });
    }

    // Hash the new password and update the account
    const passwordHash = hashPassword(newPassword);

    await postgresPool.query(
      `UPDATE auth_accounts SET password_hash = $2, must_set_password = FALSE, updated_at = NOW() WHERE email = $1`,
      [email, passwordHash],
    );

    // Send confirmation email asynchronously
    sendMail({
      to: email,
      subject: "Password Set Successfully",
      html: passwordChangedConfirmationTemplate(email),
    }).catch((err) => console.error("Set password confirmation email error:", err));

    return NextResponse.json({ message: "Password set successfully." });
  } catch (error) {
    console.error("Set password API error:", error);
    return NextResponse.json({ message: "Unable to set password right now." }, { status: 500 });
  }
}
