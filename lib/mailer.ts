import nodemailer from "nodemailer";

/* ------------------------------------------------------------------ */
/*  SMTP Transporter                                                   */
/* ------------------------------------------------------------------ */

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });

  return transporter;
}

/* ------------------------------------------------------------------ */
/*  Send Mail                                                          */
/* ------------------------------------------------------------------ */

type MailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail(payload: MailPayload) {
  const fromName = process.env.SMTP_FROM_NAME || "JNV Alumni Portal";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "";

  const transport = getTransporter();

  const result = await transport.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  return result;
}

/* ------------------------------------------------------------------ */
/*  Brand Constants                                                    */
/* ------------------------------------------------------------------ */

const BRAND = {
  primary: "#1E348A",
  primaryLight: "#93C5FD",
  secondary: "#C9A227",
  bgLight: "#F8F9F4",
  bgDark: "#1F2957",
  textDark: "#1a1a2e",
  textMuted: "#64748b",
  white: "#ffffff",
  border: "#e2e8f0",
  portalName: "JNV Farrukhabad Alumni Portal",
  portalUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://alumni-portal.ashwanik.me/",
};

/* ------------------------------------------------------------------ */
/*  Base Layout Wrapper                                                */
/* ------------------------------------------------------------------ */

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND.portalName}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgLight};font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bgLight};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,52,138,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.bgDark} 100%);padding:28px 32px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 12px;margin-bottom:8px;">
                      <span style="font-size:22px;">🎓</span>
                    </div>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:${BRAND.white};letter-spacing:0.5px;">${BRAND.portalName}</p>
                    <p style="margin:2px 0 0;font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1.5px;">Alumni Community</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};padding-top:20px;">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0;font-size:12px;color:${BRAND.textMuted};">© ${new Date().getFullYear()} ${BRAND.portalName}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:${BRAND.textMuted};">This is an automated email. Please do not reply directly.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  OTP Email Template (Registration + Forgot Password)                */
/* ------------------------------------------------------------------ */

