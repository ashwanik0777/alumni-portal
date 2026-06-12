import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { hashPassword } from "@/lib/password";
import { sendMail, passwordChangedConfirmationTemplate } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      verificationId?: string;
      otpCode?: string;
      newPassword?: string;
    };

    const email = (body.email || "").trim().toLowerCase();
    const verificationId = (body.verificationId || "").trim();
    const otpCode = (body.otpCode || "").trim();
    const newPassword = body.newPassword || "";

    if (!email || !verificationId || !otpCode || !newPassword) {
      return NextResponse.json(
        { message: "Email, verification ID, OTP code, and new password are all required." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    // Validate OTP
    const otpResult = await postgresPool.query<{
      verification_id: string;
      email: string;
      otp_code: string;
      expires_at: Date;
      used: boolean;
    }>(
      `
      SELECT verification_id, email, otp_code, expires_at, used
      FROM password_reset_otp
      WHERE verification_id = $1
      LIMIT 1
      `,
      [verificationId],
    );

    if (otpResult.rowCount === 0) {
      return NextResponse.json({ message: "Invalid verification ID." }, { status: 400 });
    }

    const otpRecord = otpResult.rows[0];

    if (otpRecord.used) {
      return NextResponse.json({ message: "This reset code has already been used." }, { status: 400 });
    }

    if (otpRecord.email !== email) {
      return NextResponse.json({ message: "Email does not match the reset request." }, { status: 400 });
    }

    if (otpRecord.otp_code !== otpCode) {
      return NextResponse.json({ message: "Invalid OTP code." }, { status: 400 });
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ message: "This reset code has expired." }, { status: 400 });
    }

    // Mark OTP as used
    await postgresPool.query(
      `UPDATE password_reset_otp SET used = TRUE WHERE verification_id = $1`,
      [verificationId],
    );

    // Hash new password and update auth_accounts
    const passwordHash = hashPassword(newPassword);
    await postgresPool.query(
      `UPDATE auth_accounts SET password_hash = $2, updated_at = NOW() WHERE email = $1`,
      [email, passwordHash],
    );

    // Send confirmation email asynchronously
    sendMail({
      to: email,
      subject: "Password Changed Successfully",
      html: passwordChangedConfirmationTemplate(email),
    }).catch((err) => console.error("Failed to send password changed confirmation email:", err));

    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Password reset API error:", error);
    return NextResponse.json(
      { message: "Unable to process request right now." },
      { status: 500 },
    );
  }
}
