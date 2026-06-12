import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { updateAdminRequestStatus, type RequestStatus } from "@/lib/admin-requests";
import { sendMail, requestStatusUpdateTemplate } from "@/lib/mailer";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const { requestId } = await params;
    const body = (await request.json()) as { status?: string; adminNote?: string };

    const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json({ message: "Valid status is required." }, { status: 400 });
    }

    const updated = await updateAdminRequestStatus({
      requestId,
      status: body.status as RequestStatus,
      adminNote: body.adminNote,
    });

    if (!updated) {
      return NextResponse.json({ message: "Request not found." }, { status: 404 });
    }

    if (updated.requesterEmail) {
      sendMail({
        to: updated.requesterEmail,
        subject: `Request Update — ${updated.status}`,
        html: requestStatusUpdateTemplate({
          name: updated.requesterName,
          subject: updated.subject,
          status: updated.status,
          adminNote: updated.adminNote,
        }),
      }).catch((err) => console.error("Request status email error", err));
    }

    return NextResponse.json({ message: "Request updated.", request: updated });
  } catch (error) {
    console.error("Admin request PATCH error", error);
    return NextResponse.json({ message: "Unable to update request." }, { status: 500 });
  }
}
