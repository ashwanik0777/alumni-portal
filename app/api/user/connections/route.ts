import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { getUserConnectionsDashboard, sendConnectionRequest } from "@/lib/user-connections";

export async function GET(request: NextRequest) {
  const denial = requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    const search = request.nextUrl.searchParams.get("search") || "";

    if (!email) {
      return NextResponse.json({ message: "User email is required." }, { status: 400 });
    }

    const result = await getUserConnectionsDashboard(email, search);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=8, stale-while-revalidate=16",
      },
    });
  } catch (error) {
    console.error("User connections GET error", error);
    return NextResponse.json({ message: "Unable to load request queue." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denial = requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const body = (await request.json()) as {
      senderEmail?: string;
      senderName?: string;
      receiverEmail?: string;
      message?: string;
    };

    const senderEmail = body.senderEmail?.trim().toLowerCase();
    const receiverEmail = body.receiverEmail?.trim().toLowerCase();

    if (!senderEmail || !receiverEmail) {
      return NextResponse.json({ message: "Sender and receiver emails are required." }, { status: 400 });
    }

    const result = await sendConnectionRequest({
      senderEmail,
      senderName: body.senderName,
      receiverEmail,
      message: body.message,
    });

    if (!result.ok) {
      if (result.reason === "self") {
        return NextResponse.json({ message: "You cannot send request to yourself." }, { status: 400 });
      }
      if (result.reason === "already-pending") {
        return NextResponse.json({ message: "Request already pending for this person." }, { status: 409 });
      }
      if (result.reason === "already-connected") {
        return NextResponse.json({ message: "You are already connected with this person." }, { status: 409 });
      }
      return NextResponse.json({ message: "Unable to send request." }, { status: 400 });
    }

    return NextResponse.json({ requestId: result.requestId, message: "Connection request sent." }, { status: 201 });
  } catch (error) {
    console.error("User connections POST error", error);
    return NextResponse.json({ message: "Unable to send connection request." }, { status: 500 });
  }
}
