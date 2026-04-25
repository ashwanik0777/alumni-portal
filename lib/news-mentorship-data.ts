import { postgresPool } from "@/lib/postgres";

let _newsTablesReady = false;
let _newsInitPromise: Promise<void> | null = null;

const seedNews = [
  { title: "From Campus to Startup Founder", author: "Ananya Singh, Batch 2014", excerpt: "How a student innovation project became a funded startup creating impact in rural education." },
  { title: "Global Reunion 2026 Highlights", author: "Alumni Office", excerpt: "A snapshot of key moments, keynote sessions, and milestone announcements from this year's reunion." },
  { title: "Mentorship Stories That Changed Careers", author: "Community Team", excerpt: "Three mentees share how guidance from alumni mentors accelerated their confidence and career growth." },
];

const seedMentorshipTracks = [
  { title: "Career Mentorship", description: "Get role-specific guidance on interviews, transitions, and long-term career planning.", audience: "Students & Early Professionals", icon_name: "Briefcase", sort_order: 1 },
  { title: "Leadership Mentorship", description: "Learn decision making, stakeholder influence, and growth into senior leadership roles.", audience: "Mid-Career Alumni", icon_name: "Compass", sort_order: 2 },
  { title: "Startup Mentorship", description: "Work with founders and operators on idea validation, execution, and fundraising readiness.", audience: "Builders & Entrepreneurs", icon_name: "Lightbulb", sort_order: 3 },
];

const seedMentorshipSteps = [
  { title: "Share Your Goals", description: "Tell us your career stage, interests, and what outcomes you want from mentorship.", sort_order: 1 },
  { title: "Smart Mentor Match", description: "We pair you with relevant alumni mentors based on domain, role, and growth goals.", sort_order: 2 },
  { title: "Structured Sessions", description: "Follow a guided session plan with milestones, action items, and progress feedback.", sort_order: 3 },
  { title: "Continuous Growth", description: "Track outcomes and expand your network with peer circles and advanced mentor groups.", sort_order: 4 },
];

