import { postgresPool } from "@/lib/postgres";

export type MessageConversation = {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: "me" | "them";
  text: string;
  time: string;
  status: "sending" | "sent" | "delivered";
};

let messagesTableReady = false;
let messagesTableInitPromise: Promise<void> | null = null;

const seedConversations = [
  { participant_id: "p1", name: "Nidhi Sharma", role: "Mentor • Product", is_online: true },
  { participant_id: "p2", name: "Aman Tiwari", role: "Senior Alumni • Engineering", is_online: false },
  { participant_id: "p3", name: "Career Support Desk", role: "Admin Team", is_online: true },
];

async function ensureMessagesTables() {
  if (messagesTableReady) return;
  if (messagesTableInitPromise) { await messagesTableInitPromise; return; }

  messagesTableInitPromise = (async () => {
    try {
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS msg_conversations (
          id BIGSERIAL PRIMARY KEY,
          owner_email TEXT NOT NULL,
          participant_id TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          is_online BOOLEAN NOT NULL DEFAULT false,
          last_message TEXT NOT NULL DEFAULT '',
          last_time TEXT NOT NULL DEFAULT '',
          unread_count INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT msg_conv_unique UNIQUE (owner_email, participant_id)
        )
      `);

      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS msg_chat_messages (
          id BIGSERIAL PRIMARY KEY,
          conversation_id BIGINT NOT NULL REFERENCES msg_conversations(id) ON DELETE CASCADE,
          sender TEXT NOT NULL,
          text TEXT NOT NULL,
          time TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'sent',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_msg_conv_owner ON msg_conversations(owner_email)`);
      await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_msg_chat_conv ON msg_chat_messages(conversation_id)`);

      messagesTableReady = true;
    } finally {
      messagesTableInitPromise = null;
    }
  })();

  await messagesTableInitPromise;
}

export async function getUserConversations(userEmail: string) {
  await ensureMessagesTables();
  const normalized = userEmail.trim().toLowerCase();

  const count = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM msg_conversations WHERE owner_email = $1`, [normalized]);
  if (Number(count.rows[0]?.count || "0") === 0) {
    for (const c of seedConversations) {
      const msg = c.participant_id === "p1" ? "Share your updated roadmap before next session." :
                  c.participant_id === "p2" ? "Referral thread updated. Please check details." : "Your profile verification is in final stage.";
      const unread = c.participant_id === "p1" ? 2 : c.participant_id === "p3" ? 1 : 0;
      await postgresPool.query(
        `INSERT INTO msg_conversations (owner_email, participant_id, name, role, is_online, last_message, last_time, unread_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [normalized, c.participant_id, c.name, c.role, c.is_online, msg, "10:42 AM", unread]
      );
    }
  }

  const result = await postgresPool.query(
    `SELECT id::text, name, role, is_online, unread_count, last_message, last_time FROM msg_conversations WHERE owner_email = $1 ORDER BY updated_at DESC`,
    [normalized]
  );

  return result.rows.map((r: Record<string, unknown>) => ({
    id: String(r.id),
    name: String(r.name),
    role: String(r.role),
    isOnline: Boolean(r.is_online),
    unreadCount: Number(r.unread_count),
    lastMessage: String(r.last_message),
    lastTime: String(r.last_time),
  }));
}

export async function getConversationMessages(conversationId: string) {
  await ensureMessagesTables();
  const result = await postgresPool.query(
    `SELECT id::text, sender, text, time, status FROM msg_chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [conversationId]
  );
  
  if (result.rows.length === 0) {
    await postgresPool.query(
      `INSERT INTO msg_chat_messages (conversation_id, sender, text, time) VALUES ($1, $2, $3, $4)`,
      [conversationId, "them", "Hi, let's catch up on the progress.", "10:28 AM"]
    );
    const retry = await postgresPool.query(`SELECT id::text, sender, text, time, status FROM msg_chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC`, [conversationId]);
    return retry.rows.map(mapMsg);
  }

  return result.rows.map(mapMsg);
}

function mapMsg(r: Record<string, unknown>) {
  return {
    id: String(r.id),
    conversationId: String(r.conversation_id),
    sender: String(r.sender) as "me" | "them",
    text: String(r.text),
    time: String(r.time),
    status: String(r.status) as "sending" | "sent" | "delivered",
  };
}

export async function sendMessage(conversationId: string, text: string) {
  await ensureMessagesTables();
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
  const insert = await postgresPool.query(
    `INSERT INTO msg_chat_messages (conversation_id, sender, text, time, status) VALUES ($1, 'me', $2, $3, 'delivered') RETURNING id::text`,
    [conversationId, text.trim(), time]
  );
  
  await postgresPool.query(
    `UPDATE msg_conversations SET last_message = $1, last_time = $2, unread_count = 0, updated_at = NOW() WHERE id = $3`,
    [text.trim(), time, conversationId]
  );
  
  return { id: String(insert.rows[0].id), text, time, status: "delivered", sender: "me" };
}

export async function markConversationRead(conversationId: string) {
  await ensureMessagesTables();
  await postgresPool.query(`UPDATE msg_conversations SET unread_count = 0 WHERE id = $1`, [conversationId]);
  return { ok: true };
}
