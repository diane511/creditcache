import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function getDatabaseUrl() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL or DATABASE_URL is missing");
  }

  return url;
}

function getAuthToken() {
  return process.env.TURSO_AUTH_TOKEN ?? undefined;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaLibSql({
  url: getDatabaseUrl(),
  authToken: getAuthToken(),
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;