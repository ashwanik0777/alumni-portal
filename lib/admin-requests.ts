import { postgresPool } from "@/lib/postgres";

export type RequestStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type RequestPriority = "Low" | "Medium" | "High" | "Critical";
export type RequestCategory = "Support" | "Feedback" | "Bug Report" | "Feature Request" | "Account" | "Other";

export type AdminRequest = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  adminNote: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type RequestListFilters = {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
  pageSize?: number;
};

type RequestsListResult = {
  rows: AdminRequest[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    openCount: number;
    inProgressCount: number;
    resolvedCount: number;
    closedCount: number;
    criticalCount: number;
  };
};

const seedRequests: Array<Omit<AdminRequest, "id" | "submittedAt" | "updatedAt">> = [
  {
    requesterName: "Priya Sharma",
    requesterEmail: "priya.sharma@example.com",
    subject: "Unable to update profile picture",
    description: "I have been trying to upload a new profile picture but the upload keeps failing with a timeout error.",
    category: "Bug Report",
    priority: "Medium",
    status: "Open",
    adminNote: null,
  },
  {
    requesterName: "Rahul Gupta",
    requesterEmail: "rahul.gupta@example.com",
    subject: "Request for alumni batch directory",
    description: "Would love to have a searchable batch directory so we can find and connect with batchmates easily.",
    category: "Feature Request",
    priority: "Low",
    status: "Open",
    adminNote: null,
  },
  {
    requesterName: "Sneha Patel",
    requesterEmail: "sneha.patel@example.com",
    subject: "Scholarship payment not received",
    description: "My scholarship was approved two months ago but the payment has not reflected in my bank account.",
    category: "Support",
    priority: "Critical",
    status: "In Progress",
    adminNote: "Escalated to finance team. Tracking reference #FIN-2026-034.",
  },
  {
    requesterName: "Amit Joshi",
    requesterEmail: "amit.joshi@example.com",
    subject: "Great initiative with mentorship program",
    description: "Just wanted to share positive feedback about the mentorship matching. The system paired me with a great mentor in my field.",
    category: "Feedback",
    priority: "Low",
    status: "Resolved",
    adminNote: "Shared with the mentorship team. Positive feedback noted.",
  },
  {
    requesterName: "Kavita Singh",
    requesterEmail: "kavita.singh@example.com",
    subject: "Cannot login after password reset",
    description: "After resetting my password, I keep getting 'Invalid credentials' error even though the password is correct.",
    category: "Account",
    priority: "High",
    status: "In Progress",
    adminNote: "Auth logs show session conflict. Clearing stale tokens.",
  },
  {
    requesterName: "Deepak Mishra",
    requesterEmail: "deepak.mishra@example.com",
    subject: "Event registration confirmation missing",
    description: "I registered for the Annual Alumni Meet 2026 but did not receive a confirmation email.",
    category: "Support",
    priority: "Medium",
    status: "Closed",
    adminNote: "Email was in spam folder. Resent confirmation and whitelisted domain.",
  },
];

function mapRow(row: {
  id: string;
  requester_name: string;
  requester_email: string;
  subject: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  admin_note: string | null;
  submitted_at: string;
  updated_at: string;
}): AdminRequest {
  return {
    id: `REQ-${row.id}`,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    subject: row.subject,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    adminNote: row.admin_note,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

let tableReady = false;
let requestsTableInitPromise: Promise<void> | null = null;

export async function ensureAdminRequestsTable() {
  if (tableReady) return;
  if (requestsTableInitPromise) { await requestsTableInitPromise; return; }

  requestsTableInitPromise = (async () => {
    try {
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS admin_requests (
          id BIGSERIAL PRIMARY KEY,
          requester_name TEXT NOT NULL,
          requester_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL DEFAULT 'Other',
          priority TEXT NOT NULL DEFAULT 'Medium',
          status TEXT NOT NULL DEFAULT 'Open',
          admin_note TEXT,
          submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT admin_requests_status_check CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
          CONSTRAINT admin_requests_priority_check CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
          CONSTRAINT admin_requests_category_check CHECK (category IN ('Support', 'Feedback', 'Bug Report', 'Feature Request', 'Account', 'Other'))
        )
      `);

      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status)`);
      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_requests_priority ON admin_requests(priority)`);
      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_requests_updated_at ON admin_requests(updated_at DESC)`);

      const existingCount = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_requests`);
      if (Number(existingCount.rows[0]?.count || "0") === 0) {
        for (const item of seedRequests) {
          await postgresPool.query(
            `
            INSERT INTO admin_requests (requester_name, requester_email, subject, description, category, priority, status, admin_note)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [item.requesterName, item.requesterEmail, item.subject, item.description, item.category, item.priority, item.status, item.adminNote],
          );
        }
      }

      tableReady = true;
    } finally {
      requestsTableInitPromise = null;
    }
  })();

  await requestsTableInitPromise;
}

