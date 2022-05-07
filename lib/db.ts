import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is missing");
  }

  return url;
}

const globalForPrisma = globalThis as unknown as {
  db?: PrismaClient;
};

const adapter = new PrismaLibSql({
  url: getDatabaseUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN ?? undefined,
});

export const db =
  globalForPrisma.db ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}