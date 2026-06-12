import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { createAdminMember } from "@/lib/admin-members";
import { sendMail, registrationConfirmationTemplate, registrationAdminNotificationTemplate } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      passingYear?: string;
      house?: string;
      mobile?: string;
      fatherName?: string;
      verificationId?: string;
    };

    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const passingYear = body.passingYear?.trim();
    const house = body.house?.trim();
    const mobile = body.mobile?.trim();
    const fatherName = body.fatherName?.trim();
    const verificationId = body.verificationId?.trim();

    if (!fullName || !email || !passingYear || !house || !mobile || !fatherName || !verificationId) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    const otpResult = await postgresPool.query<{
      verification_id: string;
      email: string;
      used: boolean;
    }>(
      `
      SELECT verification_id, email, used
      FROM registration_otp
      WHERE verification_id = $1
      LIMIT 1
      `,
      [verificationId],
    );

    if ((otpResult.rowCount ?? 0) === 0) {
      return NextResponse.json({ message: "Invalid verification ID." }, { status: 400 });
    }

    const otpRecord = otpResult.rows[0];

    if (!otpRecord.used) {
      return NextResponse.json({ message: "Email has not been verified. Please complete OTP verification first." }, { status: 400 });
    }

    if (otpRecord.email !== email) {
      return NextResponse.json({ message: "Email does not match the verified email." }, { status: 400 });
    }

    await createAdminMember({ fullName, email, passingYear, house, mobile, fatherName });

    sendMail({
      to: email,
      subject: "Registration Submitted Successfully",
      html: registrationConfirmationTemplate(fullName),
    }).catch((err) => console.error("Registration confirmation email error", err));

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      sendMail({
        to: adminEmail,
        subject: "New Alumni Registration",
        html: registrationAdminNotificationTemplate({ name: fullName, email, passingYear, house, mobile, fatherName }),
      }).catch((err) => console.error("Registration admin notification email error", err));
    }

    return NextResponse.json({ message: "Registration submitted successfully." });
  } catch (error) {
    const err = error as any;
    if (err.code === "ALREADY_APPROVED" || err.code === "23505" || (error instanceof Error && error.message?.includes("unique"))) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }
    if (err.code === "ALREADY_PENDING") {
      return NextResponse.json({ message: "Your registration request is already pending review." }, { status: 409 });
    }
    console.error("Registration error", error);
    return NextResponse.json({ message: "Unable to complete registration." }, { status: 500 });
  }
}
