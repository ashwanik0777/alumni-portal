import { NextRequest, NextResponse } from "next/server";
import { postgresPool } from "@/lib/postgres";
import { sendMail, contactFormAdminEmailTemplate, contactFormAutoReplyTemplate } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      batch?: string;
      type?: string;
      message?: string;
    };

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const batch = body.batch?.trim() || null;
    const supportType = body.type?.trim() || null;
    const message = body.message?.trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, email, and message are required." },
        { status: 400 },
      );
    }

    await postgresPool.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        batch TEXT,
        support_type TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await postgresPool.query(
      `INSERT INTO contact_submissions (name, email, batch, support_type, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, email, batch, supportType, message],
    );

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      sendMail({
        to: adminEmail,
        subject: "New Contact Form Submission",
        html: contactFormAdminEmailTemplate({ name, email, batch: batch || "", type: supportType || "", message }),
      }).catch((err) => console.error("Contact admin email error", err));
    }

    sendMail({
      to: email,
      subject: "We Received Your Message",
      html: contactFormAutoReplyTemplate(name),
    }).catch((err) => console.error("Contact auto-reply email error", err));

    return NextResponse.json({ message: "Your request has been submitted successfully." });
  } catch (error) {
    console.error("Public contact POST error:", error);
    return NextResponse.json({ message: "Unable to submit your request." }, { status: 500 });
  }
}
