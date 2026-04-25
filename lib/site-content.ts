import { postgresPool } from "@/lib/postgres";

let _siteTablesReady = false;
let _siteInitPromise: Promise<void> | null = null;

// ====== SEED DATA (inserted once, then served from DB) ======

const seedTeam = [
  { name: "Ashwani Kushwaha", role: "Lead Developer & Architect", batch: "2023", bio: "Passionate full-stack developer dedicated to building digital bridges for the JNV community.", image: "https://res.cloudinary.com/depbzbjfu/image/upload/v1768415795/portfolio/profile/file_gw6gka.jpg", github: "https://github.com/ashwanik0777", linkedin: "https://linkedin.com/in/ashwanik0777" },
];

const seedContacts = [
  { channel_type: "email", title: "Email Support", detail: "jnvfarrukhabad.alumni@gmail.com", note: "Best for detailed requests and document sharing", sort_order: 1 },
  { channel_type: "phone", title: "Help Desk", detail: "+91 90000 00000", note: "Mon - Sat, 10:00 AM to 6:00 PM", sort_order: 2 },
  { channel_type: "address", title: "Office Location", detail: "JNV Farrukhabad, Uttar Pradesh", note: "For official coordination and event meetings", sort_order: 3 },
];

const seedScholarshipRecipients = [
  { student: "Aditi Verma (Public Consent Shared)", scholarship: "Merit Excellence Scholarship", year: "2025", provider: "Aman Tiwari", amount: "INR 50,000" },
  { student: "Rohit Mishra (Public Consent Shared)", scholarship: "STEM Future Grant", year: "2025", provider: "Nidhi Sharma", amount: "INR 35,000" },
  { student: "Nidhi Chauhan (Public Consent Shared)", scholarship: "Community Impact Award", year: "2024", provider: "Ritika Verma", amount: "INR 25,000" },
];

const seedScholarshipTestimonials = [
  { quote: "The scholarship allowed me to focus entirely on my final year research without financial stress. I'm deeply grateful.", student: "Aditi Verma", note: "2025 Merit Recipient" },
  { quote: "Knowing that alumni invested in my future made me push harder. This community is genuinely impactful.", student: "Rohit Mishra", note: "2025 STEM Recipient" },
];

const seedDirectoryProfiles = [
  { slug: "aditi-verma", name: "Aditi Verma", batch: "2015", role: "Senior Software Engineer", company: "Microsoft", location: "Bengaluru", expertise: "Backend, Cloud Architecture", about: "Aditi works on distributed backend systems and helps teams design scalable cloud services.", contribution: "Supports coding interview preparation circles and mentors final-year students in backend fundamentals.", achievements: '["Led migration of critical services to cloud-native architecture","Mentored 40+ early career engineers","Speaker at two national developer conferences"]', mentorship_areas: '["Backend Development","System Design","Cloud Engineering"]' },
  { slug: "rohit-mishra", name: "Rohit Mishra", batch: "2012", role: "Product Manager", company: "Flipkart", location: "Mumbai", expertise: "Product Strategy, Growth", about: "Rohit leads product strategy for growth initiatives and data-driven user experience improvements.", contribution: "Conducts monthly product case workshops for alumni and students interested in PM roles.", achievements: '["Launched 3 high-impact product initiatives","Built cross-functional product playbook","Guest mentor for startup incubation cohorts"]', mentorship_areas: '["Product Management","Career Transition","Growth Strategy"]' },
  { slug: "sneha-dubey", name: "Sneha Dubey", batch: "2018", role: "Data Scientist", company: "Amazon", location: "Hyderabad", expertise: "ML, Analytics", about: "Sneha works on machine learning models for recommendation and business analytics pipelines.", contribution: "Helps scholarship applicants with data-science career planning and project reviews.", achievements: '["Published internal ML optimization framework","Improved model performance for production workflows","Mentored junior analysts in practical ML"]', mentorship_areas: '["Machine Learning","Analytics","Data Career Guidance"]' },
  { slug: "anurag-singh", name: "Anurag Singh", batch: "2010", role: "Founder", company: "EdTech Venture", location: "Delhi NCR", expertise: "Startups, Fundraising", about: "Anurag is building an education startup focused on access and outcomes for underserved learners.", contribution: "Supports entrepreneurship mentorship and helps early-stage founders validate ideas.", achievements: '["Raised seed funding for education startup","Built partnerships across school networks","Mentored student startup teams"]', mentorship_areas: '["Entrepreneurship","Fundraising","Leadership"]' },
  { slug: "nidhi-chauhan", name: "Nidhi Chauhan", batch: "2016", role: "UX Designer", company: "Adobe", location: "Pune", expertise: "Design Systems, Research", about: "Nidhi designs user-first digital products and contributes to enterprise design systems.", contribution: "Runs portfolio feedback sessions for students and design enthusiasts in the alumni network.", achievements: '["Created scalable design system components","Improved usability scores in major product areas","Panel mentor for design career events"]', mentorship_areas: '["UX Design","Portfolio Review","Design Research"]' },
  { slug: "kunal-saxena", name: "Kunal Saxena", batch: "2014", role: "DevOps Lead", company: "Infosys", location: "Noida", expertise: "Kubernetes, Platform Engineering", about: "Kunal leads platform reliability and deployment automation initiatives for large engineering teams.", contribution: "Guides learners on DevOps roadmaps and infrastructure fundamentals.", achievements: '["Designed CI/CD standards across multiple projects","Reduced deployment incidents through reliability practices","Facilitated DevOps bootcamps for juniors"]', mentorship_areas: '["DevOps","Infrastructure","Cloud Operations"]' },
];

