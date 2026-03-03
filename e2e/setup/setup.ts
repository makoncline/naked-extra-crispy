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
  const user = await prisma.user.create({
    data: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
    },
  });

  const spot = await prisma.spot.create({
    data: {
      id: "test-spot",
      name: "Test Spot",
      city: "Test City",
      state: "TS",
      userId: user.id,
    },
  });

  const wing = await prisma.wing.create({
    data: {
      id: "test-wing",
      userId: user.id,
      spotId: spot.id,
      review: "Test review",
      rating: 7,
    },
  });

  const sessionToken = "test-session-token";
  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  await prisma.$disconnect();
  return { user, spot, wing, sessionToken, session, cleanup: cleanupDatabase };
}

async function setupOtherUserSessionDatabase() {
  await createTestDatabase();

  const creator = await prisma.user.create({
    data: {
      id: "creator-user-id",
      email: "creator@example.com",
      name: "Creator User",
    },
  });

  const otherUser = await prisma.user.create({
    data: {
      id: "other-user-id",
      email: "other@example.com",
      name: "Other User",
    },
  });

  const spot = await prisma.spot.create({
    data: {
      id: "test-spot",
      name: "Test Spot",
      city: "Test City",
      state: "TS",
      userId: creator.id,
    },
  });

  const wing = await prisma.wing.create({
    data: {
      id: "test-wing",
      userId: creator.id,
      spotId: spot.id,
      review: "Test review",
      rating: 7,
    },
  });

  const sessionToken = "other-user-session-token";
  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId: otherUser.id,
      expires: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  await prisma.$disconnect();
  return {
    creator,
    otherUser,
    spot,
    wing,
    sessionToken,
    session,
    cleanup: cleanupDatabase,
  };
}

export { setupDatabase, setupOtherUserSessionDatabase };
