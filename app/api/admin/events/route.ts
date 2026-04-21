import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { createAdminEvent, listAdminEvents } from "@/lib/admin-events";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "All";
    const year = searchParams.get("year") || "All";
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "10");

    const result = await listAdminEvents({ search, status, year, page, pageSize });
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=10, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    console.error("Admin events GET error", error);
    return NextResponse.json({ message: "Unable to load events." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as {
      title?: string;
      eventType?: string;
      eventDate?: string;
      location?: string;
      mode?: string;
      organizerName?: string;
      organizerEmail?: string;
    };

    const title = body.title?.trim();
    const eventType = body.eventType?.trim();
    const eventDate = body.eventDate?.trim();
    const location = body.location?.trim();
    const mode = body.mode?.trim();
    const organizerName = body.organizerName?.trim();
    const organizerEmail = body.organizerEmail?.trim().toLowerCase();

    if (!title || !eventType || !eventDate || !location || !mode || !organizerName || !organizerEmail) {
      return NextResponse.json({ message: "All event fields are required." }, { status: 400 });
    }

    const created = await createAdminEvent({
      title,
      eventType,
      eventDate,
      location,
      mode,
      organizerName,
      organizerEmail,
    });

    return NextResponse.json({ event: created }, { status: 201 });
  } catch (error) {
    console.error("Admin events POST error", error);
    return NextResponse.json({ message: "Unable to create event." }, { status: 500 });
  }
}
