import { postgresPool } from "@/lib/postgres";

export async function ensureMentorshipTables() {
  const client = await postgresPool.connect();
  try {
    // Mentors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_mentors (
        id BIGSERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        expertise TEXT NOT NULL,
        max_mentees INTEGER DEFAULT 1,
        status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Mentorship Applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mentorship_applications (
        id BIGSERIAL PRIMARY KEY,
        mentee_email TEXT NOT NULL,
        mentee_name TEXT NOT NULL,
        current_stage TEXT NOT NULL,
        track TEXT NOT NULL,
        goal TEXT NOT NULL,
        urgency TEXT NOT NULL,
        status TEXT DEFAULT 'Pending', -- Pending, Assigned, Active, Completed, Closed
        mentor_email TEXT, -- Assigned mentor
        mentee_started BOOLEAN DEFAULT false,
        mentor_started BOOLEAN DEFAULT false,
        mentee_completed BOOLEAN DEFAULT false,
        mentor_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
}
