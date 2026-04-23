import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { toggleScholarshipActive, getScholarshipById } from "@/lib/admin-scholarships";

type RouteContext = { params: Promise<{ scholarshipId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { scholarshipId } = await context.params;
    const body = await request.json();

    if (typeof body.isActive === "boolean") {
      const updated = await toggleScholarshipActive(scholarshipId, body.isActive);
      if (!updated) return NextResponse.json({ message: "Scholarship not found." }, { status: 404 });
      return NextResponse.json({ scholarship: updated });
    }

    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  } catch (error) {
    console.error("Admin scholarship PATCH error", error);
    return NextResponse.json({ message: "Unable to update scholarship." }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { scholarshipId } = await context.params;
    const scholarship = await getScholarshipById(scholarshipId);
    if (!scholarship) return NextResponse.json({ message: "Not found." }, { status: 404 });
    return NextResponse.json({ scholarship });
  } catch (error) {
    console.error("Admin scholarship GET error", error);
    return NextResponse.json({ message: "Unable to fetch scholarship." }, { status: 500 });
  }
}
