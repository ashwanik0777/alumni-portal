import { postgresPool } from "@/lib/postgres";

export type MentorProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  focusArea: string;
  nextSession: string;
};

export type MentorshipRequest = {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

let mentorshipTableReady = false;
let mentorshipTableInitPromise: Promise<void> | null = null;

const seedMentors: Array<Omit<MentorProfile, "id">> = [
  { name: "Nidhi Sharma", email: "nidhi.sharma@example.com", role: "Product Leader", company: "InsightGrid", focusArea: "Career growth and product thinking", nextSession: "Tue, 7:30 PM" },
  { name: "Aman Tiwari", email: "aman.tiwari@example.com", role: "Senior Engineer", company: "CloudSprint", focusArea: "System design and backend transitions", nextSession: "Fri, 8:00 PM" },
  { name: "Rohit Mishra", email: "rohit.mishra@example.com", role: "Data Architect", company: "ScaleBridge", focusArea: "Data engineering and analytics", nextSession: "Sat, 11:00 AM" },
];

async function ensureMentorshipTables() {
  if (mentorshipTableReady) return;
  if (mentorshipTableInitPromise) { await mentorshipTableInitPromise; return; }

  mentorshipTableInitPromise = (async () => {
    try {
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS mentor_profiles (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL,
          company TEXT NOT NULL,
          focus_area TEXT NOT NULL,
          next_session TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS mentorship_requests (
          id BIGSERIAL PRIMARY KEY,
          mentor_id BIGINT NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
          mentee_email TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT mentorship_status_check CHECK (status IN ('Pending', 'Active', 'Completed', 'Cancelled')),
          CONSTRAINT mentorship_unique UNIQUE (mentor_id, mentee_email)
        )
      `);

      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_mentor_profiles_active ON mentor_profiles(is_active)`);
      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_mentorship_req_mentee ON mentorship_requests(mentee_email)`);

      const count = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM mentor_profiles`);
      if (Number(count.rows[0]?.count || "0") === 0) {
        for (const m of seedMentors) {
          await postgresPool.query(
            `INSERT INTO mentor_profiles (name, email, role, company, focus_area, next_session) VALUES ($1,$2,$3,$4,$5,$6)`,
            [m.name, m.email, m.role, m.company, m.focusArea, m.nextSession]
          );
        }
      }

      mentorshipTableReady = true;
    } finally {
      mentorshipTableInitPromise = null;
    }
  })();

  await mentorshipTableInitPromise;
}

export async function getMentorshipDashboard(userEmail: string) {
  await ensureMentorshipTables();
  const normalized = userEmail.trim().toLowerCase();

  const [mentorsResult, requestsResult] = await Promise.all([
    postgresPool.query(`SELECT id::text, name, email, role, company, focus_area, next_session FROM mentor_profiles WHERE is_active = true ORDER BY id ASC LIMIT 20`),
    postgresPool.query(
      `SELECT r.id::text, r.mentor_id::text, m.name AS mentor_name, r.mentee_email, r.status, r.created_at::text, r.updated_at::text
       FROM mentorship_requests r JOIN mentor_profiles m ON m.id = r.mentor_id
       WHERE r.mentee_email = $1 ORDER BY r.updated_at DESC`,
      [normalized]
    ),
  ]);

  const activeReqIds = new Set(requestsResult.rows.map((r: Record<string, unknown>) => String(r.mentor_id)));

  return {
    mentors: mentorsResult.rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      role: String(r.role),
      company: String(r.company),
      focusArea: String(r.focus_area),
      nextSession: String(r.next_session),
      hasRequested: activeReqIds.has(String(r.id)),
    })),
    requests: requestsResult.rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      mentorId: String(r.mentor_id),
      mentorName: String(r.mentor_name),
      menteeEmail: String(r.mentee_email),
      status: String(r.status),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    })),
    summary: {
      totalMentors: mentorsResult.rows.length,
      activeMentorships: requestsResult.rows.filter((r: Record<string, unknown>) => r.status === "Active").length,
      pendingRequests: requestsResult.rows.filter((r: Record<string, unknown>) => r.status === "Pending").length,
    },
  };
}

export async function requestMentorship(mentorId: string, menteeEmail: string) {
  await ensureMentorshipTables();
  const normalized = menteeEmail.trim().toLowerCase();

  const mExists = await postgresPool.query(`SELECT id FROM mentor_profiles WHERE id = $1 AND is_active = true`, [mentorId]);
  if ((mExists.rowCount ?? 0) === 0) return { ok: false as const, reason: "Mentor not found or inactive." };

  try {
    await postgresPool.query(
      `INSERT INTO mentorship_requests (mentor_id, mentee_email, status) VALUES ($1, $2, 'Pending') ON CONFLICT (mentor_id, mentee_email) DO NOTHING`,
      [mentorId, normalized]
    );
    return { ok: true as const };
  } catch (err) {
    console.error("Mentorship request error", err);
    return { ok: false as const, reason: "Failed to submit request." };
  }
}
