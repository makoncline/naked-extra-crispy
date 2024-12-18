import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const testDbPath = path.join(process.cwd(), "test.db");
const testDbUrl = `file:${testDbPath}`;

const prisma = new PrismaClient({
  datasources: {
    db: { url: testDbUrl },
  },
});

async function verifyDatabaseSetup() {
  try {
    await Promise.all([
      prisma.user.findFirst(),
      prisma.spot.findFirst(),
      prisma.wing.findFirst(),
      prisma.image.findFirst(),
    ]);
    return true;
  } catch {
    return false;
  }
}

async function setupTestDatabase() {
  console.log("🔄 Setting up test database...");

  // Clean up existing DB
  if (fs.existsSync(testDbPath)) {
    console.log("🗑 Removing existing database");
    fs.unlinkSync(testDbPath);
  }

  // Push schema
  console.log("📝 Pushing schema...");
  execSync(
    `npx prisma db push --schema=${path.join(
      process.cwd(),
      "prisma",
      "schema.prisma"
    )}`,
    {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: testDbUrl,
        TURSO_DATABASE_URL: testDbUrl,
      },
    }
  );

  // Verify schema
  if (!(await verifyDatabaseSetup()))
    throw new Error("Database verification failed");
  console.log("✅ Schema verified");

  // Seed database
  await seedTestDb();
  console.log("✅ Seeded test data");

  // Final verification
  if (!(await verifyDatabaseSetup()))
    throw new Error("Final verification failed");
  console.log("✅ Final verification passed");
}

async function seedTestDb() {
  const user = await prisma.user.create({
    data: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
  });

  const spot = await prisma.spot.create({
    data: {
      id: "test-spot",
      name: "Test Spot",
      city: "Test City",
      state: "TS",
      user: { connect: { id: user.id } },
    },
  });

  const wing = await prisma.wing.create({
    data: {
      id: "test-wing",
      review: "Test Review",
      rating: 5,
      spot: { connect: { id: spot.id } },
      user: { connect: { id: user.id } },
    },
  });

  await prisma.image.create({
    data: {
      id: "test-image",
      key: "test-key",
      type: "wing",
      restaurant: { connect: { id: spot.id } },
      wing: { connect: { id: wing.id } },
      user: { connect: { id: user.id } },
    },
  });
}

if (require.main === module) {
  setupTestDatabase()
    .then(() => {
      console.log("✅ Test database setup complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test database setup failed:", error);
      process.exit(1);
    });
}

export { setupTestDatabase };
