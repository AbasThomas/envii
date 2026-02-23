import { prisma } from "@/lib/prisma";

export async function logAudit(
  repoId: string,
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: {
      repoId,
      userId,
      action,
      metadata,
    },
  });
}
