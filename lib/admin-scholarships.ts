import { postgresPool } from "@/lib/postgres";

export type AdminScholarship = {
  id: string;
  scholarshipName: string;
  providerNames: string[];
  scholarshipYear: string;
  amountInr: number;
  seats: number;
  deadlineDate: string;
  eligibilityCriteria: string[];
  description: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScholarshipApplication = {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  fullName: string;
  email: string;
  mobile: string;
  passingYear: string;
  currentCourse: string;
  currentYear: string;
  percentage: string;
  annualIncome: string;
  statement: string;
  documentLinks: string[];
  status: "Pending" | "Verified" | "Completed";
  adminNotes: string | null;
  completedAt: string | null;
  appliedAt: string;
  updatedAt: string;
};

export type ScholarshipListFilters = {
  search?: string;
  activeOnly?: boolean;
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
    totalCount: number;
    activeCount: number;
    totalFundingInr: number;
    totalApplications: number;
  };
  filterOptions: {
    years: string[];
  };
};

function mapScholarshipRow(row: Record<string, unknown>): AdminScholarship {
  let providers: string[] = [];
  try {
    const raw = row.provider_names;
    if (typeof raw === "string") providers = JSON.parse(raw);
    else if (Array.isArray(raw)) providers = raw as string[];
  } catch { providers = [String(row.provider_names || "")]; }

  let criteria: string[] = [];
  try {
    const raw = row.eligibility_criteria;
    if (typeof raw === "string") criteria = JSON.parse(raw);
    else if (Array.isArray(raw)) criteria = raw as string[];
  } catch { criteria = [String(row.eligibility_criteria || "")]; }

  return {
    id: `S-${row.id}`,
    scholarshipName: String(row.scholarship_name || ""),
    providerNames: providers,
    scholarshipYear: String(row.scholarship_year || ""),
    amountInr: Number(row.amount_inr || 0),
    seats: Number(row.seats || 0),
    deadlineDate: String(row.deadline_date || ""),
    eligibilityCriteria: criteria,
    description: String(row.description || ""),
    contactEmail: String(row.contact_email || ""),
    contactPhone: String(row.contact_phone || ""),
    isActive: row.is_active === true || row.is_active === "true",
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

function mapApplicationRow(row: Record<string, unknown>): ScholarshipApplication {
  let docLinks: string[] = [];
  try {
    const raw = row.document_links;
    if (typeof raw === "string") docLinks = JSON.parse(raw);
    else if (Array.isArray(raw)) docLinks = raw as string[];
  } catch { docLinks = []; }

  return {
    id: `A-${row.id}`,
    scholarshipId: `S-${row.scholarship_id}`,
    scholarshipName: String(row.scholarship_name || ""),
    fullName: String(row.full_name || ""),
    email: String(row.email || ""),
    mobile: String(row.mobile || ""),
    passingYear: String(row.passing_year || ""),
    currentCourse: String(row.current_course || ""),
    currentYear: String(row.current_year || ""),
    percentage: String(row.percentage || ""),
    annualIncome: String(row.annual_income || ""),
    statement: String(row.statement || ""),
    documentLinks: docLinks,
    status: String(row.status || "Pending") as ScholarshipApplication["status"],
    adminNotes: row.admin_notes ? String(row.admin_notes) : null,
    completedAt: row.completed_at ? String(row.completed_at) : null,
    appliedAt: String(row.applied_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

export async function ensureScholarshipTables() {
  // Drop old table if schema mismatch (provider_name -> provider_names JSON)
  const colCheck = await postgresPool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'admin_scholarships' AND column_name = 'provider_name'
  `);
  if (colCheck.rows.length > 0) {
    await postgresPool.query(`DROP TABLE IF EXISTS scholarship_applications`);
    await postgresPool.query(`DROP TABLE IF EXISTS admin_scholarships`);
  }

  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS admin_scholarships (
      id BIGSERIAL PRIMARY KEY,
      scholarship_name TEXT NOT NULL,
      provider_names JSONB NOT NULL DEFAULT '[]',
      scholarship_year TEXT NOT NULL,
      amount_inr NUMERIC(12, 2) NOT NULL,
      seats INTEGER NOT NULL,
      deadline_date DATE NOT NULL,
      eligibility_criteria JSONB NOT NULL DEFAULT '[]',
      description TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT admin_scholarships_amount_check CHECK (amount_inr >= 0),
      CONSTRAINT admin_scholarships_seats_check CHECK (seats > 0)
    )
  `);

  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_scholarships_active ON admin_scholarships(is_active)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_scholarships_year ON admin_scholarships(scholarship_year)`);

  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS scholarship_applications (
      id BIGSERIAL PRIMARY KEY,
      scholarship_id BIGINT NOT NULL REFERENCES admin_scholarships(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      passing_year TEXT NOT NULL,
      current_course TEXT NOT NULL,
      current_year TEXT NOT NULL,
      percentage TEXT NOT NULL,
      annual_income TEXT NOT NULL,
      statement TEXT NOT NULL,
      document_links JSONB NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'Pending',
      admin_notes TEXT,
      completed_at TIMESTAMPTZ,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT app_status_check CHECK (status IN ('Pending', 'Verified', 'Completed'))
    )
  `);

  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_scholarship_apps_sid ON scholarship_applications(scholarship_id)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_scholarship_apps_status ON scholarship_applications(status)`);

  // Seed if empty
  const count = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_scholarships`);
  if (Number(count.rows[0]?.count || "0") > 0) return;

  const seeds = [
    {
      name: "Merit Excellence Scholarship",
      providers: ["Alumni Education Fund", "GBU Trust"],
      year: "2026", amount: 75000, seats: 25, deadline: "2026-07-30",
      criteria: ["Class 12 pass with at least 85%", "Family income below 6 LPA", "Must be a first-year student", "No active backlog"],
      description: "Supports top-performing students from economically constrained backgrounds.",
      email: "scholarships@alumniportal.org", phone: "9876501200", active: true,
    },
    {
      name: "STEM Future Grant",
      providers: ["Tech Alumni Collective", "Innovation Foundation", "STEM India"],
      year: "2026", amount: 100000, seats: 12, deadline: "2026-08-20",
      criteria: ["Admission in STEM degree program", "Recommendation from school principal", "Minimum 80% in qualifying exam"],
      description: "One-time grant for first-year STEM students in accredited institutions.",
      email: "stem.grants@alumniportal.org", phone: "9876501300", active: true,
    },
    {
      name: "Girls Higher Education Fund",
      providers: ["Women Alumni Network"],
      year: "2025", amount: 60000, seats: 18, deadline: "2025-12-10",
      criteria: ["Female students only", "Admitted to undergraduate programs", "Family annual income below 4 LPA"],
      description: "Promotes continuation of higher education for girl students.",
      email: "womenfund@alumniportal.org", phone: "9876501400", active: false,
    },
  ];

  for (const s of seeds) {
    await postgresPool.query(
      `INSERT INTO admin_scholarships (scholarship_name, provider_names, scholarship_year, amount_inr, seats, deadline_date, eligibility_criteria, description, contact_email, contact_phone, is_active)
       VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)`,
      [s.name, JSON.stringify(s.providers), s.year, s.amount, s.seats, s.deadline, JSON.stringify(s.criteria), s.description, s.email, s.phone, s.active],
    );
  }
}

export async function listAdminScholarships(filters: ScholarshipListFilters): Promise<ScholarshipListResult> {
  await ensureScholarshipTables();

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize || 10));
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.search?.trim()) {
    values.push(`%${filters.search.trim()}%`);
    conditions.push(`(scholarship_name ILIKE $${values.length} OR contact_email ILIKE $${values.length} OR provider_names::text ILIKE $${values.length})`);
  }
  if (filters.activeOnly) {
    conditions.push(`is_active = true`);
  }
  if (filters.year && filters.year !== "All") {
    values.push(filters.year);
    conditions.push(`scholarship_year = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRes = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_scholarships ${where}`, values);
  const total = Number(countRes.rows[0]?.count || "0");

  values.push(pageSize, (page - 1) * pageSize);
  const rows = await postgresPool.query(
    `SELECT * FROM admin_scholarships ${where} ORDER BY updated_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );

  const summaryRes = await postgresPool.query<{ total_count: string; active_count: string; total_funding: string }>(`
    SELECT COUNT(*)::text AS total_count,
           COUNT(*) FILTER (WHERE is_active)::text AS active_count,
           COALESCE(SUM(amount_inr), 0)::text AS total_funding
    FROM admin_scholarships
  `);

  const appCountRes = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM scholarship_applications`);

  const yearsRes = await postgresPool.query<{ scholarship_year: string }>(`SELECT DISTINCT scholarship_year FROM admin_scholarships ORDER BY scholarship_year DESC LIMIT 30`);

  return {
    rows: rows.rows.map(mapScholarshipRow),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    summary: {
      totalCount: Number(summaryRes.rows[0]?.total_count || "0"),
      activeCount: Number(summaryRes.rows[0]?.active_count || "0"),
      totalFundingInr: Number(summaryRes.rows[0]?.total_funding || "0"),
      totalApplications: Number(appCountRes.rows[0]?.count || "0"),
    },
    filterOptions: { years: yearsRes.rows.map((r) => r.scholarship_year) },
  };
}

