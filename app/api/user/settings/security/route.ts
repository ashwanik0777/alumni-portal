import { NextRequest, NextResponse } from "next/server";
import { requireUserApiAccess } from "@/lib/user-api-guard";
import { postgresPool } from "@/lib/postgres";
import { sendMail } from "@/lib/mailer";
import {
  getActiveSessions,
  revokeSessionById,
  revokeAllSessions,
  getBlockedUsers,
  blockUser,
  unblockUser,
} from "@/lib/user-security";

function parseUserAgent(ua: string) {
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr|opios/i.test(ua)) {
    browser = "Google Chrome";
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua)) {
    browser = "Safari";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Mozilla Firefox";
  } else if (/edge|edg/i.test(ua)) {
    browser = "Microsoft Edge";
  } else if (/opr|opios/i.test(ua)) {
    browser = "Opera";
  }

  if (/windows/i.test(ua)) {
    os = "Windows";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
  } else if (/android/i.test(ua)) {
    os = "Android";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }

  return { browser, os };
}

export async function GET(request: NextRequest) {
  const guardResult = await requireUserApiAccess(request);
  if (guardResult) return guardResult;

  const email = request.cookies.get("auth_email")?.value?.trim().toLowerCase();
  const currentToken = request.cookies.get("auth_token")?.value;

  if (!email) {
    return NextResponse.json({ message: "User email not found in session." }, { status: 401 });
  }

  try {
    // 1. Fetch 2FA Status
    const accountRes = await postgresPool.query<{ two_factor_enabled: boolean }>(
      `SELECT two_factor_enabled FROM auth_accounts WHERE email = $1 LIMIT 1`,
      [email]
    );
    const twoFactorEnabled = (accountRes.rowCount ?? 0) > 0 ? accountRes.rows[0].two_factor_enabled : false;

    // 2. Fetch Active Sessions
    const sessions = await getActiveSessions(email);
    const formattedSessions = sessions.map((s) => {
      const { browser, os } = parseUserAgent(s.user_agent);
      return {
        id: s.id.toString(),
        browser,
        os,
        ipAddress: s.ip_address,
        createdAt: s.created_at.toISOString(),
        lastActive: s.last_active.toISOString(),
        isCurrent: s.session_token === currentToken,
      };
    });

    // 3. Fetch Blocked Users
    const blockedUsers = await getBlockedUsers(email);

    return NextResponse.json({
      twoFactorEnabled,
      activeSessions: formattedSessions,
      blockedUsers,
    });
  } catch (error) {
    console.error("GET settings/security error:", error);
    return NextResponse.json({ message: "Failed to load security settings." }, { status: 500 });
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
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ message: "Action is required." }, { status: 400 });
    }

    if (action === "request-2fa") {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await postgresPool.query(
        `UPDATE auth_accounts 
         SET two_factor_otp = $1, two_factor_otp_expiry = $2 
         WHERE email = $3`,
        [otpCode, expiry, email]
      );

      // Send Code email
      await sendMail({
        to: email,
        subject: "Enable Two-Factor Authentication (2FA) - JNV Alumni Portal",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1E348A; font-size: 24px; margin: 0; font-weight: 700;">JNV Alumni Portal</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Security Settings</p>
            </div>
            <h2 style="color: #334155; font-size: 20px; font-weight: 600; margin-top: 0;">Confirm Two-Factor Authentication Setup</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello,</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">You requested to enable Two-Factor Authentication (2FA) on your JNV Alumni Portal account. Please use the following code to confirm this setup:</p>
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; text-align: center; margin: 35px 0; color: #1e3a8a; background-color: #eff6ff; padding: 20px; border-radius: 8px; border: 1px dashed #bfdbfe;">
              ${otpCode}
            </div>
            <p style="color: #ef4444; font-size: 13px; line-height: 1.5; font-weight: 500;">This code is valid for 10 minutes. If you did not request to enable 2FA, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">This is an automated security message. Please do not reply to this email.</p>
          </div>
        `,
      });

      return NextResponse.json({ success: true, message: "Verification code sent to email." });
    }

    if (action === "confirm-2fa") {
      const { code } = body;
      if (!code) {
        return NextResponse.json({ message: "Verification code is required." }, { status: 400 });
      }

      const checkRes = await postgresPool.query<{
        two_factor_otp: string | null;
        two_factor_otp_expiry: Date | null;
      }>(
        `SELECT two_factor_otp, two_factor_otp_expiry FROM auth_accounts WHERE email = $1 LIMIT 1`,
        [email]
      );

      if ((checkRes.rowCount ?? 0) === 0) {
        return NextResponse.json({ message: "User account not found." }, { status: 404 });
      }

      const account = checkRes.rows[0];

      if (!account.two_factor_otp || account.two_factor_otp !== code.trim()) {
        return NextResponse.json({ message: "Invalid verification code." }, { status: 400 });
      }

      if (!account.two_factor_otp_expiry || new Date() > account.two_factor_otp_expiry) {
        return NextResponse.json({ message: "Verification code has expired." }, { status: 400 });
      }

      // Turn on 2FA
      await postgresPool.query(
        `UPDATE auth_accounts 
         SET two_factor_enabled = TRUE, two_factor_otp = NULL, two_factor_otp_expiry = NULL 
         WHERE email = $1`,
        [email]
      );

      return NextResponse.json({ success: true, message: "Two-factor authentication enabled successfully." });
    }

    if (action === "disable-2fa") {
      await postgresPool.query(
        `UPDATE auth_accounts 
         SET two_factor_enabled = FALSE, two_factor_otp = NULL, two_factor_otp_expiry = NULL 
         WHERE email = $1`,
        [email]
      );
      return NextResponse.json({ success: true, message: "Two-factor authentication disabled." });
    }

    if (action === "revoke-session") {
      const { sessionId } = body;
      if (!sessionId) {
        return NextResponse.json({ message: "Session ID is required." }, { status: 400 });
      }

      await revokeSessionById(email, sessionId);
      return NextResponse.json({ success: true, message: "Session revoked successfully." });
    }

    if (action === "revoke-all-sessions") {
      await revokeAllSessions(email);
      return NextResponse.json({ success: true, message: "All sessions revoked. Please re-authenticate." });
    }

    if (action === "block") {
      const { blockedEmail } = body;
      if (!blockedEmail?.trim()) {
        return NextResponse.json({ message: "Email to block is required." }, { status: 400 });
      }

      const targetEmail = blockedEmail.trim().toLowerCase();
      if (targetEmail === email) {
        return NextResponse.json({ message: "You cannot block yourself." }, { status: 400 });
      }

      // Verify that the target user exists
      const targetUser = await postgresPool.query(
        `SELECT email FROM auth_accounts WHERE email = $1 LIMIT 1`,
        [targetEmail]
      );

      if ((targetUser.rowCount ?? 0) === 0) {
        return NextResponse.json({ message: `No user account found with email "${blockedEmail}".` }, { status: 404 });
      }

      await blockUser(email, targetEmail);
      return NextResponse.json({ success: true, message: `Successfully blocked ${blockedEmail}.` });
    }

    if (action === "unblock") {
      const { blockedEmail } = body;
      if (!blockedEmail?.trim()) {
        return NextResponse.json({ message: "Email to unblock is required." }, { status: 400 });
      }

      await unblockUser(email, blockedEmail.trim().toLowerCase());
      return NextResponse.json({ success: true, message: `Successfully unblocked ${blockedEmail}.` });
    }

    return NextResponse.json({ message: "Unsupported action." }, { status: 400 });
  } catch (error: any) {
    console.error("POST settings/security error:", error);
    return NextResponse.json({ message: error.message || "Failed to process security request." }, { status: 500 });
  }
}
