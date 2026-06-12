import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { sendMail, otpEmailTemplate } from "@/lib/mailer";

let registrationOtpTableReady = false;

async function ensureRegistrationOtpTable() {
  if (registrationOtpTableReady) return;

  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS registration_otp (
      verification_id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_registration_otp_email ON registration_otp(email)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_registration_otp_expires ON registration_otp(expires_at)`);

  registrationOtpTableReady = true;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    await ensureRegistrationOtpTable();

    const verificationId = `REG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await postgresPool.query(
      `
      INSERT INTO registration_otp (verification_id, email, otp_code, expires_at, used)
      VALUES ($1, $2, $3, $4, FALSE)
      `,
      [verificationId, email, otpCode, expiresAt.toISOString()],
    );

    sendMail({
      to: email,
      subject: "Your Registration Verification Code",
      html: otpEmailTemplate(otpCode, "registration"),
    }).catch((err) => console.error("Registration OTP email send error", err));

    return NextResponse.json({
      message: "OTP sent to your email.",
      verificationId,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Registration OTP request error", error);
    return NextResponse.json({ message: "Unable to send OTP." }, { status: 500 });
  }
}
