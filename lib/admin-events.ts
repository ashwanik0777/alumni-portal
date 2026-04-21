import { postgresPool } from "@/lib/postgres";

export type EventStatus = "Pending" | "Approved" | "Rejected" | "Needs Info";
export type RegistrationStatus = "Going" | "Interested" | "Cancelled";

export type AdminEvent = {
  id: string;
  title: string;
  eventType: string;
  eventDate: string;
  location: string;
  mode: string;
  organizerName: string;
  organizerEmail: string;
  status: EventStatus;
  rejectionReason: string | null;
  attendeeCount: number;
  goingCount: number;
  submittedAt: string;
  updatedAt: string;
};

export type EventAttendee = {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeMobile: string | null;
  registrationStatus: RegistrationStatus;
  registeredAt: string;
  updatedAt: string;
};

export type EventListFilters = {
  search?: string;
  status?: string;
  year?: string;
  page?: number;
  pageSize?: number;
};

type EventsListResult = {
  rows: AdminEvent[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalRegistrations: number;
    upcomingCount: number;
  };
};

type EventsListCacheEntry = {
  expiresAt: number;
  data: EventsListResult;
};

const EVENTS_LIST_CACHE_TTL_MS = 12_000;
const eventsListCache = new Map<string, EventsListCacheEntry>();

const seedEvents: Array<Omit<AdminEvent, "id" | "submittedAt" | "updatedAt" | "attendeeCount" | "goingCount">> = [
  {
    title: "Annual Alumni Meet 2026",
    eventType: "Networking",
    eventDate: "2026-09-14",
    location: "JNV Main Auditorium",
    mode: "Offline",
    organizerName: "Ritika Verma",
    organizerEmail: "ritika.verma@example.com",
    status: "Approved",
    rejectionReason: null,
  },
  {
    title: "Career Masterclass",
    eventType: "Career",
    eventDate: "2026-05-21",
    location: "Virtual",
    mode: "Online",
    organizerName: "Arjun Singh",
    organizerEmail: "arjun.singh@example.com",
    status: "Approved",
    rejectionReason: null,
  },
  {
    title: "Startup Pitch Day",
    eventType: "Entrepreneurship",
    eventDate: "2026-08-02",
    location: "Innovation Lab",
    mode: "Hybrid",
    organizerName: "Sana Khan",
    organizerEmail: "sana.khan@example.com",
    status: "Approved",
    rejectionReason: null,
  },
  {
    title: "Sports Reunion Cup",
    eventType: "Sports",
    eventDate: "2026-07-09",
    location: "School Ground",
    mode: "Offline",
    organizerName: "Meenal Sharma",
    organizerEmail: "meenal.sharma@example.com",
    status: "Approved",
    rejectionReason: null,
  },
  {
    title: "Scholarship Orientation",
    eventType: "Scholarship",
    eventDate: "2026-06-18",
    location: "Conference Hall B",
    mode: "Hybrid",
    organizerName: "Aman Chaturvedi",
    organizerEmail: "aman.chaturvedi@example.com",
    status: "Approved",
    rejectionReason: null,
  },
];

async function ensureEventRegistrationsTable() {
  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS admin_event_registrations (
      id BIGSERIAL PRIMARY KEY,
      event_id BIGINT NOT NULL REFERENCES admin_events(id) ON DELETE CASCADE,
      attendee_name TEXT NOT NULL,
      attendee_email TEXT NOT NULL,
      attendee_mobile TEXT,
      registration_status TEXT NOT NULL DEFAULT 'Going',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT admin_event_registrations_status_check CHECK (registration_status IN ('Going', 'Interested', 'Cancelled')),
      CONSTRAINT admin_event_registrations_unique_event_email UNIQUE (event_id, attendee_email)
    )
  `);

  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON admin_event_registrations(event_id)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON admin_event_registrations(attendee_email)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON admin_event_registrations(registration_status)`);
}

