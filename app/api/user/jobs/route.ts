import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { getJobsDashboard, applyToJob } from "@/lib/user-jobs";

export async function GET(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  try {
    const data = await getJobsDashboard(email);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, max-age=12, stale-while-revalidate=6" },
    });
  } catch (error) {
    console.error("User jobs GET error", error);
    return NextResponse.json({ message: "Failed to load jobs." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  try {
    const body = await request.json();
    const { jobId, email } = body;

    if (!jobId || !email) {
      return NextResponse.json({ message: "jobId and email are required." }, { status: 400 });
    }

    const result = await applyToJob(jobId, email);
    if (!result.ok) {
      return NextResponse.json({ message: result.reason }, { status: 400 });
    }

    return NextResponse.json({ message: "Application submitted." });
  } catch (error) {
    console.error("User jobs POST error", error);
    return NextResponse.json({ message: "Failed to apply." }, { status: 500 });
  }
}
