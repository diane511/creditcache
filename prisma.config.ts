import "dotenv/config";
import { defineConfig } from "prisma/config";

const datasourceUrl = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;

if (!datasourceUrl) {
  throw new Error("DATABASE_URL (or TURSO_DATABASE_URL) is missing");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});