export async function ensureAdminEventsTable() {
  await postgresPool.query(`
    CREATE TABLE IF NOT EXISTS admin_events (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_date DATE NOT NULL,
      location TEXT NOT NULL,
      mode TEXT NOT NULL,
      organizer_name TEXT NOT NULL,
      organizer_email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Approved',
      rejection_reason TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT admin_events_status_check CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Needs Info'))
    )
  `);

  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_events_status ON admin_events(status)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_events_event_date ON admin_events(event_date DESC)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_events_updated_at ON admin_events(updated_at DESC)`);
  await postgresPool.query(`CREATE INDEX IF NOT EXISTS idx_admin_events_organizer_email ON admin_events(organizer_email)`);

  const existingCount = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_events`);
  if (Number(existingCount.rows[0]?.count || "0") === 0) {
    for (const item of seedEvents) {
      await postgresPool.query(
        `
        INSERT INTO admin_events (title, event_type, event_date, location, mode, organizer_name, organizer_email, status, rejection_reason)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          item.title,
          item.eventType,
          item.eventDate,
          item.location,
          item.mode,
          item.organizerName,
          item.organizerEmail,
          item.status,
          item.rejectionReason,
        ],
      );
    }
  }

  await ensureEventRegistrationsTable();
}

function toEventNumericId(eventId: string) {
  return eventId.replace(/^E-/, "");
}

function toEventPublicId(eventId: string) {
  return `E-${eventId}`;
}

function clearEventsListCache() {
  eventsListCache.clear();
}

function getEventsListCacheKey(filters: EventListFilters) {
  return JSON.stringify({
    search: (filters.search || "").trim().toLowerCase(),
    status: filters.status || "All",
    year: filters.year || "All",
    page: Math.max(1, filters.page || 1),
    pageSize: Math.min(50, Math.max(1, filters.pageSize || 10)),
  });
}

function mapEventRow(row: {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  location: string;
  mode: string;
  organizer_name: string;
  organizer_email: string;
  status: EventStatus;
  rejection_reason: string | null;
  attendee_count: string;
  going_count: string;
  submitted_at: string;
  updated_at: string;
}): AdminEvent {
  return {
    id: toEventPublicId(row.id),
    title: row.title,
    eventType: row.event_type,
    eventDate: row.event_date,
    location: row.location,
    mode: row.mode,
    organizerName: row.organizer_name,
    organizerEmail: row.organizer_email,
    status: row.status,
    rejectionReason: row.rejection_reason,
    attendeeCount: Number(row.attendee_count || "0"),
    goingCount: Number(row.going_count || "0"),
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

function mapAttendeeRow(row: {
  id: string;
  event_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_mobile: string | null;
  registration_status: RegistrationStatus;
  created_at: string;
  updated_at: string;
}): EventAttendee {
  return {
    id: `ER-${row.id}`,
    eventId: toEventPublicId(row.event_id),
    attendeeName: row.attendee_name,
    attendeeEmail: row.attendee_email,
    attendeeMobile: row.attendee_mobile,
    registrationStatus: row.registration_status,
    registeredAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listAdminEvents(filters: EventListFilters) {
  await ensureAdminEventsTable();

  const cacheKey = getEventsListCacheKey(filters);
  const cached = eventsListCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize || 10));

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.search?.trim()) {
    values.push(`%${filters.search.trim()}%`);
    const index = values.length;
    conditions.push(`(e.title ILIKE $${index} OR e.organizer_name ILIKE $${index} OR e.organizer_email ILIKE $${index} OR e.location ILIKE $${index})`);
  }

  if (filters.status && filters.status !== "All") {
    values.push(filters.status);
    conditions.push(`e.status = $${values.length}`);
  }

  if (filters.year && filters.year !== "All") {
    values.push(filters.year);
    conditions.push(`EXTRACT(YEAR FROM e.event_date)::text = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await postgresPool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_events e ${whereClause}`, values);
  const total = Number(countResult.rows[0]?.count || "0");

  values.push(pageSize, (page - 1) * pageSize);
  const limitIndex = values.length - 1;
  const offsetIndex = values.length;

  const dataQuery = `
    SELECT
      e.id::text,
      e.title,
      e.event_type,
      e.event_date::text,
      e.location,
      e.mode,
      e.organizer_name,
      e.organizer_email,
      e.status,
      e.rejection_reason,
      COALESCE(stats.attendee_count, 0)::text AS attendee_count,
      COALESCE(stats.going_count, 0)::text AS going_count,
      e.submitted_at::text,
      e.updated_at::text
    FROM admin_events e
    LEFT JOIN (
      SELECT
        event_id,
        COUNT(*)::int AS attendee_count,
        COUNT(*) FILTER (WHERE registration_status = 'Going')::int AS going_count
      FROM admin_event_registrations
      WHERE registration_status <> 'Cancelled'
      GROUP BY event_id
    ) stats ON stats.event_id = e.id
    ${whereClause}
    ORDER BY e.event_date ASC, e.updated_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;

  const rows = await postgresPool.query<{
    id: string;
    title: string;
    event_type: string;
    event_date: string;
    location: string;
    mode: string;
    organizer_name: string;
    organizer_email: string;
    status: EventStatus;
    rejection_reason: string | null;
    attendee_count: string;
    going_count: string;
    submitted_at: string;
    updated_at: string;
  }>(dataQuery, values);

  const summary = await postgresPool.query<{
    pending_count: string;
    approved_count: string;
    rejected_count: string;
    total_registrations: string;
    upcoming_count: string;
  }>(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'Pending')::text AS pending_count,
      COUNT(*) FILTER (WHERE status = 'Approved')::text AS approved_count,
      COUNT(*) FILTER (WHERE status = 'Rejected')::text AS rejected_count,
      (SELECT COUNT(*)::text FROM admin_event_registrations WHERE registration_status <> 'Cancelled') AS total_registrations,
      COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE)::text AS upcoming_count
    FROM admin_events
  `);

  const result: EventsListResult = {
    rows: rows.rows.map(mapEventRow),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    summary: {
      pendingCount: Number(summary.rows[0]?.pending_count || "0"),
      approvedCount: Number(summary.rows[0]?.approved_count || "0"),
      rejectedCount: Number(summary.rows[0]?.rejected_count || "0"),
      totalRegistrations: Number(summary.rows[0]?.total_registrations || "0"),
      upcomingCount: Number(summary.rows[0]?.upcoming_count || "0"),
    },
  };

  eventsListCache.set(cacheKey, {
    expiresAt: Date.now() + EVENTS_LIST_CACHE_TTL_MS,
    data: result,
  });

  return result;
}

export async function listAdminEventAttendees(eventId: string, limit = 500) {
  await ensureAdminEventsTable();

  const numericId = toEventNumericId(eventId);
  const rows = await postgresPool.query<{
    id: string;
    event_id: string;
    attendee_name: string;
    attendee_email: string;
    attendee_mobile: string | null;
    registration_status: RegistrationStatus;
    created_at: string;
    updated_at: string;
  }>(
    `
    SELECT id::text, event_id::text, attendee_name, attendee_email, attendee_mobile, registration_status, created_at::text, updated_at::text
    FROM admin_event_registrations
    WHERE event_id = $1 AND registration_status <> 'Cancelled'
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [numericId, Math.max(1, Math.min(1000, limit))],
  );

  return rows.rows.map(mapAttendeeRow);
}

