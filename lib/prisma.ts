import { Prisma, PrismaClient } from "@prisma/client";

declare global {
  var __envvyPrisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & {
  __envvyPrisma?: PrismaClient;
};

const developmentLogs: Prisma.LogLevel[] =
  process.env.PRISMA_LOG_ERRORS === "true" ? ["warn", "error"] : ["warn"];

export const prisma =
  globalForPrisma.__envvyPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? developmentLogs : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__envvyPrisma = prisma;
}
