import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { getUserProfile, upsertUserProfile } from "@/lib/user-profile";

export async function GET(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  try {
    const profile = await getUserProfile(email);
    return NextResponse.json(
      { profile: profile || null },
      { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=5" } },
    );
  } catch (error) {
    console.error("User profile GET error", error);
    return NextResponse.json({ message: "Failed to load profile." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  try {
    const body = await request.json();
    const { email, ...profileData } = body;

    if (!email?.trim()) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const profile = await upsertUserProfile(email, profileData);
    return NextResponse.json({ profile, message: "Profile saved successfully." });
  } catch (error) {
    console.error("User profile POST error", error);
    return NextResponse.json({ message: "Failed to save profile." }, { status: 500 });
  }
}
