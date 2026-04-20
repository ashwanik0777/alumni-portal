import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { hashPassword, verifyPassword } from "@/lib/password";

const SEEDED_EMAIL = "admin@jnvportal.in";
const SEEDED_PASSWORD = "admin123";
const SEEDED_FIRST_NAME = "Admin";
const SEEDED_ROLES = ["admin", "user"];

async function ensureAuthTableAndSeed() {
  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS auth_accounts (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      roles TEXT[] NOT NULL DEFAULT ARRAY['user']::TEXT[],
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const existing = await postgresPool.query<{ id: number; password_hash: string }>(
    `SELECT id, password_hash FROM auth_accounts WHERE email = $1 LIMIT 1`,
    [SEEDED_EMAIL],
  );

  if (existing.rowCount === 0) {
    const passwordHash = hashPassword(SEEDED_PASSWORD);
    await postgresPool.query(
      `
      INSERT INTO auth_accounts (email, password_hash, first_name, roles, is_active)
      VALUES ($1, $2, $3, $4, TRUE)
      `,
      [SEEDED_EMAIL, passwordHash, SEEDED_FIRST_NAME, SEEDED_ROLES],
    );
    return;
  }

  const current = existing.rows[0];
  const passwordMatches = verifyPassword(SEEDED_PASSWORD, current.password_hash);

  if (!passwordMatches) {
    await postgresPool.query(
      `
      UPDATE auth_accounts
      SET password_hash = $2,
          first_name = $3,
          roles = $4,
          is_active = TRUE,
          updated_at = NOW()
      WHERE email = $1
      `,
      [SEEDED_EMAIL, hashPassword(SEEDED_PASSWORD), SEEDED_FIRST_NAME, SEEDED_ROLES],
    );
    return;
  }

  await postgresPool.query(
    `
    UPDATE auth_accounts
    SET first_name = $2,
        roles = $3,
        is_active = TRUE,
        updated_at = NOW()
    WHERE email = $1
    `,
    [SEEDED_EMAIL, SEEDED_FIRST_NAME, SEEDED_ROLES],
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    await ensureAuthTableAndSeed();

    const accountResult = await postgresPool.query<{
      email: string;
      password_hash: string;
      first_name: string;
      roles: string[];
      is_active: boolean;
    }>(
      `
      SELECT email, password_hash, first_name, roles, is_active
      FROM auth_accounts
      WHERE email = $1
      LIMIT 1
      `,
      [email],
    );

    if (accountResult.rowCount === 0) {
      return NextResponse.json({ message: "Only the configured admin credential is allowed." }, { status: 401 });
    }

    const account = accountResult.rows[0];

    if (!account.is_active) {
      return NextResponse.json({ message: "Account is inactive." }, { status: 403 });
    }

    const isPasswordValid = verifyPassword(password, account.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid password." }, { status: 401 });
    }

    const allowedRoles = account.roles.filter((role) => role === "admin" || role === "user");

    if (allowedRoles.length === 0) {
      return NextResponse.json({ message: "No allowed roles found for this account." }, { status: 403 });
    }

    return NextResponse.json({
      message: "Login validated.",
      user: {
        email: account.email,
        firstName: account.first_name,
        roles: allowedRoles,
      },
    });
  } catch (error) {
    console.error("Login API error", error);
    return NextResponse.json({ message: "Unable to process login right now." }, { status: 500 });
  }
}
