import PrismaPkg from "@prisma/client";
const { PrismaClient } = PrismaPkg as typeof import("@prisma/client");

// Ensure DATABASE_URL has a sensible default (SQLite) when not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/dev.db";
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: InstanceType<typeof PrismaClient> | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const db = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
  globalThis.__prisma = db;
}
