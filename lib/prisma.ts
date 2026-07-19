import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

function getTursoDatabaseUrl() {
  const url = process.env.TURSO_DATABASE_URL;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL is missing");
  }

  return url;
}

function getTursoAuthToken() {
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!token) {
    throw new Error("TURSO_AUTH_TOKEN is missing");
  }

  return token;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaLibSQL({
  url: getTursoDatabaseUrl(),
  authToken: getTursoAuthToken(),
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