export function otpEmailTemplate(otp: string, purpose: "registration" | "password-reset") {
  const heading = purpose === "registration" ? "Email Verification Code" : "Password Reset Code";
  const description =
    purpose === "registration"
      ? "Use the code below to verify your email address for alumni registration."
      : "Use the code below to reset your password. If you did not request this, please ignore this email.";

  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:${BRAND.primary};">${purpose === "registration" ? "Verification" : "Security"}</p>
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${BRAND.textDark};">${heading}</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">${description}</p>
    
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <div style="display:inline-block;background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.bgDark} 100%);border-radius:14px;padding:20px 40px;margin:0 0 24px;">
            <span style="font-size:32px;font-weight:800;color:${BRAND.white};letter-spacing:8px;font-family:'Courier New',monospace;">${otp}</span>
          </div>
        </td>
      </tr>
    </table>

    <div style="background:${BRAND.bgLight};border:1px solid ${BRAND.border};border-radius:10px;padding:14px 18px;margin:0 0 8px;">
      <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.5;">
        ⏱ This code expires in <strong style="color:${BRAND.textDark};">5 minutes</strong>.<br/>
        🔒 Never share this code with anyone.
      </p>
    </div>`;

  return emailWrapper(content);
}

/* ------------------------------------------------------------------ */
/*  Member Status Email Template (Approved / Rejected / Needs Info)    */
/* ------------------------------------------------------------------ */

export function memberStatusEmailTemplate(
  name: string,
  status: "Approved" | "Rejected" | "Needs Info",
  reason?: string | null,
) {
  const statusConfig = {
    Approved: {
      emoji: "✅",
      color: "#10b981",
      bgColor: "#ecfdf5",
      borderColor: "#a7f3d0",
      heading: "Membership Approved!",
      message: `Congratulations <strong>${name}</strong>! Your alumni membership has been verified and approved. You are now part of the official alumni community.`,
      cta: "Login To Your Account",
    },
    Rejected: {
      emoji: "❌",
      color: "#ef4444",
      bgColor: "#fef2f2",
      borderColor: "#fecaca",
      heading: "Membership Request Update",
      message: `Dear <strong>${name}</strong>, after review, your membership request could not be approved at this time.`,
      cta: "Contact Support",
    },
    "Needs Info": {
      emoji: "ℹ️",
      color: "#f59e0b",
      bgColor: "#fffbeb",
      borderColor: "#fde68a",
      heading: "Additional Information Required",
      message: `Dear <strong>${name}</strong>, we need a few more details to process your alumni membership request.`,
      cta: "Contact Support",
    },
  };

  const config = statusConfig[status];
  const ctaUrl = status === "Approved" ? `${BRAND.portalUrl}/login` : `${BRAND.portalUrl}/contact`;

  const reasonBlock = reason
    ? `<div style="background:${config.bgColor};border:1px solid ${config.borderColor};border-radius:10px;padding:14px 18px;margin:16px 0 0;">
        <p style="margin:0;font-size:12px;font-weight:600;color:${config.color};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Reason</p>
        <p style="margin:0;font-size:13px;color:${BRAND.textDark};line-height:1.5;">${reason}</p>
      </div>`
    : "";

  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:${BRAND.primary};">Membership Update</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:${BRAND.textDark};">${config.heading}</h1>
    
    <div style="background:${config.bgColor};border:1px solid ${config.borderColor};border-radius:12px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-size:14px;color:${BRAND.textDark};line-height:1.6;">
        ${config.emoji} ${config.message}
      </p>
      ${reasonBlock}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:8px 0 0;">
          <a href="${ctaUrl}" style="display:inline-block;background:${BRAND.primary};color:${BRAND.white};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">${config.cta}</a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(content);
}

/* ------------------------------------------------------------------ */
/*  Contact Form — Admin Notification                                  */
/* ------------------------------------------------------------------ */

export function contactFormAdminEmailTemplate(payload: {
  name: string;
  email: string;
  batch: string;
  type: string;
  message: string;
}) {
  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:${BRAND.secondary};">New Support Request</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:${BRAND.textDark};">Contact Form Submission</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;margin:0 0 20px;">
      <tr>
        <td style="padding:12px 18px;background:${BRAND.bgLight};border-bottom:1px solid ${BRAND.border};">
          <p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Name</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${BRAND.textDark};">${payload.name}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 18px;background:${BRAND.white};border-bottom:1px solid ${BRAND.border};">
          <p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Email</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${BRAND.primary};">${payload.email}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 18px;background:${BRAND.bgLight};border-bottom:1px solid ${BRAND.border};">
          <p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Batch</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${BRAND.textDark};">${payload.batch || "Not specified"}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 18px;background:${BRAND.white};border-bottom:1px solid ${BRAND.border};">
          <p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Support Type</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${BRAND.textDark};">${payload.type}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 18px;background:${BRAND.bgLight};">
          <p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Message</p>
          <p style="margin:4px 0 0;font-size:14px;color:${BRAND.textDark};line-height:1.6;">${payload.message}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:${BRAND.textMuted};">Reply directly to <a href="mailto:${payload.email}" style="color:${BRAND.primary};">${payload.email}</a> to respond.</p>`;

  return emailWrapper(content);
}

/* ------------------------------------------------------------------ */
/*  Contact Form — Auto-reply to Submitter                             */
/* ------------------------------------------------------------------ */

export function contactFormAutoReplyTemplate(name: string) {
  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:${BRAND.primary};">Request Received</p>
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${BRAND.textDark};">We Got Your Message!</h1>
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      Dear <strong>${name}</strong>, thank you for reaching out to us. Your support request has been received and our coordination team will review it shortly.
    </p>

    <div style="background:${BRAND.bgLight};border:1px solid ${BRAND.border};border-radius:10px;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.5;">
        📋 <strong style="color:${BRAND.textDark};">Expected Response Times</strong><br/>
        • General queries — within 24 hours<br/>
        • Event coordination — within 12 hours<br/>
        • Urgent requests — within 4 hours
      </p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${BRAND.portalUrl}" style="display:inline-block;background:${BRAND.primary};color:${BRAND.white};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">Visit Portal</a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(content);
}

/* ------------------------------------------------------------------ */
/*  Registration Confirmation                                          */
/* ------------------------------------------------------------------ */

export function registrationConfirmationTemplate(name: string) {
  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:${BRAND.primary};">Registration Submitted</p>
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${BRAND.textDark};">Welcome, ${name}!</h1>
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      Your alumni registration has been submitted successfully. Our verification team will review your profile and you'll receive an email once your membership is approved.
    </p>

    <div style="background:${BRAND.bgLight};border:1px solid ${BRAND.border};border-radius:10px;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.5;">
        📝 <strong style="color:${BRAND.textDark};">What happens next?</strong><br/>
        1. Our team verifies your details<br/>
        2. You receive an approval email<br/>
        3. Login and explore the alumni community
      </p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${BRAND.portalUrl}" style="display:inline-block;background:${BRAND.primary};color:${BRAND.white};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">Visit Portal</a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(content);
}

