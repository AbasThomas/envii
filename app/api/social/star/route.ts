import { NextRequest } from "next/server";
import { z } from "zod";

import { enforceFeature } from "@/lib/api-guards";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/server-auth";

const starSchema = z.object({
  repoId: z.string(),
});

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return fail("Unauthorized", 401);

  const plan = await enforceFeature(user.id, "allowForksAndStars");
  if (!plan.allowed) return fail(plan.reason, 403);

  const payload = await request.json().catch(() => null);
  const parsed = starSchema.safeParse(payload);
  if (!parsed.success) return fail("Invalid payload", 422, parsed.error.flatten());

  const repo = await prisma.repo.findUnique({ where: { id: parsed.data.repoId } });
  if (!repo) return fail("Repository not found", 404);
  if (!repo.isPublic && repo.userId !== user.id) return fail("Forbidden", 403);

  const existing = await prisma.star.findUnique({
    where: {
      userId_repoId: {
        userId: user.id,
        repoId: repo.id,
      },
    },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.star.delete({ where: { id: existing.id } }),
      prisma.repo.update({
        where: { id: repo.id },
        data: {
          starsCount: { decrement: 1 },
        },
      }),
    ]);
    return ok({ starred: false });
  }

  await prisma.$transaction([
    prisma.star.create({
      data: {
        userId: user.id,
        repoId: repo.id,
      },
    }),
    prisma.repo.update({
      where: { id: repo.id },
      data: {
        starsCount: { increment: 1 },
      },
    }),
    prisma.notification.create({
      data: {
        userId: repo.userId,
        repoId: repo.id,
        type: "STAR",
        title: "New star",
        body: `${user.name ?? user.email} starred ${repo.name}`,
      },
    }),
  ]);

  return ok({ starred: true });
}
