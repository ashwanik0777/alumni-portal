import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { getApplicationById, updateApplicationStatus } from "@/lib/admin-scholarships";

type RouteContext = { params: Promise<{ applicationId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { applicationId } = await context.params;
    const app = await getApplicationById(applicationId);
    if (!app) return NextResponse.json({ message: "Application not found." }, { status: 404 });
    return NextResponse.json({ application: app });
  } catch (error) {
    console.error("Admin application GET error", error);
    return NextResponse.json({ message: "Unable to fetch application." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { applicationId } = await context.params;
    const body = await request.json();
    const { status, adminNotes } = body;

    if (!status || !["Verified", "Completed"].includes(status)) {
      return NextResponse.json({ message: "Status must be Verified or Completed." }, { status: 400 });
    }

    const updated = await updateApplicationStatus(applicationId, status, adminNotes);
    if (!updated) return NextResponse.json({ message: "Application not found." }, { status: 404 });
    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error("Admin application PATCH error", error);
    return NextResponse.json({ message: "Unable to update application." }, { status: 500 });
  }
}
