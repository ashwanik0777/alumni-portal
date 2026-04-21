import { postgresPool } from "@/lib/postgres";

export type ScholarshipStatus = "Pending" | "Approved" | "Rejected" | "Needs Info";

export type AdminScholarship = {
  id: string;
  scholarshipName: string;
  providerName: string;
  scholarshipYear: string;
  amountInr: number;
  seats: number;
  deadlineDate: string;
  eligibilityCriteria: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  status: ScholarshipStatus;
  rejectionReason: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type ScholarshipListFilters = {
  search?: string;
  status?: string;
  year?: string;
  page?: number;
  pageSize?: number;
};

type ScholarshipListResult = {
  rows: AdminScholarship[];
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
    totalFundingInr: number;
  };
  filterOptions: {
    years: string[];
  };
};

type ScholarshipsListCacheEntry = {
  expiresAt: number;
  data: ScholarshipListResult;
};

const SCHOLARSHIPS_LIST_CACHE_TTL_MS = 12_000;
const scholarshipsListCache = new Map<string, ScholarshipsListCacheEntry>();

const seedScholarships: Array<Omit<AdminScholarship, "id" | "submittedAt" | "updatedAt">> = [
  {
    scholarshipName: "Merit Excellence Scholarship",
    providerName: "Alumni Education Fund",
    scholarshipYear: "2026",
    amountInr: 75000,
    seats: 25,
    deadlineDate: "2026-07-30",
    eligibilityCriteria: "Class 12 pass with at least 85% and family income below 6 LPA",
    description: "Supports top-performing students from economically constrained backgrounds.",
    contactEmail: "scholarships@alumniportal.org",
    contactPhone: "9876501200",
    status: "Pending",
    rejectionReason: null,
  },
  {
    scholarshipName: "STEM Future Grant",
    providerName: "Tech Alumni Collective",
    scholarshipYear: "2026",
    amountInr: 100000,
    seats: 12,
    deadlineDate: "2026-08-20",
    eligibilityCriteria: "Admission in STEM degree and recommendation from school principal",
    description: "One-time grant for first-year STEM students in accredited institutions.",
    contactEmail: "stem.grants@alumniportal.org",
    contactPhone: "9876501300",
    status: "Approved",
    rejectionReason: null,
  },
  {
    scholarshipName: "Girls Higher Education Fund",
    providerName: "Women Alumni Network",
    scholarshipYear: "2025",
    amountInr: 60000,
    seats: 18,
    deadlineDate: "2025-12-10",
    eligibilityCriteria: "Female students admitted to undergraduate programs",
    description: "Promotes continuation of higher education for girl students.",
    contactEmail: "womenfund@alumniportal.org",
    contactPhone: "9876501400",
    status: "Rejected",
    rejectionReason: "Eligibility criteria needed more clarity for lateral-entry students.",
  },
  {
    scholarshipName: "Need Support Cycle Q2",
    providerName: "Finance Team",
    scholarshipYear: "2026",
    amountInr: 50000,
    seats: 40,
    deadlineDate: "2026-06-25",
    eligibilityCriteria: "Verified income documents and active student status",
    description: "Quarterly need-based support for ongoing students.",
    contactEmail: "finance@alumniportal.org",
    contactPhone: "9876501500",
    status: "Needs Info",
    rejectionReason: null,
  },
];

