import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { getMentorshipDashboard, requestMentorship } from "@/lib/user-mentorship";

export async function GET(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  try {
    const data = await getMentorshipDashboard(email);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, max-age=12, stale-while-revalidate=6" },
    });
  } catch (error) {
    console.error("User mentorship GET error", error);
    return NextResponse.json({ message: "Failed to load mentorship dashboard." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  try {
    const body = await request.json();
    const { mentorId, email } = body;

    if (!mentorId || !email) {
      return NextResponse.json({ message: "mentorId and email are required." }, { status: 400 });
    }

    const result = await requestMentorship(mentorId, email);
    if (!result.ok) {
      return NextResponse.json({ message: result.reason }, { status: 400 });
    }

    return NextResponse.json({ message: "Mentorship request submitted." });
  } catch (error) {
    console.error("User mentorship POST error", error);
    return NextResponse.json({ message: "Failed to submit request." }, { status: 500 });
  }
}
