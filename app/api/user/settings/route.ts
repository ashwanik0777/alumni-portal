import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { postgresPool } from "@/lib/postgres";
import { ensureUserProfileTable } from "@/lib/user-profile";

export async function GET(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  const email = request.cookies.get("auth_email")?.value?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: "User email not found in session." }, { status: 401 });
  }

  try {
    await ensureUserProfileTable();

    const result = await postgresPool.query(
      `SELECT 
        profile_visibility, show_email, show_mobile, show_current_role,
        email_updates, mentorship_notifications, jobs_notifications,
        events_notifications, message_notifications, weekly_digest,
        compact_layout, timezone
       FROM user_profiles 
       WHERE email = $1 LIMIT 1`,
      [email]
    );

    const defaultSettings = {
      profileVisibility: "alumni-only",
      showEmail: false,
      showMobile: false,
      showCurrentRole: true,
      darkMode: false,
      compactMode: true,
      emailUpdates: true,
      smsAlerts: false,
      mentorshipNotifications: true,
      jobsNotifications: true,
      eventsNotifications: true,
      messageNotifications: true,
      weeklyDigest: true,
      language: "english",
      timezone: "Asia/Kolkata"
    };

    if (result.rowCount === 0) {
      return NextResponse.json({ settings: defaultSettings });
    }

    const row = result.rows[0];
    const settings = {
      profileVisibility: row.profile_visibility,
      showEmail: !!row.show_email,
      showMobile: !!row.show_mobile,
      showCurrentRole: !!row.show_current_role,
      darkMode: false, // Always false per requirements (Coming Soon)
      compactMode: !!row.compact_layout,
      emailUpdates: !!row.email_updates,
      smsAlerts: false, // Always false per requirements (Coming Soon)
      mentorshipNotifications: !!row.mentorship_notifications,
      jobsNotifications: !!row.jobs_notifications,
      eventsNotifications: !!row.events_notifications,
      messageNotifications: !!row.message_notifications,
      weeklyDigest: !!row.weekly_digest,
      language: "english",
      timezone: row.timezone || "Asia/Kolkata"
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("User settings GET error:", error);
    return NextResponse.json({ message: "Failed to load settings." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  const email = request.cookies.get("auth_email")?.value?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: "User email not found in session." }, { status: 401 });
  }

  try {
    await ensureUserProfileTable();
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ message: "Settings object is required." }, { status: 400 });
    }

    // Check if user profile row exists
    const checkUser = await postgresPool.query(
      `SELECT id FROM user_profiles WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (checkUser.rowCount === 0) {
      // Create empty profile row first with default name derived from email
      const name = email.split("@")[0].replace(/[._-]+/g, " ");
      await postgresPool.query(
        `INSERT INTO user_profiles (email, full_name, profile_visibility, show_email, show_mobile, show_current_role, email_updates, mentorship_notifications, jobs_notifications, events_notifications, message_notifications, weekly_digest, compact_layout, timezone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          email,
          name,
          settings.profileVisibility || "alumni-only",
          !!settings.showEmail,
          !!settings.showMobile,
          !!settings.showCurrentRole,
          !!settings.emailUpdates,
          !!settings.mentorshipNotifications,
          !!settings.jobsNotifications,
          !!settings.eventsNotifications,
          !!settings.messageNotifications,
          !!settings.weeklyDigest,
          !!settings.compactMode,
          settings.timezone || "Asia/Kolkata"
        ]
      );
    } else {
      // Update existing profile settings columns
      await postgresPool.query(
        `UPDATE user_profiles 
         SET 
           profile_visibility = $1,
           show_email = $2,
           show_mobile = $3,
           show_current_role = $4,
           email_updates = $5,
           mentorship_notifications = $6,
           jobs_notifications = $7,
           events_notifications = $8,
           message_notifications = $9,
           weekly_digest = $10,
           compact_layout = $11,
           timezone = $12,
           updated_at = NOW()
         WHERE email = $13`,
        [
          settings.profileVisibility || "alumni-only",
          !!settings.showEmail,
          !!settings.showMobile,
          !!settings.showCurrentRole,
          !!settings.emailUpdates,
          !!settings.mentorshipNotifications,
          !!settings.jobsNotifications,
          !!settings.eventsNotifications,
          !!settings.messageNotifications,
          !!settings.weeklyDigest,
          !!settings.compactMode,
          settings.timezone || "Asia/Kolkata",
          email
        ]
      );
    }

    return NextResponse.json({ message: "Settings saved successfully." });
  } catch (error) {
    console.error("User settings POST error:", error);
    return NextResponse.json({ message: "Failed to save settings." }, { status: 500 });
  }
}
