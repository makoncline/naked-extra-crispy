import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const testDbPath = path.join(process.cwd(), "test.db");
const testDbUrl = `file:${testDbPath}`;
let prisma: PrismaClient;

async function createTestDatabase() {
  // Ensure we start fresh
  await cleanupDatabase();

  // Create new database with schema
  execSync("npx prisma db push --schema=prisma/schema.prisma", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: testDbUrl,
      TURSO_DATABASE_URL: testDbUrl,
      // Prisma 7 schema engine intermittently fails here without trace logging.
      RUST_LOG: "trace",
    },
  });

  prisma = new PrismaClient({
    adapter: new PrismaLibSql({
      url: testDbUrl,
    }),
  });
}

async function cleanupDatabase() {
  if (prisma) {
    await prisma.$disconnect();
  }

  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
}

async function setupDatabase() {
  await createTestDatabase();

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
    },
  });

  return { user, cleanup: cleanupDatabase };
}

export { setupDatabase };