export async function registerUserForEvent(payload: {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeeMobile?: string;
}) {
  await ensureAdminEventsTable();

  const eventNumericId = toEventNumericId(payload.eventId);
  const eventExists = await postgresPool.query<{ id: string }>(`SELECT id::text FROM admin_events WHERE id = $1 LIMIT 1`, [eventNumericId]);
  if (eventExists.rowCount === 0) {
    return { ok: false as const, reason: "event-not-found" as const };
  }

  const upsert = await postgresPool.query<{
    id: string;
    event_id: string;
    attendee_name: string;
    attendee_email: string;
    attendee_mobile: string | null;
    registration_status: RegistrationStatus;
    created_at: string;
    updated_at: string;
  }>(
    `
    INSERT INTO admin_event_registrations (event_id, attendee_name, attendee_email, attendee_mobile, registration_status)
    VALUES ($1, $2, $3, $4, 'Going')
    ON CONFLICT (event_id, attendee_email)
    DO UPDATE SET
      attendee_name = EXCLUDED.attendee_name,
      attendee_mobile = EXCLUDED.attendee_mobile,
      registration_status = 'Going',
      updated_at = NOW()
    RETURNING id::text, event_id::text, attendee_name, attendee_email, attendee_mobile, registration_status, created_at::text, updated_at::text
    `,
    [eventNumericId, payload.attendeeName.trim(), payload.attendeeEmail.trim().toLowerCase(), payload.attendeeMobile?.trim() || null],
  );

  clearEventsListCache();
  return { ok: true as const, registration: mapAttendeeRow(upsert.rows[0]) };
}