export async function listAdminRequests(filters: RequestListFilters): Promise<RequestsListResult> {
  await ensureAdminRequestsTable();

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize || 10));

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.search?.trim()) {
    values.push(`%${filters.search.trim()}%`);
    const index = values.length;
    conditions.push(`(requester_name ILIKE $${index} OR requester_email ILIKE $${index} OR subject ILIKE $${index})`);
  }

  if (filters.status && filters.status !== "All") {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.priority && filters.priority !== "All") {
    values.push(filters.priority);
    conditions.push(`priority = $${values.length}`);
  }

  if (filters.category && filters.category !== "All") {
    values.push(filters.category);
    conditions.push(`category = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Build data query with separate values array (count query doesn't need LIMIT/OFFSET)
  const dataValues = [...values, pageSize, (page - 1) * pageSize];
  const limitIndex = dataValues.length - 1;
  const offsetIndex = dataValues.length;

  const countQuery = `SELECT COUNT(*)::text AS count FROM admin_requests ${whereClause}`;
  const dataQuery = `
    SELECT id::text, requester_name, requester_email, subject, description, category, priority, status, admin_note, submitted_at::text, updated_at::text
    FROM admin_requests
    ${whereClause}
    ORDER BY
      CASE priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
      updated_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;
  const summaryQuery = `
    SELECT
      COUNT(*) FILTER (WHERE status = 'Open')::text AS open_count,
      COUNT(*) FILTER (WHERE status = 'In Progress')::text AS in_progress_count,
      COUNT(*) FILTER (WHERE status = 'Resolved')::text AS resolved_count,
      COUNT(*) FILTER (WHERE status = 'Closed')::text AS closed_count,
      COUNT(*) FILTER (WHERE priority = 'Critical')::text AS critical_count
    FROM admin_requests
  `;

  // Run all three queries in parallel for maximum performance
  const [countResult, rows, summary] = await Promise.all([
    postgresPool.query<{ count: string }>(countQuery, values),
    postgresPool.query<{
      id: string;
      requester_name: string;
      requester_email: string;
      subject: string;
      description: string;
      category: RequestCategory;
      priority: RequestPriority;
      status: RequestStatus;
      admin_note: string | null;
      submitted_at: string;
      updated_at: string;
    }>(dataQuery, dataValues),
    postgresPool.query<{
      open_count: string;
      in_progress_count: string;
      resolved_count: string;
      closed_count: string;
      critical_count: string;
    }>(summaryQuery),
  ]);

  const total = Number(countResult.rows[0]?.count || "0");

  return {
    rows: rows.rows.map(mapRow),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    summary: {
      openCount: Number(summary.rows[0]?.open_count || "0"),
      inProgressCount: Number(summary.rows[0]?.in_progress_count || "0"),
      resolvedCount: Number(summary.rows[0]?.resolved_count || "0"),
      closedCount: Number(summary.rows[0]?.closed_count || "0"),
      criticalCount: Number(summary.rows[0]?.critical_count || "0"),
    },
  };
}

export async function updateAdminRequestStatus(payload: {
  requestId: string;
  status: RequestStatus;
  adminNote?: string;
}) {
  await ensureAdminRequestsTable();
  const numericId = payload.requestId.replace(/^REQ-/, "");

  const result = await postgresPool.query<{
    id: string;
    requester_name: string;
    requester_email: string;
    subject: string;
    description: string;
    category: RequestCategory;
    priority: RequestPriority;
    status: RequestStatus;
    admin_note: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    UPDATE admin_requests
    SET status = $2,
        admin_note = COALESCE($3, admin_note),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id::text, requester_name, requester_email, subject, description, category, priority, status, admin_note, submitted_at::text, updated_at::text
    `,
    [numericId, payload.status, payload.adminNote || null],
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return mapRow(result.rows[0]);
}

export async function createAdminRequest(payload: {
  requesterName: string;
  requesterEmail: string;
  subject: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
}) {
  await ensureAdminRequestsTable();

  const result = await postgresPool.query<{
    id: string;
    requester_name: string;
    requester_email: string;
    subject: string;
    description: string;
    category: RequestCategory;
    priority: RequestPriority;
    status: RequestStatus;
    admin_note: string | null;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    INSERT INTO admin_requests (requester_name, requester_email, subject, description, category, priority)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id::text, requester_name, requester_email, subject, description, category, priority, status, admin_note, submitted_at::text, updated_at::text
    `,
    [payload.requesterName, payload.requesterEmail, payload.subject, payload.description, payload.category, payload.priority],
  );

  return mapRow(result.rows[0]);
}
