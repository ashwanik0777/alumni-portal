import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ensureSecurityTables, createSession } from "@/lib/user-security";
import { sendMail } from "@/lib/mailer";

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
      must_set_password BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Add must_set_password column if table already existed without it
  await postgresPool.query(`ALTER TABLE auth_accounts ADD COLUMN IF NOT EXISTS must_set_password BOOLEAN NOT NULL DEFAULT FALSE`);
  
  // Ensure security-related tables are created/altered
  await ensureSecurityTables();

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
      must_set_password: boolean;
      two_factor_enabled: boolean;
    }>(
      `
      SELECT email, password_hash, first_name, roles, is_active, must_set_password, two_factor_enabled
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

    // Two-factor Authentication Check
    if (account.two_factor_enabled) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await postgresPool.query(
        `UPDATE auth_accounts 
         SET two_factor_otp = $1, two_factor_otp_expiry = $2 
         WHERE email = $3`,
        [otpCode, expiry, account.email]
      );

      try {
        await sendMail({
          to: account.email,
          subject: "Your Two-Factor Authentication (2FA) Code - JNV Alumni Portal",
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1E348A; font-size: 24px; margin: 0; font-weight: 700;">JNV Alumni Portal</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Security Verification</p>
              </div>
              <h2 style="color: #334155; font-size: 20px; font-weight: 600; margin-top: 0;">Two-Factor Authentication</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello ${account.first_name || "Alumni"},</p>
              <p style="color: #475569; font-size: 15px; line-height: 1.6;">You are logging into your JNV Alumni Portal account. Please use the verification code below to authorize your session:</p>
              <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; text-align: center; margin: 35px 0; color: #1e3a8a; background-color: #eff6ff; padding: 20px; border-radius: 8px; border: 1px dashed #bfdbfe;">
                ${otpCode}
              </div>
              <p style="color: #ef4444; font-size: 13px; line-height: 1.5; font-weight: 500;">This code is valid for 10 minutes. Do not share it with anyone.</p>
              <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 20px;">If you did not initiate this login request, please reset your password immediately to secure your account.</p>
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">This is an automated security message. Please do not reply to this email.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error("Failed to send 2FA OTP email", mailError);
        // Still proceed so user doesn't get completely locked out if nodemailer fails momentarily,
        // or return error. Let's return error to notify them.
        return NextResponse.json({ message: "Failed to send 2FA verification email. Please try again." }, { status: 500 });
      }

      return NextResponse.json({
        twoFactorRequired: true,
        email: account.email,
        message: "Two-factor verification required. Code sent to your email.",
      });
    }

    // Session Creation
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || (request as any).ip || "127.0.0.1";
    const authToken = await createSession(account.email, userAgent, ipAddress);

    return NextResponse.json({
      message: "Login validated.",
      authToken,
      user: {
        email: account.email,
        firstName: account.first_name,
        roles: allowedRoles,
        mustSetPassword: account.must_set_password || false,
      },
    });
  } catch (error) {
    console.error("Login API error", error);
    return NextResponse.json({ message: "Unable to process login right now." }, { status: 500 });
  }
}
