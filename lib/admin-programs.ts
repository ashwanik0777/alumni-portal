import { postgresPool } from "@/lib/postgres";

export type ProgramStatus = "Pending" | "Approved" | "Rejected" | "Needs Info";

export type AdminProgram = {
  id: string;
  title: string;
  category: string;
  programYear: string;
  mode: string;
  coordinatorName: string;
  coordinatorEmail: string;
  contactNumber: string;
  status: ProgramStatus;
  rejectionReason: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type ProgramListFilters = {
  search?: string;
  status?: string;
  year?: string;
  page?: number;
  pageSize?: number;
};

type ProgramsListResult = {
  rows: AdminProgram[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
  filterOptions: {
    years: string[];
  };
};

type ProgramsListCacheEntry = {
  expiresAt: number;
  data: ProgramsListResult;
};

const PROGRAMS_LIST_CACHE_TTL_MS = 12_000;
const programsListCache = new Map<string, ProgramsListCacheEntry>();

const seedPrograms: Array<Omit<AdminProgram, "id" | "submittedAt" | "updatedAt">> = [
  {
    title: "Campus to Corporate Mentorship",
    category: "Mentorship",
    programYear: "2026",
    mode: "Hybrid",
    coordinatorName: "Ritika Verma",
    coordinatorEmail: "ritika.verma@example.com",
    contactNumber: "9876500123",
    status: "Pending",
    rejectionReason: null,
  },
  {
    title: "Startup Bootcamp",
    category: "Entrepreneurship",
    programYear: "2025",
    mode: "Offline",
    coordinatorName: "Arjun Singh",
    coordinatorEmail: "arjun.singh@example.com",
    contactNumber: "9876500456",
    status: "Approved",
    rejectionReason: null,
  },
  {
    title: "Career Compass Webinar",
    category: "Career",
    programYear: "2026",
    mode: "Online",
    coordinatorName: "Sana Khan",
    coordinatorEmail: "sana.khan@example.com",
    contactNumber: "9876500789",
    status: "Needs Info",
    rejectionReason: null,
  },
  {
    title: "Alumni Networking Night",
    category: "Community",
    programYear: "2024",
    mode: "Offline",
    coordinatorName: "Meenal Sharma",
    coordinatorEmail: "meenal.sharma@example.com",
    contactNumber: "9876500222",
    status: "Rejected",
    rejectionReason: "Program budget details are incomplete.",
  },
  {
    title: "Scholarship Awareness Drive",
    category: "Scholarship",
    programYear: "2026",
    mode: "Hybrid",
    coordinatorName: "Aman Chaturvedi",
    coordinatorEmail: "aman.chaturvedi@example.com",
    contactNumber: "9876500999",
    status: "Pending",
    rejectionReason: null,
  },
];

export async function ensureAdminProgramsTable() {
  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS admin_programs (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      program_year TEXT NOT NULL,
      mode TEXT NOT NULL,
      coordinator_name TEXT NOT NULL,
      coordinator_email TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      rejection_reason TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT admin_programs_status_check CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Needs Info'))
    )
  `);

  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_programs_status ON admin_programs(status)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_programs_year ON admin_programs(program_year)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_programs_updated_at ON admin_programs(updated_at DESC)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_programs_coordinator_email ON admin_programs(coordinator_email)`);

  const existingCount = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_programs`);
  if (Number(existingCount.rows[0]?.count || "0") > 0) return;

  for (const item of seedPrograms) {
    await postgresPool.query(
      `
      INSERT INTO admin_programs (title, category, program_year, mode, coordinator_name, coordinator_email, contact_number, status, rejection_reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        item.title,
        item.category,
        item.programYear,
        item.mode,
        item.coordinatorName,
        item.coordinatorEmail,
        item.contactNumber,
        item.status,
        item.rejectionReason,
      ],
    );
  }
}

function getProgramsListCacheKey(filters: ProgramListFilters) {
  return JSON.stringify({
    search: (filters.search || "").trim().toLowerCase(),
    status: filters.status || "All",
    year: filters.year || "All",
    page: Math.max(1, filters.page || 1),
    pageSize: Math.min(50, Math.max(1, filters.pageSize || 10)),
  });
}

function clearProgramsListCache() {
  programsListCache.clear();
}

