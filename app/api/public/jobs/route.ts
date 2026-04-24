import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";

// We reuse the ensureJobsTables side-effect from user-jobs to ensure the table exists.
// But since that function is not exported, we do a lightweight CREATE IF NOT EXISTS here.
let _jobsTableReady = false;

async function ensureJobsTable() {
  if (_jobsTableReady) return;
  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS job_listings (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'Hybrid',
      type TEXT NOT NULL DEFAULT 'Full-time',
      salary TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      posted_by TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  _jobsTableReady = true;
}

export async function GET(request: NextRequest) {
  try {
    await ensureJobsTable();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "All";
    const mode = searchParams.get("mode") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

    // Only show active jobs
    const whereClauses: string[] = ["is_active = true"];
    const values: unknown[] = [];
    let valueIdx = 1;

    if (search) {
      whereClauses.push(`(title ILIKE $${valueIdx} OR company ILIKE $${valueIdx} OR description ILIKE $${valueIdx})`);
      values.push(`%${search}%`);
      valueIdx++;
    }

    if (location !== "All") {
      whereClauses.push(`location = $${valueIdx}`);
      values.push(location);
      valueIdx++;
    }

    if (mode !== "All") {
      whereClauses.push(`mode = $${valueIdx}`);
      values.push(mode);
      valueIdx++;
    }

    const whereString = `WHERE ${whereClauses.join(" AND ")}`;

    const countRes = await postgresPool.query(
      `SELECT COUNT(*) FROM job_listings ${whereString}`,
      values
    );
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const offset = (page - 1) * pageSize;
    const result = await postgresPool.query(
      `SELECT id::text, title, company, location, mode, type, salary, description, posted_at::text
       FROM job_listings ${whereString}
       ORDER BY posted_at DESC
       LIMIT $${valueIdx} OFFSET $${valueIdx + 1}`,
      [...values, pageSize, offset]
    );

    // Get available locations and modes for filters
    const [locationsRes, modesRes] = await Promise.all([
      postgresPool.query(`SELECT DISTINCT location FROM job_listings WHERE is_active = true ORDER BY location`),
      postgresPool.query(`SELECT DISTINCT mode FROM job_listings WHERE is_active = true ORDER BY mode`),
    ]);

    return NextResponse.json({
      jobs: result.rows,
      locations: locationsRes.rows.map(r => r.location),
      modes: modesRes.rows.map(r => r.mode),
      pagination: { page, pageSize, total: totalCount, totalPages: Math.ceil(totalCount / pageSize) },
    }, {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Public jobs GET error:", error);
    return NextResponse.json({ message: "Failed to fetch jobs" }, { status: 500 });
  }
}
