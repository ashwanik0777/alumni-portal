import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { postgresPool } from "@/lib/postgres";

/**
 * GET /api/user/connections/status?email=user@example.com&targets=a@b.com,c@d.com
 * Returns the connection status between the user and each target email.
 */
export async function GET(request: NextRequest) {
  const denial = await requireUserApiAccess(request);
  if (denial) return denial;

  try {
    const userEmail = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    const targetsParam = request.nextUrl.searchParams.get("targets") || "";

    if (!userEmail) {
      return NextResponse.json({ message: "User email is required." }, { status: 400 });
    }

    const targetEmails = targetsParam
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (targetEmails.length === 0) {
      return NextResponse.json({ statuses: {} });
    }

    // Query all connection requests between user and targets (both directions)
    // Table may not exist yet if no connections have ever been made
    let rows: { sender_email: string; receiver_email: string; status: string }[] = [];
    try {
      const result = await postgresPool.query<{
        sender_email: string;
        receiver_email: string;
        status: string;
      }>(
        `
          SELECT sender_email, receiver_email, status
          FROM user_connection_requests
          WHERE (
            (sender_email = $1 AND receiver_email = ANY($2))
            OR
            (receiver_email = $1 AND sender_email = ANY($2))
          )
          AND status IN ('Pending', 'Accepted')
          ORDER BY updated_at DESC
        `,
        [userEmail, targetEmails],
      );
      rows = result.rows;
    } catch (queryError: any) {
      // Table doesn't exist yet — return empty statuses
      if (queryError?.code === "42P01") {
        return NextResponse.json({ statuses: {} });
      }
      throw queryError;
    }

    // Build a map: targetEmail -> status
    const statuses: Record<string, string> = {};

    for (const row of rows) {
      const otherEmail = row.sender_email === userEmail ? row.receiver_email : row.sender_email;
      // Only keep the first (most recent) status per target
      if (!statuses[otherEmail]) {
        if (row.status === "Accepted") {
          statuses[otherEmail] = "connected";
        } else if (row.status === "Pending") {
          statuses[otherEmail] = row.sender_email === userEmail ? "sent" : "received";
        }
      }
    }

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error("Connection status check error", error);
    return NextResponse.json({ message: "Failed to check connection statuses." }, { status: 500 });
  }
}
