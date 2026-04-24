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

    const whereClauses: string[] = [];
    const values: unknown[] = [];
    let valueIdx = 1;

    if (search) {
      whereClauses.push(`(full_name ILIKE $${valueIdx} OR email ILIKE $${valueIdx})`);
      values.push(`%${search}%`);
      valueIdx++;
    }

    if (status !== "All") {
      whereClauses.push(`status = $${valueIdx}`);
      values.push(status);
      valueIdx++;
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const result = await postgresPool.query(
      `SELECT * FROM admin_mentors ${whereString} ORDER BY created_at DESC`,
      values
    );

    const summaryRes = await postgresPool.query(
      `SELECT status, COUNT(*) as count FROM admin_mentors GROUP BY status`
    );

    let pendingCount = 0, approvedCount = 0, rejectedCount = 0;
    summaryRes.rows.forEach((r) => {
      if (r.status === "Pending") pendingCount = parseInt(r.count, 10);
      if (r.status === "Approved") approvedCount = parseInt(r.count, 10);
      if (r.status === "Rejected") rejectedCount = parseInt(r.count, 10);
    });

    return NextResponse.json({
      rows: result.rows,
      summary: { pendingCount, approvedCount, rejectedCount },
    });
  } catch (error) {
    console.error("Admin mentors GET error:", error);
    return NextResponse.json({ message: "Failed to fetch mentors" }, { status: 500 });
  }
}
