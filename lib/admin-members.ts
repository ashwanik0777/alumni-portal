import { postgresPool } from "@/lib/postgres";

export type MemberStatus = "Pending" | "Approved" | "Rejected" | "Needs Info";

export type AdminMember = {
  id: string;
  fullName: string;
  email: string;
  passingYear: string;
  house: string;
  mobile: string;
  fatherName: string;
  status: MemberStatus;
  rejectionReason: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type MemberListFilters = {
  search?: string;
  status?: string;
  batch?: string;
  page?: number;
  pageSize?: number;
};

const seedMembers: Array<Omit<AdminMember, "id" | "submittedAt" | "updatedAt">> = [
  {
    fullName: "Ritika Verma",
    email: "ritika.verma@example.com",
    passingYear: "2024",
    house: "Arawali",
    mobile: "9876500123",
    fatherName: "Suresh Verma",
    status: "Pending",
    rejectionReason: null,
  },
  {
    fullName: "Arjun Singh",
    email: "arjun.singh@example.com",
    passingYear: "2015",
    house: "Neelgiri",
    mobile: "9876500456",
    fatherName: "Mahesh Singh",
    status: "Approved",
    rejectionReason: null,
  },
  {
    fullName: "Sana Khan",
    email: "sana.khan@example.com",
    passingYear: "2021",
    house: "Shiwalik",
    mobile: "9876500789",
    fatherName: "Irfan Khan",
    status: "Needs Info",
    rejectionReason: null,
  },
  {
    fullName: "Meenal Sharma",
    email: "meenal.sharma@example.com",
    passingYear: "2012",
    house: "Arawali",
    mobile: "9876500222",
    fatherName: "Kamal Sharma",
    status: "Rejected",
    rejectionReason: "Duplicate profile detected.",
  },
  {
    fullName: "Aman Chaturvedi",
    email: "aman.chaturvedi@example.com",
    passingYear: "2024",
    house: "Neelgiri",
    mobile: "9876500999",
    fatherName: "Rakesh Chaturvedi",
    status: "Pending",
    rejectionReason: null,
  },
];

export async function ensureAdminMembersTable() {
  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS admin_members (
      id BIGSERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passing_year TEXT NOT NULL,
      house TEXT NOT NULL,
      mobile TEXT NOT NULL,
      father_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      rejection_reason TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT admin_members_status_check CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Needs Info'))
    )
  `);

  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_members_status ON admin_members(status)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_members_passing_year ON admin_members(passing_year)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_members_updated_at ON admin_members(updated_at DESC)`);

  const existingCount = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_members`);
  if (Number(existingCount.rows[0]?.count || "0") > 0) return;

  for (const item of seedMembers) {
    await postgresPool.query(
      `
      INSERT INTO admin_members (full_name, email, passing_year, house, mobile, father_name, status, rejection_reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [item.fullName, item.email, item.passingYear, item.house, item.mobile, item.fatherName, item.status, item.rejectionReason],
    );
  }
}

function mapRow(row: {
  id: string;
  full_name: string;
  email: string;
  passing_year: string;
  house: string;
  mobile: string;
  father_name: string;
  status: MemberStatus;
  rejection_reason: string | null;
  submitted_at: string;
  updated_at: string;
}): AdminMember {
  return {
    id: `M-${row.id}`,
    fullName: row.full_name,
    email: row.email,
    passingYear: row.passing_year,
    house: row.house,
    mobile: row.mobile,
    fatherName: row.father_name,
    status: row.status,
    rejectionReason: row.rejection_reason,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

export async function listAdminMembers(filters: MemberListFilters) {
  await ensureAdminMembersTable();

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize || 10));

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.search?.trim()) {
    values.push(`%${filters.search.trim()}%`);
    const index = values.length;
    conditions.push(`(full_name ILIKE $${index} OR email ILIKE $${index} OR mobile ILIKE $${index})`);
  }

  if (filters.status && filters.status !== "All") {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.batch && filters.batch !== "All") {
    values.push(filters.batch);
    conditions.push(`passing_year = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*)::text AS count FROM admin_members ${whereClause}`;
  const countResult = await postgresPool.query<{ count: string }>(countQuery, values);
  const total = Number(countResult.rows[0]?.count || "0");

  values.push(pageSize, (page - 1) * pageSize);
  const limitIndex = values.length - 1;
  const offsetIndex = values.length;

  const dataQuery = `
    SELECT id::text, full_name, email, passing_year, house, mobile, father_name, status, rejection_reason, submitted_at::text, updated_at::text
    FROM admin_members
    ${whereClause}
    ORDER BY updated_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;

  const rows = await postgresPool.query<{
    id: string;
    full_name: string;
    email: string;
    passing_year: string;
    house: string;
    mobile: string;
    father_name: string;
    status: MemberStatus;
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
    FROM admin_members
  `);

  return {
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
  };
}

export async function createAdminMember(payload: {
  fullName: string;
  email: string;
  passingYear: string;
  house: string;
  mobile: string;
  fatherName: string;
}) {
  await ensureAdminMembersTable();

  const result = await postgresPool.query<{
    id: string;
    full_name: string;
    email: string;
    passing_year: string;
    house: string;
    mobile: string;
    father_name: string;
    status: MemberStatus;
    rejection_reason: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    INSERT INTO admin_members (full_name, email, passing_year, house, mobile, father_name)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id::text, full_name, email, passing_year, house, mobile, father_name, status, rejection_reason, submitted_at::text, updated_at::text
    `,
    [payload.fullName, payload.email.toLowerCase(), payload.passingYear, payload.house, payload.mobile, payload.fatherName],
  );

  return mapRow(result.rows[0]);
}

export async function updateAdminMemberStatus(payload: {
  memberId: string;
  status: MemberStatus;
  rejectionReason?: string;
}) {
  await ensureAdminMembersTable();
  const numericId = payload.memberId.replace(/^M-/, "");

  const result = await postgresPool.query<{
    id: string;
    full_name: string;
    email: string;
    passing_year: string;
    house: string;
    mobile: string;
    father_name: string;
    status: MemberStatus;
    rejection_reason: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    UPDATE admin_members
    SET status = $2,
        rejection_reason = $3,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id::text, full_name, email, passing_year, house, mobile, father_name, status, rejection_reason, submitted_at::text, updated_at::text
    `,
    [numericId, payload.status, payload.status === "Rejected" ? payload.rejectionReason || "Rejected by admin." : null],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapRow(result.rows[0]);
}

export async function bulkApprovePendingMembers() {
  await ensureAdminMembersTable();
  const updated = await postgresPool.query<{ count: string }>(`
    WITH updated AS (
      UPDATE admin_members
      SET status = 'Approved', rejection_reason = NULL, updated_at = NOW()
      WHERE status = 'Pending'
      RETURNING id
    )
    SELECT COUNT(*)::text AS count FROM updated
  `);

  return Number(updated.rows[0]?.count || "0");
}
