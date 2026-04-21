import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { EventStatus, updateAdminEventStatus } from "@/lib/admin-events";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

const allowedStatuses = new Set<EventStatus>(["Pending", "Approved", "Rejected", "Needs Info"]);

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { eventId } = await context.params;
    const body = (await request.json()) as { status?: EventStatus; rejectionReason?: string };

    if (!body.status || !allowedStatuses.has(body.status)) {
      return NextResponse.json({ message: "Valid status is required." }, { status: 400 });
    }

    if (body.status === "Rejected" && !body.rejectionReason?.trim()) {
      return NextResponse.json({ message: "Rejection reason is required for rejected status." }, { status: 400 });
    }

    const updated = await updateAdminEventStatus({
      eventId,
      status: body.status,
      rejectionReason: body.rejectionReason,
    });

    if (!updated) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ event: updated });
  } catch (error) {
    console.error("Admin event PATCH error", error);
    return NextResponse.json({ message: "Unable to update event." }, { status: 500 });
  }
}
