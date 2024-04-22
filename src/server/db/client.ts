import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { env } from "../../env/server.mjs";
import { PrismaClient } from "@prisma/client";

const libsql = createClient({
  url: `${env.TURSO_DATABASE_URL}`,
  authToken: `${env.TURSO_DATABASE_TOKEN}`,
});

const adapter = new PrismaLibSQL(libsql);

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
