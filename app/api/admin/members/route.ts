import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { createAdminMember, listAdminMembers, verifyMemberCreateOtp } from "@/lib/admin-members";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "All";
    const batch = searchParams.get("batch") || "All";
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "10");

    const result = await listAdminMembers({ search, status, batch, page, pageSize });
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=10, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    console.error("Admin members GET error", error);
    return NextResponse.json({ message: "Unable to load members." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      passingYear?: string;
      house?: string;
      mobile?: string;
      fatherName?: string;
      otpVerificationId?: string;
      otpCode?: string;
    };

    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const passingYear = body.passingYear?.trim();
    const house = body.house?.trim();
    const mobile = body.mobile?.trim();
    const fatherName = body.fatherName?.trim();

    if (!fullName || !email || !passingYear || !house || !mobile || !fatherName) {
      return NextResponse.json({ message: "All member fields are required." }, { status: 400 });
    }

    if (!body.otpVerificationId || !body.otpCode) {
      return NextResponse.json({ message: "OTP verification is required before creating member." }, { status: 400 });
    }

    const otpValidation = await verifyMemberCreateOtp({
      email,
      verificationId: body.otpVerificationId,
      otpCode: body.otpCode,
    });

    if (!otpValidation.ok) {
      return NextResponse.json({ message: `OTP validation failed: ${otpValidation.reason}.` }, { status: 400 });
    }

    const created = await createAdminMember({ fullName, email, passingYear, house, mobile, fatherName });
    return NextResponse.json({ member: created }, { status: 201 });
  } catch (error) {
    console.error("Admin members POST error", error);
    return NextResponse.json({ message: "Unable to create member. Email may already exist." }, { status: 500 });
  }
}
