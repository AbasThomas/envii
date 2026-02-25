import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { withDb } from "@/lib/prisma-resilience";
import { getRequestUser } from "@/lib/server-auth";

export const GET = withDb(async (request: NextRequest) => {
  const user = await getRequestUser(request);
  if (!user) return fail("Unauthorized", 401);

  const repos = await prisma.repo.findMany({
    where: {
      OR: [{ userId: user.id }, { shares: { some: { userId: user.id } } }],
    },
    include: {
      _count: { select: { envs: true, stars: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return ok({ repos });
});
