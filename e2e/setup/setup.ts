import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const testDbPath = path.join(process.cwd(), "test.db");
const testDbUrl = `file:${testDbPath}`;
let prisma: PrismaClient;

async function createTestDatabase() {
  // Ensure we start fresh
  await cleanupDatabase();

  // Create new database with schema
  execSync("npx prisma db push", {
    stdio: "inherit",
    env: { ...process.env, TURSO_DATABASE_URL: testDbUrl },
  });

  // Create new client
  prisma = new PrismaClient({ datasourceUrl: testDbUrl });
}

async function cleanupDatabase() {
  // Disconnect any existing client
  if (prisma) {
    await prisma.$disconnect();
  }

  // Remove database file if it exists
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