export async function ensureNewsTables() {
  if (_newsTablesReady) return;
  if (_newsInitPromise) { await _newsInitPromise; return; }

  _newsInitPromise = (async () => {
    try {
      // News / Stories table
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS news_stories (
          id BIGSERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          excerpt TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          published_at TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Mentorship Tracks table
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS mentorship_tracks (
          id BIGSERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          audience TEXT NOT NULL,
          icon_name TEXT NOT NULL DEFAULT 'Briefcase',
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Mentorship Steps/Process table
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS mentorship_steps (
          id BIGSERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Seed news
      const newsCount = await postgresPool.query(`SELECT COUNT(*)::text AS c FROM news_stories`);
      if (Number(newsCount.rows[0].c) === 0) {
        for (const n of seedNews) {
          await postgresPool.query(
            `INSERT INTO news_stories (title, author, excerpt) VALUES ($1, $2, $3)`,
            [n.title, n.author, n.excerpt]
          );
        }
      }

      // Seed mentorship tracks
      const tracksCount = await postgresPool.query(`SELECT COUNT(*)::text AS c FROM mentorship_tracks`);
      if (Number(tracksCount.rows[0].c) === 0) {
        for (const t of seedMentorshipTracks) {
          await postgresPool.query(
            `INSERT INTO mentorship_tracks (title, description, audience, icon_name, sort_order) VALUES ($1, $2, $3, $4, $5)`,
            [t.title, t.description, t.audience, t.icon_name, t.sort_order]
          );
        }
      }

      // Seed mentorship steps
      const stepsCount = await postgresPool.query(`SELECT COUNT(*)::text AS c FROM mentorship_steps`);
      if (Number(stepsCount.rows[0].c) === 0) {
        for (const s of seedMentorshipSteps) {
          await postgresPool.query(
            `INSERT INTO mentorship_steps (title, description, sort_order) VALUES ($1, $2, $3)`,
            [s.title, s.description, s.sort_order]
          );
        }
      }

      _newsTablesReady = true;
    } finally {
      _newsInitPromise = null;
    }
  })();

  await _newsInitPromise;
}

// ============ NEWS ============

export async function getActiveNews() {
  await ensureNewsTables();
  const result = await postgresPool.query(
    `SELECT id::text, title, author, excerpt, published_at::text FROM news_stories WHERE is_active = true ORDER BY published_at DESC`
  );
  return result.rows;
}

export async function getAllNews() {
  await ensureNewsTables();
  const result = await postgresPool.query(
    `SELECT id::text, title, author, excerpt, is_active, published_at::text FROM news_stories ORDER BY published_at DESC`
  );
  return result.rows;
}

export async function addNewsStory(payload: { title: string; author: string; excerpt: string }) {
  await ensureNewsTables();
  const result = await postgresPool.query(
    `INSERT INTO news_stories (title, author, excerpt) VALUES ($1, $2, $3) RETURNING id::text`,
    [payload.title.trim(), payload.author.trim(), payload.excerpt.trim()]
  );
  return { id: result.rows[0].id };
}

export async function deleteNewsStory(id: string) {
  await postgresPool.query(`DELETE FROM news_stories WHERE id = $1`, [id]);
  return { ok: true };
}

export async function toggleNewsStory(id: string, isActive: boolean) {
  await postgresPool.query(`UPDATE news_stories SET is_active = $1 WHERE id = $2`, [isActive, id]);
  return { ok: true };
}

export async function updateNewsStory(id: string, payload: { title: string; author: string; excerpt: string }) {
  await postgresPool.query(
    `UPDATE news_stories SET title = $1, author = $2, excerpt = $3 WHERE id = $4`,
    [payload.title.trim(), payload.author.trim(), payload.excerpt.trim(), id]
  );
  return { ok: true };
}

// ============ MENTORSHIP TRACKS ============

export async function getActiveMentorshipTracks() {
  await ensureNewsTables();
  const result = await postgresPool.query(
    `SELECT id::text, title, description, audience, icon_name, sort_order FROM mentorship_tracks WHERE is_active = true ORDER BY sort_order ASC`
  );
  return result.rows;
}

export async function getAllMentorshipTracks() {
  await ensureNewsTables();
  const result = await postgresPool.query(
    `SELECT id::text, title, description, audience, icon_name, sort_order, is_active FROM mentorship_tracks ORDER BY sort_order ASC`
  );
  return result.rows;
}

// ============ MENTORSHIP STEPS ============

export async function getActiveMentorshipSteps() {
  await ensureNewsTables();
  const result = await postgresPool.query(
    `SELECT id::text, title, description, sort_order FROM mentorship_steps WHERE is_active = true ORDER BY sort_order ASC`
  );
  return result.rows;
}

// ============ MENTORSHIP STATS (computed from DB) ============

export async function getMentorshipStats() {
  await ensureNewsTables();
  // Real counts from DB
  const [sessionsRes, mentorsRes, completedRes, totalRes] = await Promise.all([
    postgresPool.query(`SELECT COUNT(*)::text AS c FROM mentorship_applications WHERE status IN ('Active', 'Completed')`),
    postgresPool.query(`SELECT COUNT(*)::text AS c FROM admin_mentors WHERE status = 'Approved'`),
    postgresPool.query(`SELECT COUNT(*)::text AS c FROM mentorship_applications WHERE status = 'Completed'`),
    postgresPool.query(`SELECT COUNT(*)::text AS c FROM mentorship_applications`),
  ]);

  const sessions = Number(sessionsRes.rows[0]?.c || 0);
  const mentors = Number(mentorsRes.rows[0]?.c || 0);
  const completed = Number(completedRes.rows[0]?.c || 0);
  const total = Number(totalRes.rows[0]?.c || 0);
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return [
    { value: `${sessions}+`, label: "Mentorship sessions" },
    { value: `${mentors}+`, label: "Active mentors" },
    { value: `${rate}%`, label: "Goal completion rate" },
  ];
}
