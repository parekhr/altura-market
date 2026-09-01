import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// pg.Pool is an EventEmitter — without an 'error' listener, a connection
// dying unexpectedly (e.g. the process freezing/thawing between requests in
// a serverless-style host) crashes the whole Node process by default,
// taking down every in-flight request rather than just the one query.
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
pool.on("error", (err) => {
  console.error("Postgres pool error:", err);
});

const adapter = new PrismaPg(pool);

// Next.js dev mode hot-reloads modules on every file save, which would
// otherwise construct a brand-new PrismaClient (and connection pool) each
// time. Stashing the instance on `globalThis` — which survives module
// reloads — means dev mode reuses the same client instead of leaking a new
// pool on every save. Not needed in production, where the module only
// loads once per process anyway.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}