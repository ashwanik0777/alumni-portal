import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { ensureMentorshipTables } from "@/lib/mentorship";
import { deleteMessagesForApplication } from "@/lib/mentorship-chat";

export async function GET(request: NextRequest) {
  const denial = await requireUserApiAccess(request);
  if (denial) return denial;

  try {
    await ensureMentorshipTables();

    const email = request.cookies.get("auth_email")?.value;
    if (!email) {
      return NextResponse.json({ message: "User not identified" }, { status: 401 });
    }

    // Check if user is an approved mentor
    const checkMentor = await postgresPool.query(
      `SELECT * FROM admin_mentors WHERE email = $1 AND status = 'Approved'`,
      [email]
    );

    if (!checkMentor.rowCount || checkMentor.rowCount === 0) {
      return NextResponse.json({ message: "Not an approved mentor", applications: [] }, { status: 403 });
    }

    const result = await postgresPool.query(
      `SELECT * FROM mentorship_applications WHERE mentor_email = $1 ORDER BY created_at DESC`,
      [email]
    );

    return NextResponse.json({
      applications: result.rows,
      isMentor: true,
      mentorProfile: checkMentor.rows[0],
    });
  } catch (error) {
    console.error("User mentor GET error:", error);
    return NextResponse.json({ message: "Failed to fetch mentees" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const denial = await requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const email = request.cookies.get("auth_email")?.value;
    if (!email) {
      return NextResponse.json({ message: "User not identified" }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ message: "ID and action are required" }, { status: 400 });
    }

    let fieldToUpdate = "";
    if (action === "start") fieldToUpdate = "mentor_started = true";
    else if (action === "complete") fieldToUpdate = "mentor_completed = true";
    else return NextResponse.json({ message: "Invalid action" }, { status: 400 });

    const result = await postgresPool.query(
      `UPDATE mentorship_applications SET ${fieldToUpdate}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND mentor_email = $2 RETURNING *`,
      [id, email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Application not found or unauthorized" }, { status: 404 });
    }

    const app = result.rows[0];

    // Auto-transition: both started → Active
    if (app.mentee_started && app.mentor_started && app.status === "Assigned") {
      await postgresPool.query(
        `UPDATE mentorship_applications SET status = 'Active', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
      app.status = "Active";
    }

    // Auto-transition: both completed → Completed + delete chat
    if (app.mentee_completed && app.mentor_completed && app.status !== "Completed") {
      await postgresPool.query(
        `UPDATE mentorship_applications SET status = 'Completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
      app.status = "Completed";
      // Destroy chat messages
      await deleteMessagesForApplication(String(id));
    }

    return NextResponse.json({ message: "Mentorship updated successfully", application: app });
  } catch (error) {
    console.error("User mentor PATCH error:", error);
    return NextResponse.json({ message: "Failed to update mentorship" }, { status: 500 });
  }
}

