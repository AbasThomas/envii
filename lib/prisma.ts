import { PrismaClient } from "@prisma/client";

declare global {
  var __enviiPrisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & {
  __enviiPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.__enviiPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__enviiPrisma = prisma;
}
