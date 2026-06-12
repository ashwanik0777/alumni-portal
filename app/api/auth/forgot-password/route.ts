import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { sendMail, otpEmailTemplate } from "@/lib/mailer";
import { randomBytes, randomInt } from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    // Create password_reset_otp table if it doesn't exist
    await postgresPool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_otp (
        verification_id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Check if account exists
    const accountResult = await postgresPool.query<{ email: string }>(
      `SELECT email FROM auth_accounts WHERE email = $1 LIMIT 1`,
      [email],
    );

    // Generate verification details regardless (for consistent response shape)
    const verificationId = randomBytes(16).toString("hex");
    const otpCode = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (accountResult.rowCount && accountResult.rowCount > 0) {
      // Store OTP in database
      await postgresPool.query(
        `
        INSERT INTO password_reset_otp (verification_id, email, otp_code, expires_at)
        VALUES ($1, $2, $3, $4)
        `,
        [verificationId, email, otpCode, expiresAt.toISOString()],
      );

      // Send OTP email asynchronously
      sendMail({
        to: email,
        subject: "Password Reset Code",
        html: otpEmailTemplate(otpCode, "password-reset"),
      }).catch((err) => console.error("Failed to send password reset OTP email:", err));
    }

    // Always return success to avoid revealing if account exists
    return NextResponse.json({
      message: "If this email is registered, a reset code has been sent.",
      verificationId,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { message: "Unable to process request right now." },
      { status: 500 },
    );
  }
}
