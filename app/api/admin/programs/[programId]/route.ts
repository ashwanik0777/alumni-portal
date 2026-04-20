import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { ProgramStatus, updateAdminProgramStatus } from "@/lib/admin-programs";

type RouteContext = {
  params: Promise<{ programId: string }>;
};

const allowedStatuses = new Set<ProgramStatus>(["Pending", "Approved", "Rejected", "Needs Info"]);

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { programId } = await context.params;
    const body = (await request.json()) as { status?: ProgramStatus; rejectionReason?: string };

    if (!body.status || !allowedStatuses.has(body.status)) {
      return NextResponse.json({ message: "Valid status is required." }, { status: 400 });
    }

    if (body.status === "Rejected" && !body.rejectionReason?.trim()) {
      return NextResponse.json({ message: "Rejection reason is required for rejected status." }, { status: 400 });
    }

    const updated = await updateAdminProgramStatus({
      programId,
      status: body.status,
      rejectionReason: body.rejectionReason,
    });

    if (!updated) {
      return NextResponse.json({ message: "Program not found." }, { status: 404 });
    }

    return NextResponse.json({ program: updated });
  } catch (error) {
    console.error("Admin program PATCH error", error);
    return NextResponse.json({ message: "Unable to update program." }, { status: 500 });
  }
}
