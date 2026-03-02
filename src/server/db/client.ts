import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { env } from "../../env/server.mjs";

declare global {
  var prisma: PrismaClient | undefined;
}

// Use SQLite for tests, Turso for everything else
const createPrismaClient = () => {
  const isTest = process.env.NODE_ENV === "test";
  const url = isTest
    ? process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL
    : env.TURSO_DATABASE_URL;
  if (!url) throw new Error("Missing database URL");
  const adapter = new PrismaLibSql({
    url,
    authToken: isTest ? process.env.TURSO_DATABASE_TOKEN : env.TURSO_DATABASE_TOKEN,
  });
  return new PrismaClient({ adapter });
};

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