/* ------------------------------------------------------------------ */
/*  Registration — Admin Notification                                  */
/* ------------------------------------------------------------------ */

export function registrationAdminNotificationTemplate(payload: {
  name: string;
  email: string;
  passingYear: string;
  house: string;
  mobile: string;
  fatherName: string;
}) {
  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:${BRAND.secondary};">New Registration</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:${BRAND.textDark};">New Member Registration</h1>
    <p style="margin:0 0 16px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      A new alumni registration request has been submitted and is awaiting your review.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;margin:0 0 20px;">
      <tr><td style="padding:10px 18px;background:${BRAND.bgLight};border-bottom:1px solid ${BRAND.border};"><p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Name</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${BRAND.textDark};">${payload.name}</p></td></tr>
      <tr><td style="padding:10px 18px;background:${BRAND.white};border-bottom:1px solid ${BRAND.border};"><p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Email</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${BRAND.primary};">${payload.email}</p></td></tr>
      <tr><td style="padding:10px 18px;background:${BRAND.bgLight};border-bottom:1px solid ${BRAND.border};"><p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Batch / Passing Year</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${BRAND.textDark};">${payload.passingYear}</p></td></tr>
      <tr><td style="padding:10px 18px;background:${BRAND.white};border-bottom:1px solid ${BRAND.border};"><p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">House</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${BRAND.textDark};">${payload.house}</p></td></tr>
      <tr><td style="padding:10px 18px;background:${BRAND.bgLight};border-bottom:1px solid ${BRAND.border};"><p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Mobile</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${BRAND.textDark};">${payload.mobile}</p></td></tr>
      <tr><td style="padding:10px 18px;background:${BRAND.white};"><p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Father's Name</p><p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${BRAND.textDark};">${payload.fatherName}</p></td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${BRAND.portalUrl}/admin" style="display:inline-block;background:${BRAND.primary};color:${BRAND.white};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">Review in Admin Panel</a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(content);
}

/* ------------------------------------------------------------------ */
/*  Request Status Update                                              */
/* ------------------------------------------------------------------ */

