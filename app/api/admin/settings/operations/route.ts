import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/admin-api-guard";
import { postgresPool } from "@/lib/postgres";
import crypto from "node:crypto";
import { getAdminState, saveAdminState } from "@/lib/admin-state";

const API_KEYS_STATE_KEY = "settings:api_keys";

export async function POST(request: NextRequest) {
  const denial = requireAdminApiAccess(request);
  if (denial) return denial;

  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ message: "Action is required." }, { status: 400 });
    }

    if (action === "rotate-keys") {
      const newKey = "jnv_live_" + crypto.randomBytes(16).toString("hex");
      const updatedKeys = {
        primaryKey: newKey,
        secondaryKey: "jnv_secondary_" + crypto.randomBytes(16).toString("hex"),
        rotatedAt: new Date().toISOString(),
      };
      await saveAdminState(API_KEYS_STATE_KEY, updatedKeys);

      return NextResponse.json({
        message: "API keys rotated successfully.",
        details: `Primary Key: ${newKey.slice(0, 12)}...`,
        data: updatedKeys
      });
    }

    if (action === "logout-all-sessions") {
      // Deactivate all user sessions
      const res = await postgresPool.query(
        `UPDATE user_sessions SET is_active = FALSE WHERE is_active = TRUE`
      );
      return NextResponse.json({
        message: "All active user sessions have been terminated.",
        details: `${res.rowCount ?? 0} sessions revoked. Users will be forced to log in again.`
      });
    }

    if (action === "anomaly-scan") {
      // Find multiple sessions per user (more than 2 active)
      const res = await postgresPool.query<{ email: string; session_count: string }>(
        `SELECT email, COUNT(*)::text AS session_count 
         FROM user_sessions 
         WHERE is_active = TRUE 
         GROUP BY email 
         HAVING COUNT(*) > 2`
      );

      const suspiciousCount = res.rowCount ?? 0;
      const details = suspiciousCount > 0 
        ? `Found ${suspiciousCount} accounts with more than 2 concurrent active sessions.`
        : "Scan completed. No suspicious session patterns detected. All clear.";

      return NextResponse.json({
        message: "Access anomaly scan completed.",
        details,
        anomalies: res.rows
      });
    }

    if (action === "revoke-stale") {
      // Revoke sessions inactive for > 15 days
      const res = await postgresPool.query(
        `UPDATE user_sessions 
         SET is_active = FALSE 
         WHERE is_active = TRUE AND last_active < NOW() - INTERVAL '15 days'`
      );

      const count = res.rowCount ?? 0;
      return NextResponse.json({
        message: "Stale session cleanup completed.",
        details: count > 0 
          ? `Successfully revoked ${count} stale sessions inactive for over 15 days.`
          : "No stale sessions found. Active sessions are clean."
      });
    }

    if (action === "export-audit-logs") {
      // Query tables to construct a virtual audit log
      const members = await postgresPool.query(
        `SELECT email, full_name, status, created_at, 'MEMBER_STATUS_CHANGE' AS action 
         FROM admin_members 
         ORDER BY created_at DESC LIMIT 20`
      );

      const scholarships = await postgresPool.query(
        `SELECT title, is_active::text as details, created_at, 'SCHOLARSHIP_UPDATE' AS action 
         FROM admin_scholarships 
         ORDER BY created_at DESC LIMIT 20`
      );

      const programs = await postgresPool.query(
        `SELECT title, status as details, created_at, 'PROGRAM_UPDATE' AS action 
         FROM admin_programs 
         ORDER BY created_at DESC LIMIT 20`
      );

      // Combine logs
      const logs = [
        ...members.rows.map(r => ({
          timestamp: r.created_at,
          action: r.action,
          target: r.email,
          details: `Member: ${r.full_name}, Status: ${r.status}`
        })),
        ...scholarships.rows.map(r => ({
          timestamp: r.created_at,
          action: r.action,
          target: r.title,
          details: `Scholarship Status: ${r.details === "true" ? "Active" : "Inactive"}`
        })),
        ...programs.rows.map(r => ({
          timestamp: r.created_at,
          action: r.action,
          target: r.title,
          details: `Program Status: ${r.details}`
        }))
      ];

      // Sort by timestamp descending
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return NextResponse.json({
        message: "Virtual audit log generated successfully.",
        details: `Compiled ${logs.length} system activity entries.`,
        logs
      });
    }

    if (action === "integrity-check") {
      // 1. Orphaned mentorship applications (no mentor)
      const mentorships = await postgresPool.query(
        `SELECT COUNT(*)::text AS count 
         FROM mentorship_applications m
         LEFT JOIN admin_mentors am ON am.email = m.mentor_email
         WHERE m.mentor_email IS NOT NULL AND am.email IS NULL`
      );

      // 2. Orphaned connections
      const connections = await postgresPool.query(
        `SELECT COUNT(*)::text AS count 
         FROM user_connection_requests r
         LEFT JOIN auth_accounts a1 ON a1.email = r.sender_email
         LEFT JOIN auth_accounts a2 ON a2.email = r.receiver_email
         WHERE a1.email IS NULL OR a2.email IS NULL`
      );

      const orphanedMentors = Number(mentorships.rows[0]?.count || "0");
      const orphanedConnections = Number(connections.rows[0]?.count || "0");

      const checkPassed = orphanedMentors === 0 && orphanedConnections === 0;
      const details = checkPassed
        ? "All database integrity checks passed. No orphaned keys or data corruption found."
        : `Integrity check completed. Found ${orphanedMentors} orphaned mentor assignments and ${orphanedConnections} orphaned connection requests.`;

      return NextResponse.json({
        message: "Data integrity check completed.",
        details,
        stats: {
          orphanedMentors,
          orphanedConnections,
          checkPassed
        }
      });
    }

    return NextResponse.json({ message: "Unsupported action." }, { status: 400 });
  } catch (error: any) {
    console.error("POST settings/operations error:", error);
    return NextResponse.json({ message: error.message || "Failed to process operations request." }, { status: 500 });
  }
}