export async function cancelUserEventRegistration(payload: { eventId: string; attendeeEmail: string }) {
  await ensureAdminEventsTable();

  const eventNumericId = toEventNumericId(payload.eventId);
  const result = await postgresPool.query<{
    id: string;
    event_id: string;
    attendee_name: string;
    attendee_email: string;
    attendee_mobile: string | null;
    registration_status: RegistrationStatus;
    created_at: string;
    updated_at: string;
  }>(
    `
    UPDATE admin_event_registrations
    SET registration_status = 'Cancelled', updated_at = NOW()
    WHERE event_id = $1 AND attendee_email = $2
    RETURNING id::text, event_id::text, attendee_name, attendee_email, attendee_mobile, registration_status, created_at::text, updated_at::text
    `,
    [eventNumericId, payload.attendeeEmail.trim().toLowerCase()],
  );

  if (result.rowCount === 0) {
    return { ok: false as const, reason: "registration-not-found" as const };
  }

  clearEventsListCache();
  return { ok: true as const, registration: mapAttendeeRow(result.rows[0]) };
}

export async function listUserEventsWithRegistration(userEmail: string) {
  await ensureAdminEventsTable();

  const normalizedEmail = userEmail.trim().toLowerCase();
  const rows = await postgresPool.query<{
    id: string;
    title: string;
    event_type: string;
    event_date: string;
    location: string;
    mode: string;
    organizer_name: string;
    organizer_email: string;
    status: EventStatus;
    rejection_reason: string | null;
    attendee_count: string;
    going_count: string;
    submitted_at: string;
    updated_at: string;
    my_registration_status: RegistrationStatus | null;
  }>(
    `
    SELECT
      e.id::text,
      e.title,
      e.event_type,
      e.event_date::text,
      e.location,
      e.mode,
      e.organizer_name,
      e.organizer_email,
      e.status,
      e.rejection_reason,
      COALESCE(stats.attendee_count, 0)::text AS attendee_count,
      COALESCE(stats.going_count, 0)::text AS going_count,
      e.submitted_at::text,
      e.updated_at::text,
      ur.registration_status AS my_registration_status
    FROM admin_events e
    LEFT JOIN (
      SELECT
        event_id,
        COUNT(*)::int AS attendee_count,
        COUNT(*) FILTER (WHERE registration_status = 'Going')::int AS going_count
      FROM admin_event_registrations
      WHERE registration_status <> 'Cancelled'
      GROUP BY event_id
    ) stats ON stats.event_id = e.id
    LEFT JOIN admin_event_registrations ur
      ON ur.event_id = e.id
      AND ur.attendee_email = $1
      AND ur.registration_status <> 'Cancelled'
    WHERE e.event_date >= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY e.event_date ASC, e.updated_at DESC
    `,
    [normalizedEmail],
  );

  const events = rows.rows.map((row) => ({
    ...mapEventRow(row),
    myRegistrationStatus: row.my_registration_status,
  }));

  return {
    rows: events,
    summary: {
      totalEvents: events.length,
      registeredCount: events.filter((item) => item.myRegistrationStatus === "Going").length,
      upcomingCount: events.filter((item) => new Date(item.eventDate).getTime() >= Date.now()).length,
    },
  };
}

