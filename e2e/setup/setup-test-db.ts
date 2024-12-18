import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const testDbPath = path.join(process.cwd(), "test.db");
const testDbUrl = `file:${testDbPath}`;

// Create a new client for our setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testDbUrl,
    },
  },
});

async function verifyDatabaseSetup() {
  try {
    // Try to query all required tables
    await Promise.all([
      prisma.user.findFirst(),
      prisma.spot.findFirst(),
      prisma.wing.findFirst(),
      prisma.image.findFirst(),
    ]);
    return true;
  } catch (error) {
    return false;
  }
}

async function setupTestDatabase() {
  try {
    console.log("🔄 Setting up test database...");

    // Clean up any existing database
    if (fs.existsSync(testDbPath)) {
      console.log("🗑️  Removing existing database");
      fs.unlinkSync(testDbPath);
    }

    // Generate Prisma Client
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("✅ Generated Prisma Client");

    // Push schema
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
    console.log("✅ Pushed schema to database");

    // Verify database setup
    const isSetup = await verifyDatabaseSetup();
    if (!isSetup) {
      throw new Error("Database verification failed");
    }
    console.log("✅ Verified database setup");

    // Seed test data
    await seedTestDb();
    console.log("✅ Seeded test data");

    // Final verification
    const finalCheck = await verifyDatabaseSetup();
    if (!finalCheck) {
      throw new Error("Final database verification failed");
    }
    console.log("✅ Final verification passed");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedTestDb() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
  });

  // Create test spot
  const spot = await prisma.spot.create({
    data: {
      id: "test-spot",
      name: "Test Spot",
      city: "Test City",
      state: "TS",
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  // Create test wing
  const wing = await prisma.wing.create({
    data: {
      id: "test-wing",
      review: "Test Review",
      rating: 5,
      spot: {
        connect: {
          id: spot.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  // Create test image
  await prisma.image.create({
    data: {
      id: "test-image",
      key: "test-key",
      type: "wing",
      restaurant: {
        connect: {
          id: spot.id,
        },
      },
      wing: {
        connect: {
          id: wing.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
}

// Run if called directly
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

export { setupTestDatabase, seedTestDb };