export async function ensureAdminScholarshipsTable() {
  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS admin_scholarships (
      id BIGSERIAL PRIMARY KEY,
      scholarship_name TEXT NOT NULL,
      provider_name TEXT NOT NULL,
      scholarship_year TEXT NOT NULL,
      amount_inr NUMERIC(12, 2) NOT NULL,
      seats INTEGER NOT NULL,
      deadline_date DATE NOT NULL,
      eligibility_criteria TEXT NOT NULL,
      description TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      rejection_reason TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT admin_scholarships_status_check CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Needs Info')),
      CONSTRAINT admin_scholarships_amount_check CHECK (amount_inr >= 0),
      CONSTRAINT admin_scholarships_seats_check CHECK (seats > 0)
    )
  `);

  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_scholarships_status ON admin_scholarships(status)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_scholarships_year ON admin_scholarships(scholarship_year)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_scholarships_updated_at ON admin_scholarships(updated_at DESC)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_scholarships_contact_email ON admin_scholarships(contact_email)`);

  const existingCount = await postgresPool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM admin_scholarships`,
  );
  if (Number(existingCount.rows[0]?.count || "0") > 0) return;

  for (const item of seedScholarships) {
    await postgresPool.query(
      `
      INSERT INTO admin_scholarships (
        scholarship_name,
        provider_name,
        scholarship_year,
        amount_inr,
        seats,
        deadline_date,
        eligibility_criteria,
        description,
        contact_email,
        contact_phone,
        status,
        rejection_reason
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `,
      [
        item.scholarshipName,
        item.providerName,
        item.scholarshipYear,
        item.amountInr,
        item.seats,
        item.deadlineDate,
        item.eligibilityCriteria,
        item.description,
        item.contactEmail,
        item.contactPhone,
        item.status,
        item.rejectionReason,
      ],
    );
  }
}

function getScholarshipListCacheKey(filters: ScholarshipListFilters) {
  return JSON.stringify({
    search: (filters.search || "").trim().toLowerCase(),
    status: filters.status || "All",
    year: filters.year || "All",
    page: Math.max(1, filters.page || 1),
    pageSize: Math.min(50, Math.max(1, filters.pageSize || 10)),
  });
}

function clearScholarshipsListCache() {
  scholarshipsListCache.clear();
}

function mapRow(row: {
  id: string;
  scholarship_name: string;
  provider_name: string;
  scholarship_year: string;
  amount_inr: string;
  seats: number;
  deadline_date: string;
  eligibility_criteria: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  status: ScholarshipStatus;
  rejection_reason: string | null;
  submitted_at: string;
  updated_at: string;
}): AdminScholarship {
  return {
    id: `S-${row.id}`,
    scholarshipName: row.scholarship_name,
    providerName: row.provider_name,
    scholarshipYear: row.scholarship_year,
    amountInr: Number(row.amount_inr),
    seats: row.seats,
    deadlineDate: row.deadline_date,
    eligibilityCriteria: row.eligibility_criteria,
    description: row.description,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    status: row.status,
    rejectionReason: row.rejection_reason,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

export async function listAdminScholarships(filters: ScholarshipListFilters) {
  await ensureAdminScholarshipsTable();

  const cacheKey = getScholarshipListCacheKey(filters);
  const cached = scholarshipsListCache.get(cacheKey);
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
    conditions.push(
      `(scholarship_name ILIKE $${index} OR provider_name ILIKE $${index} OR contact_email ILIKE $${index})`,
    );
  }

  if (filters.status && filters.status !== "All") {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.year && filters.year !== "All") {
    values.push(filters.year);
    conditions.push(`scholarship_year = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await postgresPool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM admin_scholarships ${whereClause}`,
    values,
  );
  const total = Number(countResult.rows[0]?.count || "0");

  values.push(pageSize, (page - 1) * pageSize);
  const limitIndex = values.length - 1;
  const offsetIndex = values.length;

  const rows = await postgresPool.query<{
    id: string;
    scholarship_name: string;
    provider_name: string;
    scholarship_year: string;
    amount_inr: string;
    seats: number;
    deadline_date: string;
    eligibility_criteria: string;
    description: string;
    contact_email: string;
    contact_phone: string;
    status: ScholarshipStatus;
    rejection_reason: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    SELECT
      id::text,
      scholarship_name,
      provider_name,
      scholarship_year,
      amount_inr::text,
      seats,
      deadline_date::text,
      eligibility_criteria,
      description,
      contact_email,
      contact_phone,
      status,
      rejection_reason,
      submitted_at::text,
      updated_at::text
    FROM admin_scholarships
    ${whereClause}
    ORDER BY updated_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `,
    values,
  );

  const summary = await postgresPool.query<{
    pending_count: string;
    approved_count: string;
    rejected_count: string;
    total_funding_inr: string;
  }>(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'Pending')::text AS pending_count,
      COUNT(*) FILTER (WHERE status = 'Approved')::text AS approved_count,
      COUNT(*) FILTER (WHERE status = 'Rejected')::text AS rejected_count,
      COALESCE(SUM(amount_inr), 0)::text AS total_funding_inr
    FROM admin_scholarships
  `);

  const yearsResult = await postgresPool.query<{ scholarship_year: string }>(`
    SELECT DISTINCT scholarship_year
    FROM admin_scholarships
    WHERE scholarship_year IS NOT NULL AND scholarship_year <> ''
    ORDER BY scholarship_year DESC
    LIMIT 30
  `);

  const result: ScholarshipListResult = {
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
      totalFundingInr: Number(summary.rows[0]?.total_funding_inr || "0"),
    },
    filterOptions: {
      years: yearsResult.rows.map((item) => item.scholarship_year),
    },
  };

  scholarshipsListCache.set(cacheKey, {
    expiresAt: Date.now() + SCHOLARSHIPS_LIST_CACHE_TTL_MS,
    data: result,
  });

  return result;
}

export async function listAdminScholarshipsByStatus(status: "Approved" | "Rejected", limit = 100) {
  await ensureAdminScholarshipsTable();

  const rows = await postgresPool.query<{
    id: string;
    scholarship_name: string;
    provider_name: string;
    scholarship_year: string;
    amount_inr: string;
    seats: number;
    deadline_date: string;
    eligibility_criteria: string;
    description: string;
    contact_email: string;
    contact_phone: string;
    status: ScholarshipStatus;
    rejection_reason: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    SELECT
      id::text,
      scholarship_name,
      provider_name,
      scholarship_year,
      amount_inr::text,
      seats,
      deadline_date::text,
      eligibility_criteria,
      description,
      contact_email,
      contact_phone,
      status,
      rejection_reason,
      submitted_at::text,
      updated_at::text
    FROM admin_scholarships
    WHERE status = $1
    ORDER BY updated_at DESC
    LIMIT $2
    `,
    [status, Math.max(1, Math.min(500, limit))],
  );

  return rows.rows.map(mapRow);
}

