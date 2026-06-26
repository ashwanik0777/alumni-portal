import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { postgresPool } from "@/lib/postgres";
import { getMessages, sendMessage } from "@/lib/mentorship-chat";

/**
 * GET /api/user/mentorship/chat?application_id=X&email=Y
 * Fetch messages for a mentorship application.
 * Only the mentor or mentee of that application can access.
 */
export async function GET(request: NextRequest) {
  const denial = await requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const applicationId = request.nextUrl.searchParams.get("application_id");
    const email = request.cookies.get("auth_email")?.value?.trim().toLowerCase();

    if (!applicationId || !email) {
      return NextResponse.json({ message: "application_id and email are required." }, { status: 400 });
    }

    // Verify user is either the mentor or mentee for this application
    const appResult = await postgresPool.query<{ mentee_email: string; mentor_email: string; status: string }>(
      `SELECT mentee_email, mentor_email, status FROM mentorship_applications WHERE id = $1 LIMIT 1`,
      [applicationId],
    );

    if (appResult.rowCount === 0) {
      return NextResponse.json({ message: "Application not found." }, { status: 404 });
    }

    const app = appResult.rows[0];
    if (app.mentee_email !== email && app.mentor_email !== email) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }

    // Only allow chat for active mentorships
    if (!["Assigned", "Active"].includes(app.status)) {
      return NextResponse.json({ messages: [], chatEnabled: false });
    }

    const messages = await getMessages(applicationId);
    return NextResponse.json({ messages, chatEnabled: true });
  } catch (error) {
    console.error("Mentorship chat GET error:", error);
    return NextResponse.json({ message: "Failed to load messages." }, { status: 500 });
  }
}

/**
 * POST /api/user/mentorship/chat
 * Send a message in a mentorship chat.
 */
export async function POST(request: NextRequest) {
  const denial = await requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const body = await request.json();
    const { application_id, message } = body;
    const email = request.cookies.get("auth_email")?.value?.trim().toLowerCase();

    if (!application_id || !email || !message?.trim()) {
      return NextResponse.json({ message: "application_id and message are required." }, { status: 400 });
    }

    const normalizedEmail = email;

    // Verify user is either the mentor or mentee
    const appResult = await postgresPool.query<{ mentee_email: string; mentor_email: string; status: string }>(
      `SELECT mentee_email, mentor_email, status FROM mentorship_applications WHERE id = $1 LIMIT 1`,
      [application_id],
    );

    if (appResult.rowCount === 0) {
      return NextResponse.json({ message: "Application not found." }, { status: 404 });
    }

    const app = appResult.rows[0];
    if (app.mentee_email !== normalizedEmail && app.mentor_email !== normalizedEmail) {
      return NextResponse.json({ message: "Access denied." }, { status: 403 });
    }

    if (!["Assigned", "Active"].includes(app.status)) {
      return NextResponse.json({ message: "Chat is only available for active mentorships." }, { status: 400 });
    }

    const sent = await sendMessage(application_id, normalizedEmail, message);
    return NextResponse.json({ message: "Message sent.", data: sent }, { status: 201 });
  } catch (error) {
    console.error("Mentorship chat POST error:", error);
    return NextResponse.json({ message: "Failed to send message." }, { status: 500 });
  }
}
