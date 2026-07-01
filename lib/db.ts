// main/lib/db.ts
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function getTursoUrl() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is missing");
  }
  return url;
}

const globalForPrisma = globalThis as unknown as {
  db?: PrismaClient;
};

const adapter = new PrismaLibSql({
  url: getTursoUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
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