import { NextRequest, NextResponse } from "next/server";
import { listUserEventsWithRegistration } from "@/lib/admin-events";
import { requireUserApiAccess } from "@/lib/user-api-guard";

export async function GET(request: NextRequest) {
  const denial = requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const userEmail = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!userEmail) {
      return NextResponse.json({ message: "User email is required." }, { status: 400 });
    }

    const result = await listUserEventsWithRegistration(userEmail);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=10, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    console.error("User events GET error", error);
    return NextResponse.json({ message: "Unable to load events." }, { status: 500 });
  }
}
