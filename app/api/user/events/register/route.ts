import { NextRequest, NextResponse } from "next/server";
import { registerUserForEvent } from "@/lib/admin-events";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { postgresPool } from "@/lib/postgres";

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

    // Check if event is upcoming (event_date > today). Registration not allowed for past/ongoing events.
    const numericId = eventId.replace(/^E-/, "");
    const eventCheck = await postgresPool.query<{ event_date: string }>(
      `SELECT event_date::text FROM admin_events WHERE id = $1 LIMIT 1`,
      [numericId],
    );

    if ((eventCheck.rowCount ?? 0) === 0) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    const eventDate = new Date(eventCheck.rows[0].event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() <= today.getTime()) {
      return NextResponse.json(
        { message: "Registration is only available for upcoming events. This event has already started or ended." },
        { status: 400 },
      );
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

