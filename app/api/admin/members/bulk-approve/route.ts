import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { bulkApprovePendingMembers } from "@/lib/admin-members";
import { postgresPool } from "@/lib/postgres";
import { hashPassword } from "@/lib/password";
import { ensureUserProfileTable, generateUniqueUsername } from "@/lib/user-profile";
import { sendMail, memberApprovedWithCredentialsTemplate } from "@/lib/mailer";
import { randomBytes } from "node:crypto";

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    // First get the pending members' info BEFORE bulk approving
    const pendingResult = await postgresPool.query<{
      email: string;
      full_name: string;
      passing_year: string;
      house: string;
      mobile: string;
      father_name: string;
    }>(`SELECT email, full_name, passing_year, house, mobile, father_name FROM admin_members WHERE status = 'Pending'`);

    const pendingMembers = pendingResult.rows;

    // Now run the bulk approve
    const updatedCount = await bulkApprovePendingMembers();

    // Asynchronously create auth accounts + user profiles + send emails
    if (pendingMembers.length > 0) {
      (async () => {
        try {
          await postgresPool.query(`ALTER TABLE auth_accounts ADD COLUMN IF NOT EXISTS must_set_password BOOLEAN NOT NULL DEFAULT FALSE`);
          await ensureUserProfileTable();

          for (const member of pendingMembers) {
            try {
              const tempPassword = randomBytes(4).toString("hex");
              const passwordHash = hashPassword(tempPassword);

              await postgresPool.query(
                `INSERT INTO auth_accounts (email, password_hash, first_name, roles, is_active, must_set_password)
                 VALUES ($1, $2, $3, ARRAY['user']::TEXT[], TRUE, TRUE)
                 ON CONFLICT (email) DO UPDATE SET
                   password_hash = $2,
                   first_name = $3,
                   is_active = TRUE,
                   must_set_password = TRUE,
                   updated_at = NOW()`,
                [member.email, passwordHash, member.full_name],
              );

              const autoUsername = await generateUniqueUsername(member.full_name);

              await postgresPool.query(
                `INSERT INTO user_profiles (email, full_name, passing_year, house, mobile, father_name, username)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (email) DO UPDATE SET
                   full_name = EXCLUDED.full_name,
                   passing_year = EXCLUDED.passing_year,
                   house = EXCLUDED.house,
                   mobile = EXCLUDED.mobile,
                   father_name = EXCLUDED.father_name,
                   username = COALESCE(user_profiles.username, EXCLUDED.username)`,
                [member.email, member.full_name, member.passing_year || "", member.house || "", member.mobile || "", member.father_name || "", autoUsername],
              );

              sendMail({
                to: member.email,
                subject: "Membership Approved — Your Login Credentials",
                html: memberApprovedWithCredentialsTemplate(member.full_name, member.email, tempPassword),
              }).catch((err) => console.error(`Bulk approve email error for ${member.email}:`, err));
            } catch (memberError) {
              console.error(`Error creating account for ${member.email}:`, memberError);
            }
          }
        } catch (batchError) {
          console.error("Bulk approve account creation error:", batchError);
        }
      })();
    }

    return NextResponse.json({ updatedCount });
  } catch (error) {
    console.error("Admin members bulk approve error", error);
    return NextResponse.json({ message: "Unable to run bulk approve." }, { status: 500 });
  }
}
