import { postgresPool } from "@/lib/postgres";

export type MessageConversation = {
  id: string; // participant's email
  name: string;
  role: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
};

export type ChatMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  createdAt: string; // ISO string
  isEdited: boolean;
  status: "sent" | "delivered";
};

let messagesTableReady = false;
let messagesTableInitPromise: Promise<void> | null = null;

export async function ensureMessagesTables() {
  if (messagesTableReady) return;
  if (messagesTableInitPromise) {
    await messagesTableInitPromise;
    return;
  }

  messagesTableInitPromise = (async () => {
    try {
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS alumni_messages (
          id BIGSERIAL PRIMARY KEY,
          sender_email TEXT NOT NULL,
          receiver_email TEXT NOT NULL,
          message_text TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT false,
          is_edited BOOLEAN NOT NULL DEFAULT false,
          deleted_by_sender BOOLEAN NOT NULL DEFAULT false,
          deleted_by_receiver BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await postgresPool.query(`
        CREATE INDEX IF NOT EXISTS idx_alumni_messages_sender ON alumni_messages(sender_email)
      `);
      await postgresPool.query(`
        CREATE INDEX IF NOT EXISTS idx_alumni_messages_receiver ON alumni_messages(receiver_email)
      `);
      messagesTableReady = true;
    } finally {
      messagesTableInitPromise = null;
    }
  })();

  await messagesTableInitPromise;
}

export async function getUserConversations(userEmail: string): Promise<MessageConversation[]> {
  await ensureMessagesTables();
  const email = userEmail.trim().toLowerCase();

  // Fetch all accepted connections for this user.
  const connectionsRes = await postgresPool.query<{
    participant_email: string;
    name: string;
    role: string;
  }>(
    `
      SELECT 
        CASE WHEN r.sender_email = $1 THEN r.receiver_email ELSE r.sender_email END AS participant_email,
        COALESCE(p.full_name, 'Alumni Member') AS name,
        COALESCE(p.role, 'Alumni') AS role
      FROM user_connection_requests r
      LEFT JOIN user_connection_profiles p ON p.email = CASE WHEN r.sender_email = $1 THEN r.receiver_email ELSE r.sender_email END
      WHERE r.status = 'Accepted' AND (r.sender_email = $1 OR r.receiver_email = $1)
    `,
    [email]
  );

  const list: MessageConversation[] = [];

  for (const conn of connectionsRes.rows) {
    const pEmail = conn.participant_email;

    // Fetch the last active message
    const lastMsgRes = await postgresPool.query<{
      message_text: string;
      created_at: Date;
    }>(
      `
        SELECT message_text, created_at
        FROM alumni_messages
        WHERE (
          (sender_email = $1 AND receiver_email = $2 AND deleted_by_sender = false)
          OR 
          (sender_email = $2 AND receiver_email = $1 AND deleted_by_receiver = false)
        )
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [email, pEmail]
    );

    // Fetch unread count for messages received from this participant
    const unreadRes = await postgresPool.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM alumni_messages
        WHERE sender_email = $2 AND receiver_email = $1 AND is_read = false AND deleted_by_receiver = false
      `,
      [email, pEmail]
    );

    let lastMessage = "No messages yet. Start chatting!";
    let lastTime = "";

    if (lastMsgRes.rowCount && lastMsgRes.rowCount > 0) {
      lastMessage = lastMsgRes.rows[0].message_text;
      const date = lastMsgRes.rows[0].created_at;
      lastTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    list.push({
      id: pEmail,
      name: conn.name,
      role: conn.role,
      isOnline: false,
      unreadCount: Number(unreadRes.rows[0]?.count || "0"),
      lastMessage,
      lastTime,
    });
  }

  // Sort conversations by unread count first, or status.
  return list;
}

export async function getConversationMessages(userEmail: string, participantEmail: string): Promise<ChatMessage[]> {
  await ensureMessagesTables();
  const email = userEmail.trim().toLowerCase();
  const pEmail = participantEmail.trim().toLowerCase();

  // Mark all incoming messages from this participant as read
  await postgresPool.query(
    `
      UPDATE alumni_messages
      SET is_read = true
      WHERE sender_email = $2 AND receiver_email = $1 AND is_read = false AND deleted_by_receiver = false
    `,
    [email, pEmail]
  );

  const result = await postgresPool.query<{
    id: string;
    sender_email: string;
    message_text: string;
    created_at: Date;
    is_edited: boolean;
  }>(
    `
      SELECT id::text, sender_email, message_text, created_at, is_edited
      FROM alumni_messages
      WHERE (
        (sender_email = $1 AND receiver_email = $2 AND deleted_by_sender = false)
        OR 
        (sender_email = $2 AND receiver_email = $1 AND deleted_by_receiver = false)
      )
      ORDER BY created_at ASC
    `,
    [email, pEmail]
  );

  return result.rows.map((row) => ({
    id: row.id,
    sender: row.sender_email === email ? "me" : "them",
    text: row.message_text,
    time: row.created_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: row.created_at.toISOString(),
    isEdited: row.is_edited,
    status: "delivered",
  }));
}

export async function sendMessage(senderEmail: string, receiverEmail: string, text: string) {
  await ensureMessagesTables();
  const sender = senderEmail.trim().toLowerCase();
  const receiver = receiverEmail.trim().toLowerCase();

  const insert = await postgresPool.query<{ id: string; created_at: Date }>(
    `
      INSERT INTO alumni_messages (sender_email, receiver_email, message_text)
      VALUES ($1, $2, $3)
      RETURNING id::text, created_at
    `,
    [sender, receiver, text.trim()]
  );

  const row = insert.rows[0];
  return {
    id: row.id,
    sender: "me" as const,
    text: text.trim(),
    time: row.created_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: row.created_at.toISOString(),
    isEdited: false,
    status: "delivered" as const,
  };
}

export async function clearChatHistory(userEmail: string, participantEmail: string) {
  await ensureMessagesTables();
  const email = userEmail.trim().toLowerCase();
  const pEmail = participantEmail.trim().toLowerCase();

  await postgresPool.query(
    `
      UPDATE alumni_messages
      SET deleted_by_sender = true
      WHERE sender_email = $1 AND receiver_email = $2
    `,
    [email, pEmail]
  );

  await postgresPool.query(
    `
      UPDATE alumni_messages
      SET deleted_by_receiver = true
      WHERE sender_email = $2 AND receiver_email = $1
    `,
    [email, pEmail]
  );

  return { ok: true };
}

export async function editMessage(messageId: string, senderEmail: string, newText: string) {
  await ensureMessagesTables();
  const email = senderEmail.trim().toLowerCase();

  const check = await postgresPool.query<{ created_at: Date }>(
    `
      SELECT created_at
      FROM alumni_messages
      WHERE id = $1 AND sender_email = $2 AND deleted_by_sender = false
      LIMIT 1
    `,
    [messageId, email]
  );

  if (check.rowCount === 0) {
    return { ok: false, message: "Message not found or unauthorized." };
  }

  const ageInMs = Date.now() - new Date(check.rows[0].created_at).getTime();
  if (ageInMs > 5 * 60 * 1000) {
    return { ok: false, message: "Cannot edit message after 5 minutes." };
  }

  await postgresPool.query(
    `
      UPDATE alumni_messages
      SET message_text = $1, is_edited = true, updated_at = NOW()
      WHERE id = $2
    `,
    [newText.trim(), messageId]
  );

  return { ok: true };
}
