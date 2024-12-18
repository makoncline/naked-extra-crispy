import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedTestDb() {
  try {
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
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running directly from command line
if (require.main === module) {
  seedTestDb()
    .then(() => {
      console.log("✅ Test database seeded");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error seeding test database:", error);
      process.exit(1);
    });
}

export { seedTestDb };
