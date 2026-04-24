import { postgresPool } from "@/lib/postgres";

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: string;
  type: string;
  salary: string;
  description: string;
  postedBy: string;
  postedAt: string;
  isActive: boolean;
};

export type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicantEmail: string;
  stage: string;
  appliedAt: string;
  updatedAt: string;
};

let jobsTableReady = false;
let jobsTableInitPromise: Promise<void> | null = null;

const seedJobs: Array<Omit<JobListing, "id" | "postedAt">> = [
  { title: "Frontend Engineer", company: "PixelNest Labs", location: "Bengaluru", mode: "Hybrid", type: "Full-time", salary: "12-18 LPA", description: "Build modern web applications using React and Next.js", postedBy: "ritika.verma@example.com", isActive: true },
  { title: "Product Analyst", company: "ScaleBridge", location: "Gurugram", mode: "Onsite", type: "Full-time", salary: "10-14 LPA", description: "Drive product analytics and growth insights", postedBy: "arjun.singh@example.com", isActive: true },
  { title: "Data Engineer", company: "InsightGrid", location: "Remote", mode: "Remote", type: "Full-time", salary: "14-20 LPA", description: "Design and maintain large-scale data pipelines", postedBy: "sana.khan@example.com", isActive: true },
  { title: "Backend Developer", company: "CloudSprint", location: "Noida", mode: "Hybrid", type: "Full-time", salary: "15-22 LPA", description: "Build scalable microservices and APIs", postedBy: "aman.chaturvedi@example.com", isActive: true },
  { title: "UX Design Intern", company: "BlueOrbit", location: "Hyderabad", mode: "Onsite", type: "Internship", salary: "25K/month", description: "Work on user research and interface design", postedBy: "meenal.sharma@example.com", isActive: true },
];

async function ensureJobsTables() {
  if (jobsTableReady) return;
  if (jobsTableInitPromise) { await jobsTableInitPromise; return; }

  jobsTableInitPromise = (async () => {
    try {
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

      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS job_applications (
          id BIGSERIAL PRIMARY KEY,
          job_id BIGINT NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
          applicant_email TEXT NOT NULL,
          stage TEXT NOT NULL DEFAULT 'Applied',
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT job_app_stage_check CHECK (stage IN ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')),
          CONSTRAINT job_app_unique UNIQUE (job_id, applicant_email)
        )
      `);

      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_job_listings_active ON job_listings(is_active)`);
      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_job_apps_email ON job_applications(applicant_email)`);
      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_job_apps_job_id ON job_applications(job_id)`);

      const count = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM job_listings`);
      if (Number(count.rows[0]?.count || "0") === 0) {
        for (const job of seedJobs) {
          await postgresPool.query(
            `INSERT INTO job_listings (title, company, location, mode, type, salary, description, posted_by, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [job.title, job.company, job.location, job.mode, job.type, job.salary, job.description, job.postedBy, job.isActive],
          );
        }
      }

      jobsTableReady = true;
    } finally {
      jobsTableInitPromise = null;
    }
  })();

  await jobsTableInitPromise;
}

export async function getJobsDashboard(userEmail: string) {
  await ensureJobsTables();
  const normalized = userEmail.trim().toLowerCase();

  const [jobsResult, appsResult, pipelineResult] = await Promise.all([
    postgresPool.query(
      `SELECT id::text, title, company, location, mode, type, salary, description, posted_by, is_active, posted_at::text FROM job_listings WHERE is_active = true ORDER BY posted_at DESC LIMIT 20`,
    ),
    postgresPool.query(
      `SELECT a.id::text, a.job_id::text, j.title AS job_title, j.company, a.applicant_email, a.stage, a.applied_at::text, a.updated_at::text
       FROM job_applications a JOIN job_listings j ON j.id = a.job_id
       WHERE a.applicant_email = $1 ORDER BY a.updated_at DESC`,
      [normalized],
    ),
    postgresPool.query<{ stage: string; count: string }>(
      `SELECT stage, COUNT(*)::text AS count FROM job_applications WHERE applicant_email = $1 GROUP BY stage`,
      [normalized],
    ),
  ]);

  const pipeline: Record<string, number> = { Saved: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
  for (const row of pipelineResult.rows) {
    pipeline[row.stage] = Number(row.count || "0");
  }

  const appliedJobIds = new Set(appsResult.rows.map((r: Record<string, unknown>) => String(r.job_id)));

  return {
    jobs: jobsResult.rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      title: String(r.title),
      company: String(r.company),
      location: String(r.location),
      mode: String(r.mode),
      type: String(r.type),
      salary: String(r.salary),
      description: String(r.description),
      postedBy: String(r.posted_by),
      postedAt: String(r.posted_at),
      isActive: Boolean(r.is_active),
      hasApplied: appliedJobIds.has(String(r.id)),
    })),
    applications: appsResult.rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      jobId: String(r.job_id),
      jobTitle: String(r.job_title),
      company: String(r.company),
      applicantEmail: String(r.applicant_email),
      stage: String(r.stage),
      appliedAt: String(r.applied_at),
      updatedAt: String(r.updated_at),
    })),
    pipeline,
    summary: {
      totalJobs: jobsResult.rows.length,
      totalApplications: appsResult.rows.length,
      interviewCount: pipeline.Interview || 0,
      offerCount: pipeline.Offer || 0,
    },
  };
}

export async function applyToJob(jobId: string, applicantEmail: string) {
  await ensureJobsTables();
  const normalized = applicantEmail.trim().toLowerCase();
  const numericId = jobId.replace(/^J-/, "");

  const jobExists = await postgresPool.query(`SELECT id FROM job_listings WHERE id = $1 AND is_active = true`, [numericId]);
  if ((jobExists.rowCount ?? 0) === 0) return { ok: false as const, reason: "Job not found or inactive." };

  try {
    await postgresPool.query(
      `INSERT INTO job_applications (job_id, applicant_email, stage) VALUES ($1, $2, 'Applied') ON CONFLICT (job_id, applicant_email) DO NOTHING`,
      [numericId, normalized],
    );
    return { ok: true as const };
  } catch (err) {
    console.error("Apply to job error", err);
    return { ok: false as const, reason: "Failed to apply." };
  }
}
