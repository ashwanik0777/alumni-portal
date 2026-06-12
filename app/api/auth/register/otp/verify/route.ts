import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      verificationId?: string;
      otpCode?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const verificationId = body.verificationId?.trim();
    const otpCode = body.otpCode?.trim();

    if (!email || !verificationId || !otpCode) {
      return NextResponse.json({ message: "Email, verificationId, and otpCode are required." }, { status: 400 });
    }

    const result = await postgresPool.query<{
      verification_id: string;
      used: boolean;
      expires_at: string;
      email: string;
      otp_code: string;
    }>(
      `
      SELECT verification_id, used, expires_at::text, email, otp_code
      FROM registration_otp
      WHERE verification_id = $1
      LIMIT 1
      `,
      [verificationId],
    );

    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json({ message: "Invalid verification ID." }, { status: 400 });
    }

    const otp = result.rows[0];

    if (otp.used) {
      return NextResponse.json({ message: "This OTP has already been used." }, { status: 400 });
    }

    if (otp.email !== email) {
      return NextResponse.json({ message: "Email does not match." }, { status: 400 });
    }

    if (otp.otp_code !== otpCode) {
      return NextResponse.json({ message: "Incorrect OTP code." }, { status: 400 });
    }

    if (new Date(otp.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ message: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    await postgresPool.query(
      `UPDATE registration_otp SET used = TRUE WHERE verification_id = $1`,
      [verificationId],
    );

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Registration OTP verify error", error);
    return NextResponse.json({ message: "Unable to verify OTP." }, { status: 500 });
  }
}
