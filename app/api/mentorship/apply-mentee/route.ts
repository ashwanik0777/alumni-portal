import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { ensureMentorshipTables } from "@/lib/mentorship";

export async function POST(request: NextRequest) {
  const denial = requireUserApiAccess(request);
  if (denial) return denial;

  try {
    await ensureMentorshipTables();

    const email = request.cookies.get("auth_user")?.value;
    if (!email) {
      return NextResponse.json({ message: "User not identified" }, { status: 401 });
    }

    const body = await request.json();
    const { name, currentStage, track, goal, urgency } = body;

    if (!name || !currentStage || !track || !goal || !urgency) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Sanitize inputs to prevent injection
    const safeValues = [email, String(name), String(currentStage), String(track), String(goal), String(urgency)];

    const result = await postgresPool.query(
      `INSERT INTO mentorship_applications (mentee_email, mentee_name, current_stage, track, goal, urgency) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      safeValues
    );

    return NextResponse.json({
      message: "Mentorship application submitted successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Mentorship apply mentee POST error:", error);
    return NextResponse.json({ message: "Failed to submit mentorship application" }, { status: 500 });
  }
}
