import { postgresPool } from "@/lib/postgres";

export type ConnectionRequestStatus = "Pending" | "Accepted" | "Declined" | "Cancelled";

export type ConnectionRequest = {
  id: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  message: string;
  status: ConnectionRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type UserConnection = {
  connectionId: string;
  name: string;
  email: string;
  batch: string;
  city: string;
  role: string;
  company: string;
  connectedAt: string;
};

export type DiscoverProfile = {
  profileId: string;
  fullName: string;
  email: string;
  batch: string;
  city: string;
  role: string;
  company: string;
  reason: string;
};

const seedProfiles = [
  {
    fullName: "Aman Sharma",
    email: "aman.alumni@jnvportal.in",
    batch: "2018",
    city: "Lucknow",
    role: "Software Engineer",
    company: "CloudSprint",
  },
  {
    fullName: "Ritika Verma",
    email: "ritika.verma@example.com",
    batch: "2017",
    city: "Bengaluru",
    role: "Senior Product Manager",
    company: "InsightGrid",
  },
  {
    fullName: "Arjun Singh",
    email: "arjun.singh@example.com",
    batch: "2015",
    city: "Pune",
    role: "Engineering Manager",
    company: "NovaStack",
  },
  {
    fullName: "Sana Khan",
    email: "sana.khan@example.com",
    batch: "2020",
    city: "Delhi",
    role: "Data Scientist",
    company: "ScaleBridge",
  },
  {
    fullName: "Meenal Sharma",
    email: "meenal.sharma@example.com",
    batch: "2012",
    city: "Hyderabad",
    role: "UX Lead",
    company: "BlueOrbit",
  },
  {
    fullName: "Aman Chaturvedi",
    email: "aman.chaturvedi@example.com",
    batch: "2019",
    city: "Noida",
    role: "Backend Engineer",
    company: "RocketWare",
  },
  {
    fullName: "Karan Verma",
    email: "karan.verma@example.com",
    batch: "2019",
    city: "Chandigarh",
    role: "Business Analyst",
    company: "Zenith Insights",
  },
  {
    fullName: "Riya Dubey",
    email: "riya.dubey@example.com",
    batch: "2021",
    city: "Gurugram",
    role: "ML Engineer",
    company: "Vertex AI",
  },
];

async function ensureConnectionTables() {
  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS user_connection_profiles (
      id BIGSERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      batch TEXT NOT NULL,
      city TEXT NOT NULL,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS user_connection_requests (
      id BIGSERIAL PRIMARY KEY,
      sender_email TEXT NOT NULL,
      receiver_email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT user_connection_requests_status_check CHECK (status IN ('Pending', 'Accepted', 'Declined', 'Cancelled')),
      CONSTRAINT user_connection_requests_no_self CHECK (sender_email <> receiver_email)
    )
  `);

  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_user_connection_requests_sender ON user_connection_requests(sender_email)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_user_connection_requests_receiver ON user_connection_requests(receiver_email)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_user_connection_requests_status ON user_connection_requests(status)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_user_connection_requests_updated_at ON user_connection_requests(updated_at DESC)`);

  const countResult = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM user_connection_profiles`);
  if (Number(countResult.rows[0]?.count || "0") === 0) {
    for (const profile of seedProfiles) {
      await postgresPool.query(
        `
          INSERT INTO user_connection_profiles (full_name, email, batch, city, role, company)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [profile.fullName, profile.email.toLowerCase(), profile.batch, profile.city, profile.role, profile.company],
      );
    }
  }

  const reqCount = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM user_connection_requests`);
  if (Number(reqCount.rows[0]?.count || "0") === 0) {
    await postgresPool.query(
      `
        INSERT INTO user_connection_requests (sender_email, receiver_email, message, status)
        VALUES
          ('karan.verma@example.com', 'aman.alumni@jnvportal.in', 'Hi Aman, same batch cluster se hoon, connect karna hai.', 'Pending'),
          ('riya.dubey@example.com', 'aman.alumni@jnvportal.in', 'Data role ke liye guidance chahiye, please connect.', 'Pending'),
          ('aman.alumni@jnvportal.in', 'arjun.singh@example.com', 'Sir, backend referrals ke liye connect request bhej raha hoon.', 'Pending'),
          ('aman.alumni@jnvportal.in', 'ritika.verma@example.com', 'Product mentorship ke liye connect request.', 'Accepted')
      `,
    );
  }
}

async function ensureProfileExists(email: string, fullName?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  await ensureConnectionTables();

  const existing = await postgresPool.query<{ id: string }>(
    `SELECT id::text FROM user_connection_profiles WHERE email = $1 LIMIT 1`,
    [normalizedEmail],
  );

  if (existing.rowCount > 0) {
    if (fullName?.trim()) {
      await postgresPool.query(
        `UPDATE user_connection_profiles SET full_name = $2, updated_at = NOW() WHERE email = $1`,
        [normalizedEmail, fullName.trim()],
      );
    }
    return;
  }

  const derivedName = fullName?.trim() || normalizedEmail.split("@")[0].replace(/[._-]+/g, " ");
  await postgresPool.query(
    `
      INSERT INTO user_connection_profiles (full_name, email, batch, city, role, company)
      VALUES ($1, $2, 'N/A', 'N/A', 'Alumni Member', 'Community')
    `,
    [derivedName, normalizedEmail],
  );
}

function toPublicRequestId(id: string) {
  return `CR-${id}`;
}

function toNumericRequestId(publicId: string) {
  return publicId.replace(/^CR-/, "");
}

export async function getUserConnectionsDashboard(userEmail: string, search = "") {
  await ensureConnectionTables();
  const normalizedEmail = userEmail.trim().toLowerCase();
  const searchTerm = search.trim().toLowerCase();

  const incomingResult = await postgresPool.query<{
    id: string;
    sender_name: string;
    sender_email: string;
    receiver_name: string;
    receiver_email: string;
    message: string;
    status: ConnectionRequestStatus;
    created_at: string;
    updated_at: string;
  }>(
    `
      SELECT
        r.id::text,
        sp.full_name AS sender_name,
        r.sender_email,
        rp.full_name AS receiver_name,
        r.receiver_email,
        r.message,
        r.status,
        r.created_at::text,
        r.updated_at::text
      FROM user_connection_requests r
      LEFT JOIN user_connection_profiles sp ON sp.email = r.sender_email
      LEFT JOIN user_connection_profiles rp ON rp.email = r.receiver_email
      WHERE r.receiver_email = $1 AND r.status = 'Pending'
      ORDER BY r.updated_at DESC
    `,
    [normalizedEmail],
  );

  const sentResult = await postgresPool.query<{
    id: string;
    sender_name: string;
    sender_email: string;
    receiver_name: string;
    receiver_email: string;
    message: string;
    status: ConnectionRequestStatus;
    created_at: string;
    updated_at: string;
  }>(
    `
      SELECT
        r.id::text,
        sp.full_name AS sender_name,
        r.sender_email,
        rp.full_name AS receiver_name,
        r.receiver_email,
        r.message,
        r.status,
        r.created_at::text,
        r.updated_at::text
      FROM user_connection_requests r
      LEFT JOIN user_connection_profiles sp ON sp.email = r.sender_email
      LEFT JOIN user_connection_profiles rp ON rp.email = r.receiver_email
      WHERE r.sender_email = $1
      ORDER BY r.updated_at DESC
      LIMIT 100
    `,
    [normalizedEmail],
  );

  const connectionsResult = await postgresPool.query<{
    id: string;
    sender_email: string;
    receiver_email: string;
    sender_name: string;
    receiver_name: string;
    sender_batch: string;
    receiver_batch: string;
    sender_city: string;
    receiver_city: string;
    sender_role: string;
    receiver_role: string;
    sender_company: string;
    receiver_company: string;
    updated_at: string;
  }>(
    `
      SELECT
        r.id::text,
        r.sender_email,
        r.receiver_email,
        sp.full_name AS sender_name,
        rp.full_name AS receiver_name,
        sp.batch AS sender_batch,
        rp.batch AS receiver_batch,
        sp.city AS sender_city,
        rp.city AS receiver_city,
        sp.role AS sender_role,
        rp.role AS receiver_role,
        sp.company AS sender_company,
        rp.company AS receiver_company,
        r.updated_at::text
      FROM user_connection_requests r
      LEFT JOIN user_connection_profiles sp ON sp.email = r.sender_email
      LEFT JOIN user_connection_profiles rp ON rp.email = r.receiver_email
      WHERE r.status = 'Accepted' AND (r.sender_email = $1 OR r.receiver_email = $1)
      ORDER BY r.updated_at DESC
    `,
    [normalizedEmail],
  );

  const blockedEmails = new Set<string>([normalizedEmail]);
  for (const row of incomingResult.rows) {
    blockedEmails.add(row.sender_email);
  }
  for (const row of sentResult.rows) {
    blockedEmails.add(row.receiver_email);
  }
  for (const row of connectionsResult.rows) {
    blockedEmails.add(row.sender_email);
    blockedEmails.add(row.receiver_email);
  }

  const discoverResult = await postgresPool.query<{
    id: string;
    full_name: string;
    email: string;
    batch: string;
    city: string;
    role: string;
    company: string;
  }>(
    `
      SELECT id::text, full_name, email, batch, city, role, company
      FROM user_connection_profiles
      WHERE email <> $1
      ORDER BY updated_at DESC
      LIMIT 300
    `,
    [normalizedEmail],
  );

  const incoming: ConnectionRequest[] = incomingResult.rows
    .map((row) => ({
      id: toPublicRequestId(row.id),
      senderName: row.sender_name || row.sender_email,
      senderEmail: row.sender_email,
      receiverName: row.receiver_name || row.receiver_email,
      receiverEmail: row.receiver_email,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
    .filter((item) => {
      if (!searchTerm) return true;
      const searchable = `${item.senderName} ${item.senderEmail} ${item.message}`.toLowerCase();
      return searchable.includes(searchTerm);
    });

  const sent: ConnectionRequest[] = sentResult.rows
    .map((row) => ({
      id: toPublicRequestId(row.id),
      senderName: row.sender_name || row.sender_email,
      senderEmail: row.sender_email,
      receiverName: row.receiver_name || row.receiver_email,
      receiverEmail: row.receiver_email,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
    .filter((item) => {
      if (!searchTerm) return true;
      const searchable = `${item.receiverName} ${item.receiverEmail} ${item.message} ${item.status}`.toLowerCase();
      return searchable.includes(searchTerm);
    });

  const connections: UserConnection[] = connectionsResult.rows
    .map((row) => {
      const isSender = row.sender_email === normalizedEmail;
      return {
        connectionId: toPublicRequestId(row.id),
        name: isSender ? row.receiver_name || row.receiver_email : row.sender_name || row.sender_email,
        email: isSender ? row.receiver_email : row.sender_email,
        batch: isSender ? row.receiver_batch || "N/A" : row.sender_batch || "N/A",
        city: isSender ? row.receiver_city || "N/A" : row.sender_city || "N/A",
        role: isSender ? row.receiver_role || "Alumni Member" : row.sender_role || "Alumni Member",
        company: isSender ? row.receiver_company || "Community" : row.sender_company || "Community",
        connectedAt: row.updated_at,
      };
    })
    .filter((item) => {
      if (!searchTerm) return true;
      const searchable = `${item.name} ${item.email} ${item.role} ${item.company} ${item.city}`.toLowerCase();
      return searchable.includes(searchTerm);
    });

  const discover: DiscoverProfile[] = discoverResult.rows
    .filter((item) => !blockedEmails.has(item.email))
    .map((item) => ({
      profileId: `CP-${item.id}`,
      fullName: item.full_name,
      email: item.email,
      batch: item.batch,
      city: item.city,
      role: item.role,
      company: item.company,
      reason: `Same alumni community • ${item.role}`,
    }))
    .filter((item) => {
      if (!searchTerm) return true;
      const searchable = `${item.fullName} ${item.email} ${item.role} ${item.company} ${item.city}`.toLowerCase();
      return searchable.includes(searchTerm);
    })
    .slice(0, 50);

  return {
    incoming,
    sent,
    connections,
    discover,
    summary: {
      pendingIncoming: incoming.length,
      pendingSent: sent.filter((item) => item.status === "Pending").length,
      totalConnections: connections.length,
      discoverCount: discover.length,
    },
  };
}

export async function sendConnectionRequest(payload: {
  senderEmail: string;
  senderName?: string;
  receiverEmail: string;
  message?: string;
}) {
  await ensureProfileExists(payload.senderEmail, payload.senderName);
  await ensureProfileExists(payload.receiverEmail);

  const senderEmail = payload.senderEmail.trim().toLowerCase();
  const receiverEmail = payload.receiverEmail.trim().toLowerCase();
  if (senderEmail === receiverEmail) {
    return { ok: false as const, reason: "self" as const };
  }

  const existing = await postgresPool.query<{
    id: string;
    sender_email: string;
    receiver_email: string;
    status: ConnectionRequestStatus;
  }>(
    `
      SELECT id::text, sender_email, receiver_email, status
      FROM user_connection_requests
      WHERE (sender_email = $1 AND receiver_email = $2)
         OR (sender_email = $2 AND receiver_email = $1)
      ORDER BY updated_at DESC
      LIMIT 1
    `,
    [senderEmail, receiverEmail],
  );

  if (existing.rowCount > 0) {
    const previous = existing.rows[0];
    if (previous.status === "Pending") {
      return { ok: false as const, reason: "already-pending" as const };
    }
    if (previous.status === "Accepted") {
      return { ok: false as const, reason: "already-connected" as const };
    }

    const updated = await postgresPool.query<{ id: string }>(
      `
        UPDATE user_connection_requests
        SET sender_email = $2,
            receiver_email = $3,
            message = $4,
            status = 'Pending',
            updated_at = NOW()
        WHERE id = $1
        RETURNING id::text
      `,
      [previous.id, senderEmail, receiverEmail, payload.message?.trim() || "Let us connect through alumni network."],
    );

    return { ok: true as const, requestId: toPublicRequestId(updated.rows[0].id) };
  }

  const inserted = await postgresPool.query<{ id: string }>(
    `
      INSERT INTO user_connection_requests (sender_email, receiver_email, message, status)
      VALUES ($1, $2, $3, 'Pending')
      RETURNING id::text
    `,
    [senderEmail, receiverEmail, payload.message?.trim() || "Let us connect through alumni network."],
  );

  return { ok: true as const, requestId: toPublicRequestId(inserted.rows[0].id) };
}

export async function respondToConnectionRequest(payload: {
  requestId: string;
  userEmail: string;
  action: "accept" | "decline";
}) {
  await ensureConnectionTables();

  const requestId = toNumericRequestId(payload.requestId);
  const userEmail = payload.userEmail.trim().toLowerCase();

  const nextStatus: ConnectionRequestStatus = payload.action === "accept" ? "Accepted" : "Declined";

  const result = await postgresPool.query<{ id: string }>(
    `
      UPDATE user_connection_requests
      SET status = $2, updated_at = NOW()
      WHERE id = $1 AND receiver_email = $3 AND status = 'Pending'
      RETURNING id::text
    `,
    [requestId, nextStatus, userEmail],
  );

  if (result.rowCount === 0) {
    return { ok: false as const, reason: "not-found" as const };
  }

  return { ok: true as const };
}

export async function manageConnection(payload: {
  requestId: string;
  userEmail: string;
  action: "cancel" | "remove";
}) {
  await ensureConnectionTables();

  const requestId = toNumericRequestId(payload.requestId);
  const userEmail = payload.userEmail.trim().toLowerCase();

  if (payload.action === "cancel") {
    const result = await postgresPool.query<{ id: string }>(
      `
        UPDATE user_connection_requests
        SET status = 'Cancelled', updated_at = NOW()
        WHERE id = $1 AND sender_email = $2 AND status = 'Pending'
        RETURNING id::text
      `,
      [requestId, userEmail],
    );

    if (result.rowCount === 0) {
      return { ok: false as const, reason: "not-found" as const };
    }

    return { ok: true as const };
  }

  const result = await postgresPool.query<{ id: string }>(
    `
      UPDATE user_connection_requests
      SET status = 'Cancelled', updated_at = NOW()
      WHERE id = $1 AND status = 'Accepted' AND (sender_email = $2 OR receiver_email = $2)
      RETURNING id::text
    `,
    [requestId, userEmail],
  );

  if (result.rowCount === 0) {
    return { ok: false as const, reason: "not-found" as const };
  }

  return { ok: true as const };
}
