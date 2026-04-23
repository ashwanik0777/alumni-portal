import { postgresPool } from "@/lib/postgres";
import { QueryResultRow } from "pg";

async function safeCount(sql: string): Promise<number> {
  try {
    const res = await postgresPool.query<QueryResultRow & { count: string }>(sql);
    return Number(res.rows[0]?.count || "0");
  } catch { return 0; }
}

export type SettingsStats = {
  access: {
    totalAdmins: number;
    totalMembers: number;
    pendingMembers: number;
    rejectedMembers: number;
  };
  workflow: {
    memberVerificationRate: number;
    scholarshipReviewRate: number;
    applicationCompletionRate: number;
    programActiveRate: number;
  };
  data: {
    totalRecords: number;
    tablesCount: number;
    lastUpdated: string;
  };
};

let statsCache: { data: SettingsStats; expiresAt: number } | null = null;
const STATS_CACHE_TTL_MS = 15_000;

export async function getSettingsStats(): Promise<SettingsStats> {
  if (statsCache && statsCache.expiresAt > Date.now()) {
    return statsCache.data;
  }

  const [
    totalMembers, pendingMembers, rejectedMembers, approvedMembers,
    totalScholarships, activeScholarships,
    totalApps, completedApps,
    totalPrograms, activePrograms,
    totalRecords,
  ] = await Promise.all([
    safeCount(`SELECT COUNT(*)::text AS count FROM admin_members`),
    safeCount(`SELECT COUNT(*)::text AS count FROM admin_members WHERE status = 'Pending'`),
    safeCount(`SELECT COUNT(*)::text AS count FROM admin_members WHERE status = 'Rejected'`),
    safeCount(`SELECT COUNT(*)::text AS count FROM admin_members WHERE status = 'Approved'`),
    safeCount(`SELECT COUNT(*)::text AS count FROM admin_scholarships`),
    safeCount(`SELECT COUNT(*)::text AS count FROM admin_scholarships WHERE is_active = true`),
    safeCount(`SELECT COUNT(*)::text AS count FROM scholarship_applications`),
    safeCount(`SELECT COUNT(*)::text AS count FROM scholarship_applications WHERE status = 'Completed'`),
    safeCount(`SELECT COUNT(*)::text AS count FROM admin_programs`),
    safeCount(`SELECT COUNT(*)::text AS count FROM admin_programs WHERE status = 'Active'`),
    safeCount(`SELECT (
      (SELECT COUNT(*) FROM admin_members) +
      (SELECT COUNT(*) FROM admin_scholarships) +
      (SELECT COUNT(*) FROM scholarship_applications) +
      (SELECT COUNT(*) FROM admin_events) +
      (SELECT COUNT(*) FROM admin_programs)
    )::text AS count`),
  ]);

  const memberVerificationRate = totalMembers > 0 ? Math.round((approvedMembers / totalMembers) * 100) : 0;
  const scholarshipReviewRate = totalScholarships > 0 ? Math.round((activeScholarships / totalScholarships) * 100) : 0;
  const applicationCompletionRate = totalApps > 0 ? Math.round((completedApps / totalApps) * 100) : 0;
  const programActiveRate = totalPrograms > 0 ? Math.round((activePrograms / totalPrograms) * 100) : 0;

  const result: SettingsStats = {
    access: {
      totalAdmins: 1, // Currently single admin system
      totalMembers,
      pendingMembers,
      rejectedMembers,
    },
    workflow: {
      memberVerificationRate,
      scholarshipReviewRate,
      applicationCompletionRate,
      programActiveRate,
    },
    data: {
      totalRecords,
      tablesCount: 7,
      lastUpdated: new Date().toISOString(),
    },
  };

  statsCache = { data: result, expiresAt: Date.now() + STATS_CACHE_TTL_MS };
  return result;
}
