import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { getUserOverview } from "@/lib/user-overview";

export async function GET(request: NextRequest) {
  const denial = requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ message: "User email is required." }, { status: 400 });
    }

    const data = await getUserOverview(email);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, max-age=12, stale-while-revalidate=8" },
    });
  } catch (error) {
    console.error("User overview GET error", error);
    return NextResponse.json({ message: "Unable to load overview." }, { status: 500 });
  }
}