// Legacy exports kept for compatibility with existing admin event APIs.
export async function listAdminEventsByStatus(status: "Approved" | "Rejected", limit = 100) {
  await ensureAdminEventsTable();

  const result = await postgresPool.query<{
    id: string;
    title: string;
    event_type: string;
    event_date: string;
    location: string;
    mode: string;
    organizer_name: string;
    organizer_email: string;
    status: EventStatus;
    rejection_reason: string | null;
    attendee_count: string;
    going_count: string;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    SELECT
      e.id::text,
      e.title,
      e.event_type,
      e.event_date::text,
      e.location,
      e.mode,
      e.organizer_name,
      e.organizer_email,
      e.status,
      e.rejection_reason,
      COALESCE(stats.attendee_count, 0)::text AS attendee_count,
      COALESCE(stats.going_count, 0)::text AS going_count,
      e.submitted_at::text,
      e.updated_at::text
    FROM admin_events e
    LEFT JOIN (
      SELECT
        event_id,
        COUNT(*)::int AS attendee_count,
        COUNT(*) FILTER (WHERE registration_status = 'Going')::int AS going_count
      FROM admin_event_registrations
      WHERE registration_status <> 'Cancelled'
      GROUP BY event_id
    ) stats ON stats.event_id = e.id
    WHERE e.status = $1
    ORDER BY e.updated_at DESC
    LIMIT $2
    `,
    [status, Math.max(1, Math.min(500, limit))],
  );

  return result.rows.map(mapEventRow);
}

export async function createAdminEvent(payload: {
  title: string;
  eventType: string;
  eventDate: string;
  location: string;
  mode: string;
  organizerName: string;
  organizerEmail: string;
}) {
  await ensureAdminEventsTable();

  const result = await postgresPool.query<{
    id: string;
    title: string;
    event_type: string;
    event_date: string;
    location: string;
    mode: string;
    organizer_name: string;
    organizer_email: string;
    status: EventStatus;
    rejection_reason: string | null;
    attendee_count: string;
    going_count: string;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    INSERT INTO admin_events (title, event_type, event_date, location, mode, organizer_name, organizer_email, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'Approved')
    RETURNING id::text, title, event_type, event_date::text, location, mode, organizer_name, organizer_email, status, rejection_reason,
      '0'::text AS attendee_count, '0'::text AS going_count, submitted_at::text, updated_at::text
    `,
    [
      payload.title,
      payload.eventType,
      payload.eventDate,
      payload.location,
      payload.mode,
      payload.organizerName,
      payload.organizerEmail.toLowerCase(),
    ],
  );

  clearEventsListCache();
  return mapEventRow(result.rows[0]);
}

export async function updateAdminEventStatus(payload: {
  eventId: string;
  status: EventStatus;
  rejectionReason?: string;
}) {
  await ensureAdminEventsTable();
  const numericId = toEventNumericId(payload.eventId);

  const result = await postgresPool.query<{
    id: string;
    title: string;
    event_type: string;
    event_date: string;
    location: string;
    mode: string;
    organizer_name: string;
    organizer_email: string;
    status: EventStatus;
    rejection_reason: string | null;
    attendee_count: string;
    going_count: string;
    submitted_at: string;
    updated_at: string;
  }>(
    `
    UPDATE admin_events
    SET status = $2,
        rejection_reason = $3,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id::text, title, event_type, event_date::text, location, mode, organizer_name, organizer_email, status, rejection_reason,
      '0'::text AS attendee_count, '0'::text AS going_count, submitted_at::text, updated_at::text
    `,
    [numericId, payload.status, payload.status === "Rejected" ? payload.rejectionReason || "Rejected by admin." : null],
  );

  if (result.rowCount === 0) {
    return null;
  }

  clearEventsListCache();
  return mapEventRow(result.rows[0]);
}

export async function bulkApprovePendingEvents() {
  await ensureAdminEventsTable();

  const updated = await postgresPool.query<{ count: string }>(`
    WITH updated AS (
      UPDATE admin_events
      SET status = 'Approved', rejection_reason = NULL, updated_at = NOW()
      WHERE status = 'Pending'
      RETURNING id
    )
    SELECT COUNT(*)::text AS count FROM updated
  `);

  clearEventsListCache();
  return Number(updated.rows[0]?.count || "0");
}
