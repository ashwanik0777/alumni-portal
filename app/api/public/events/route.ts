import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { ensureAdminEventsTable } from "@/lib/admin-events";

export async function GET(request: NextRequest) {
  try {
    await ensureAdminEventsTable();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const mode = searchParams.get("mode") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

    // Only show approved events to public
    const whereClauses: string[] = ["status = 'Approved'"];
    const values: unknown[] = [];
    let valueIdx = 1;

    if (search) {
      whereClauses.push(`(title ILIKE $${valueIdx} OR location ILIKE $${valueIdx})`);
      values.push(`%${search}%`);
      valueIdx++;
    }

    if (mode !== "All") {
      whereClauses.push(`mode = $${valueIdx}`);
      values.push(mode);
      valueIdx++;
    }

    const whereString = `WHERE ${whereClauses.join(" AND ")}`;

    const countRes = await postgresPool.query(
      `SELECT COUNT(*) FROM admin_events e ${whereString.replace(/\b(status|title|location|mode)\b/g, 'e.$1')}`,
      values
    );
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const offset = (page - 1) * pageSize;
    const result = await postgresPool.query(
      `SELECT e.id, e.title, e.event_type, e.event_date, e.location, e.mode, e.organizer_name, e.submitted_at,
              COALESCE((SELECT COUNT(*) FROM admin_event_registrations a WHERE a.event_id = e.id), 0) AS attendee_count,
              COALESCE((SELECT COUNT(*) FROM admin_event_registrations a WHERE a.event_id = e.id AND a.registration_status = 'Going'), 0) AS going_count
       FROM admin_events e ${whereString.replace(/\b(status|title|location|mode)\b/g, 'e.$1')}
       ORDER BY e.event_date ASC
       LIMIT $${valueIdx} OFFSET $${valueIdx + 1}`,
      [...values, pageSize, offset]
    );

    // Get available modes for filter
    const modesRes = await postgresPool.query(
      `SELECT DISTINCT mode FROM admin_events WHERE status = 'Approved' ORDER BY mode`
    );

    return NextResponse.json({
      events: result.rows,
      modes: modesRes.rows.map(r => r.mode),
      pagination: { page, pageSize, total: totalCount, totalPages: Math.ceil(totalCount / pageSize) },
    }, {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Public events GET error:", error);
    return NextResponse.json({ message: "Failed to fetch events" }, { status: 500 });
  }
}
