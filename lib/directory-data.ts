import { postgresPool } from "@/lib/postgres";
import { ensureUserProfileTable } from "@/lib/user-profile";

export async function getDirectoryProfiles(search?: string, batch?: string, domain?: string) {
  await ensureUserProfileTable();

  let query = `
    SELECT id::text, full_name, email, passing_year, city, job_title, company_name, profile_type, bio
    FROM user_profiles 
    WHERE 1=1
  `;
  const params: string[] = [];
  let paramCount = 1;

  if (search) {
    query += ` AND (full_name ILIKE $${paramCount} OR company_name ILIKE $${paramCount} OR job_title ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  if (batch && batch !== "All Batches") {
    // Basic batch filtering: '2010 - 2013'
    const parts = batch.split("-").map(p => p.trim());
    if (parts.length === 2) {
      query += ` AND passing_year >= $${paramCount} AND passing_year <= $${paramCount + 1}`;
      params.push(parts[0], parts[1]);
      paramCount += 2;
    } else {
      query += ` AND passing_year = $${paramCount}`;
      params.push(parts[0]);
      paramCount++;
    }
  }

  // A real domain filter might need a specific schema, but for now we search job_title/company
  if (domain && domain !== "All") {
    query += ` AND (job_title ILIKE $${paramCount} OR company_name ILIKE $${paramCount} OR bio ILIKE $${paramCount})`;
    params.push(`%${domain}%`);
    paramCount++;
  }

  query += ` ORDER BY passing_year DESC LIMIT 50`;

  const result = await postgresPool.query(query, params);
  
  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.full_name),
    email: String(row.email),
    batch: String(row.passing_year),
    location: String(row.city) || "Not specified",
    role: String(row.job_title) || (row.profile_type === 'student' ? 'Student' : 'Alumni'),
    company: String(row.company_name) || "Self/Institution",
    expertise: String(row.bio).slice(0, 50) + (String(row.bio).length > 50 ? '...' : '') || "General",
  }));
}

export async function getDirectoryFilters() {
  await ensureUserProfileTable();
  
  const result = await postgresPool.query(`SELECT DISTINCT passing_year FROM user_profiles WHERE passing_year != '' ORDER BY passing_year DESC`);
  const batches = result.rows.map(r => r.passing_year).filter(Boolean);
  
  return {
    batches: ["All Batches", ...batches],
    domains: ["All", "Engineering", "Product", "Design", "Data", "Founders", "Mentors"]
  };
}
