import { postgresPool } from "@/lib/postgres";
import crypto from "node:crypto";

let securityTablesReady = false;
let securityTablesInitPromise: Promise<void> | null = null;

export async function ensureSecurityTables() {
  if (securityTablesReady) return;
  if (securityTablesInitPromise) {
    await securityTablesInitPromise;
    return;
  }

  securityTablesInitPromise = (async () => {
    try {
      // 1. Create user_sessions table
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id BIGSERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          session_token TEXT NOT NULL UNIQUE,
          user_agent TEXT NOT NULL,
          ip_address TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      // 2. Create blocked_users table
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS blocked_users (
          id BIGSERIAL PRIMARY KEY,
          blocker_email TEXT NOT NULL,
          blocked_email TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(blocker_email, blocked_email)
        )
      `);

      // 3. Alter auth_accounts table to support 2FA columns
      await postgresPool.query(`
        ALTER TABLE auth_accounts 
        ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE
      `);

      await postgresPool.query(`
        ALTER TABLE auth_accounts 
        ADD COLUMN IF NOT EXISTS two_factor_otp TEXT
      `);

      await postgresPool.query(`
        ALTER TABLE auth_accounts 
        ADD COLUMN IF NOT EXISTS two_factor_otp_expiry TIMESTAMPTZ
      `);

      securityTablesReady = true;
    } catch (error) {
      console.error("Failed to initialize security tables:", error);
      securityTablesInitPromise = null;
      throw error;
    }
  })();

  await securityTablesInitPromise;
}

// --- SESSION MANAGEMENT ---

export async function createSession(
  email: string,
  userAgent: string,
  ipAddress: string
): Promise<string> {
  await ensureSecurityTables();
  const token = crypto.randomBytes(32).toString("hex");

  await postgresPool.query(
    `INSERT INTO user_sessions (email, session_token, user_agent, ip_address)
     VALUES ($1, $2, $3, $4)`,
    [email.trim().toLowerCase(), token, userAgent || "Unknown", ipAddress || "Unknown"]
  );

  return token;
}

export async function validateSession(email: string, token: string): Promise<boolean> {
  await ensureSecurityTables();
  if (!email || !token) return false;

  const result = await postgresPool.query(
    `SELECT is_active FROM user_sessions 
     WHERE email = $1 AND session_token = $2 LIMIT 1`,
    [email.trim().toLowerCase(), token]
  );

  if ((result.rowCount ?? 0) === 0) return false;

  const session = result.rows[0];
  if (!session.is_active) return false;

  // Update last active timestamp asynchronously
  postgresPool.query(
    `UPDATE user_sessions SET last_active = NOW() WHERE session_token = $1`,
    [token]
  ).catch(err => console.error("Failed to update last_active for session", err));

  return true;
}

export async function revokeSession(email: string, token: string): Promise<void> {
  await ensureSecurityTables();
  await postgresPool.query(
    `UPDATE user_sessions SET is_active = FALSE 
     WHERE email = $1 AND session_token = $2`,
    [email.trim().toLowerCase(), token]
  );
}

export async function revokeSessionById(email: string, sessionId: string | number): Promise<void> {
  await ensureSecurityTables();
  await postgresPool.query(
    `UPDATE user_sessions SET is_active = FALSE 
     WHERE email = $1 AND id = $2`,
    [email.trim().toLowerCase(), sessionId]
  );
}

export async function revokeAllSessions(email: string): Promise<void> {
  await ensureSecurityTables();
  await postgresPool.query(
    `UPDATE user_sessions SET is_active = FALSE 
     WHERE email = $1`,
    [email.trim().toLowerCase()]
  );
}

export async function getActiveSessions(email: string): Promise<any[]> {
  await ensureSecurityTables();
  const result = await postgresPool.query(
    `SELECT id, session_token, user_agent, ip_address, created_at, last_active, is_active
     FROM user_sessions
     WHERE email = $1 AND is_active = TRUE
     ORDER BY last_active DESC`,
    [email.trim().toLowerCase()]
  );
  return result.rows;
}

// --- BLOCKED USERS ---

export async function blockUser(blockerEmail: string, blockedEmail: string): Promise<void> {
  await ensureSecurityTables();
  const blocker = blockerEmail.trim().toLowerCase();
  const blocked = blockedEmail.trim().toLowerCase();
  
  if (blocker === blocked) {
    throw new Error("You cannot block yourself.");
  }

  // Insert or do nothing if already exists
  await postgresPool.query(
    `INSERT INTO blocked_users (blocker_email, blocked_email)
     VALUES ($1, $2)
     ON CONFLICT (blocker_email, blocked_email) DO NOTHING`,
    [blocker, blocked]
  );
}

export async function unblockUser(blockerEmail: string, blockedEmail: string): Promise<void> {
  await ensureSecurityTables();
  await postgresPool.query(
    `DELETE FROM blocked_users 
     WHERE blocker_email = $1 AND blocked_email = $2`,
    [blockerEmail.trim().toLowerCase(), blockedEmail.trim().toLowerCase()]
  );
}

export async function getBlockedUsers(blockerEmail: string): Promise<any[]> {
  await ensureSecurityTables();
  // We want to return list of blocked users with details if possible, or just the email.
  // We can join with user_profiles to get the name/avatar or just display the emails.
  const result = await postgresPool.query(
    `SELECT b.blocked_email, p.full_name 
     FROM blocked_users b
     LEFT JOIN user_profiles p ON p.email = b.blocked_email
     WHERE b.blocker_email = $1
     ORDER BY b.created_at DESC`,
    [blockerEmail.trim().toLowerCase()]
  );
  return result.rows;
}

export async function isBlocked(emailA: string, emailB: string): Promise<boolean> {
  await ensureSecurityTables();
  const a = emailA.trim().toLowerCase();
  const b = emailB.trim().toLowerCase();

  const result = await postgresPool.query(
    `SELECT id FROM blocked_users 
     WHERE (blocker_email = $1 AND blocked_email = $2)
        OR (blocker_email = $2 AND blocked_email = $1)
     LIMIT 1`,
    [a, b]
  );

  return (result.rowCount ?? 0) > 0;
}
