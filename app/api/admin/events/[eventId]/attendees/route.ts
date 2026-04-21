import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { listAdminEventAttendees } from "@/lib/admin-events";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { eventId } = await context.params;
    const rows = await listAdminEventAttendees(eventId);
    return NextResponse.json(
      { rows },
      {
        headers: {
          "Cache-Control": "private, max-age=10, stale-while-revalidate=20",
        },
      },
    );
  } catch (error) {
    console.error("Admin event attendees GET error", error);
    return NextResponse.json({ message: "Unable to load attendees." }, { status: 500 });
  }
}