export function requestStatusUpdateTemplate(payload: {
  name: string;
  subject: string;
  status: string;
  adminNote?: string | null;
}) {
  const statusColors: Record<string, { color: string; bg: string; border: string }> = {
    Open: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    "In Progress": { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    Resolved: { color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
    Closed: { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
  };

  const sc = statusColors[payload.status] || statusColors.Open;

  const noteBlock = payload.adminNote
    ? `<div style="background:${BRAND.bgLight};border:1px solid ${BRAND.border};border-radius:10px;padding:14px 18px;margin:16px 0 0;">
        <p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Admin Note</p>
        <p style="margin:0;font-size:13px;color:${BRAND.textDark};line-height:1.5;">${payload.adminNote}</p>
      </div>`
    : "";

  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:${BRAND.primary};">Request Update</p>
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${BRAND.textDark};">Your Request Status Changed</h1>
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      Dear <strong>${payload.name}</strong>, there is an update on your support request.
    </p>

    <div style="background:${sc.bg};border:1px solid ${sc.border};border-radius:12px;padding:16px 20px;margin:0 0 16px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:${BRAND.textMuted};">Subject: <span style="color:${BRAND.textDark};">${payload.subject}</span></p>
      <p style="margin:0;font-size:14px;font-weight:700;color:${sc.color};">
        Status: ${payload.status}
      </p>
      ${noteBlock}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:8px 0 0;">
          <a href="${BRAND.portalUrl}/contact" style="display:inline-block;background:${BRAND.primary};color:${BRAND.white};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">View Portal</a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(content);
}

/* ------------------------------------------------------------------ */
/*  Password Changed Confirmation                                      */
/* ------------------------------------------------------------------ */

export function passwordChangedConfirmationTemplate(email: string) {
  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:${BRAND.primary};">Security Alert</p>
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${BRAND.textDark};">Password Changed Successfully</h1>
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      The password for your account (<strong>${email}</strong>) has been changed successfully. You can now login with your new password.
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:12px;color:#991b1b;line-height:1.5;">
        🔒 <strong>Didn't make this change?</strong> If you did not reset your password, please contact the admin immediately to secure your account.
      </p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${BRAND.portalUrl}/login" style="display:inline-block;background:${BRAND.primary};color:${BRAND.white};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">Login Now</a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(content);
}

/* ------------------------------------------------------------------ */
/*  Member Approved With Credentials                                   */
/* ------------------------------------------------------------------ */

export function memberApprovedWithCredentialsTemplate(name: string, loginEmail: string, tempPassword: string) {
  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.8px;color:${BRAND.primary};">Membership Approved</p>
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:${BRAND.textDark};">Welcome to the Alumni Community!</h1>
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      Congratulations <strong>${name}</strong>! Your alumni membership has been verified and approved. Here are your login credentials:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;margin:0 0 20px;">
      <tr>
        <td style="padding:14px 20px;background:${BRAND.bgLight};border-bottom:1px solid ${BRAND.border};">
          <p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Login Email</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:${BRAND.primary};">${loginEmail}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 20px;background:${BRAND.white};">
          <p style="margin:0;font-size:11px;font-weight:700;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Temporary Password</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:800;color:${BRAND.textDark};font-family:'Courier New',monospace;letter-spacing:2px;">${tempPassword}</p>
        </td>
      </tr>
    </table>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:12px;color:#92400e;line-height:1.5;">
        ⚠️ <strong>Important:</strong> You will be asked to set a new password on your first login. The temporary password above is for one-time use only.
      </p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${BRAND.portalUrl}/login" style="display:inline-block;background:${BRAND.primary};color:${BRAND.white};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">Login Now</a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(content);
}

/* ------------------------------------------------------------------ */
/*  Mentor Assignment Notification                                     */
/* ------------------------------------------------------------------ */

export function mentorAssignmentEmailTemplate(payload: {
  mentorName: string;
  menteeName: string;
  menteeEmail: string;
  menteePhone: string;
  menteeTrack: string;
  menteeStage: string;
  menteeGoal: string;
  menteeUrgency: string;
}) {
  const content = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:${BRAND.textDark};">
      New Mentee Assigned to You 🎯
    </h2>
    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      Hi <strong>${payload.mentorName}</strong>, a new mentee has been assigned to you through the alumni mentorship program.
      Please review the details below and reach out to begin the mentorship journey.
    </p>

    <div style="background:${BRAND.bgLight};border:1px solid ${BRAND.border};border-radius:12px;padding:20px;margin:0 0 20px;">
      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:${BRAND.primary};text-transform:uppercase;letter-spacing:1px;">
        Mentee Details
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:${BRAND.textDark};">
        <tr>
          <td style="padding:6px 0;font-weight:600;width:120px;vertical-align:top;">Name</td>
          <td style="padding:6px 0;">${payload.menteeName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;vertical-align:top;">Email</td>
          <td style="padding:6px 0;"><a href="mailto:${payload.menteeEmail}" style="color:${BRAND.primary};text-decoration:none;">${payload.menteeEmail}</a></td>
        </tr>
        ${payload.menteePhone ? `<tr>
          <td style="padding:6px 0;font-weight:600;vertical-align:top;">Phone</td>
          <td style="padding:6px 0;"><a href="tel:${payload.menteePhone}" style="color:${BRAND.primary};text-decoration:none;">${payload.menteePhone}</a></td>
        </tr>` : ""}
        <tr>
          <td style="padding:6px 0;font-weight:600;vertical-align:top;">Track</td>
          <td style="padding:6px 0;">${payload.menteeTrack}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;vertical-align:top;">Stage</td>
          <td style="padding:6px 0;">${payload.menteeStage}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:600;vertical-align:top;">Urgency</td>
          <td style="padding:6px 0;"><span style="color:${payload.menteeUrgency.includes("Urgent") ? "#dc2626" : BRAND.textDark};font-weight:${payload.menteeUrgency.includes("Urgent") ? "700" : "400"};">${payload.menteeUrgency}</span></td>
        </tr>
      </table>
    </div>

    <div style="background:${BRAND.bgLight};border:1px solid ${BRAND.border};border-radius:12px;padding:20px;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${BRAND.primary};text-transform:uppercase;letter-spacing:1px;">
        Mentee's Goal
      </p>
      <p style="margin:0;font-size:14px;color:${BRAND.textDark};line-height:1.7;">
        ${payload.menteeGoal}
      </p>
    </div>

    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;font-size:12px;color:#065f46;line-height:1.5;">
        💡 <strong>Next Steps:</strong> Please reach out to your mentee within the next 48 hours via email or phone to introduce yourself and set up your first session.
      </p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${BRAND.portalUrl}/user/mentor" style="display:inline-block;background:${BRAND.primary};color:${BRAND.white};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">View Mentor Dashboard</a>
        </td>
      </tr>
    </table>`;

  return emailWrapper(content);
}

