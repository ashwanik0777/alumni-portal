import { NextRequest, NextResponse } from "next/server";
import { cancelUserEventRegistration } from "@/lib/admin-events";
import { requireUserApiAccess } from "@/lib/user-api-guard";

export async function POST(request: NextRequest) {
  const denial = requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as {
      eventId?: string;
      attendeeEmail?: string;
    };

    const eventId = body.eventId?.trim();
    const attendeeEmail = body.attendeeEmail?.trim().toLowerCase();

    if (!eventId || !attendeeEmail) {
      return NextResponse.json({ message: "Event and email are required." }, { status: 400 });
    }

    const result = await cancelUserEventRegistration({ eventId, attendeeEmail });
    if (!result.ok) {
      return NextResponse.json({ message: "Registration not found." }, { status: 404 });
    }

    return NextResponse.json({ registration: result.registration });
  } catch (error) {
    console.error("User event cancel POST error", error);
    return NextResponse.json({ message: "Unable to cancel registration." }, { status: 500 });
  }
}
