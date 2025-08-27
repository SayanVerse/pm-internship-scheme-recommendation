// Handle both CommonJS and ESM imports for Prisma Client
let PrismaClient: any;
try {
  // Try ES module import first
  const prismaModule = await import("@prisma/client");
  PrismaClient = prismaModule.PrismaClient;
} catch (error) {
  // Fallback to CommonJS import
  try {
    const pkg = await import("@prisma/client");
    PrismaClient = pkg.default?.PrismaClient || pkg.PrismaClient;
  } catch (fallbackError) {
    console.error("Failed to import PrismaClient:", fallbackError);
    throw fallbackError;
  }
}

declare global {
  var __prisma: any | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const db = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
  globalThis.__prisma = db;
}
