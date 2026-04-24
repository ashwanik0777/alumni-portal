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
    const { name, expertise, maxMentees } = body;

    if (!name || !expertise || !maxMentees) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if already applied
    const checkRes = await postgresPool.query(
      `SELECT id FROM admin_mentors WHERE email = $1`,
      [email]
    );
    if (checkRes.rowCount && checkRes.rowCount > 0) {
      return NextResponse.json({ message: "You have already applied to be a mentor." }, { status: 400 });
    }

    const result = await postgresPool.query(
      `INSERT INTO admin_mentors (email, full_name, expertise, max_mentees) VALUES ($1, $2, $3, $4) RETURNING *`,
      [email, String(name), String(expertise), parseInt(String(maxMentees), 10)]
    );

    return NextResponse.json({
      message: "Mentor application submitted successfully",
      mentor: result.rows[0],
    });
  } catch (error) {
    console.error("Mentorship apply mentor POST error:", error);
    return NextResponse.json({ message: "Failed to submit mentor application" }, { status: 500 });
  }
}
