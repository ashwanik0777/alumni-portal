import { postgresPool } from "@/lib/postgres";
import { randomBytes } from "node:crypto";

export type UserProfile = {
  id: string;
  profileType: "student" | "employed";
  fullName: string;
  email: string;
  passingYear: string;
  house: string;
  mobile: string;
  fatherName: string;
  city: string;
  state: string;
  country: string;
  bio: string;
  interests: string;
  linkedin: string;
  github: string;
  portfolio: string;
  certifications: string;
  languages: string;
  studentCourse: string;
  studentSpecialization: string;
  studentInstitution: string;
  studentYearOrSemester: string;
  studentExpectedGraduation: string;
  studentCgpa: string;
  studentGoals: string;
  jobTitle: string;
  companyName: string;
  employmentType: string;
  industry: string;
  experienceYears: string;
  workLocation: string;
  keySkills: string;
  achievements: string;
  createdAt: string;
  updatedAt: string;
  username: string | null;
  usernameChangesLeft: number;
};

let profileTableReady = false;
let profileTableInitPromise: Promise<void> | null = null;

export async function ensureUserProfileTable() {
  if (profileTableReady) return;
  if (profileTableInitPromise) { await profileTableInitPromise; return; }

  profileTableInitPromise = (async () => {
    try {
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id BIGSERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          profile_type TEXT NOT NULL DEFAULT 'student',
          full_name TEXT NOT NULL DEFAULT '',
          passing_year TEXT NOT NULL DEFAULT '',
          house TEXT NOT NULL DEFAULT '',
          mobile TEXT NOT NULL DEFAULT '',
          father_name TEXT NOT NULL DEFAULT '',
          city TEXT NOT NULL DEFAULT '',
          state TEXT NOT NULL DEFAULT '',
          country TEXT NOT NULL DEFAULT 'India',
          bio TEXT NOT NULL DEFAULT '',
          interests TEXT NOT NULL DEFAULT '',
          linkedin TEXT NOT NULL DEFAULT '',
          github TEXT NOT NULL DEFAULT '',
          portfolio TEXT NOT NULL DEFAULT '',
          certifications TEXT NOT NULL DEFAULT '',
          languages TEXT NOT NULL DEFAULT '',
          student_course TEXT NOT NULL DEFAULT '',
          student_specialization TEXT NOT NULL DEFAULT '',
          student_institution TEXT NOT NULL DEFAULT '',
          student_year_or_semester TEXT NOT NULL DEFAULT '',
          student_expected_graduation TEXT NOT NULL DEFAULT '',
          student_cgpa TEXT NOT NULL DEFAULT '',
          student_goals TEXT NOT NULL DEFAULT '',
          job_title TEXT NOT NULL DEFAULT '',
          company_name TEXT NOT NULL DEFAULT '',
          employment_type TEXT NOT NULL DEFAULT '',
          industry TEXT NOT NULL DEFAULT '',
          experience_years TEXT NOT NULL DEFAULT '',
          work_location TEXT NOT NULL DEFAULT '',
          key_skills TEXT NOT NULL DEFAULT '',
          achievements TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email)`);

      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username_changes_left INTEGER NOT NULL DEFAULT 2`);
      
      // User Settings Columns
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'alumni-only'`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_email BOOLEAN NOT NULL DEFAULT false`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_mobile BOOLEAN NOT NULL DEFAULT false`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_current_role BOOLEAN NOT NULL DEFAULT true`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_updates BOOLEAN NOT NULL DEFAULT true`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mentorship_notifications BOOLEAN NOT NULL DEFAULT true`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS jobs_notifications BOOLEAN NOT NULL DEFAULT true`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS events_notifications BOOLEAN NOT NULL DEFAULT true`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS message_notifications BOOLEAN NOT NULL DEFAULT true`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weekly_digest BOOLEAN NOT NULL DEFAULT true`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS compact_layout BOOLEAN NOT NULL DEFAULT true`);
      await postgresPool.query(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata'`);

      const existingCount = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM user_profiles`);
      if (Number(existingCount.rows[0]?.count || "0") === 0) {
        const seedProfiles = [
          {
            email: "aditi.verma@example.com",
            profile_type: "employed",
            full_name: "Aditi Verma",
            passing_year: "2015",
            house: "Arawali",
            mobile: "9876500123",
            father_name: "Suresh Verma",
            city: "Bengaluru",
            state: "Karnataka",
            country: "India",
            bio: "Aditi works on distributed backend systems and helps teams design scalable cloud services.",
            interests: "Supports coding interview preparation circles and mentors final-year students in backend fundamentals.",
            linkedin: "https://linkedin.com",
            github: "https://github.com",
            portfolio: "https://portfolio.com",
            certifications: "AWS Certified Solution Architect",
            languages: "English, Hindi",
            job_title: "Senior Software Engineer",
            company_name: "Microsoft",
            employment_type: "Full-time",
            industry: "IT/Software",
            experience_years: "8",
            work_location: "Bengaluru",
            key_skills: "Backend, Cloud Architecture",
            achievements: '["Led migration of critical services to cloud-native architecture","Mentored 40+ early career engineers","Speaker at two national developer conferences"]',
          },
          {
            email: "rohit.mishra@example.com",
            profile_type: "employed",
            full_name: "Rohit Mishra",
            passing_year: "2012",
            house: "Neelgiri",
            mobile: "9876500456",
            father_name: "Mahesh Singh",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            bio: "Rohit leads product strategy for growth initiatives and data-driven user experience improvements.",
            interests: "Conducts monthly product case workshops for alumni and students interested in PM roles.",
            linkedin: "https://linkedin.com",
            github: "https://github.com",
            portfolio: "https://portfolio.com",
            certifications: "Product Management Certificate",
            languages: "English, Hindi",
            job_title: "Product Manager",
            company_name: "Flipkart",
            employment_type: "Full-time",
            industry: "E-Commerce",
            experience_years: "11",
            work_location: "Mumbai",
            key_skills: "Product Strategy, Growth",
            achievements: '["Launched 3 high-impact product initiatives","Built cross-functional product playbook","Guest mentor for startup incubation cohorts"]',
          },
          {
            email: "sneha.dubey@example.com",
            profile_type: "employed",
            full_name: "Sneha Dubey",
            passing_year: "2018",
            house: "Shiwalik",
            mobile: "9876500789",
            father_name: "Irfan Khan",
            city: "Hyderabad",
            state: "Telangana",
            country: "India",
            bio: "Sneha works on machine learning models for recommendation and business analytics pipelines.",
            interests: "Helps scholarship applicants with data-science career planning and project reviews.",
            linkedin: "https://linkedin.com",
            github: "https://github.com",
            portfolio: "https://portfolio.com",
            certifications: "Coursera ML Specialist",
            languages: "English, Hindi",
            job_title: "Data Scientist",
            company_name: "Amazon",
            employment_type: "Full-time",
            industry: "IT/Software",
            experience_years: "5",
            work_location: "Hyderabad",
            key_skills: "ML, Analytics",
            achievements: '["Published internal ML optimization framework","Improved model performance for production workflows","Mentored junior analysts in practical ML"]',
          },
          {
            email: "anurag.singh@example.com",
            profile_type: "employed",
            full_name: "Anurag Singh",
            passing_year: "2010",
            house: "Arawali",
            mobile: "9876500222",
            father_name: "Kamal Sharma",
            city: "Delhi NCR",
            state: "Delhi",
            country: "India",
            bio: "Anurag is building an education startup focused on access and outcomes for underserved learners.",
            interests: "Supports entrepreneurship mentorship and helps early-stage founders validate ideas.",
            linkedin: "https://linkedin.com",
            github: "https://github.com",
            portfolio: "https://portfolio.com",
            certifications: "Executive Leadership Program",
            languages: "English, Hindi",
            job_title: "Founder",
            company_name: "EdTech Venture",
            employment_type: "Full-time",
            industry: "Education",
            experience_years: "14",
            work_location: "Delhi NCR",
            key_skills: "Startups, Fundraising",
            achievements: '["Raised seed funding for education startup","Built partnerships across school networks","Mentored student startup teams"]',
          },
          {
            email: "nidhi.chauhan@example.com",
            profile_type: "employed",
            full_name: "Nidhi Chauhan",
            passing_year: "2016",
            house: "Neelgiri",
            mobile: "9876500111",
            father_name: "Ramesh Chauhan",
            city: "Pune",
            state: "Maharashtra",
            country: "India",
            bio: "Nidhi designs user-first digital products and contributes to enterprise design systems.",
            interests: "Runs portfolio feedback sessions for students and design enthusiasts in the alumni network.",
            linkedin: "https://linkedin.com",
            github: "https://github.com",
            portfolio: "https://portfolio.com",
            certifications: "Nielsen Norman UX Specialist",
            languages: "English, Hindi",
            job_title: "UX Designer",
            company_name: "Adobe",
            employment_type: "Full-time",
            industry: "Design",
            experience_years: "7",
            work_location: "Pune",
            key_skills: "Design Systems, Research",
            achievements: '["Created scalable design system components","Improved usability scores in major product areas","Panel mentor for design career events"]',
          },
          {
            email: "kunal.saxena@example.com",
            profile_type: "employed",
            full_name: "Kunal Saxena",
            passing_year: "2014",
            house: "Shiwalik",
            mobile: "9876500333",
            father_name: "Ashok Saxena",
            city: "Noida",
            state: "UP",
            country: "India",
            bio: "Kunal leads platform reliability and deployment automation initiatives for large engineering teams.",
            interests: "Guides learners on DevOps roadmaps and infrastructure fundamentals.",
            linkedin: "https://linkedin.com",
            github: "https://github.com",
            portfolio: "https://portfolio.com",
            certifications: "CKA (Certified Kubernetes Admin)",
            languages: "English, Hindi",
            job_title: "DevOps Lead",
            company_name: "Infosys",
            employment_type: "Full-time",
            industry: "IT/Services",
            experience_years: "9",
            work_location: "Noida",
            key_skills: "Kubernetes, Platform Engineering",
            achievements: '["Designed CI/CD standards across multiple projects","Reduced deployment incidents through reliability practices","Facilitated DevOps bootcamps for juniors"]',
          },
        ];

        for (const p of seedProfiles) {
          await postgresPool.query(
            `
            INSERT INTO user_profiles (
              email, profile_type, full_name, passing_year, house, mobile, father_name,
              city, state, country, bio, interests, linkedin, github, portfolio,
              certifications, languages, job_title, company_name, employment_type,
              industry, experience_years, work_location, key_skills, achievements
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
            `,
            [
              p.email, p.profile_type, p.full_name, p.passing_year, p.house, p.mobile, p.father_name,
              p.city, p.state, p.country, p.bio, p.interests, p.linkedin, p.github, p.portfolio,
              p.certifications, p.languages, p.job_title, p.company_name, p.employment_type,
              p.industry, p.experience_years, p.work_location, p.key_skills, p.achievements
            ]
          );
        }
      }

      profileTableReady = true;
    } finally {
      profileTableInitPromise = null;
    }
  })();

  await profileTableInitPromise;
}

function mapRow(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id),
    profileType: (row.profile_type as string) === "employed" ? "employed" : "student",
    fullName: (row.full_name as string) || "",
    email: (row.email as string) || "",
    passingYear: (row.passing_year as string) || "",
    house: (row.house as string) || "",
    mobile: (row.mobile as string) || "",
    fatherName: (row.father_name as string) || "",
    city: (row.city as string) || "",
    state: (row.state as string) || "",
    country: (row.country as string) || "India",
    bio: (row.bio as string) || "",
    interests: (row.interests as string) || "",
    linkedin: (row.linkedin as string) || "",
    github: (row.github as string) || "",
    portfolio: (row.portfolio as string) || "",
    certifications: (row.certifications as string) || "",
    languages: (row.languages as string) || "",
    studentCourse: (row.student_course as string) || "",
    studentSpecialization: (row.student_specialization as string) || "",
    studentInstitution: (row.student_institution as string) || "",
    studentYearOrSemester: (row.student_year_or_semester as string) || "",
    studentExpectedGraduation: (row.student_expected_graduation as string) || "",
    studentCgpa: (row.student_cgpa as string) || "",
    studentGoals: (row.student_goals as string) || "",
    jobTitle: (row.job_title as string) || "",
    companyName: (row.company_name as string) || "",
    employmentType: (row.employment_type as string) || "",
    industry: (row.industry as string) || "",
    experienceYears: (row.experience_years as string) || "",
    workLocation: (row.work_location as string) || "",
    keySkills: (row.key_skills as string) || "",
    achievements: (row.achievements as string) || "",
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
    username: (row.username as string) || null,
    usernameChangesLeft: Number(row.username_changes_left ?? 2),
  };
}

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  await ensureUserProfileTable();
  const normalized = email.trim().toLowerCase();
  const result = await postgresPool.query(
    `SELECT * FROM user_profiles WHERE email = $1 LIMIT 1`,
    [normalized],
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export async function upsertUserProfile(email: string, data: Partial<Omit<UserProfile, "id" | "createdAt" | "updatedAt">>): Promise<UserProfile> {
  await ensureUserProfileTable();
  const normalized = email.trim().toLowerCase();

  const result = await postgresPool.query(
    `
    INSERT INTO user_profiles (
      email, profile_type, full_name, passing_year, house, mobile, father_name,
      city, state, country, bio, interests, linkedin, github, portfolio,
      certifications, languages, student_course, student_specialization,
      student_institution, student_year_or_semester, student_expected_graduation,
      student_cgpa, student_goals, job_title, company_name, employment_type,
      industry, experience_years, work_location, key_skills, achievements
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
    )
    ON CONFLICT (email)
    DO UPDATE SET
      profile_type = EXCLUDED.profile_type,
      full_name = EXCLUDED.full_name,
      passing_year = EXCLUDED.passing_year,
      house = EXCLUDED.house,
      mobile = EXCLUDED.mobile,
      father_name = EXCLUDED.father_name,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      country = EXCLUDED.country,
      bio = EXCLUDED.bio,
      interests = EXCLUDED.interests,
      linkedin = EXCLUDED.linkedin,
      github = EXCLUDED.github,
      portfolio = EXCLUDED.portfolio,
      certifications = EXCLUDED.certifications,
      languages = EXCLUDED.languages,
      student_course = EXCLUDED.student_course,
      student_specialization = EXCLUDED.student_specialization,
      student_institution = EXCLUDED.student_institution,
      student_year_or_semester = EXCLUDED.student_year_or_semester,
      student_expected_graduation = EXCLUDED.student_expected_graduation,
      student_cgpa = EXCLUDED.student_cgpa,
      student_goals = EXCLUDED.student_goals,
      job_title = EXCLUDED.job_title,
      company_name = EXCLUDED.company_name,
      employment_type = EXCLUDED.employment_type,
      industry = EXCLUDED.industry,
      experience_years = EXCLUDED.experience_years,
      work_location = EXCLUDED.work_location,
      key_skills = EXCLUDED.key_skills,
      achievements = EXCLUDED.achievements,
      updated_at = NOW()
    RETURNING *
    `,
    [
      normalized,
      data.profileType || "student",
      data.fullName || "",
      data.passingYear || "",
      data.house || "",
      data.mobile || "",
      data.fatherName || "",
      data.city || "",
      data.state || "",
      data.country || "India",
      data.bio || "",
      data.interests || "",
      data.linkedin || "",
      data.github || "",
      data.portfolio || "",
      data.certifications || "",
      data.languages || "",
      data.studentCourse || "",
      data.studentSpecialization || "",
      data.studentInstitution || "",
      data.studentYearOrSemester || "",
      data.studentExpectedGraduation || "",
      data.studentCgpa || "",
      data.studentGoals || "",
      data.jobTitle || "",
      data.companyName || "",
      data.employmentType || "",
      data.industry || "",
      data.experienceYears || "",
      data.workLocation || "",
      data.keySkills || "",
      data.achievements || "",
    ],
  );

  return mapRow(result.rows[0]);
}

export async function generateUniqueUsername(fullName: string): Promise<string> {
  const cleanName = fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
  // Take at most 5 characters, pad with 'x' if shorter than 3
  const prefix = (cleanName.padEnd(3, 'x') || "user").slice(0, 5);

  let attempts = 0;
  while (attempts < 10) {
    const suffixLength = 8 - prefix.length;
    const suffix = randomBytes(4).toString("hex").slice(0, suffixLength);
    const candidate = `${prefix}${suffix}`; // Total length: exactly 8 characters

    // Check if unique in user_profiles
    const check = await postgresPool.query(
      `SELECT 1 FROM user_profiles WHERE LOWER(username) = $1 LIMIT 1`,
      [candidate]
    );

    if (check.rowCount === 0) {
      return candidate;
    }
    attempts++;
  }

  // Absolute fallback
  return `${prefix}${Date.now().toString().slice(-3)}`;
}