function mapRow(row: {
  id: string;
  title: string;
  category: string;
  program_year: string;
  mode: string;
  coordinator_name: string;
  coordinator_email: string;
  contact_number: string;
  status: ProgramStatus;
  rejection_reason: string | null;
  submitted_at: string;
  updated_at: string;
}): AdminProgram {
  return {
    id: `P-${row.id}`,
    title: row.title,
    category: row.category,
    programYear: row.program_year,
    mode: row.mode,
    coordinatorName: row.coordinator_name,
    coordinatorEmail: row.coordinator_email,
    contactNumber: row.contact_number,
    status: row.status,
    rejectionReason: row.rejection_reason,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

export async function listAdminPrograms(filters: ProgramListFilters) {
  await ensureAdminProgramsTable();

  const cacheKey = getProgramsListCacheKey(filters);
  const cached = programsListCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize || 10));

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.search?.trim()) {
    values.push(`%${filters.search.trim()}%`);
    const index = values.length;
    conditions.push(`(title ILIKE $${index} OR coordinator_name ILIKE $${index} OR coordinator_email ILIKE $${index})`);
  }

  if (filters.status && filters.status !== "All") {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.year && filters.year !== "All") {
    values.push(filters.year);
    conditions.push(`program_year = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*)::text AS count FROM admin_programs ${whereClause}`;
  const countResult = await postgresPool.query<{ count: string }>(countQuery, values);
  const total = Number(countResult.rows[0]?.count || "0");

  values.push(pageSize, (page - 1) * pageSize);
  const limitIndex = values.length - 1;
  const offsetIndex = values.length;

  const dataQuery = `
    SELECT id::text, title, category, program_year, mode, coordinator_name, coordinator_email, contact_number, status, rejection_reason, submitted_at::text, updated_at::text
    FROM admin_programs
    ${whereClause}
    ORDER BY updated_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;

  const rows = await postgresPool.query<{
    id: string;
    title: string;
    category: string;
    program_year: string;
    mode: string;
    coordinator_name: string;
    coordinator_email: string;
    contact_number: string;
    status: ProgramStatus;
    rejection_reason: string | null;
    submitted_at: string;
    updated_at: string;
  }>(dataQuery, values);

  const summary = await postgresPool.query<{
    pending_count: string;
    approved_count: string;
    rejected_count: string;
  }>(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'Pending')::text AS pending_count,
      COUNT(*) FILTER (WHERE status = 'Approved')::text AS approved_count,
      COUNT(*) FILTER (WHERE status = 'Rejected')::text AS rejected_count
    FROM admin_programs
  `);

  const yearsResult = await postgresPool.query<{ program_year: string }>(`
    SELECT DISTINCT program_year
    FROM admin_programs
    WHERE program_year IS NOT NULL AND program_year <> ''
    ORDER BY program_year DESC
    LIMIT 30
  `);

  const result: ProgramsListResult = {
    rows: rows.rows.map(mapRow),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    summary: {
      pendingCount: Number(summary.rows[0]?.pending_count || "0"),
      approvedCount: Number(summary.rows[0]?.approved_count || "0"),
      rejectedCount: Number(summary.rows[0]?.rejected_count || "0"),
    },
    filterOptions: {
      years: yearsResult.rows.map((item) => item.program_year),
    },
  };

  programsListCache.set(cacheKey, {
    expiresAt: Date.now() + PROGRAMS_LIST_CACHE_TTL_MS,
    data: result,
  });

  return result;
}

export async function listAdminProgramsByStatus(status: "Approved" | "Rejected", limit = 100) {
  await ensureAdminProgramsTable();

  const result = await postgresPool.query<{
    id: string;
    title: string;
    category: string;
    program_year: string;
    mode: string;
    coordinator_name: string;
    coordinator_email: string;
    contact_number: string;
    status: ProgramStatus;
    rejection_reason: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    SELECT id::text, title, category, program_year, mode, coordinator_name, coordinator_email, contact_number, status, rejection_reason, submitted_at::text, updated_at::text
    FROM admin_programs
    WHERE status = $1
    ORDER BY updated_at DESC
    LIMIT $2
    `,
    [status, Math.max(1, Math.min(500, limit))],
  );

  return result.rows.map(mapRow);
}

export async function createAdminProgram(payload: {
  title: string;
  category: string;
  programYear: string;
  mode: string;
  coordinatorName: string;
  coordinatorEmail: string;
  contactNumber: string;
}) {
  await ensureAdminProgramsTable();

  const result = await postgresPool.query<{
    id: string;
    title: string;
    category: string;
    program_year: string;
    mode: string;
    coordinator_name: string;
    coordinator_email: string;
    contact_number: string;
    status: ProgramStatus;
    rejection_reason: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    INSERT INTO admin_programs (title, category, program_year, mode, coordinator_name, coordinator_email, contact_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id::text, title, category, program_year, mode, coordinator_name, coordinator_email, contact_number, status, rejection_reason, submitted_at::text, updated_at::text
    `,
    [
      payload.title,
      payload.category,
      payload.programYear,
      payload.mode,
      payload.coordinatorName,
      payload.coordinatorEmail.toLowerCase(),
      payload.contactNumber,
    ],
  );

  const created = mapRow(result.rows[0]);
  clearProgramsListCache();
  return created;
}

export async function updateAdminProgramStatus(payload: {
  programId: string;
  status: ProgramStatus;
  rejectionReason?: string;
}) {
  await ensureAdminProgramsTable();
  const numericId = payload.programId.replace(/^P-/, "");

  const result = await postgresPool.query<{
    id: string;
    title: string;
    category: string;
    program_year: string;
    mode: string;
    coordinator_name: string;
    coordinator_email: string;
    contact_number: string;
    status: ProgramStatus;
    rejection_reason: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    UPDATE admin_programs
    SET status = $2,
        rejection_reason = $3,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id::text, title, category, program_year, mode, coordinator_name, coordinator_email, contact_number, status, rejection_reason, submitted_at::text, updated_at::text
    `,
    [numericId, payload.status, payload.status === "Rejected" ? payload.rejectionReason || "Rejected by admin." : null],
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  const updated = mapRow(result.rows[0]);
  clearProgramsListCache();
  return updated;
}

export async function bulkApprovePendingPrograms() {
  await ensureAdminProgramsTable();

  const updated = await postgresPool.query<{ count: string }>(`
    WITH updated AS (
      UPDATE admin_programs
      SET status = 'Approved', rejection_reason = NULL, updated_at = NOW()
      WHERE status = 'Pending'
      RETURNING id
    )
    SELECT COUNT(*)::text AS count FROM updated
  `);

  const count = Number(updated.rows[0]?.count || "0");
  clearProgramsListCache();
  return count;
}
