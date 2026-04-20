import { Pool } from "pg";

declare global {
  var __alumniPortalPgPool: Pool | undefined;
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return url;
}

export const postgresPool =
  globalThis.__alumniPortalPgPool ??
  new Pool({
    connectionString: getDatabaseUrl(),
    max: 5,
    ssl: {
      rejectUnauthorized: false,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__alumniPortalPgPool = postgresPool;
}