export async function createAdminScholarship(payload: {
  scholarshipName: string;
  providerName: string;
  scholarshipYear: string;
  amountInr: number;
  seats: number;
  deadlineDate: string;
  eligibilityCriteria: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
}) {
  await ensureAdminScholarshipsTable();

  const result = await postgresPool.query<{
    id: string;
    scholarship_name: string;
    provider_name: string;
    scholarship_year: string;
    amount_inr: string;
    seats: number;
    deadline_date: string;
    eligibility_criteria: string;
    description: string;
    contact_email: string;
    contact_phone: string;
    status: ScholarshipStatus;
    rejection_reason: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    INSERT INTO admin_scholarships (
      scholarship_name,
      provider_name,
      scholarship_year,
      amount_inr,
      seats,
      deadline_date,
      eligibility_criteria,
      description,
      contact_email,
      contact_phone
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING
      id::text,
      scholarship_name,
      provider_name,
      scholarship_year,
      amount_inr::text,
      seats,
      deadline_date::text,
      eligibility_criteria,
      description,
      contact_email,
      contact_phone,
      status,
      rejection_reason,
      submitted_at::text,
      updated_at::text
    `,
    [
      payload.scholarshipName,
      payload.providerName,
      payload.scholarshipYear,
      payload.amountInr,
      payload.seats,
      payload.deadlineDate,
      payload.eligibilityCriteria,
      payload.description,
      payload.contactEmail.toLowerCase(),
      payload.contactPhone,
    ],
  );

  clearScholarshipsListCache();
  return mapRow(result.rows[0]);
}

export async function updateAdminScholarshipStatus(payload: {
  scholarshipId: string;
  status: ScholarshipStatus;
  rejectionReason?: string;
}) {
  await ensureAdminScholarshipsTable();
  const numericId = payload.scholarshipId.replace(/^S-/, "");

  const result = await postgresPool.query<{
    id: string;
    scholarship_name: string;
    provider_name: string;
    scholarship_year: string;
    amount_inr: string;
    seats: number;
    deadline_date: string;
    eligibility_criteria: string;
    description: string;
    contact_email: string;
    contact_phone: string;
    status: ScholarshipStatus;
    rejection_reason: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    UPDATE admin_scholarships
    SET status = $2,
        rejection_reason = $3,
        updated_at = NOW()
    WHERE id = $1
    RETURNING
      id::text,
      scholarship_name,
      provider_name,
      scholarship_year,
      amount_inr::text,
      seats,
      deadline_date::text,
      eligibility_criteria,
      description,
      contact_email,
      contact_phone,
      status,
      rejection_reason,
      submitted_at::text,
      updated_at::text
    `,
    [numericId, payload.status, payload.status === "Rejected" ? payload.rejectionReason || "Rejected by admin." : null],
  );

  if (result.rowCount === 0) {
    return null;
  }

  clearScholarshipsListCache();
  return mapRow(result.rows[0]);
}

export async function bulkApprovePendingScholarships() {
  await ensureAdminScholarshipsTable();

  const updated = await postgresPool.query<{ count: string }>(`
    WITH updated AS (
      UPDATE admin_scholarships
      SET status = 'Approved', rejection_reason = NULL, updated_at = NOW()
      WHERE status = 'Pending'
      RETURNING id
    )
    SELECT COUNT(*)::text AS count FROM updated
  `);

  clearScholarshipsListCache();
  return Number(updated.rows[0]?.count || "0");
}
