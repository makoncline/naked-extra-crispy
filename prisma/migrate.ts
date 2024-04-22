// dotenv -e .env.development -- sh -c 'npx ts-node --project tsconfig.scripts.json prisma/migrate.ts'

import { PrismaClient as PostgresClient } from "./generated/postgres-client";
import { PrismaClient as SQLiteClient } from "./generated/sqlite-client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const libsql = createClient({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_DATABASE_TOKEN}`,
});
const adapter = new PrismaLibSQL(libsql);

const postgres = new PostgresClient();
const sqlite = new SQLiteClient({ adapter });

async function upsertUsers() {
  const users = await postgres.user.findMany();
  for (const user of users) {
    if (!user.email) {
      continue;
    }
    await sqlite.user.upsert({
      where: { email: user.email },
      update: { ...user },
      create: { ...user },
    });
  }
}

async function upsertSpots() {
  const spots = await postgres.spot.findMany();
  for (const spot of spots) {
    await sqlite.spot.upsert({
      where: { id: spot.id },
      update: { ...spot },
      create: { ...spot },
    });
  }
}

async function upsertPlaces() {
  const places = await postgres.place.findMany();
  for (const place of places) {
    await sqlite.place.upsert({
      where: { id: place.id },
      update: { ...place },
      create: { ...place },
    });
  }
}

async function upsertImages() {
  const images = await postgres.image.findMany();
  for (const image of images) {
    await sqlite.image.upsert({
      where: { id: image.id },
      update: { ...image },
      create: { ...image },
    });
  }
}

async function upsertWings() {
  const wings = await postgres.wing.findMany();
  for (const wing of wings) {
    await sqlite.wing.upsert({
      where: { id: wing.id },
      update: { ...wing },
      create: { ...wing },
    });
  }
}

async function upsertWingSocialPosts() {
  const posts = await postgres.wingSocialPost.findMany();
  for (const post of posts) {
    await sqlite.wingSocialPost.upsert({
      where: { id: post.id },
      update: { ...post },
      create: { ...post },
    });
  }
}

async function upsertAccounts() {
  const accounts = await postgres.account.findMany();
  for (const account of accounts) {
    await sqlite.account.upsert({
      where: { id: account.id },
      update: { ...account },
      create: { ...account },
    });
  }
}

async function upsertSessions() {
  const sessions = await postgres.session.findMany();
  for (const session of sessions) {
    await sqlite.session.upsert({
      where: { id: session.id },
      update: { ...session },
      create: { ...session },
    });
  }
}

async function upsertVerificationTokens() {
  const tokens = await postgres.verificationToken.findMany();
  for (const token of tokens) {
    await sqlite.verificationToken.upsert({
      where: { token: token.token },
      update: { ...token },
      create: { ...token },
    });
  }
}

async function main() {
  try {
    await upsertUsers();
    await upsertSpots();
    await upsertPlaces();
    await upsertWings();
    await upsertImages();
    await upsertWingSocialPosts();
    await upsertAccounts();
    await upsertSessions();
    await upsertVerificationTokens();
    console.log("Data upsertion completed successfully.");
  } catch (error) {
    console.error("Failed to upsert data:", error);
  } finally {
    await postgres.$disconnect();
    await sqlite.$disconnect();
  }
}

main();
