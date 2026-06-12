import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { MemberStatus, updateAdminMemberStatus } from "@/lib/admin-members";
import { sendMail, memberStatusEmailTemplate, memberApprovedWithCredentialsTemplate } from "@/lib/mailer";
import { postgresPool } from "@/lib/postgres";
import { hashPassword } from "@/lib/password";
import { ensureUserProfileTable, generateUniqueUsername } from "@/lib/user-profile";
import { randomBytes } from "node:crypto";

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

const allowedStatuses = new Set<MemberStatus>(["Pending", "Approved", "Rejected", "Needs Info"]);

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { memberId } = await context.params;
    const body = (await request.json()) as { status?: MemberStatus; rejectionReason?: string };

    if (!body.status || !allowedStatuses.has(body.status)) {
      return NextResponse.json({ message: "Valid status is required." }, { status: 400 });
    }

    if (body.status === "Rejected" && !body.rejectionReason?.trim()) {
      return NextResponse.json({ message: "Rejection reason is required for rejected status." }, { status: 400 });
    }

    const updated = await updateAdminMemberStatus({
      memberId,
      status: body.status,
      rejectionReason: body.rejectionReason,
    });

    if (!updated) {
      return NextResponse.json({ message: "Member not found." }, { status: 404 });
    }

    // On Approval: create auth account + user profile + send credentials email
    if (body.status === "Approved" && updated.email) {
      try {
        // Generate temporary password
        const tempPassword = randomBytes(4).toString("hex");
        const passwordHash = hashPassword(tempPassword);

        // Ensure must_set_password column exists
        await postgresPool.query(`ALTER TABLE auth_accounts ADD COLUMN IF NOT EXISTS must_set_password BOOLEAN NOT NULL DEFAULT FALSE`);

        // Create auth account with temp password (or update if exists)
        await postgresPool.query(
          `INSERT INTO auth_accounts (email, password_hash, first_name, roles, is_active, must_set_password)
           VALUES ($1, $2, $3, ARRAY['user']::TEXT[], TRUE, TRUE)
           ON CONFLICT (email) DO UPDATE SET
             password_hash = $2,
             first_name = $3,
             is_active = TRUE,
             must_set_password = TRUE,
             updated_at = NOW()`,
          [updated.email, passwordHash, updated.fullName],
        );

        const autoUsername = await generateUniqueUsername(updated.fullName);

        // Create user profile so stats count increases
        await ensureUserProfileTable();
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
          [updated.email, updated.fullName, updated.passingYear || "", updated.house || "", updated.mobile || "", updated.fatherName || "", autoUsername],
        );

        // Send email with credentials
        sendMail({
          to: updated.email,
          subject: "Membership Approved — Your Login Credentials",
          html: memberApprovedWithCredentialsTemplate(updated.fullName, updated.email, tempPassword),
        }).catch((err) => console.error("Approved credentials email error:", err));
      } catch (accountError) {
        console.error("Error creating auth account on approval:", accountError);
      }
    } else if ((body.status === "Rejected" || body.status === "Needs Info") && updated.email) {
      sendMail({
        to: updated.email,
        subject: `Membership Update — ${body.status}`,
        html: memberStatusEmailTemplate(updated.fullName, body.status as "Rejected" | "Needs Info", body.rejectionReason),
      }).catch((err) => console.error("Member status email error:", err));
    }

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error("Admin member PATCH error", error);
    return NextResponse.json({ message: "Unable to update member." }, { status: 500 });
  }
}
