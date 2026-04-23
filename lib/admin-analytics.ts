import { postgresPool } from "@/lib/postgres";

export type AnalyticsData = {
  overview: {
    totalMembers: number;
    totalEvents: number;
    totalPrograms: number;
    totalScholarships: number;
    activeScholarships: number;
    totalApplications: number;
    pendingApplications: number;
    verifiedApplications: number;
    completedApplications: number;
    totalFundingInr: number;
    disbursedFundingInr: number;
  };
  membersByStatus: { status: string; count: number }[];
  scholarshipsByYear: { year: string; count: number; funding: number }[];
  applicationsByStatus: { status: string; count: number }[];
  applicationsByCourse: { course: string; count: number }[];
  recentApplications: { name: string; scholarship: string; status: string; date: string }[];
  eventsByStatus: { status: string; count: number }[];
  topScholarships: { name: string; applications: number; amount: number }[];
  monthlyTrend: { month: string; applications: number; completions: number }[];
};

import { QueryResultRow } from "pg";

async function safeQuery<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  try {
    const result = await postgresPool.query<T>(sql, params);
    return result.rows;
  } catch {
    return [];
  }
}

let analyticsCache: { data: AnalyticsData; expiresAt: number } | null = null;
const ANALYTICS_CACHE_TTL_MS = 15_000;

