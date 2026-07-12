import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { postgresPool } from "@/lib/postgres";
import { ensureUserProfileTable } from "@/lib/user-profile";

export async function POST(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const username = body.username?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    if (!username) {
      return NextResponse.json({ message: "Username is required." }, { status: 400 });
    }

    // Username validation (alphanumeric, underscores, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        message: "Username must be 3-20 characters long and contain only letters, numbers, and underscores."
      }, { status: 400 });
    }

    await ensureUserProfileTable();

    // Fetch the user's current profile to check changes left and current username
    const currentRes = await postgresPool.query<{
      username: string | null;
      username_changes_left: number;
    }>(
      `SELECT username, username_changes_left FROM user_profiles WHERE email = $1 LIMIT 1`,
      [email]
    );

    if (currentRes.rowCount === 0) {
      return NextResponse.json({ message: "Profile not found." }, { status: 404 });
    }

    const currentProfile = currentRes.rows[0];

    // If username is already what the user wants to set it to (case-insensitive check)
    if (currentProfile.username && currentProfile.username.toLowerCase() === username) {
      return NextResponse.json({
        message: "Username updated successfully.",
        username: currentProfile.username,
        usernameChangesLeft: currentProfile.username_changes_left
      });
    }

    // Check if they have changes left
    if (currentProfile.username_changes_left <= 0) {
      return NextResponse.json({
        message: "You have already reached the maximum limit of 2 username changes."
      }, { status: 400 });
    }

    // Check if the username is already taken by someone else (case-insensitive)
    const takenRes = await postgresPool.query(
      `SELECT 1 FROM user_profiles WHERE LOWER(username) = $1 AND email != $2 LIMIT 1`,
      [username, email]
    );

    if (takenRes.rowCount && takenRes.rowCount > 0) {
      return NextResponse.json({
        message: "This username is already taken. Please choose a different one."
      }, { status: 400 });
    }

    // Update username and decrement count
    const updateRes = await postgresPool.query<{
      username: string;
      username_changes_left: number;
    }>(
      `UPDATE user_profiles 
       SET username = $1, 
           username_changes_left = username_changes_left - 1, 
           updated_at = NOW() 
       WHERE email = $2 
       RETURNING username, username_changes_left`,
      [username, email]
    );

    const updated = updateRes.rows[0];

    return NextResponse.json({
      message: "Username updated successfully.",
      username: updated.username,
      usernameChangesLeft: updated.username_changes_left
    });

  } catch (error) {
    console.error("Username update error:", error);
    return NextResponse.json({ message: "Failed to update username." }, { status: 500 });
  }
}
