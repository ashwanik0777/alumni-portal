import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { MemberStatus, updateAdminMemberStatus } from "@/lib/admin-members";

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

const allowedStatuses = new Set<MemberStatus>(["Pending", "Approved", "Rejected", "Needs Info"]);

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { memberId } = await context.params;
    const body = (await request.json()) as { status?: MemberStatus; rejectionReason?: string };

    if (!body.status || !allowedStatuses.has(body.status)) {
      return NextResponse.json({ message: "Valid status is required." }, { status: 400 });
    }

    if (body.status === "Rejected" && !body.rejectionReason?.trim()) {
      return NextResponse.json({ message: "Rejection reason is required for rejected status." }, { status: 400 });
    }

    const updated = await updateAdminMemberStatus({
      memberId,
      status: body.status,
      rejectionReason: body.rejectionReason,
    });

    if (!updated) {
      return NextResponse.json({ message: "Member not found." }, { status: 404 });
    }

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error("Admin member PATCH error", error);
    return NextResponse.json({ message: "Unable to update member." }, { status: 500 });
  }
}
