import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const result = await postgresPool.query(
      `UPDATE admin_mentors SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Mentor not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Mentor status updated successfully", mentor: result.rows[0] });
  } catch (error) {
    console.error("Admin mentors PATCH error:", error);
    return NextResponse.json({ message: "Failed to update mentor status" }, { status: 500 });
  }
}
