import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { manageConnection, respondToConnectionRequest } from "@/lib/user-connections";

type RouteContext = {
  params: Promise<{ requestId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denial = requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const { requestId } = await context.params;
    const body = (await request.json()) as {
      userEmail?: string;
      action?: "accept" | "decline" | "cancel" | "remove";
    };

    const userEmail = body.userEmail?.trim().toLowerCase();
    if (!userEmail || !body.action) {
      return NextResponse.json({ message: "userEmail and action are required." }, { status: 400 });
    }

    if (body.action === "accept" || body.action === "decline") {
      const result = await respondToConnectionRequest({
        requestId,
        userEmail,
        action: body.action,
      });

      if (!result.ok) {
        return NextResponse.json({ message: "Request not found or already processed." }, { status: 404 });
      }

      return NextResponse.json({ message: `Request ${body.action === "accept" ? "accepted" : "declined"}.` });
    }

    const manageResult = await manageConnection({
      requestId,
      userEmail,
      action: body.action,
    });

    if (!manageResult.ok) {
      return NextResponse.json({ message: "Request not found for selected action." }, { status: 404 });
    }

    return NextResponse.json({ message: body.action === "cancel" ? "Request cancelled." : "Connection removed." });
  } catch (error) {
    console.error("User connection request PATCH error", error);
    return NextResponse.json({ message: "Unable to update request." }, { status: 500 });
  }
}
