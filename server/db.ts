import { PrismaClient } from "@prisma/client";

// Ensure DATABASE_URL has a sensible default (SQLite) when not provided
if (!process.env.DATABASE_URL) {
  // Use the repo-committed SQLite database by default
  process.env.DATABASE_URL = "file:./prisma/dev.db";
}

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const db = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
  globalThis.__prisma = db;
}
