import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { execSync } from "child_process";
import path from "path";

const testDbPath = path.join(process.cwd(), "test.db");
const testDbUrl = `file:${testDbPath}`;
let prisma: PrismaClient;
let schemaInitialized = false;

const sleep = async (ms: number) =>
  await new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableDbError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as { code?: string }).code;
  const message = error.message.toLowerCase();
  return (
    code === "P1008" ||
    message.includes("timed out") ||
    message.includes("database is locked")
  );
};

const withDbRetry = async <T>(operation: () => Promise<T>, attempts = 5) => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableDbError(error) || attempt === attempts) {
        throw error;
      }
      await sleep(100 * attempt);
    }
  }

  throw lastError;
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function createTestDatabase() {
  if (!schemaInitialized) {
    // Ensure schema exists once per test process.
    execSync("pnpm exec prisma db push --schema=prisma/schema.prisma", {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: testDbUrl,
        TURSO_DATABASE_URL: testDbUrl,
        // Prisma 7 schema engine intermittently fails here without trace logging.
        RUST_LOG: "trace",
      },
    });
    schemaInitialized = true;
  }

  if (!prisma) {
    prisma = new PrismaClient({
      adapter: new PrismaLibSql({
        url: testDbUrl,
      }),
    });
  }
}

async function cleanupDatabase() {
  // Intentionally no-op. We use unique IDs per test setup call and keep writes
  // minimal to avoid SQLite lock contention against the running app process.
}

async function setupDatabase() {
  await createTestDatabase();

  const userId = createId("test-user");
  const spotId = createId("test-spot");
  const wingId = createId("test-wing");
  const sessionToken = createId("test-session-token");

  const user = await withDbRetry(async () => {
    return await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@example.com`,
        name: "Test User",
      },
    });
  });

  const spot = await withDbRetry(async () => {
    return await prisma.spot.create({
      data: {
        id: spotId,
        name: "Test Spot",
        city: "Test City",
        state: "TS",
        userId: user.id,
      },
    });
  });

  const wing = await withDbRetry(async () => {
    return await prisma.wing.create({
      data: {
        id: wingId,
        userId: user.id,
        spotId: spot.id,
        review: "Test review",
        rating: 7,
      },
    });
  });

  const session = await withDbRetry(async () => {
    return await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
  });

  return { user, spot, wing, sessionToken, session, cleanup: cleanupDatabase };
}

async function setupOtherUserSessionDatabase() {
  await createTestDatabase();

  const creatorId = createId("creator-user");
  const otherUserId = createId("other-user");
  const spotId = createId("test-spot");
  const wingId = createId("test-wing");
  const sessionToken = createId("other-user-session-token");

  const creator = await withDbRetry(async () => {
    return await prisma.user.create({
      data: {
        id: creatorId,
        email: `${creatorId}@example.com`,
        name: "Creator User",
      },
    });
  });

  const otherUser = await withDbRetry(async () => {
    return await prisma.user.create({
      data: {
        id: otherUserId,
        email: `${otherUserId}@example.com`,
        name: "Other User",
      },
    });
  });

  const spot = await withDbRetry(async () => {
    return await prisma.spot.create({
      data: {
        id: spotId,
        name: "Test Spot",
        city: "Test City",
        state: "TS",
        userId: creator.id,
      },
    });
  });

  const wing = await withDbRetry(async () => {
    return await prisma.wing.create({
      data: {
        id: wingId,
        userId: creator.id,
        spotId: spot.id,
        review: "Test review",
        rating: 7,
      },
    });
  });

  const session = await withDbRetry(async () => {
    return await prisma.session.create({
      data: {
        sessionToken,
        userId: otherUser.id,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
  });

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