export async function getAnalyticsData(): Promise<AnalyticsData> {
  // Return cached result if fresh
  if (analyticsCache && analyticsCache.expiresAt > Date.now()) {
    return analyticsCache.data;
  }

  // Run all queries in parallel for performance
  const [
    membersCount,
    eventsCount,
    programsCount,
    scholarshipsOverview,
    applicationsOverview,
    membersByStatus,
    scholarshipsByYear,
    applicationsByStatus,
    applicationsByCourse,
    recentApplications,
    eventsByStatus,
    topScholarships,
    monthlyTrend,
  ] = await Promise.all([
    // Total members
    safeQuery<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_members`),
    // Total events
    safeQuery<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_events`),
    // Total programs
    safeQuery<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_programs`),
    // Scholarships overview
    safeQuery<{ total: string; active: string; funding: string }>(`
      SELECT COUNT(*)::text AS total,
             COUNT(*) FILTER (WHERE is_active)::text AS active,
             COALESCE(SUM(amount_inr), 0)::text AS funding
      FROM admin_scholarships
    `),
    // Applications overview
    safeQuery<{ total: string; pending: string; verified: string; completed: string; disbursed: string }>(`
      SELECT COUNT(*)::text AS total,
             COUNT(*) FILTER (WHERE sa.status = 'Pending')::text AS pending,
             COUNT(*) FILTER (WHERE sa.status = 'Verified')::text AS verified,
             COUNT(*) FILTER (WHERE sa.status = 'Completed')::text AS completed,
             COALESCE(SUM(CASE WHEN sa.status = 'Completed' THEN s.amount_inr ELSE 0 END), 0)::text AS disbursed
      FROM scholarship_applications sa
      JOIN admin_scholarships s ON s.id = sa.scholarship_id
    `),
    // Members by status
    safeQuery<{ status: string; count: string }>(`
      SELECT status, COUNT(*)::text AS count FROM admin_members GROUP BY status ORDER BY count DESC
    `),
    // Scholarships by year
    safeQuery<{ year: string; count: string; funding: string }>(`
      SELECT scholarship_year AS year, COUNT(*)::text AS count, COALESCE(SUM(amount_inr), 0)::text AS funding
      FROM admin_scholarships GROUP BY scholarship_year ORDER BY scholarship_year DESC LIMIT 5
    `),
    // Applications by status
    safeQuery<{ status: string; count: string }>(`
      SELECT status, COUNT(*)::text AS count FROM scholarship_applications GROUP BY status ORDER BY count DESC
    `),
    // Applications by course
    safeQuery<{ course: string; count: string }>(`
      SELECT current_course AS course, COUNT(*)::text AS count
      FROM scholarship_applications GROUP BY current_course ORDER BY count DESC LIMIT 8
    `),
    // Recent applications
    safeQuery<{ name: string; scholarship: string; status: string; date: string }>(`
      SELECT sa.full_name AS name, s.scholarship_name AS scholarship, sa.status, sa.applied_at::text AS date
      FROM scholarship_applications sa
      JOIN admin_scholarships s ON s.id = sa.scholarship_id
      ORDER BY sa.applied_at DESC LIMIT 5
    `),
    // Events by status
    safeQuery<{ status: string; count: string }>(`
      SELECT status, COUNT(*)::text AS count FROM admin_events GROUP BY status ORDER BY count DESC
    `),
    // Top scholarships by application count
    safeQuery<{ name: string; applications: string; amount: string }>(`
      SELECT s.scholarship_name AS name, COUNT(sa.id)::text AS applications, s.amount_inr::text AS amount
      FROM admin_scholarships s
      LEFT JOIN scholarship_applications sa ON sa.scholarship_id = s.id
      GROUP BY s.id, s.scholarship_name, s.amount_inr
      ORDER BY COUNT(sa.id) DESC LIMIT 5
    `),
    // Monthly trend (last 6 months)
    safeQuery<{ month: string; applications: string; completions: string }>(`
      SELECT TO_CHAR(d.m, 'Mon YYYY') AS month,
             COUNT(sa.id) FILTER (WHERE sa.applied_at >= d.m AND sa.applied_at < d.m + INTERVAL '1 month')::text AS applications,
             COUNT(sa.id) FILTER (WHERE sa.completed_at >= d.m AND sa.completed_at < d.m + INTERVAL '1 month')::text AS completions
      FROM generate_series(
        DATE_TRUNC('month', NOW()) - INTERVAL '5 months',
        DATE_TRUNC('month', NOW()),
        INTERVAL '1 month'
      ) AS d(m)
      LEFT JOIN scholarship_applications sa ON TRUE
      GROUP BY d.m ORDER BY d.m ASC
    `),
  ]);

  const so = scholarshipsOverview[0] || { total: "0", active: "0", funding: "0" };
  const ao = applicationsOverview[0] || { total: "0", pending: "0", verified: "0", completed: "0", disbursed: "0" };

  const result: AnalyticsData = {
    overview: {
      totalMembers: Number(membersCount[0]?.count || "0"),
      totalEvents: Number(eventsCount[0]?.count || "0"),
      totalPrograms: Number(programsCount[0]?.count || "0"),
      totalScholarships: Number(so.total),
      activeScholarships: Number(so.active),
      totalApplications: Number(ao.total),
      pendingApplications: Number(ao.pending),
      verifiedApplications: Number(ao.verified),
      completedApplications: Number(ao.completed),
      totalFundingInr: Number(so.funding),
      disbursedFundingInr: Number(ao.disbursed),
    },
    membersByStatus: membersByStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
    scholarshipsByYear: scholarshipsByYear.map((r) => ({ year: r.year, count: Number(r.count), funding: Number(r.funding) })),
    applicationsByStatus: applicationsByStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
    applicationsByCourse: applicationsByCourse.map((r) => ({ course: r.course, count: Number(r.count) })),
    recentApplications: recentApplications.map((r) => ({ name: r.name, scholarship: r.scholarship, status: r.status, date: r.date })),
    eventsByStatus: eventsByStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
    topScholarships: topScholarships.map((r) => ({ name: r.name, applications: Number(r.applications), amount: Number(r.amount) })),
    monthlyTrend: monthlyTrend.map((r) => ({ month: r.month, applications: Number(r.applications), completions: Number(r.completions) })),
  };

  // Cache the result
  analyticsCache = { data: result, expiresAt: Date.now() + ANALYTICS_CACHE_TTL_MS };

  return result;
}
