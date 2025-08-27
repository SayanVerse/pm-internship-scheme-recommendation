// Use dynamic import to handle CommonJS/ESM compatibility
async function createPrismaClient() {
  try {
    const { PrismaClient } = await import("@prisma/client");
    return new PrismaClient();
  } catch (error) {
    console.error("Failed to import PrismaClient:", error);
    throw error;
  }
}

declare global {
  var __prisma: any | undefined;
}

// Create the database instance
let dbInstance: any = null;

export const getDb = async () => {
  if (dbInstance) return dbInstance;

  if (globalThis.__prisma) {
    dbInstance = globalThis.__prisma;
    return dbInstance;
  }

  dbInstance = await createPrismaClient();

  if (process.env.NODE_ENV === "development") {
    globalThis.__prisma = dbInstance;
  }

  return dbInstance;
};

// For backward compatibility, create a synchronous version
// This will be a promise that resolves to the Prisma client
export const db = getDb();
