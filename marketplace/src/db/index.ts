import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = global as typeof globalThis & {
  pool?: any;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool);
