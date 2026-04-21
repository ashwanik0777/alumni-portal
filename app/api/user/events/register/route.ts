import { NextRequest, NextResponse } from "next/server";
import { registerUserForEvent } from "@/lib/admin-events";
import { requireUserApiAccess } from "@/lib/user-api-guard";

export async function POST(request: NextRequest) {
  const denial = requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as {
      eventId?: string;
      attendeeName?: string;
      attendeeEmail?: string;
      attendeeMobile?: string;
    };

    const eventId = body.eventId?.trim();
    const attendeeName = body.attendeeName?.trim();
    const attendeeEmail = body.attendeeEmail?.trim().toLowerCase();

    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json({ message: "Event, name and email are required." }, { status: 400 });
    }

    const result = await registerUserForEvent({
      eventId,
      attendeeName,
      attendeeEmail,
      attendeeMobile: body.attendeeMobile,
    });

    if (!result.ok) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ registration: result.registration });
  } catch (error) {
    console.error("User event register POST error", error);
    return NextResponse.json({ message: "Unable to register for event." }, { status: 500 });
  }
}
