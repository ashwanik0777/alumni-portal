import { postgresPool } from "@/lib/postgres";

let chatTableReady = false;
let chatTableInitPromise: Promise<void> | null = null;

export async function ensureMentorshipChatTable() {
  if (chatTableReady) return;
  if (chatTableInitPromise) {
    await chatTableInitPromise;
    return;
  }

  chatTableInitPromise = (async () => {
    try {
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS mentorship_messages (
          id BIGSERIAL PRIMARY KEY,
          application_id BIGINT NOT NULL,
          sender_email TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_mentorship_messages_app ON mentorship_messages(application_id, created_at ASC);
      `);
      chatTableReady = true;
    } finally {
      chatTableInitPromise = null;
    }
  })();

  await chatTableInitPromise;
}

export type MentorshipMessage = {
  id: string;
  applicationId: string;
  senderEmail: string;
  message: string;
  createdAt: string;
};

export async function getMessages(applicationId: string): Promise<MentorshipMessage[]> {
  await ensureMentorshipChatTable();

  const result = await postgresPool.query<{
    id: string;
    application_id: string;
    sender_email: string;
    message: string;
    created_at: string;
  }>(
    `SELECT id::text, application_id::text, sender_email, message, created_at::text
     FROM mentorship_messages
     WHERE application_id = $1
     ORDER BY created_at ASC
     LIMIT 500`,
    [applicationId],
  );

  return result.rows.map((r) => ({
    id: r.id,
    applicationId: r.application_id,
    senderEmail: r.sender_email,
    message: r.message,
    createdAt: r.created_at,
  }));
}

export async function sendMessage(applicationId: string, senderEmail: string, message: string) {
  await ensureMentorshipChatTable();

  const trimmed = message.trim();
  if (!trimmed) return null;

  const result = await postgresPool.query<{ id: string; created_at: string }>(
    `INSERT INTO mentorship_messages (application_id, sender_email, message)
     VALUES ($1, $2, $3)
     RETURNING id::text, created_at::text`,
    [applicationId, senderEmail.trim().toLowerCase(), trimmed],
  );

  return {
    id: result.rows[0].id,
    applicationId,
    senderEmail: senderEmail.trim().toLowerCase(),
    message: trimmed,
    createdAt: result.rows[0].created_at,
  };
}

export async function deleteMessagesForApplication(applicationId: string) {
  await ensureMentorshipChatTable();
  await postgresPool.query(
    `DELETE FROM mentorship_messages WHERE application_id = $1`,
    [applicationId],
  );
}
