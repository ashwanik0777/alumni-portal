import { postgresPool } from "@/lib/postgres";
import { QueryResultRow } from "pg";

export type UserOverviewData = {
  greeting: {
    name: string;
    email: string;
  };
  stats: {
    totalConnections: number;
    pendingRequests: number;
    registeredEvents: number;
    scholarshipApplications: number;
    upcomingEvents: number;
  };
  recentActivity: {
    id: string;
    title: string;
    description: string;
    type: "event" | "scholarship" | "connection" | "request";
    time: string;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    eventDate: string;
    location: string;
    mode: string;
  }[];
  applicationStatus: {
    pending: number;
    verified: number;
    completed: number;
  };
  quickActions: {
    label: string;
    href: string;
    description: string;
  }[];
};

async function safeQuery<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  try {
    const result = await postgresPool.query<T>(sql, params);
    return result.rows;
  } catch {
    return [];
  }
}

let overviewCache: { data: UserOverviewData; email: string; expiresAt: number } | null = null;
const OVERVIEW_CACHE_TTL_MS = 12_000;

export async function getUserOverview(userEmail: string): Promise<UserOverviewData> {
  const email = userEmail.trim().toLowerCase();

  // Return cached result if same user and fresh
  if (overviewCache && overviewCache.email === email && overviewCache.expiresAt > Date.now()) {
    return overviewCache.data;
  }

  // Run all queries in parallel for maximum performance
  const [
    connectionStats,
    registeredEvents,
    upcomingEventsRows,
    scholarshipStats,
    recentConnectionActivity,
    recentEventRegistrations,
    recentScholarshipApps,
    profileInfo,
  ] = await Promise.all([
    // Connection stats
    safeQuery<{ total: string; pending_in: string; pending_out: string }>(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'Accepted' AND (sender_email = $1 OR receiver_email = $1))::text AS total,
        COUNT(*) FILTER (WHERE status = 'Pending' AND receiver_email = $1)::text AS pending_in,
        COUNT(*) FILTER (WHERE status = 'Pending' AND sender_email = $1)::text AS pending_out
      FROM user_connection_requests
      WHERE sender_email = $1 OR receiver_email = $1
    `, [email]),

    // Events registered (Going)
    safeQuery<{ count: string }>(`
      SELECT COUNT(*)::text AS count
      FROM event_attendees ea
      JOIN admin_events ae ON ae.id = ea.event_id
      WHERE ea.attendee_email = $1 AND ea.registration_status = 'Going'
    `, [email]),

    // Upcoming events where user is registered
    safeQuery<{ id: string; title: string; event_date: string; location: string; mode: string }>(`
      SELECT ae.id::text, ae.title, ae.event_date::text AS event_date, ae.location, ae.mode
      FROM event_attendees ea
      JOIN admin_events ae ON ae.id = ea.event_id
      WHERE ea.attendee_email = $1 AND ea.registration_status = 'Going' AND ae.event_date >= NOW()
      ORDER BY ae.event_date ASC
      LIMIT 5
    `, [email]),

    // Scholarship application stats
    safeQuery<{ total: string; pending: string; verified: string; completed: string }>(`
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE status = 'Pending')::text AS pending,
        COUNT(*) FILTER (WHERE status = 'Verified')::text AS verified,
        COUNT(*) FILTER (WHERE status = 'Completed')::text AS completed
      FROM scholarship_applications
      WHERE LOWER(email) = $1
    `, [email]),

    // Recent connection activity
    safeQuery<{ id: string; sender_email: string; receiver_email: string; sender_name: string; receiver_name: string; status: string; updated_at: string }>(`
      SELECT r.id::text, r.sender_email, r.receiver_email,
             sp.full_name AS sender_name, rp.full_name AS receiver_name,
             r.status, r.updated_at::text
      FROM user_connection_requests r
      LEFT JOIN user_connection_profiles sp ON sp.email = r.sender_email
      LEFT JOIN user_connection_profiles rp ON rp.email = r.receiver_email
      WHERE (r.sender_email = $1 OR r.receiver_email = $1)
      ORDER BY r.updated_at DESC LIMIT 3
    `, [email]),

    // Recent event registrations
    safeQuery<{ id: string; title: string; registered_at: string }>(`
      SELECT ae.id::text, ae.title, ea.registered_at::text
      FROM event_attendees ea
      JOIN admin_events ae ON ae.id = ea.event_id
      WHERE ea.attendee_email = $1
      ORDER BY ea.registered_at DESC LIMIT 3
    `, [email]),

    // Recent scholarship applications
    safeQuery<{ id: string; scholarship_name: string; status: string; applied_at: string }>(`
      SELECT sa.id::text, s.scholarship_name, sa.status, sa.applied_at::text
      FROM scholarship_applications sa
      JOIN admin_scholarships s ON s.id = sa.scholarship_id
      WHERE LOWER(sa.email) = $1
      ORDER BY sa.applied_at DESC LIMIT 3
    `, [email]),

    // Profile info
    safeQuery<{ full_name: string }>(`
      SELECT full_name FROM user_connection_profiles WHERE email = $1 LIMIT 1
    `, [email]),
  ]);

  const cs = connectionStats[0] || { total: "0", pending_in: "0", pending_out: "0" };
  const ss = scholarshipStats[0] || { total: "0", pending: "0", verified: "0", completed: "0" };
  const userName = profileInfo[0]?.full_name || email.split("@")[0].replace(/[._-]+/g, " ");

  // Build recent activity feed from all sources
  const recentActivity: UserOverviewData["recentActivity"] = [];

  for (const conn of recentConnectionActivity) {
    const isSender = conn.sender_email === email;
    const otherName = isSender ? (conn.receiver_name || conn.receiver_email) : (conn.sender_name || conn.sender_email);
    let title = "";
    let description = "";

    if (conn.status === "Accepted") {
      title = `Connected with ${otherName}`;
      description = "Connection request accepted";
    } else if (conn.status === "Pending" && isSender) {
      title = `Request sent to ${otherName}`;
      description = "Awaiting response";
    } else if (conn.status === "Pending" && !isSender) {
      title = `${otherName} wants to connect`;
      description = "Pending your response";
    } else {
      title = `Connection with ${otherName}`;
      description = conn.status;
    }

    recentActivity.push({
      id: `conn-${conn.id}`,
      title,
      description,
      type: "connection",
      time: conn.updated_at,
    });
  }

  for (const reg of recentEventRegistrations) {
    recentActivity.push({
      id: `event-${reg.id}`,
      title: `Registered for ${reg.title}`,
      description: "Event registration confirmed",
      type: "event",
      time: reg.registered_at,
    });
  }

  for (const app of recentScholarshipApps) {
    recentActivity.push({
      id: `scholarship-${app.id}`,
      title: `Applied for ${app.scholarship_name}`,
      description: `Status: ${app.status}`,
      type: "scholarship",
      time: app.applied_at,
    });
  }

  // Sort by time descending and take top 6
  recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const topActivity = recentActivity.slice(0, 6);

  const result: UserOverviewData = {
    greeting: {
      name: userName,
      email,
    },
    stats: {
      totalConnections: Number(cs.total),
      pendingRequests: Number(cs.pending_in),
      registeredEvents: Number(registeredEvents[0]?.count || "0"),
      scholarshipApplications: Number(ss.total),
      upcomingEvents: upcomingEventsRows.length,
    },
    recentActivity: topActivity,
    upcomingEvents: upcomingEventsRows.map((e) => ({
      id: `EVT-${e.id}`,
      title: e.title,
      eventDate: e.event_date,
      location: e.location,
      mode: e.mode,
    })),
    applicationStatus: {
      pending: Number(ss.pending),
      verified: Number(ss.verified),
      completed: Number(ss.completed),
    },
    quickActions: [
      { label: "Browse Events", href: "/user/events", description: "Register for upcoming alumni events" },
      { label: "Apply for Scholarship", href: "/user/scholarships", description: "Explore available scholarships" },
      { label: "Grow Network", href: "/user/network", description: "Connect with fellow alumni" },
      { label: "Update Profile", href: "/user/profile", description: "Keep your profile information current" },
    ],
  };

  // Cache the result
  overviewCache = { data: result, email, expiresAt: Date.now() + OVERVIEW_CACHE_TTL_MS };

  return result;
}