export async function createAdminScholarship(payload: {
  scholarshipName: string;
  providerNames: string[];
  scholarshipYear: string;
  amountInr: number;
  seats: number;
  deadlineDate: string;
  eligibilityCriteria: string[];
  description: string;
  contactEmail: string;
  contactPhone: string;
}) {
  await ensureScholarshipTables();

  const result = await postgresPool.query(
    `INSERT INTO admin_scholarships (scholarship_name, provider_names, scholarship_year, amount_inr, seats, deadline_date, eligibility_criteria, description, contact_email, contact_phone, is_active)
     VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, true)
     RETURNING *`,
    [payload.scholarshipName, JSON.stringify(payload.providerNames), payload.scholarshipYear, payload.amountInr, payload.seats, payload.deadlineDate, JSON.stringify(payload.eligibilityCriteria), payload.description, payload.contactEmail.toLowerCase(), payload.contactPhone],
  );

  return mapScholarshipRow(result.rows[0]);
}

export async function toggleScholarshipActive(scholarshipId: string, isActive: boolean) {
  await ensureScholarshipTables();
  const numId = scholarshipId.replace(/^S-/, "");
  const result = await postgresPool.query(
    `UPDATE admin_scholarships SET is_active = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [numId, isActive],
  );
  if (result.rowCount === 0) return null;
  return mapScholarshipRow(result.rows[0]);
}

export async function getScholarshipById(scholarshipId: string) {
  await ensureScholarshipTables();
  const numId = scholarshipId.replace(/^S-/, "");
  const result = await postgresPool.query(`SELECT * FROM admin_scholarships WHERE id = $1`, [numId]);
  if (result.rows.length === 0) return null;
  return mapScholarshipRow(result.rows[0]);
}

// ── Applications ──

export async function submitApplication(payload: {
  scholarshipId: string;
  fullName: string;
  email: string;
  mobile: string;
  passingYear: string;
  currentCourse: string;
  currentYear: string;
  percentage: string;
  annualIncome: string;
  statement: string;
  documentLinks: string[];
}) {
  await ensureScholarshipTables();
  const numSid = payload.scholarshipId.replace(/^S-/, "");

  const result = await postgresPool.query(
    `INSERT INTO scholarship_applications (scholarship_id, full_name, email, mobile, passing_year, current_course, current_year, percentage, annual_income, statement, document_links)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
     RETURNING *, (SELECT scholarship_name FROM admin_scholarships WHERE id = $1) AS scholarship_name`,
    [numSid, payload.fullName, payload.email.toLowerCase(), payload.mobile, payload.passingYear, payload.currentCourse, payload.currentYear, payload.percentage, payload.annualIncome, payload.statement, JSON.stringify(payload.documentLinks)],
  );

  return mapApplicationRow(result.rows[0]);
}

export async function listApplications(filters: { scholarshipId?: string; status?: string; page?: number; pageSize?: number }) {
  await ensureScholarshipTables();

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize || 10));
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.scholarshipId) {
    values.push(filters.scholarshipId.replace(/^S-/, ""));
    conditions.push(`sa.scholarship_id = $${values.length}`);
  }
  if (filters.status && filters.status !== "All") {
    values.push(filters.status);
    conditions.push(`sa.status = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRes = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM scholarship_applications sa ${where}`, values);
  const total = Number(countRes.rows[0]?.count || "0");

  values.push(pageSize, (page - 1) * pageSize);
  const rows = await postgresPool.query(
    `SELECT sa.*, s.scholarship_name FROM scholarship_applications sa JOIN admin_scholarships s ON s.id = sa.scholarship_id ${where} ORDER BY sa.applied_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );

  return {
    rows: rows.rows.map(mapApplicationRow),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function getApplicationById(applicationId: string) {
  await ensureScholarshipTables();
  const numId = applicationId.replace(/^A-/, "");
  const result = await postgresPool.query(
    `SELECT sa.*, s.scholarship_name FROM scholarship_applications sa JOIN admin_scholarships s ON s.id = sa.scholarship_id WHERE sa.id = $1`,
    [numId],
  );
  if (result.rows.length === 0) return null;
  return mapApplicationRow(result.rows[0]);
}

export async function updateApplicationStatus(applicationId: string, status: "Verified" | "Completed", adminNotes?: string) {
  await ensureScholarshipTables();
  const numId = applicationId.replace(/^A-/, "");
  const completedAt = status === "Completed" ? "NOW()" : "NULL";

  const result = await postgresPool.query(
    `UPDATE scholarship_applications SET status = $2, admin_notes = $3, completed_at = ${completedAt}, updated_at = NOW() WHERE id = $1
     RETURNING *, (SELECT scholarship_name FROM admin_scholarships WHERE id = scholarship_applications.scholarship_id) AS scholarship_name`,
    [numId, status, adminNotes || null],
  );

  if (result.rowCount === 0) return null;
  return mapApplicationRow(result.rows[0]);
}

export async function listUserApplications(email: string) {
  await ensureScholarshipTables();
  const rows = await postgresPool.query(
    `SELECT sa.*, s.scholarship_name FROM scholarship_applications sa JOIN admin_scholarships s ON s.id = sa.scholarship_id WHERE sa.email = $1 ORDER BY sa.applied_at DESC`,
    [email.toLowerCase()],
  );
  return rows.rows.map(mapApplicationRow);
}

export async function listActiveScholarships() {
  await ensureScholarshipTables();
  const rows = await postgresPool.query(`SELECT * FROM admin_scholarships WHERE is_active = true ORDER BY deadline_date ASC`);
  return rows.rows.map(mapScholarshipRow);
}
