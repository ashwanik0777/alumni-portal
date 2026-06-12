import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { sendMail, mentorAssignmentEmailTemplate } from "@/lib/mailer";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, mentor_email } = body;

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    let result;
    if (mentor_email !== undefined) {
      result = await postgresPool.query(
        `UPDATE mentorship_applications SET status = $1, mentor_email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
        [status, mentor_email, id]
      );
    } else {
      result = await postgresPool.query(
        `UPDATE mentorship_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [status, id]
      );
    }

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 });
    }

    const application = result.rows[0];

    // Send email to mentor when a mentee is assigned
    if (status === "Assigned" && mentor_email) {
      try {
        // Fetch mentor's name from admin_mentors
        const mentorResult = await postgresPool.query<{ full_name: string }>(
          `SELECT full_name FROM admin_mentors WHERE email = $1 LIMIT 1`,
          [mentor_email]
        );
        const mentorName = mentorResult.rows[0]?.full_name || mentor_email.split("@")[0];

        const html = mentorAssignmentEmailTemplate({
          mentorName,
          menteeName: application.mentee_name || "N/A",
          menteeEmail: application.mentee_email || "N/A",
          menteePhone: application.mentee_phone || "",
          menteeTrack: application.track || "N/A",
          menteeStage: application.current_stage || "N/A",
          menteeGoal: application.goal || "N/A",
          menteeUrgency: application.urgency || "Flexible",
        });

        await sendMail({
          to: mentor_email,
          subject: `New Mentee Assigned — ${application.mentee_name}`,
          html,
        });
      } catch (mailError) {
        console.error("Failed to send mentor assignment email:", mailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ message: "Application updated successfully", application });
  } catch (error) {
    console.error("Admin mentorship applications PATCH error:", error);
    return NextResponse.json({ message: "Failed to update application" }, { status: 500 });
  }
}
