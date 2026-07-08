import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL (or TURSO_DATABASE_URL) is missing");
  }

  return url;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaLibSql({
  url: getDatabaseUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN ?? undefined,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}