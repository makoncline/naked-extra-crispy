import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

async function verifyDatabaseSetup() {
  try {
    // Try to query the Spot table
    await prisma.spot.findFirst();
    return true;
  } catch (error) {
    return false;
  }
}

async function setupTestDatabase() {
  try {
    console.log("🔄 Setting up test database...");

    // Generate Prisma Client
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("✅ Generated Prisma Client");

    // Push schema
    execSync("npx prisma db push --force-reset", { stdio: "inherit" });
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
  // First create the user
  const user = await prisma.user.create({
    data: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
  });

  // Then create the spot connected to the user
  await prisma.spot.create({
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
