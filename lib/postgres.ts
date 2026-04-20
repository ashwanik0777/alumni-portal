import { Pool } from "pg";

declare global {
  var __alumniPortalPgPool: Pool | undefined;
}

function getDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  try {
    const parsed = new URL(rawUrl);
    const sslMode = parsed.searchParams.get("sslmode");

    // pg-connection-string warns for legacy alias modes; keep current secure behavior explicitly.
    if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
      parsed.searchParams.set("sslmode", "verify-full");
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

export const postgresPool =
  globalThis.__alumniPortalPgPool ??
  new Pool({
    connectionString: getDatabaseUrl(),
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__alumniPortalPgPool = postgresPool;
}
