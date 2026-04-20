import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { requestMemberCreateOtp } from "@/lib/admin-members";

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ message: "Email is required to request OTP." }, { status: 400 });
    }

    const otp = await requestMemberCreateOtp(email);
    return NextResponse.json({
      message: "OTP generated for member creation.",
      verificationId: otp.verificationId,
      expiresAt: otp.expiresAt,
      devOtp: otp.otpCode,
    });
  } catch (error) {
    console.error("Member create OTP request error", error);
    return NextResponse.json({ message: "Unable to generate OTP." }, { status: 500 });
  }
}
