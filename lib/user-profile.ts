import { postgresPool } from "@/lib/postgres";

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
