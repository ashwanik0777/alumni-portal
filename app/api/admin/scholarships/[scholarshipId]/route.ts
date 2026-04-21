import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { ScholarshipStatus, updateAdminScholarshipStatus } from "@/lib/admin-scholarships";

type RouteContext = {
  params: Promise<{ scholarshipId: string }>;
};

const allowedStatuses = new Set<ScholarshipStatus>(["Pending", "Approved", "Rejected", "Needs Info"]);

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { scholarshipId } = await context.params;
    const body = (await request.json()) as { status?: ScholarshipStatus; rejectionReason?: string };

    if (!body.status || !allowedStatuses.has(body.status)) {
      return NextResponse.json({ message: "Valid status is required." }, { status: 400 });
    }

    if (body.status === "Rejected" && !body.rejectionReason?.trim()) {
      return NextResponse.json({ message: "Rejection reason is required for rejected status." }, { status: 400 });
    }

    const updated = await updateAdminScholarshipStatus({
      scholarshipId,
      status: body.status,
      rejectionReason: body.rejectionReason,
    });

    if (!updated) {
      return NextResponse.json({ message: "Scholarship not found." }, { status: 404 });
    }

    return NextResponse.json({ scholarship: updated });
  } catch (error) {
    console.error("Admin scholarship PATCH error", error);
    return NextResponse.json({ message: "Unable to update scholarship." }, { status: 500 });
  }
}
