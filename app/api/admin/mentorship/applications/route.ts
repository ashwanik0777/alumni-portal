import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { ensureMentorshipTables } from "@/lib/mentorship";

export async function GET(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    await ensureMentorshipTables();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const whereClauses: string[] = [];
    const values: unknown[] = [];
    let valueIdx = 1;

    if (search) {
      whereClauses.push(`(mentee_name ILIKE $${valueIdx} OR mentee_email ILIKE $${valueIdx})`);
      values.push(`%${search}%`);
      valueIdx++;
    }

    if (status !== "All") {
      whereClauses.push(`status = $${valueIdx}`);
      values.push(status);
      valueIdx++;
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countRes = await postgresPool.query(
      `SELECT COUNT(*) FROM mentorship_applications ${whereString}`,
      values
    );
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const offset = (page - 1) * pageSize;
    const result = await postgresPool.query(
      `SELECT * FROM mentorship_applications ${whereString} ORDER BY created_at DESC LIMIT $${valueIdx} OFFSET $${valueIdx + 1}`,
      [...values, pageSize, offset]
    );

    const summaryRes = await postgresPool.query(
      `SELECT status, COUNT(*) as count FROM mentorship_applications GROUP BY status`
    );

    let pendingCount = 0, activeCount = 0, completedCount = 0;
    summaryRes.rows.forEach((r) => {
      if (r.status === "Pending") pendingCount = parseInt(r.count, 10);
      if (r.status === "Active") activeCount = parseInt(r.count, 10);
      if (r.status === "Completed") completedCount = parseInt(r.count, 10);
    });

    return NextResponse.json({
      rows: result.rows,
      pagination: { page, pageSize, total: totalCount, totalPages: Math.ceil(totalCount / pageSize) },
      summary: { pendingCount, activeCount, completedCount, totalCount },
    });
  } catch (error) {
    console.error("Admin mentorship applications GET error:", error);
    return NextResponse.json({ message: "Failed to fetch mentorship applications" }, { status: 500 });
  }
}
