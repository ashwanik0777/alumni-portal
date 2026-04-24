import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";

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

    return NextResponse.json({ message: "Application updated successfully", application: result.rows[0] });
  } catch (error) {
    console.error("Admin mentorship applications PATCH error:", error);
    return NextResponse.json({ message: "Failed to update application" }, { status: 500 });
  }
}