const seedEventTimeline = [
  { month: "May 2026", milestone: "Regional chapter meetups begin in 5 cities", sort_order: 1 },
  { month: "July 2026", milestone: "Mentor matchmaking sessions and career circles", sort_order: 2 },
  { month: "September 2026", milestone: "Campus impact day and scholarship fundraiser", sort_order: 3 },
];

const seedCareerTracks = [
  { title: "Tech Roles", description: "Engineering, data, cloud, and platform opportunities from trusted alumni teams.", growth: "High Demand", focus: "Engineering, Data, Cloud", icon_name: "Briefcase", sort_order: 1 },
  { title: "Product & Strategy", description: "Openings across product management, analytics, consulting, and growth functions.", growth: "Fast Growth", focus: "Product, Analytics, Consulting", icon_name: "TrendingUp", sort_order: 2 },
  { title: "Design & Research", description: "User experience, visual design, and research positions in high-impact organizations.", growth: "Rising Opportunities", focus: "UX, Visual Design, Research", icon_name: "Compass", sort_order: 3 },
];

export async function ensureSiteContentTables() {
  if (_siteTablesReady) return;
  if (_siteInitPromise) { await _siteInitPromise; return; }

  _siteInitPromise = (async () => {
    try {
      // Team members
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS site_team (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          batch TEXT NOT NULL DEFAULT '',
          bio TEXT NOT NULL DEFAULT '',
          image TEXT NOT NULL DEFAULT '',
          github TEXT NOT NULL DEFAULT '',
          linkedin TEXT NOT NULL DEFAULT '',
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Contact channels
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS site_contacts (
          id BIGSERIAL PRIMARY KEY,
          channel_type TEXT NOT NULL DEFAULT 'email',
          title TEXT NOT NULL,
          detail TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Scholarship recipients (public page)
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS site_scholarship_recipients (
          id BIGSERIAL PRIMARY KEY,
          student TEXT NOT NULL,
          scholarship TEXT NOT NULL,
          year TEXT NOT NULL,
          provider TEXT NOT NULL,
          amount TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Scholarship testimonials (public page)
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS site_scholarship_testimonials (
          id BIGSERIAL PRIMARY KEY,
          quote TEXT NOT NULL,
          student TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Directory profiles (featured public profiles)
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS site_directory_profiles (
          id BIGSERIAL PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          batch TEXT NOT NULL,
          role TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT NOT NULL,
          expertise TEXT NOT NULL DEFAULT '',
          about TEXT NOT NULL DEFAULT '',
          contribution TEXT NOT NULL DEFAULT '',
          achievements JSONB DEFAULT '[]',
          mentorship_areas JSONB DEFAULT '[]',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Seed all tables
      await seedIfEmpty("site_team", seedTeam, ["name", "role", "batch", "bio", "image", "github", "linkedin"]);
      await seedIfEmpty("site_contacts", seedContacts, ["channel_type", "title", "detail", "note", "sort_order"]);
      await seedIfEmpty("site_scholarship_recipients", seedScholarshipRecipients, ["student", "scholarship", "year", "provider", "amount"]);
      await seedIfEmpty("site_scholarship_testimonials", seedScholarshipTestimonials, ["quote", "student", "note"]);
      await seedIfEmpty("site_directory_profiles", seedDirectoryProfiles, ["slug", "name", "batch", "role", "company", "location", "expertise", "about", "contribution", "achievements", "mentorship_areas"]);

      // Event timeline
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS site_event_timeline (
          id BIGSERIAL PRIMARY KEY,
          month TEXT NOT NULL,
          milestone TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await seedIfEmpty("site_event_timeline", seedEventTimeline, ["month", "milestone", "sort_order"]);

      // Career tracks (jobs page)
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS site_career_tracks (
          id BIGSERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          growth TEXT NOT NULL DEFAULT '',
          focus TEXT NOT NULL DEFAULT '',
          icon_name TEXT NOT NULL DEFAULT 'Briefcase',
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await seedIfEmpty("site_career_tracks", seedCareerTracks, ["title", "description", "growth", "focus", "icon_name", "sort_order"]);

      _siteTablesReady = true;
    } finally {
      _siteInitPromise = null;
    }
  })();

  await _siteInitPromise;
}

async function seedIfEmpty(table: string, rows: Record<string, unknown>[], cols: string[]) {
  const count = await postgresPool.query(`SELECT COUNT(*)::text AS c FROM ${table}`);
  if (Number(count.rows[0].c) > 0) return;
  for (const row of rows) {
    const vals = cols.map(c => row[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(",");
    await postgresPool.query(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`, vals);
  }
}

// ============ TEAM ============
export async function getActiveTeam() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, name, role, batch, bio, image, github, linkedin FROM site_team WHERE is_active = true ORDER BY sort_order ASC, id ASC`)).rows;
}
export async function getAllTeam() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, name, role, batch, bio, image, github, linkedin, is_active FROM site_team ORDER BY sort_order ASC, id ASC`)).rows;
}
export async function addTeamMember(p: Record<string, string>) {
  await ensureSiteContentTables();
  return (await postgresPool.query(`INSERT INTO site_team (name, role, batch, bio, image, github, linkedin) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id::text`, [p.name, p.role, p.batch || "", p.bio || "", p.image || "", p.github || "", p.linkedin || ""])).rows[0];
}
export async function deleteTeamMember(id: string) { await postgresPool.query(`DELETE FROM site_team WHERE id = $1`, [id]); }
export async function toggleTeamMember(id: string, active: boolean) { await postgresPool.query(`UPDATE site_team SET is_active = $1 WHERE id = $2`, [active, id]); }
export async function updateTeamMember(id: string, p: Record<string, string>) {
  await ensureSiteContentTables();
  await postgresPool.query(
    `UPDATE site_team SET name=$1, role=$2, batch=$3, bio=$4, image=$5, github=$6, linkedin=$7 WHERE id=$8`,
    [p.name, p.role, p.batch || "", p.bio || "", p.image || "", p.github || "", p.linkedin || "", id]
  );
}

// ============ CONTACTS ============
export async function getActiveContacts() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, channel_type, title, detail, note FROM site_contacts WHERE is_active = true ORDER BY sort_order ASC`)).rows;
}
export async function getAllContacts() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, channel_type, title, detail, note, is_active FROM site_contacts ORDER BY sort_order ASC`)).rows;
}
export async function addContact(p: Record<string, string>) {
  await ensureSiteContentTables();
  return (await postgresPool.query(`INSERT INTO site_contacts (channel_type, title, detail, note) VALUES ($1,$2,$3,$4) RETURNING id::text`, [p.channel_type || "email", p.title, p.detail, p.note || ""])).rows[0];
}
export async function deleteContact(id: string) { await postgresPool.query(`DELETE FROM site_contacts WHERE id = $1`, [id]); }
export async function toggleContact(id: string, active: boolean) { await postgresPool.query(`UPDATE site_contacts SET is_active = $1 WHERE id = $2`, [active, id]); }
export async function updateContact(id: string, p: Record<string, string>) {
  await ensureSiteContentTables();
  await postgresPool.query(
    `UPDATE site_contacts SET channel_type=$1, title=$2, detail=$3, note=$4 WHERE id=$5`,
    [p.channel_type || "email", p.title, p.detail, p.note || "", id]
  );
}

// ============ SCHOLARSHIP RECIPIENTS ============
export async function getActiveScholarshipRecipients() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, student, scholarship, year, provider, amount FROM site_scholarship_recipients WHERE is_active = true ORDER BY year DESC, id DESC`)).rows;
}
export async function getAllScholarshipRecipients() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, student, scholarship, year, provider, amount, is_active FROM site_scholarship_recipients ORDER BY year DESC, id DESC`)).rows;
}
export async function addScholarshipRecipient(p: Record<string, string>) {
  await ensureSiteContentTables();
  return (await postgresPool.query(`INSERT INTO site_scholarship_recipients (student, scholarship, year, provider, amount) VALUES ($1,$2,$3,$4,$5) RETURNING id::text`, [p.student, p.scholarship, p.year, p.provider, p.amount])).rows[0];
}
export async function deleteScholarshipRecipient(id: string) { await postgresPool.query(`DELETE FROM site_scholarship_recipients WHERE id = $1`, [id]); }

// ============ SCHOLARSHIP TESTIMONIALS ============
export async function getActiveScholarshipTestimonials() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, quote, student, note FROM site_scholarship_testimonials WHERE is_active = true ORDER BY id DESC`)).rows;
}
export async function getAllScholarshipTestimonials() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, quote, student, note, is_active FROM site_scholarship_testimonials ORDER BY id DESC`)).rows;
}

// ============ DIRECTORY PROFILES ============
export async function getActiveDirectoryProfiles() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, slug, name, batch, role, company, location, expertise, about, contribution, achievements, mentorship_areas FROM site_directory_profiles WHERE is_active = true ORDER BY name ASC`)).rows;
}
export async function getDirectoryProfileBySlug(slug: string) {
  await ensureSiteContentTables();
  const result = await postgresPool.query(`SELECT id::text, slug, name, batch, role, company, location, expertise, about, contribution, achievements, mentorship_areas FROM site_directory_profiles WHERE slug = $1 AND is_active = true`, [slug]);
  return result.rows[0] || null;
}
export async function getDirectoryFiltersFromSite() {
  await ensureSiteContentTables();
  const [batchRes, locRes, expRes] = await Promise.all([
    postgresPool.query(`SELECT DISTINCT batch FROM site_directory_profiles WHERE is_active = true ORDER BY batch DESC`),
    postgresPool.query(`SELECT DISTINCT location FROM site_directory_profiles WHERE is_active = true ORDER BY location`),
    postgresPool.query(`SELECT DISTINCT expertise FROM site_directory_profiles WHERE is_active = true ORDER BY expertise`),
  ]);
  return {
    batches: batchRes.rows.map(r => r.batch),
    locations: locRes.rows.map(r => r.location),
    domains: expRes.rows.map(r => r.expertise),
  };
}

// ============ EVENT TIMELINE ============
export async function getActiveEventTimeline() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, month, milestone, sort_order FROM site_event_timeline WHERE is_active = true ORDER BY sort_order ASC`)).rows;
}

// ============ CAREER TRACKS (Jobs page) ============
export async function getActiveCareerTracks() {
  await ensureSiteContentTables();
  return (await postgresPool.query(`SELECT id::text, title, description, growth, focus, icon_name, sort_order FROM site_career_tracks WHERE is_active = true ORDER BY sort_order ASC`)).rows;
}
